import { isWithinInputLimit, MAX_TEXT_INPUT_BYTES } from './limits';

export const MAX_TOOL_INPUT_BYTES = MAX_TEXT_INPUT_BYTES;

export type JsonToolErrorCode = 'too-large' | 'syntax';

export class JsonToolError extends Error {
  constructor(
    readonly code: JsonToolErrorCode,
    readonly line?: number,
    readonly column?: number,
  ) {
    super(code);
    this.name = 'JsonToolError';
  }
}

function assertInputSize(input: string) {
  if (!isWithinInputLimit(input)) {
    throw new JsonToolError('too-large');
  }
}

function syntaxLocation(input: string, message: string) {
  const position = message.match(/position\s+(\d+)/i)?.[1];
  if (position) {
    const offset = Math.min(Number(position), input.length);
    const before = input.slice(0, offset);
    const line = before.split(/\r\n|\r|\n/).length;
    const lastLineBreak = Math.max(before.lastIndexOf('\n'), before.lastIndexOf('\r'));
    return { line, column: offset - lastLineBreak };
  }
  const lineColumn = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  return lineColumn ? { line: Number(lineColumn[1]), column: Number(lineColumn[2]) } : {};
}

export function parseJson(input: string): unknown {
  assertInputSize(input);
  try {
    return JSON.parse(input) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const location = syntaxLocation(input, message);
    throw new JsonToolError('syntax', location.line, location.column);
  }
}

export function formatJson(input: string, indent: 2 | 4 = 2): string {
  return JSON.stringify(parseJson(input), null, indent);
}

export function minifyJson(input: string): string {
  return JSON.stringify(parseJson(input));
}

export function validateJson(input: string): void {
  parseJson(input);
}
