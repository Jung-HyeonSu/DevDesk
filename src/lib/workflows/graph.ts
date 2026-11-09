import { workflowAdapterById } from '@/lib/tools/workflow-adapters';
import type { WorkflowEdge, WorkflowNode } from '@/data/workflow-recipes';

export class WorkflowGraphError extends Error {
  constructor(readonly code: 'duplicateNode' | 'unknownNode' | 'unknownAdapter' | 'unknownPort' | 'typeMismatch' | 'duplicateInput' | 'branch' | 'cycle', message: string) {
    super(message);
    this.name = 'WorkflowGraphError';
  }
}

export function orderWorkflowNodes(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const nodeById = new Map<string, WorkflowNode>();
  for (const node of nodes) {
    if (nodeById.has(node.id)) throw new WorkflowGraphError('duplicateNode', `Duplicate node ID: ${node.id}`);
    if (!workflowAdapterById(node.adapterId)) throw new WorkflowGraphError('unknownAdapter', `Unknown adapter: ${node.adapterId}`);
    nodeById.set(node.id, node);
  }

  const inputConnections = new Set<string>();
  const outgoingCount = new Map<string, number>();
  const indegree = new Map(nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(nodes.map((node) => [node.id, [] as string[]]));

  for (const edge of edges) {
    const from = nodeById.get(edge.fromNodeId);
    const to = nodeById.get(edge.toNodeId);
    if (!from || !to) throw new WorkflowGraphError('unknownNode', 'A connection references a missing node.');
    const fromAdapter = workflowAdapterById(from.adapterId);
    const toAdapter = workflowAdapterById(to.adapterId);
    if (!fromAdapter || !toAdapter) throw new WorkflowGraphError('unknownAdapter', 'A node uses an unavailable tool adapter.');
    if (edge.fromPortId !== 'output') throw new WorkflowGraphError('unknownPort', 'A connection references an unknown output port.');
    const input = toAdapter.inputs.find((port) => port.id === edge.toPortId);
    if (!input) throw new WorkflowGraphError('unknownPort', `Unknown input port: ${edge.toPortId}`);
    if (fromAdapter.outputType !== input.type) throw new WorkflowGraphError('typeMismatch', `${fromAdapter.outputType} cannot connect to ${input.type}.`);
    const inputKey = `${edge.toNodeId}:${edge.toPortId}`;
    if (inputConnections.has(inputKey)) throw new WorkflowGraphError('duplicateInput', 'An input can have only one connection.');
    inputConnections.add(inputKey);
    const nextCount = (outgoingCount.get(edge.fromNodeId) ?? 0) + 1;
    if (nextCount > 1) throw new WorkflowGraphError('branch', 'A node output can connect to only one next node.');
    outgoingCount.set(edge.fromNodeId, nextCount);
    outgoing.get(edge.fromNodeId)?.push(edge.toNodeId);
    indegree.set(edge.toNodeId, (indegree.get(edge.toNodeId) ?? 0) + 1);
  }

  const ready = nodes.filter((node) => indegree.get(node.id) === 0).map((node) => node.id);
  const result: WorkflowNode[] = [];
  while (ready.length) {
    const id = ready.shift() as string;
    const node = nodeById.get(id);
    if (node) result.push(node);
    for (const next of outgoing.get(id) ?? []) {
      const value = (indegree.get(next) ?? 1) - 1;
      indegree.set(next, value);
      if (value === 0) ready.push(next);
    }
  }
  if (result.length !== nodes.length) throw new WorkflowGraphError('cycle', 'A workflow cannot contain a cycle.');
  return result;
}
