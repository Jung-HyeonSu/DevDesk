import { diffLines } from 'diff';
import { isWithinInputLimit } from './limits';

export type DiffRowKind = 'same' | 'added' | 'removed' | 'changed';
export type DiffRow = {
  kind: DiffRowKind;
  original: string | null;
  modified: string | null;
  originalLine: number | null;
  modifiedLine: number | null;
};
export type TextDiffResult = {
  rows: DiffRow[];
  added: number;
  removed: number;
  changed: number;
};
export type TextDiffErrorCode = 'too-large' | 'too-many-lines' | 'too-complex';

const MAX_LINES_PER_SIDE = 5000;

export class TextDiffError extends Error {
  constructor(readonly code: TextDiffErrorCode) {
    super(code);
    this.name = 'TextDiffError';
  }
}

function asLines(value: string): string[] {
  if (value === '') return [];
  const lines = value.split('\n');
  if (lines.at(-1) === '') lines.pop();
  return lines;
}

function createRows(before: string, after: string, ignoreWhitespace: boolean): Omit<DiffRow, 'originalLine' | 'modifiedLine'>[] {
  const chunks = diffLines(before, after, {
    ignoreWhitespace,
    stripTrailingCr: true,
    maxEditLength: 1000,
    timeout: 500,
  });
  if (!chunks) throw new TextDiffError('too-complex');

  const rows: Omit<DiffRow, 'originalLine' | 'modifiedLine'>[] = [];
  let index = 0;
  while (index < chunks.length) {
    const chunk = chunks[index];
    if (!chunk.added && !chunk.removed) {
      for (const line of asLines(chunk.value)) rows.push({ kind: 'same', original: line, modified: line });
      index += 1;
      continue;
    }

    const removedLines: string[] = [];
    const addedLines: string[] = [];
    while (index < chunks.length && chunks[index].removed) {
      removedLines.push(...asLines(chunks[index].value));
      index += 1;
    }
    while (index < chunks.length && chunks[index].added) {
      addedLines.push(...asLines(chunks[index].value));
      index += 1;
    }
    const pairedLines = Math.min(removedLines.length, addedLines.length);
    for (let lineIndex = 0; lineIndex < pairedLines; lineIndex += 1) {
      rows.push({ kind: 'changed', original: removedLines[lineIndex], modified: addedLines[lineIndex] });
    }
    for (const line of removedLines.slice(pairedLines)) rows.push({ kind: 'removed', original: line, modified: null });
    for (const line of addedLines.slice(pairedLines)) rows.push({ kind: 'added', original: null, modified: line });
  }
  return rows;
}

export function diffText(beforeInput: string, afterInput: string, ignoreWhitespace = false): TextDiffResult {
  const combined = beforeInput + afterInput;
  if (!isWithinInputLimit(beforeInput) || !isWithinInputLimit(afterInput) || !isWithinInputLimit(combined)) {
    throw new TextDiffError('too-large');
  }
  const before = beforeInput.replace(/\r\n?/g, '\n');
  const after = afterInput.replace(/\r\n?/g, '\n');
  const beforeLineCount = asLines(before).length;
  const afterLineCount = asLines(after).length;
  if (beforeLineCount > MAX_LINES_PER_SIDE || afterLineCount > MAX_LINES_PER_SIDE) {
    throw new TextDiffError('too-many-lines');
  }

  const rows = createRows(before, after, ignoreWhitespace);
  let originalLine = 0;
  let modifiedLine = 0;
  let added = 0;
  let removed = 0;
  let changed = 0;
  const numberedRows = rows.map((row) => {
    const hasOriginal = row.original !== null;
    const hasModified = row.modified !== null;
    if (row.kind === 'added') added += 1;
    if (row.kind === 'removed') removed += 1;
    if (row.kind === 'changed') changed += 1;
    return {
      ...row,
      originalLine: hasOriginal ? ++originalLine : null,
      modifiedLine: hasModified ? ++modifiedLine : null,
    };
  });
  return { rows: numberedRows, added, removed, changed };
}

export type DiffCopyLabels = { summary: string; added: string; removed: string; changed: string };

export function formatDiffForCopy(
  result: TextDiffResult,
  labels: DiffCopyLabels = { summary: 'Change summary', added: 'Added lines', removed: 'Removed lines', changed: 'Changed lines' },
): string {
  const summary = [
    labels.summary,
    labels.added + ': ' + result.added,
    labels.removed + ': ' + result.removed,
    labels.changed + ': ' + result.changed,
  ].join('\n');
  const lines = result.rows.flatMap((row) => {
    if (row.kind === 'same') return ['  ' + row.original];
    if (row.kind === 'added') return ['+ ' + row.modified];
    if (row.kind === 'removed') return ['- ' + row.original];
    return ['- ' + row.original, '+ ' + row.modified];
  });
  return summary + '\n\n' + lines.join('\n');
}
