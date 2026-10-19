import { afterEach, describe, expect, it, vi } from 'vitest';
import { hashText, HashToolError, type HashAlgorithm } from '@/lib/tools/hash';

afterEach(() => vi.unstubAllGlobals());

const vectors: Array<[HashAlgorithm, string]> = [
  ['SHA-256', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
  ['SHA-384', 'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7'],
  ['SHA-512', 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'],
];

describe('Web Crypto hash generator', () => {
  it.each(vectors)('matches the SHA-2 test vector for %s', async (algorithm, expectedHex) => {
    expect((await hashText('abc', algorithm)).hex).toBe(expectedHex);
  });

  it('hashes the empty string and returns matching hex and Base64 encodings', async () => {
    const result = await hashText('', 'SHA-256');
    expect(result.hex).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(result.base64).toBe('47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=');
  });

  it('hashes Unicode as UTF-8 bytes', async () => {
    const result = await hashText('안녕하세요 🌏', 'SHA-256');
    const expected = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode('안녕하세요 🌏'));
    expect(result.hex).toBe(Array.from(new Uint8Array(expected), (byte) => byte.toString(16).padStart(2, '0')).join(''));
  });

  it('enforces the shared 1 MB input limit', async () => {
    await expect(hashText('a'.repeat(1024 * 1024 + 1), 'SHA-256')).rejects.toThrowError(expect.objectContaining({ code: 'too-large' }));
  });

  it('reports when Web Crypto digest support is unavailable', async () => {
    vi.stubGlobal('crypto', {});
    await expect(hashText('abc', 'SHA-256')).rejects.toThrowError(HashToolError);
    await expect(hashText('abc', 'SHA-256')).rejects.toThrowError(expect.objectContaining({ code: 'unsupported' }));
  });
});
