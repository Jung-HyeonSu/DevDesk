import { ExpandedToolError, runExpandedTool, type ExpandedToolInput, type ExpandedToolSlug } from './expanded-tools';

type RequestMessage = { id: number; slug: ExpandedToolSlug; input: ExpandedToolInput };
type ResponseMessage = { id: number; ok: true; result: ReturnType<typeof runExpandedTool> } | { id: number; ok: false; code: string; message: string };

self.onmessage = (event: MessageEvent<RequestMessage>) => {
  const { id, slug, input } = event.data;
  let response: ResponseMessage;
  try {
    response = { id, ok: true, result: runExpandedTool(slug, input) };
  } catch (error) {
    response = error instanceof ExpandedToolError
      ? { id, ok: false, code: error.code, message: error.message }
      : { id, ok: false, code: 'unexpected', message: error instanceof Error ? error.message : 'Unexpected tool error.' };
  }
  self.postMessage(response);
};
