import { isWithinInputLimit, MAX_TEXT_INPUT_BYTES } from './limits';

export const MAX_REGEX_PATTERN_LENGTH = 2_000;
export const MAX_REGEX_MATCHES = 500;

export type RegexCapture = { name: string; value: string | undefined };
export type RegexMatch = {
  value: string;
  index: number;
  endIndex: number;
  captures: Array<string | undefined>;
  namedCaptures: RegexCapture[];
};
export type RegexAnalysis = { matches: RegexMatch[]; truncated: boolean; flags: string };
export type RegexErrorCode = 'invalid-flags' | 'invalid-pattern' | 'too-large';

export class RegexToolError extends Error {
  constructor(readonly code: RegexErrorCode) {
    super(code);
    this.name = 'RegexToolError';
  }
}

export function validateRegexInput(pattern: string, input: string): void {
  const patternBytes = new TextEncoder().encode(pattern).byteLength;
  const inputBytes = new TextEncoder().encode(input).byteLength;
  if (
    pattern.length > MAX_REGEX_PATTERN_LENGTH
    || !isWithinInputLimit(pattern)
    || !isWithinInputLimit(input)
    || patternBytes + inputBytes > MAX_TEXT_INPUT_BYTES
  ) {
    throw new RegexToolError('too-large');
  }
}

function advanceStringIndex(input: string, index: number, unicode: boolean): number {
  if (!unicode || index + 1 >= input.length) return index + 1;
  const first = input.charCodeAt(index);
  const second = input.charCodeAt(index + 1);
  if (first >= 0xd800 && first <= 0xdbff && second >= 0xdc00 && second <= 0xdfff) return index + 2;
  return index + 1;
}

export function analyzeRegex(pattern: string, flags: string, input: string): RegexAnalysis {
  validateRegexInput(pattern, input);

  try {
    new RegExp('', flags);
  } catch {
    throw new RegexToolError('invalid-flags');
  }

  let expression: RegExp;
  try {
    expression = new RegExp(pattern, flags);
  } catch {
    throw new RegexToolError('invalid-pattern');
  }

  const matches: RegexMatch[] = [];
  let truncated = false;
  while (true) {
    const match = expression.exec(input);
    if (!match) break;
    matches.push({
      value: match[0],
      index: match.index,
      endIndex: match.index + match[0].length,
      captures: match.slice(1),
      namedCaptures: Object.entries(match.groups ?? {}).map(([name, value]) => ({ name, value })),
    });
    if (!expression.global) break;
    if (matches.length >= MAX_REGEX_MATCHES) {
      truncated = true;
      break;
    }
    if (match[0].length === 0) {
      const nextIndex = advanceStringIndex(input, expression.lastIndex, expression.unicode || expression.unicodeSets);
      if (nextIndex > input.length) break;
      expression.lastIndex = nextIndex;
    }
  }

  return { matches, truncated, flags: expression.flags };
}
