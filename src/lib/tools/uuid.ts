export const MAX_UUID_COUNT = 100;

export type UuidToolErrorCode = 'invalid-count' | 'unsupported';

export class UuidToolError extends Error {
  constructor(readonly code: UuidToolErrorCode) {
    super(code);
    this.name = 'UuidToolError';
  }
}

export function generateUuids(count: number): string[] {
  if (!Number.isInteger(count) || count < 1 || count > MAX_UUID_COUNT) throw new UuidToolError('invalid-count');
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID !== 'function') throw new UuidToolError('unsupported');
  return Array.from({ length: count }, () => randomUUID.call(globalThis.crypto));
}
