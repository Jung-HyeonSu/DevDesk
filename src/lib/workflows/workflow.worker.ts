import { ExpandedToolError, type ExpandedToolInput } from '@/lib/tools/expanded-tools';
import { runWorkflowAdapter, type WorkflowAdapterId } from '@/lib/tools/workflow-adapters';

type RequestMessage = { id: number; adapterId: WorkflowAdapterId; input: ExpandedToolInput };
type ResponseMessage = { id: number; ok: true; output: string; summary: string; warning?: string } | { id: number; ok: false; code: string; message: string };

self.onmessage = (event: MessageEvent<RequestMessage>) => {
  const { id, adapterId, input } = event.data;
  let response: ResponseMessage;
  try {
    const result = runWorkflowAdapter(adapterId, input);
    response = { id, ok: true, output: result.output, summary: result.summary, warning: result.warning };
  } catch (error) {
    response = error instanceof ExpandedToolError
      ? { id, ok: false, code: error.code, message: error.message }
      : { id, ok: false, code: 'unexpected', message: error instanceof Error ? error.message : 'Unexpected workflow error.' };
  }
  self.postMessage(response);
};
