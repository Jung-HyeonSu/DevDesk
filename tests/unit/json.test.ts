import { describe, expect, it } from 'vitest';
import { formatJson, JsonToolError, MAX_TOOL_INPUT_BYTES, minifyJson, parseJson, validateJson } from '@/lib/tools/json';

describe('JSON formatter', () => {
  it('formats objects and arrays and supports JSON primitive values', () => {
    expect(formatJson('{"name":"DevDesk","active":true}', 2)).toBe(JSON.stringify({ name: 'DevDesk', active: true }, null, 2));
    expect(formatJson('[1,2]', 4)).toBe(JSON.stringify([1, 2], null, 4));
    expect(parseJson('42')).toBe(42);
    expect(parseJson('false')).toBe(false);
    expect(parseJson('null')).toBeNull();
  });

  it('minifies, validates, and preserves Unicode', () => {
    expect(minifyJson('{ "hello": "안녕하세요 🌏" }')).toBe('{"hello":"안녕하세요 🌏"}');
    expect(() => validateJson('["日本語", "中文"]')).not.toThrow();
  });

  it.each(['{"value":"missing quote}', '{"value":1,}'])('reports a safe syntax error for invalid JSON: %s', (input) => {
    expect(() => validateJson(input)).toThrowError(expect.objectContaining({ code: 'syntax' }));
  });

  it('extracts a parser location when the runtime provides one', () => {
    try {
      validateJson('{"value":1,}');
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(JsonToolError);
      expect((error as JsonToolError).line).toBeGreaterThan(0);
      expect((error as JsonToolError).column).toBeGreaterThan(0);
    }
  });

  it('accepts input up to 1 MB and rejects larger input before parsing', () => {
    const boundary = `"${'a'.repeat(MAX_TOOL_INPUT_BYTES - 2)}"`;
    expect(() => validateJson(boundary)).not.toThrow();
    expect(() => parseJson(`${boundary} `)).toThrowError(expect.objectContaining({ code: 'too-large' }));
  });
});
