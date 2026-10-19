import { isWithinInputLimit } from './limits';

export type UrlToolErrorCode = 'too-large' | 'invalid-escape' | 'invalid-unicode';

export class UrlToolError extends Error {
  constructor(readonly code: UrlToolErrorCode) {
    super(code);
    this.name = 'UrlToolError';
  }
}

function assertInputSize(input: string) {
  if (!isWithinInputLimit(input)) throw new UrlToolError('too-large');
}

export function encodeUrlComponent(input: string): string {
  assertInputSize(input);
  try {
    return encodeURIComponent(input);
  } catch {
    throw new UrlToolError('invalid-unicode');
  }
}

export function decodeUrlComponent(input: string): string {
  assertInputSize(input);
  try {
    return decodeURIComponent(input);
  } catch {
    throw new UrlToolError('invalid-escape');
  }
}
