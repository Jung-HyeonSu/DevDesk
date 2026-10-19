import { describe, expect, it } from 'vitest';
import { Base64ToolError, decodeBase64, encodeBase64 } from '@/lib/tools/base64';

describe('Base64 UTF-8 encoder and decoder', () => {
  it.each(['Hello, world!', '안녕하세요', '日本語', '中文', 'Hello 👋 🌏', ''])('round trips UTF-8 text: %s', (value) => {
    expect(decodeBase64(encodeBase64(value))).toBe(value);
  });

  it('supports unpadded URL-safe Base64', () => {
    const encoded = encodeBase64('💻', true);
    expect(encoded).toBe('8J-Suw');
    expect(decodeBase64(encoded, true)).toBe('💻');
    expect(encodeBase64('\uFFFF', true)).toBe('77-_');
    expect(decodeBase64('77-_', true)).toBe('\uFFFF');
  });

  it.each(['?', 'a', 'AA='])('rejects malformed Base64: %s', (value) => {
    expect(() => decodeBase64(value)).toThrowError(expect.objectContaining({ code: 'invalid-base64' }));
  });

  it('distinguishes invalid UTF-8 bytes from malformed Base64', () => {
    expect(() => decodeBase64('/w==')).toThrowError(expect.objectContaining({ code: 'invalid-utf8' }));
  });

  it('enforces the shared 1 MB limit on input', () => {
    expect(() => encodeBase64('a'.repeat(1024 * 1024 + 1))).toThrowError(expect.objectContaining({ code: 'too-large' }));
    expect(() => decodeBase64('a'.repeat(1024 * 1024 + 1))).toThrowError(Base64ToolError);
  });
});
