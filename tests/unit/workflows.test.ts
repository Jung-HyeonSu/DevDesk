import { describe, expect, it } from 'vitest';
import { workflowRecipes } from '@/data/workflow-recipes';
import { workflowAdapters, workflowAdapterById, runWorkflowAdapter } from '@/lib/tools/workflow-adapters';
import { orderWorkflowNodes, WorkflowGraphError } from '@/lib/workflows/graph';

describe('workflow graph validation', () => {
  it('keeps all starter recipes acyclic, typed, and runnable in order', () => {
    for (const recipe of workflowRecipes) {
      const order = orderWorkflowNodes(recipe.nodes, recipe.edges);
      const outputs = new Map<string, string>();
      for (const node of order) {
        const adapter = workflowAdapterById(node.adapterId);
        expect(adapter).toBeDefined();
        const input = { ...adapter!.sampleInputs };
        for (const edge of recipe.edges.filter((candidate) => candidate.toNodeId === node.id)) {
          input[edge.toPortId] = outputs.get(edge.fromNodeId) ?? '';
        }
        const result = runWorkflowAdapter(node.adapterId, input);
        outputs.set(node.id, result.output);
        expect(result.output).not.toBe('');
      }
      expect(outputs.size).toBe(recipe.nodes.length);
    }
  });

  it('exposes the existing JSON formatter alongside the eight new tools', () => {
    expect(workflowAdapters.map((adapter) => adapter.id)).toContain('json-formatter');
    expect(workflowAdapters).toHaveLength(9);
    expect(workflowAdapters.every((adapter) => adapter.inputs.length > 0 && adapter.outputType)).toBe(true);
  });

  it('rejects cycles, branches, duplicate input connections, and mismatched port types', () => {
    const nodes = [
      { id: 'a', adapterId: 'json-formatter' as const },
      { id: 'b', adapterId: 'json-formatter' as const },
      { id: 'c', adapterId: 'curl-fetch-converter' as const },
    ];
    const edge = { fromNodeId: 'a', fromPortId: 'output' as const, toNodeId: 'b', toPortId: 'json' };
    expect(() => orderWorkflowNodes(nodes.slice(0, 2), [edge, { ...edge, fromNodeId: 'b', toNodeId: 'a' }])).toThrowError(WorkflowGraphError);
    expect(() => orderWorkflowNodes(nodes.slice(0, 2), [edge, { ...edge, toNodeId: 'a', toPortId: 'json' }])).toThrowError(WorkflowGraphError);
    expect(() => orderWorkflowNodes(nodes, [edge, { ...edge, toNodeId: 'c', toPortId: 'command' }])).toThrowError(WorkflowGraphError);
    expect(() => orderWorkflowNodes(nodes.slice(0, 2), [edge, { ...edge, toPortId: 'other' }])).toThrowError(WorkflowGraphError);
  });
});
