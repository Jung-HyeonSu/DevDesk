import { describe, expect, it } from 'vitest';
import { analyzeRegex } from '@/lib/tools/regex';

describe('regex analysis', () => {
  it('returns matches, numbered and named captures, and UTF-16 indexes', () => {
    const result = analyzeRegex('(?<word>\\w+)-(\\d+)', 'gi', 'alpha-12 beta-34');
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0]).toMatchObject({
      value: 'alpha-12', index: 0, endIndex: 8, captures: ['alpha', '12'],
      namedCaptures: [{ name: 'word', value: 'alpha' }],
    });
    expect(result.flags).toBe('gi');
    expect(result.truncated).toBe(false);
  });

  it('advances zero-length global matches without looping, including Unicode code points', () => {
    const result = analyzeRegex('(?=.)', 'gu', '🌏a');
    expect(result.matches.map((match) => match.index)).toEqual([0, 2]);
    expect(analyzeRegex('^|$', 'g', 'x').matches.map((match) => match.index)).toEqual([0, 1]);
    expect(analyzeRegex('', 'g', '').matches.map((match) => match.index)).toEqual([0]);
  });

  it('reports malformed patterns and invalid flags separately', () => {
    expect(() => analyzeRegex('(', 'g', 'text')).toThrowError(expect.objectContaining({ code: 'invalid-pattern' }));
    expect(() => analyzeRegex('word', 'gg', 'text')).toThrowError(expect.objectContaining({ code: 'invalid-flags' }));
  });

  it('caps displayed matches and rejects oversized input', () => {
    expect(analyzeRegex('a', 'g', 'a'.repeat(501))).toMatchObject({ matches: Array(500).fill(expect.any(Object)), truncated: true });
    expect(() => analyzeRegex('.', 'g', 'x'.repeat(1_100_000))).toThrowError(
      expect.objectContaining({ code: 'too-large' }),
    );
    expect(() => analyzeRegex('x'.repeat(2_001), '', '')).toThrowError(
      expect.objectContaining({ code: 'too-large' }),
    );
  });
});
