const MAX_INPUT_BYTES = 1024 * 1024;

export class JsonPointerToolError extends Error {
  constructor(readonly code: 'empty' | 'too-large' | 'invalid-json' | 'invalid-pointer' | 'not-found') {
    super(code);
    this.name = 'JsonPointerToolError';
  }
}

export type JsonPointerInspection = {
  value: unknown;
  formattedValue: string;
  valueType: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  segmentCount: number;
};

function assertSize(value: string) {
  if (new TextEncoder().encode(value).byteLength > MAX_INPUT_BYTES) throw new JsonPointerToolError('too-large');
}

function decodeToken(token: string) {
  if (/~(?![01])/.test(token)) throw new JsonPointerToolError('invalid-pointer');
  return token.replaceAll('~1', '/').replaceAll('~0', '~');
}

export function inspectJsonPointer(jsonText: string, pointer: string): JsonPointerInspection {
  if (!jsonText.trim()) throw new JsonPointerToolError('empty');
  assertSize(jsonText);
  assertSize(pointer);

  let root: unknown;
  try {
    root = JSON.parse(jsonText);
  } catch {
    throw new JsonPointerToolError('invalid-json');
  }

  if (pointer !== '' && !pointer.startsWith('/')) throw new JsonPointerToolError('invalid-pointer');
  const tokens = pointer === '' ? [] : pointer.slice(1).split('/').map(decodeToken);
  let value = root;

  for (const token of tokens) {
    if (Array.isArray(value)) {
      if (!/^(0|[1-9]\d*)$/.test(token)) throw new JsonPointerToolError('not-found');
      const index = Number(token);
      if (!Number.isSafeInteger(index) || index >= value.length) throw new JsonPointerToolError('not-found');
      value = value[index];
    } else if (value !== null && typeof value === 'object') {
      if (!Object.prototype.hasOwnProperty.call(value, token)) throw new JsonPointerToolError('not-found');
      value = (value as Record<string, unknown>)[token];
    } else {
      throw new JsonPointerToolError('not-found');
    }
  }

  const valueType = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  return {
    value,
    formattedValue: JSON.stringify(value, null, 2),
    valueType: valueType as JsonPointerInspection['valueType'],
    segmentCount: tokens.length,
  };
}
