import { describe, expect, it } from 'vitest';
import { diffText, formatDiffForCopy } from '@/lib/tools/text-diff';

describe('line-based text diff', () => {
  it('pairs changed lines and counts added, removed, and changed rows', () => {
    const result = diffText('alpha\nbeta\ngamma\n', 'alpha\nBETA\ndelta\ngamma\n');
    expect(result).toMatchObject({ added: 1, removed: 0, changed: 1 });
    expect(result.rows.map((row) => row.kind)).toEqual(['same', 'changed', 'added', 'same']);
    expect(result.rows[1]).toMatchObject({
      original: 'beta', modified: 'BETA', originalLine: 2, modifiedLine: 2,
    });
    expect(result.rows[2]).toMatchObject({ kind: 'added', original: null, modified: 'delta', modifiedLine: 3 });
  });

  it('handles CJK, emoji, and blank-line additions and deletions as text', () => {
    const result = diffText('안녕하세요\n\n東京\n中文\n', '안녕하세요\n🌏\n東京\n中文\n');
    expect(result).toMatchObject({ added: 0, removed: 0, changed: 1 });
    expect(result.rows.some((row) => row.kind === 'changed' && row.original === '' && row.modified === '🌏')).toBe(true);
    expect(diffText('first\n\nsecond\n', 'first\nsecond\n').removed).toBe(1);
  });

  it('normalizes CRLF and LF and returns no changes for identical text', () => {
    const normalized = diffText('first\r\nsecond\r\n', 'first\nsecond\n');
    expect(normalized).toMatchObject({ added: 0, removed: 0, changed: 0 });
    expect(normalized.rows).toHaveLength(2);
    expect(diffText('', '')).toMatchObject({ rows: [], added: 0, removed: 0, changed: 0 });
  });

  it('can ignore leading and trailing whitespace changes when requested', () => {
    const before = 'alpha  \nbeta\n';
    const after = 'alpha\nbeta\t\n';
    expect(diffText(before, after).changed).toBe(2);
    expect(diffText(before, after, true)).toMatchObject({ rows: [{ kind: 'same' }, { kind: 'same' }], changed: 0 });
    expect(diffText('  spaced  ', 'spaced', true)).toMatchObject({ added: 0, removed: 0, changed: 0 });
  });

  it('formats a safe unified text copy with a change summary', () => {
    const copied = formatDiffForCopy(diffText('old\nsame\n', 'new\nsame\n'));
    expect(copied).toBe('Change summary\nAdded lines: 0\nRemoved lines: 0\nChanged lines: 1\n\n- old\n+ new\n  same');
  });

  it('limits combined input bytes and line counts', () => {
    expect(() => diffText('a'.repeat(600_000), 'b'.repeat(500_000))).toThrowError(
      expect.objectContaining({ code: 'too-large' }),
    );
    expect(() => diffText('line\n'.repeat(5001), '')).toThrowError(
      expect.objectContaining({ code: 'too-many-lines' }),
    );
  });

  it('stops when a large change exceeds the edit budget', () => {
    const before = Array.from({ length: 600 }, (_, index) => 'old-' + index).join('\n');
    const after = Array.from({ length: 600 }, (_, index) => 'new-' + index).join('\n');
    expect(() => diffText(before, after)).toThrowError(expect.objectContaining({ code: 'too-complex' }));
  });
});
