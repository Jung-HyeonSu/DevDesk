'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '@/components/tools/workbench-primitives';
import type { Locale } from '@/i18n/config';
import { workbenchMessages } from '@/i18n/workbench';
import {
  MAX_REGEX_MATCHES,
  RegexToolError,
  validateRegexInput,
  type RegexAnalysis,
  type RegexErrorCode,
  type RegexMatch,
} from '@/lib/tools/regex';
import type { RegexWorkerResponse } from '@/lib/tools/regex.worker';

const workerTimeoutMs = 1_000;
const samplePattern = '(?<word>\\w+)-(\\d+)';
const sampleFlags = 'gi';
const sampleInput = 'alpha-12\nbeta-34';
type HighlightPart = { value: string; match: boolean; key: number };

function highlightParts(input: string, matches: RegexMatch[]): HighlightPart[] {
  const parts: HighlightPart[] = [];
  let cursor = 0;
  for (const [key, match] of matches.entries()) {
    if (match.endIndex <= match.index || match.index < cursor) continue;
    if (match.index > cursor) parts.push({ value: input.slice(cursor, match.index), match: false, key: key * 2 });
    parts.push({ value: input.slice(match.index, match.endIndex), match: true, key: key * 2 + 1 });
    cursor = match.endIndex;
  }
  if (cursor < input.length) parts.push({ value: input.slice(cursor), match: false, key: matches.length * 2 });
  return parts;
}

function createCopyText(result: RegexAnalysis, labels: { summary: string; matches: string; captures: string }): string {
  const lines = result.matches.map((match, index) => {
    const captures = [...match.captures.map((value, captureIndex) => (captureIndex + 1) + ': ' + JSON.stringify(value)),
      ...match.namedCaptures.map(({ name, value }) => name + ': ' + JSON.stringify(value))];
    return (index + 1) + '. [' + match.index + ', ' + match.endIndex + ') ' + JSON.stringify(match.value)
      + (captures.length ? ' | ' + labels.captures + ': ' + captures.join(', ') : '');
  });
  return labels.summary + ': ' + result.matches.length + (result.truncated ? '+' : '')
    + '\n' + labels.matches + ': ' + lines.length + (result.truncated ? '+' : '')
    + (lines.length ? '\n' + lines.join('\n') : '');
}

