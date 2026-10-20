import { CodeFormatError, formatCode, type CodeFormatErrorCode } from './code-formatter';
import type { CodeLanguage } from './code-languages';

type FormatRequest = { id: number; source: string; language: CodeLanguage; indentWidth: 2 | 4 };
type FormatResponse = { id: number; output?: string; error?: CodeFormatErrorCode };
const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<FormatRequest>) => void) | null;
  postMessage: (message: FormatResponse) => void;
};

workerScope.onmessage = (event) => {
  const { id, source, language, indentWidth } = event.data;
  void formatCode(source, language, indentWidth, new URL('/', self.location.href).href).then(
    (output) => workerScope.postMessage({ id, output }),
    (error: unknown) => workerScope.postMessage({
      id,
      error: error instanceof CodeFormatError ? error.code : 'format-failed',
    }),
  );
};
