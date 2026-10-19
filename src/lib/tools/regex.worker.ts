import { analyzeRegex, type RegexAnalysis, type RegexErrorCode } from './regex';

export type RegexWorkerRequest = { id: number; pattern: string; flags: string; input: string };
export type RegexWorkerResponse =
  | { id: number; ok: true; result: RegexAnalysis }
  | { id: number; ok: false; error: RegexErrorCode };

type RegexWorkerScope = {
  addEventListener(type: 'message', listener: (event: MessageEvent<RegexWorkerRequest>) => void): void;
  postMessage(message: RegexWorkerResponse): void;
};

const workerScope = self as unknown as RegexWorkerScope;
workerScope.addEventListener('message', (event) => {
  try {
    workerScope.postMessage({ id: event.data.id, ok: true, result: analyzeRegex(event.data.pattern, event.data.flags, event.data.input) });
  } catch (error) {
    const code: RegexErrorCode = error instanceof Error && 'code' in error
      ? error.code as RegexErrorCode
      : 'invalid-pattern';
    workerScope.postMessage({ id: event.data.id, ok: false, error: code });
  }
});

export {};