export function RegexWorkbench({ locale }: { locale: Locale }) {
  const text = workbenchMessages[locale];
  const [pattern, setPattern] = useState(samplePattern);
  const [flags, setFlags] = useState(sampleFlags);
  const [input, setInput] = useState(sampleInput);
  const [result, setResult] = useState<RegexAnalysis | null>(null);
  const [status, setStatus] = useState<{ kind: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [pending, setPending] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const stopWorker = useCallback(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  const messageForError = useCallback((code: RegexErrorCode) => ({
    'invalid-flags': text.regexInvalidFlags,
    'invalid-pattern': text.regexInvalidPattern,
    'too-large': text.regexTooLarge,
  })[code], [text]);

  const run = useCallback(() => {
    stopWorker();
    const id = ++requestIdRef.current;
    setResult(null);
    try {
      validateRegexInput(pattern, input);
    } catch (error) {
      const code = error instanceof RegexToolError ? error.code : 'too-large';
      setPending(false);
      setStatus({ kind: 'error', message: messageForError(code) });
      return;
    }

    let worker: Worker;
    try {
      worker = new Worker(new URL('../../../lib/tools/regex.worker.ts', import.meta.url), { type: 'module' });
    } catch {
      setPending(false);
      setStatus({ kind: 'error', message: text.regexWorkerError });
      return;
    }
    workerRef.current = worker;
    setPending(true);
    setStatus({ kind: 'info', message: text.regexRunning });
    let timeoutId: number | null = null;
    const finish = (complete: () => void) => {
      if (requestIdRef.current !== id) return;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      if (timeoutRef.current === timeoutId) timeoutRef.current = null;
      if (workerRef.current === worker) workerRef.current = null;
      worker.terminate();
      setPending(false);
      complete();
    };
    timeoutId = window.setTimeout(() => {
      if (requestIdRef.current !== id) return;
      requestIdRef.current += 1;
      timeoutRef.current = null;
      workerRef.current = null;
      worker.terminate();
      setPending(false);
      setResult(null);
      setStatus({ kind: 'error', message: text.regexTimeout });
    }, workerTimeoutMs);
    timeoutRef.current = timeoutId;
    worker.onmessage = (event: MessageEvent<RegexWorkerResponse>) => {
      const response = event.data;
      if (response.id !== id) return;
      finish(() => {
        if (!response.ok) {
          setResult(null);
          setStatus({ kind: 'error', message: messageForError(response.error) });
          return;
        }
        setResult(response.result);
        setStatus({ kind: 'success', message: text.regexCompleted });
      });
    };
    worker.onerror = () => finish(() => {
      setResult(null);
      setStatus({ kind: 'error', message: text.regexWorkerError });
    });
    worker.postMessage({ id, pattern, flags, input });
  }, [flags, input, messageForError, pattern, stopWorker, text]);

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

  useEffect(() => () => {
    requestIdRef.current += 1;
    stopWorker();
  }, [stopWorker]);

  const loadSample = () => {
    stopWorker();
    requestIdRef.current += 1;
    setPending(false);
    setPattern(samplePattern);
    setFlags(sampleFlags);
    setInput(sampleInput);
    setResult(null);
    setStatus({ kind: 'info', message: text.sampleLoaded });
  };
  const clear = () => {
    stopWorker();
    requestIdRef.current += 1;
    setPending(false);
    setPattern('');
    setFlags('g');
    setInput('');
    setResult(null);
    setStatus({ kind: 'info', message: text.cleared });
  };
  const copyText = result ? createCopyText(result, {
    summary: text.regexMatchCount,
    matches: text.regexMatches,
    captures: text.regexCaptures,
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
    anchor.download = 'regex-matches.txt';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({ kind: 'success', message: text.downloaded });
  };

  return (
    <section className="regex-workbench" aria-label={text.regexToolLabel}>
      <p className="workbench-note">{text.regexNotice}</p>
      <div className="regex-settings">
        <label className="workbench-field">
          <span>{text.regexPattern}</span>
          <input aria-label={text.regexPattern} autoCapitalize="off" autoComplete="off" autoCorrect="off" disabled={pending} spellCheck={false} value={pattern} onChange={(event) => setPattern(event.target.value)} />
        </label>
        <label className="workbench-field">
          <span>{text.regexFlags}</span>
          <input aria-label={text.regexFlags} autoCapitalize="off" autoComplete="off" autoCorrect="off" disabled={pending} spellCheck={false} value={flags} onChange={(event) => setFlags(event.target.value)} />
          <small>{text.regexFlagsHint}</small>
        </label>
      </div>
      <EditorPanel locale={locale} label={text.regexInput} value={input} onChange={setInput} placeholder={text.regexInputHint} readOnly={pending} />
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={run} variant="primary" disabled={pending}>{pending ? text.regexRunning : text.regexRun}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      {result && (
        <section className="regex-results" aria-label={text.regexResults}>
          <h3>{text.regexResults}</h3>
          <p className="regex-match-count">{text.regexMatchCount}: <strong>{result.matches.length}{result.truncated ? '+' : ''}</strong></p>
          {result.truncated && <p className="workbench-note">{text.regexTruncated.replace('{count}', String(MAX_REGEX_MATCHES))}</p>}
          <section className="regex-highlight-panel" aria-label={text.regexHighlightedText}>
            <h4>{text.regexHighlightedText}</h4>
            <pre className="regex-highlight"><code>{highlightParts(input, result.matches).map((part) => (
              part.match
                ? <mark key={part.key}>{part.value}</mark>
                : <Fragment key={part.key}>{part.value}</Fragment>
            ))}</code></pre>
          </section>
          {result.matches.length > 0 ? (
            <div className="regex-table-scroll">
              <table className="regex-match-table">
                <caption className="sr-only">{text.regexMatches}</caption>
                <thead><tr><th scope="col">#</th><th scope="col">{text.regexMatch}</th><th scope="col">{text.regexIndex}</th><th scope="col">{text.regexCaptures}</th></tr></thead>
                <tbody>{result.matches.map((match, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td><code>{JSON.stringify(match.value)}</code></td>
                    <td><code>{match.index}–{match.endIndex}</code></td>
                    <td>
                      {match.captures.length || match.namedCaptures.length ? (
                        <ul>{match.captures.map((value, captureIndex) => <li key={'capture-' + captureIndex}>{captureIndex + 1}: <code>{JSON.stringify(value)}</code></li>)}
                          {match.namedCaptures.map(({ name, value }) => <li key={'named-' + name}>{name}: <code>{JSON.stringify(value)}</code></li>)}
                        </ul>
                      ) : '—'}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <p className="status-message status-info">{text.regexNoMatches}</p>}
          <p className="regex-index-note">{text.regexIndexHint}</p>
          <ActionToolbar>
            <ActionButton onClick={() => void copy()}>{text.copy}</ActionButton>
            <ActionButton onClick={download}>{text.downloadText}</ActionButton>
          </ActionToolbar>
        </section>
      )}
    </section>
  );
}
