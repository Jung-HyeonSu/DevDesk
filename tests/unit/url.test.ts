import { describe, expect, it } from 'vitest';
import { decodeUrlComponent, encodeUrlComponent, UrlToolError } from '@/lib/tools/url';

describe('URL component encoder and decoder', () => {
  it('encodes reserved characters, spaces, CJK, and emoji as one component', () => {
    const input = 'a b&c=d?你好 🌏';
    const encoded = encodeUrlComponent(input);
    expect(encoded).toBe('a%20b%26c%3Dd%3F%E4%BD%A0%E5%A5%BD%20%F0%9F%8C%8F');
    expect(decodeUrlComponent(encoded)).toBe(input);
  });

  it('keeps a plus sign literal instead of treating it as a space', () => {
    expect(decodeUrlComponent('a+b')).toBe('a+b');
    expect(encodeUrlComponent('a+b')).toBe('a%2Bb');
  });

  it.each(['%', '%2', '%GG', '%E0%A4%A'])('rejects malformed percent escapes: %s', (input) => {
    expect(() => decodeUrlComponent(input)).toThrowError(expect.objectContaining({ code: 'invalid-escape' }));
  });

  it('reports unpaired UTF-16 surrogates and enforces the shared input limit', () => {
    expect(() => encodeUrlComponent('\uD800')).toThrowError(expect.objectContaining({ code: 'invalid-unicode' }));
    expect(() => decodeUrlComponent('a'.repeat(1024 * 1024 + 1))).toThrowError(UrlToolError);
  });
});
