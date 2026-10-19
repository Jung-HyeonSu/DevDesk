import { isWithinInputLimit } from './limits';

export type Base64ToolErrorCode = 'too-large' | 'invalid-base64' | 'invalid-utf8';

export class Base64ToolError extends Error {
  constructor(readonly code: Base64ToolErrorCode) {
    super(code);
    this.name = 'Base64ToolError';
  }
}

export function encodeBase64(input: string, urlSafe = false): string {
  if (!isWithinInputLimit(input)) throw new Base64ToolError('too-large');
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  const encoded = btoa(binary);
  return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '') : encoded;
}

function normalizeBase64(input: string, urlSafe: boolean) {
  const compact = input.replace(/\s+/g, '');
  const allowed = urlSafe ? /^[A-Za-z0-9_-]*={0,2}$/ : /^[A-Za-z0-9+/]*={0,2}$/;
  if (!allowed.test(compact)) throw new Base64ToolError('invalid-base64');
  const unpadded = compact.replace(/=+$/g, '');
  if (unpadded.length % 4 === 1) throw new Base64ToolError('invalid-base64');
  const paddingLength = compact.length - unpadded.length;
  if (paddingLength > 0 && compact.length % 4 !== 0) throw new Base64ToolError('invalid-base64');
  const standard = urlSafe ? unpadded.replace(/-/g, '+').replace(/_/g, '/') : unpadded;
  return standard.padEnd(standard.length + ((4 - standard.length % 4) % 4), '=');
}

export function decodeBase64(input: string, urlSafe = false): string {
  if (!isWithinInputLimit(input)) throw new Base64ToolError('too-large');
  const normalized = normalizeBase64(input, urlSafe);
  let binary: string;
  try {
    binary = atob(normalized);
  } catch {
    throw new Base64ToolError('invalid-base64');
  }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Base64ToolError('invalid-utf8');
  }
}
