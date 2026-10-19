import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateUuids, MAX_UUID_COUNT, UuidToolError } from '@/lib/tools/uuid';

afterEach(() => vi.unstubAllGlobals());

describe('UUID v4 generator', () => {
  it('generates cryptographic UUID v4 values and respects the 1–100 count range', () => {
    const values = generateUuids(MAX_UUID_COUNT);
    expect(values).toHaveLength(MAX_UUID_COUNT);
    expect(new Set(values).size).toBe(MAX_UUID_COUNT);
    for (const value of values) expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it.each([0, -1, 101, 1.5, Number.NaN])('rejects invalid count %s', (count) => {
    expect(() => generateUuids(count)).toThrowError(expect.objectContaining({ code: 'invalid-count' }));
  });

  it('reports when cryptographic UUID support is unavailable', () => {
    vi.stubGlobal('crypto', {});
    expect(() => generateUuids(1)).toThrowError(UuidToolError);
    expect(() => generateUuids(1)).toThrowError(expect.objectContaining({ code: 'unsupported' }));
  });
});
