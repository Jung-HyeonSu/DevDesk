'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { workflowRecipes, workflowRecipeSlugs, type WorkflowEdge, type WorkflowNode, type WorkflowRecipe, type WorkflowRecipeSlug } from '@/data/workflow-recipes';
import { toolBySlug } from '@/data/tools';
import type { Locale } from '@/i18n/config';
import { workflowUiMessages } from '@/i18n/workflows';
import { workflowAdapterById, workflowAdapterName, workflowAdapters, type WorkflowAdapterId } from '@/lib/tools/workflow-adapters';
import { orderWorkflowNodes, WorkflowGraphError } from '@/lib/workflows/graph';
import { notifyWorkbenchSuccess, SuccessConfetti } from '@/components/tools/workbench-feedback';

type NodeRun = { state: 'idle' | 'running' | 'complete' | 'error' | 'skipped'; output?: string; summary?: string; warning?: string; error?: string };
type WorkerResponse = { id: number; ok: true; output: string; summary: string; warning?: string } | { id: number; ok: false; code: string; message: string };
type ImportedRecipe = { id: string; nodes: WorkflowNode[]; edges: WorkflowEdge[] };

function cloneRecipe(recipe: WorkflowRecipe): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
  return { nodes: recipe.nodes.map((node) => ({ ...node })), edges: recipe.edges.map((edge) => ({ ...edge })) };
}

function readImportedRecipe(value: unknown): ImportedRecipe {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected a JSON object.');
  const candidate = value as Record<string, unknown>;
  if (candidate.format !== 'devdesk-workflow' || candidate.version !== 1 || !Array.isArray(candidate.nodes) || !Array.isArray(candidate.edges)) {
    throw new Error('Unsupported recipe format.');
  }
  if (candidate.nodes.length > 15 || candidate.edges.length > 14) throw new Error('Recipe is larger than the supported limit.');
  const nodes = candidate.nodes.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Invalid node.');
    const node = item as Record<string, unknown>;
    if (typeof node.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(node.id) || typeof node.adapterId !== 'string' || !workflowAdapterById(node.adapterId)) {
      throw new Error('Invalid node ID or adapter.');
    }
    return { id: node.id, adapterId: node.adapterId as WorkflowAdapterId };
  });
  const edges = candidate.edges.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Invalid connection.');
    const edge = item as Record<string, unknown>;
    if (typeof edge.fromNodeId !== 'string' || typeof edge.toNodeId !== 'string' || edge.fromPortId !== 'output' || typeof edge.toPortId !== 'string') {
      throw new Error('Invalid connection ports.');
    }
    return { fromNodeId: edge.fromNodeId, fromPortId: 'output' as const, toNodeId: edge.toNodeId, toPortId: edge.toPortId };
  });
  orderWorkflowNodes(nodes, edges);
  const recipeId = workflowRecipeSlugs.includes(candidate.recipeId as WorkflowRecipeSlug)
    ? candidate.recipeId as WorkflowRecipeSlug
    : 'custom';
  return { id: recipeId, nodes, edges };
}

function runNodeInWorker(adapterId: WorkflowAdapterId, input: Record<string, string>): Promise<WorkerResponse> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../../lib/workflows/workflow.worker.ts', import.meta.url), { type: 'module' });
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const timer = window.setTimeout(() => {
      worker.terminate();
      reject(new Error('The step exceeded its time limit.'));
    }, 10000);
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.id !== id) return;
      window.clearTimeout(timer);
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = () => {
      window.clearTimeout(timer);
      worker.terminate();
      reject(new Error('The workflow worker stopped unexpectedly.'));
    };
    worker.postMessage({ id, adapterId, input });
  });
}

