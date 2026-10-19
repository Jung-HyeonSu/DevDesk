import { isWithinInputLimit } from './limits';

export type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';
export type HashToolErrorCode = 'too-large' | 'unsupported' | 'digest-failed';

export class HashToolError extends Error {
  constructor(readonly code: HashToolErrorCode) {
    super(code);
    this.name = 'HashToolError';
  }
}

export async function hashText(input: string, algorithm: HashAlgorithm): Promise<{ hex: string; base64: string }> {
  if (!isWithinInputLimit(input)) throw new HashToolError('too-large');
  const subtle = globalThis.crypto?.subtle;
  if (!subtle || typeof subtle.digest !== 'function') throw new HashToolError('unsupported');
  try {
    const digest = new Uint8Array(await subtle.digest(algorithm, new TextEncoder().encode(input)));
    let binary = '';
    for (const byte of digest) binary += String.fromCharCode(byte);
    return {
      hex: Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join(''),
      base64: btoa(binary),
    };
  } catch {
    throw new HashToolError('digest-failed');
  }
}
