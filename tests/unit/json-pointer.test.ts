import { describe, expect, it } from 'vitest';
import { inspectJsonPointer, JsonPointerToolError } from '@/lib/tools/json-pointer';

describe('JSON Pointer inspector', () => {
  it('returns the document root for an empty pointer', () => {
    expect(inspectJsonPointer('{"ok":true}', '')).toMatchObject({ value: { ok: true }, valueType: 'object', segmentCount: 0 });
  });

  it('follows nested object keys and array indexes', () => {
    expect(inspectJsonPointer('{"items":[{"name":"Ada"}]}', '/items/0/name')).toMatchObject({
      value: 'Ada', formattedValue: '"Ada"', valueType: 'string', segmentCount: 3,
    });
  });

  it('decodes RFC 6901 escaped key tokens', () => {
    expect(inspectJsonPointer('{"a/b":{"~key":42}}', '/a~1b/~0key').value).toBe(42);
  });

  it('reports malformed escapes and missing values separately', () => {
    expect(() => inspectJsonPointer('{"a":1}', '/a~2')).toThrowError(JsonPointerToolError);
    expect(() => inspectJsonPointer('{"a":1}', '/b')).toThrowError('not-found');
    expect(() => inspectJsonPointer('{"items":[1]}', '/items/01')).toThrowError('not-found');
  });

  it('distinguishes empty and invalid JSON input', () => {
    expect(() => inspectJsonPointer('  ', '')).toThrowError('empty');
    expect(() => inspectJsonPointer('{bad}', '')).toThrowError('invalid-json');
  });
});