export function WorkflowStudio({ locale, initialRecipe = 'api-contract-triage' }: { locale: Locale; initialRecipe?: WorkflowRecipeSlug }) {
  const text = workflowUiMessages[locale];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeRecipe, setActiveRecipe] = useState<string>(initialRecipe);
  const initial = workflowRecipes.find((recipe) => recipe.id === initialRecipe) ?? workflowRecipes[0];
  const [nodes, setNodes] = useState<WorkflowNode[]>(() => cloneRecipe(initial).nodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(() => cloneRecipe(initial).edges);
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({});
  const [runs, setRuns] = useState<Record<string, NodeRun>>({});
  const [selectedAdapter, setSelectedAdapter] = useState<WorkflowAdapterId>(workflowAdapters[0]?.id ?? 'json-formatter');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeIsError, setNoticeIsError] = useState(false);

  const orderedNodes = useMemo(() => {
    try { return orderWorkflowNodes(nodes, edges); }
    catch { return nodes; }
  }, [nodes, edges]);

  function announce(message: string, isError = false) {
    setNotice(message);
    setNoticeIsError(isError);
  }

  function loadRecipe(recipe: WorkflowRecipe) {
    const copy = cloneRecipe(recipe);
    setNodes(copy.nodes);
    setEdges(copy.edges);
    setInputs({});
    setRuns({});
    setActiveRecipe(recipe.id);
    announce('');
  }

  function loadBlank() {
    setNodes([]);
    setEdges([]);
    setInputs({});
    setRuns({});
    setActiveRecipe('custom');
    announce('');
  }

  function addNode() {
    const adapter = workflowAdapterById(selectedAdapter);
    if (!adapter || nodes.length >= 15) return;
    const node = { id: `${selectedAdapter}-${crypto.randomUUID()}`, adapterId: selectedAdapter };
    setNodes((current) => [...current, node]);
    setRuns({});
    announce('');
  }

  function removeNode(nodeId: string) {
    setNodes((current) => current.filter((node) => node.id !== nodeId));
    setEdges((current) => current.filter((edge) => edge.fromNodeId !== nodeId && edge.toNodeId !== nodeId));
    setInputs((current) => { const next = { ...current }; delete next[nodeId]; return next; });
    setRuns((current) => { const next = { ...current }; delete next[nodeId]; return next; });
  }

  function updateInput(nodeId: string, inputId: string, value: string) {
    setInputs((current) => ({ ...current, [nodeId]: { ...current[nodeId], [inputId]: value } }));
    setRuns({});
  }

  function changeConnection(node: WorkflowNode, inputId: string, fromNodeId: string) {
    const base = edges.filter((edge) => !(edge.toNodeId === node.id && edge.toPortId === inputId));
    const next = fromNodeId ? [...base, { fromNodeId, fromPortId: 'output' as const, toNodeId: node.id, toPortId: inputId }] : base;
    try {
      orderWorkflowNodes(nodes, next);
      setEdges(next);
      setRuns({});
      announce('');
    } catch (error) {
      if (error instanceof WorkflowGraphError && error.code === 'cycle') announce(text.cycleError, true);
      else if (error instanceof WorkflowGraphError && error.code === 'branch') announce(text.branchError, true);
      else announce(text.invalidGraph, true);
    }
  }

  function fillExamples() {
    setInputs(Object.fromEntries(nodes.map((node) => [node.id, { ...(workflowAdapterById(node.adapterId)?.sampleInputs ?? {}) }])));
    setRuns({});
    announce('');
  }

  async function runWorkflow() {
    if (!nodes.length || busy) return;
    let order: WorkflowNode[];
    try { order = orderWorkflowNodes(nodes, edges); }
    catch (error) {
      announce(error instanceof WorkflowGraphError && error.code === 'cycle' ? text.cycleError : text.invalidGraph, true);
      return;
    }
    setBusy(true);
    setRuns(Object.fromEntries(order.map((node) => [node.id, { state: 'idle' as const }])));
    announce(text.running);
    const outputs = new Map<string, string>();
    let failedAt = -1;
    for (const [index, node] of order.entries()) {
      const adapter = workflowAdapterById(node.adapterId);
      if (!adapter) { failedAt = index; setRuns((current) => ({ ...current, [node.id]: { state: 'error', error: text.invalidGraph } })); break; }
      setRuns((current) => ({ ...current, [node.id]: { state: 'running' } }));
      const input = { ...(inputs[node.id] ?? {}) };
      const incoming = edges.filter((edge) => edge.toNodeId === node.id);
      for (const edge of incoming) {
        const upstream = outputs.get(edge.fromNodeId);
        if (upstream === undefined) {
          failedAt = index;
          setRuns((current) => ({ ...current, [node.id]: { state: 'error', error: text.runError } }));
          break;
        }
        input[edge.toPortId] = upstream;
      }
      if (failedAt === index) break;
      const missing = adapter.inputs.find((port) => port.required && !(input[port.id] ?? '').trim());
      if (missing) {
        failedAt = index;
        setRuns((current) => ({ ...current, [node.id]: { state: 'error', error: `${missing.label[locale]} — ${text.runError}` } }));
        break;
      }
      try {
        const response = await runNodeInWorker(node.adapterId, input);
        if (!response.ok) {
          failedAt = index;
          setRuns((current) => ({ ...current, [node.id]: { state: 'error', error: response.message } }));
          break;
        }
        outputs.set(node.id, response.output);
        setRuns((current) => ({ ...current, [node.id]: { state: 'complete', output: response.output, summary: response.summary, warning: response.warning } }));
      } catch (error) {
        failedAt = index;
        setRuns((current) => ({ ...current, [node.id]: { state: 'error', error: error instanceof Error ? error.message : text.runError } }));
        break;
      }
    }
    if (failedAt >= 0) {
      for (const node of order.slice(failedAt + 1)) setRuns((current) => ({ ...current, [node.id]: { state: 'skipped' } }));
      announce(text.runError, true);
    } else {
      announce(text.nodeComplete);
      notifyWorkbenchSuccess();
    }
    setBusy(false);
  }

  async function exportRecipe() {
    const content = JSON.stringify({
      format: 'devdesk-workflow', version: 1, recipeId: activeRecipe,
      nodes: nodes.map(({ id, adapterId }) => ({ id, adapterId })),
      edges: edges.map(({ fromNodeId, fromPortId, toNodeId, toPortId }) => ({ fromNodeId, fromPortId, toNodeId, toPortId })),
    }, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'devdesk-workflow.json';
    link.click();
    URL.revokeObjectURL(url);
    announce(text.exported);
    notifyWorkbenchSuccess();
  }

  async function importRecipe(file?: File) {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const imported = readImportedRecipe(parsed);
      setNodes(imported.nodes);
      setEdges(imported.edges);
      setInputs({});
      setRuns({});
      setActiveRecipe(imported.id);
      announce(text.imported);
      notifyWorkbenchSuccess();
    } catch {
      announce(text.importError, true);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <main className="simple-page workflow-studio-page">
      <p className="eyebrow">DEVDESK / {text.eyebrow}</p>
      <h1>{text.title}</h1>
      <p className="workflow-studio-lede">{text.description}</p>
      <aside className="notice-card workflow-privacy-note"><p>{text.privacy}</p></aside>

      <section className="workflow-studio-controls" aria-label={text.recipe}>
        <label className="workflow-control-field">
          <span>{text.recipe}</span>
          <select value={activeRecipe} onChange={(event) => {
            const nextRecipe = workflowRecipes.find((item) => item.id === event.target.value);
            if (nextRecipe) loadRecipe(nextRecipe); else loadBlank();
          }}>
            {workflowRecipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.title[locale]}</option>)}
            <option value="custom">{text.blank}</option>
          </select>
        </label>
        <label className="workflow-control-field">
          <span>{text.addTool}</span>
          <select value={selectedAdapter} onChange={(event) => setSelectedAdapter(event.target.value as WorkflowAdapterId)}>
            {workflowAdapters.map((adapter) => <option key={adapter.id} value={adapter.id}>{workflowAdapterName(adapter.id, locale)}</option>)}
          </select>
        </label>
        <button className="primary-button" disabled={busy || nodes.length >= 15} onClick={addNode} type="button">{text.add}</button>
      </section>

      <div className="workflow-studio-actions workflow-run-actions">
        <button className="primary-button" disabled={busy || nodes.length === 0} onClick={() => void runWorkflow()} type="button">{busy ? text.running : text.run}</button>
        <button className="secondary-button" disabled={busy || nodes.length === 0} onClick={fillExamples} type="button">{text.loadExample}</button>
        <button className="secondary-button" disabled={busy} onClick={() => activeRecipe === 'custom' ? loadBlank() : loadRecipe(workflowRecipes.find((item) => item.id === activeRecipe) ?? workflowRecipes[0])} type="button">{text.reset}</button>
      </div>

      {notice && <p aria-live="polite" className={`workflow-studio-notice${noticeIsError ? ' is-error' : ''}`} role={noticeIsError ? 'alert' : 'status'}>{notice}</p>}
      <p className="workflow-step-hint">{text.stepHint}</p>
      <ol className="workflow-node-list" aria-label={text.node}>
        {orderedNodes.map((node, index) => {
          const adapter = workflowAdapterById(node.adapterId);
          if (!adapter) return null;
          const tool = toolBySlug(adapter.toolSlug);
          const run = runs[node.id] ?? { state: 'idle' as const };
          return (
            <li className="workflow-node-item" data-node-id={node.id} key={node.id}>
              <article className="workflow-node-card" aria-labelledby={`workflow-node-title-${node.id}`}>
                <header className="workflow-node-heading">
                  <div><span className="workflow-node-number">{index + 1}</span><div><p>{text.node} {index + 1}</p><h2 id={`workflow-node-title-${node.id}`}>{workflowAdapterName(node.adapterId, locale)}</h2></div></div>
                  <button aria-label={`${text.remove}: ${workflowAdapterName(node.adapterId, locale)}`} className="quiet-button workflow-remove-button" disabled={busy} onClick={() => removeNode(node.id)} type="button">{text.remove}</button>
                </header>
                <div className="workflow-node-body">
                  {adapter.inputs.map((port) => {
                    const edge = edges.find((item) => item.toNodeId === node.id && item.toPortId === port.id);
                    const candidates = nodes.filter((candidate) => {
                      if (candidate.id === node.id) return false;
                      const source = workflowAdapterById(candidate.adapterId);
                      return source?.outputType === port.type && (!edges.some((item) => item.fromNodeId === candidate.id) || edges.some((item) => item.fromNodeId === candidate.id && item.toNodeId === node.id && item.toPortId === port.id));
                    });
                    return (
                      <fieldset className="workflow-input-port" key={port.id}>
                        <legend>{port.label[locale]}{port.required ? ' *' : ''}</legend>
                        {candidates.length > 0 && <label className="workflow-connect-field">
                          <span>{text.connectFrom}</span>
                          <select aria-label={`${port.label[locale]} — ${text.connectFrom}`} disabled={busy} onChange={(event) => changeConnection(node, port.id, event.target.value)} value={edge?.fromNodeId ?? ''}>
                            <option value="">{text.unconnected}</option>
                            {candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{workflowAdapterName(candidate.adapterId, locale)}</option>)}
                          </select>
                        </label>}
                        {edge && <p className="workflow-connected-note">{text.connected}</p>}
                        <textarea aria-label={`${workflowAdapterName(node.adapterId, locale)}: ${port.label[locale]}`} disabled={busy || Boolean(edge)} onChange={(event) => updateInput(node.id, port.id, event.target.value)} required={port.required && !edge} rows={port.type === 'json' || port.type === 'schema' || port.type === 'openapi' || port.type === 'har' || port.type === 'markdown' || port.type === 'files' ? 6 : 3} value={edge ? '' : inputs[node.id]?.[port.id] ?? ''} />
                      </fieldset>
                    );
                  })}
                  <div className="workflow-node-output"><strong>{adapter.outputLabel[locale]}</strong><span>{text.output}: {adapter.outputType}</span></div>
                  {tool && <Link className="workflow-tool-detail" href={`/${locale}/tools/${tool.slug}/`}>{text.toolsInRecipe}: {tool.name[locale]} <span aria-hidden="true">→</span></Link>}
                  <div className={`workflow-node-result is-${run.state}`} aria-live="polite">
                    <h3>{text.result} · {run.state === 'idle' ? text.nodeReady : run.state === 'complete' ? text.nodeComplete : run.state === 'error' ? text.nodeError : run.state === 'skipped' ? text.skipped : text.running}</h3>
                    {run.summary && <p>{run.summary}</p>}
                    {run.error && <p role="alert">{run.error}</p>}
                    {run.output && <pre><code>{run.output}</code></pre>}
                    {run.warning && <p className="workflow-warning">{run.warning}</p>}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
        {nodes.length === 0 && <li className="workflow-empty-state">{text.noNodes}</li>}
      </ol>

      <section className="workflow-recipe-file-actions" aria-label={text.recipe}>
        <p>{text.recipeOnly}</p>
        <div className="workflow-studio-actions">
          <button className="secondary-button" disabled={busy} onClick={() => fileInputRef.current?.click()} type="button">{text.import}</button>
          <button className="secondary-button" disabled={busy || nodes.length === 0} onClick={() => void exportRecipe()} type="button">{text.export}</button>
          <input accept="application/json,.json" aria-label={text.import} className="visually-hidden" onChange={(event) => void importRecipe(event.currentTarget.files?.[0])} ref={fileInputRef} type="file" />
        </div>
      </section>
      {workflowRecipeSlugs.includes(activeRecipe as WorkflowRecipeSlug) && <p className="guide-link"><Link href={`/${locale}/guides/${activeRecipe}/`}>{text.openGuide}<span aria-hidden="true"> →</span></Link></p>}
      <SuccessConfetti />
    </main>
  );
}
