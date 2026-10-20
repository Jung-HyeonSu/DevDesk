'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '@/components/tools/workbench-primitives';
import { useWorkbenchStatus } from '@/components/tools/workbench-feedback';
import type { Locale } from '@/i18n/config';
import { workbenchMessages } from '@/i18n/workbench';
import { diffText, formatDiffForCopy, TextDiffError, type TextDiffResult } from '@/lib/tools/text-diff';

const sampleBefore = 'name: DevDesk\nstatus: draft\n東京\n';
const sampleAfter = 'name: DevDesk\nstatus: ready\n東京\n🌏\n';
type DiffView = 'side-by-side' | 'unified';

export function TextDiffWorkbench({ locale }: { locale: Locale }) {
  const text = workbenchMessages[locale];
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [result, setResult] = useState<TextDiffResult | null>(null);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [view, setView] = useState<DiffView>('side-by-side');
  const [status, setStatus] = useWorkbenchStatus(null);

  const run = useCallback(() => {
    try {
      const nextResult = diffText(before, after, ignoreWhitespace);
      setResult(nextResult);
      const noChanges = nextResult.added === 0 && nextResult.removed === 0 && nextResult.changed === 0;
      setStatus(noChanges
        ? { kind: 'info', message: text.diffNoChanges }
        : { kind: 'success', message: text.diffCompared });
    } catch (error) {
      setResult(null);
      const code = error instanceof TextDiffError ? error.code : 'too-complex';
      const messages = {
        'too-large': text.diffTooLarge,
        'too-many-lines': text.diffTooManyLines,
        'too-complex': text.diffTooComplex,
      };
      setStatus({ kind: 'error', message: messages[code] });
    }
  }, [after, before, ignoreWhitespace, setStatus, text]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        run();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [run]);

  const loadSample = () => {
    setBefore(sampleBefore);
    setAfter(sampleAfter);
    setResult(null);
    setStatus({ kind: 'info', message: text.sampleLoaded });
  };
  const clear = () => {
    setBefore('');
    setAfter('');
    setResult(null);
    setStatus({ kind: 'info', message: text.cleared });
  };
  const copyText = result ? formatDiffForCopy(result, {
    summary: text.diffSummary,
    added: text.diffAdded,
    removed: text.diffRemoved,
    changed: text.diffChanged,
  }) : '';
  const copy = async () => {
    if (!copyText) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(copyText);
      copied = true;
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = copyText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.append(textarea);
        textarea.select();
        copied = document.execCommand('copy');
        textarea.remove();
      } catch {
        copied = false;
      }
    }
    setStatus(copied ? { kind: 'success', message: text.copied } : { kind: 'error', message: text.copyError });
  };
  const download = () => {
    if (!copyText) return;
    const url = URL.createObjectURL(new Blob([copyText], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'text-diff.txt';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({ kind: 'success', message: text.downloaded });
  };

  return (
    <section className="diff-workbench" aria-label={text.diffToolLabel}>
      <p className="workbench-note">{text.diffNotice}</p>
      <div className="diff-input-grid">
        <EditorPanel locale={locale} label={text.diffBeforeLabel} value={before} onChange={setBefore} placeholder={text.diffBeforeHint} />
        <EditorPanel locale={locale} label={text.diffAfterLabel} value={after} onChange={setAfter} placeholder={text.diffAfterHint} />
      </div>
      <label className="workbench-option">
        <input type="checkbox" checked={ignoreWhitespace} onChange={(event) => setIgnoreWhitespace(event.target.checked)} />
        <span>{text.diffIgnoreWhitespace}</span>
      </label>
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={run} variant="primary">{text.diffCompare}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      {result && (
        <section className="diff-results" aria-label={text.diffSummary}>
          <h3>{text.diffSummary}</h3>
          <dl className="diff-summary">
            <div><dt>{text.diffAdded}</dt><dd>{result.added}</dd></div>
            <div><dt>{text.diffRemoved}</dt><dd>{result.removed}</dd></div>
            <div><dt>{text.diffChanged}</dt><dd>{result.changed}</dd></div>
          </dl>
          <div className="diff-view-tabs" role="tablist" aria-label={text.diffViewLabel}>
            <button
              aria-controls="diff-panel"
              aria-selected={view === 'side-by-side'}
              id="diff-tab-side-by-side"
              onClick={() => setView('side-by-side')}
              role="tab"
              type="button"
            >{text.diffSideBySide}</button>
            <button
              aria-controls="diff-panel"
              aria-selected={view === 'unified'}
              id="diff-tab-unified"
              onClick={() => setView('unified')}
              role="tab"
              type="button"
            >{text.diffUnified}</button>
          </div>
          <div aria-labelledby={view === 'side-by-side' ? 'diff-tab-side-by-side' : 'diff-tab-unified'} className="diff-panel" id="diff-panel" role="tabpanel">
            {view === 'side-by-side' ? (
              <div className="diff-table-scroll">
                <table className="diff-table">
                  <colgroup>
                    <col className="diff-line-number-column" />
                    <col />
                    <col className="diff-line-number-column" />
                    <col />
                  </colgroup>
                  <thead><tr><th colSpan={2}>{text.diffBeforeLabel}</th><th colSpan={2}>{text.diffAfterLabel}</th></tr></thead>
                  <tbody>
                    {result.rows.map((row, index) => (
                      <tr className={'diff-row diff-row-' + row.kind} key={index}>
                        <td className="diff-line-number">{row.originalLine ?? ''}</td>
                        <td className="diff-line-content">{row.original ?? ''}</td>
                        <td className="diff-line-number">{row.modifiedLine ?? ''}</td>
                        <td className="diff-line-content">{row.modified ?? ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="diff-unified">
                {result.rows.map((row, index) => (
                  <Fragment key={index}>
                    {row.kind === 'changed' ? (
                      <>
                        <div className="diff-unified-row diff-row-removed"><span>{row.originalLine}</span><code>- {row.original}</code></div>
                        <div className="diff-unified-row diff-row-added"><span>{row.modifiedLine}</span><code>+ {row.modified}</code></div>
                      </>
                    ) : (
                      <div className={'diff-unified-row diff-row-' + row.kind}>
                        <span>{row.kind === 'added' ? row.modifiedLine : row.originalLine}</span>
                        <code>{(row.kind === 'added' ? '+ ' : row.kind === 'removed' ? '- ' : '  ') + (row.original ?? row.modified ?? '')}</code>
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            )}
          </div>
          <ActionToolbar>
            <ActionButton onClick={() => void copy()}>{text.copy}</ActionButton>
            <ActionButton onClick={download}>{text.downloadText}</ActionButton>
          </ActionToolbar>
        </section>
      )}
    </section>
  );
}
