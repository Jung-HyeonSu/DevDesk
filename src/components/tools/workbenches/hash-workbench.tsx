'use client';

import { useCallback, useEffect, useState } from 'react';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '@/components/tools/workbench-primitives';
import type { Locale } from '@/i18n/config';
import { workbenchMessages } from '@/i18n/workbench';
import { hashText, HashToolError, type HashAlgorithm } from '@/lib/tools/hash';

const algorithms: HashAlgorithm[] = ['SHA-256', 'SHA-384', 'SHA-512'];

export function HashWorkbench({ locale }: { locale: Locale }) {
  const text = workbenchMessages[locale];
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [includeBase64, setIncludeBase64] = useState(false);
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error' | 'info'; message: string } | null>(null);

  const run = useCallback(async () => {
    if (!window.isSecureContext) {
      setOutput('');
      setStatus({ kind: 'error', message: text.hashUnavailable });
      return;
    }
    setBusy(true);
    setStatus({ kind: 'info', message: text.loading });
    try {
      const digest = await hashText(input, algorithm);
      const lines = [`${algorithm} (${text.hashHexLabel}): ${digest.hex}`];
      if (includeBase64) lines.push(`${algorithm} (${text.hashBase64Label}): ${digest.base64}`);
      setOutput(lines.join('\n'));
      setStatus({ kind: 'success', message: text.hashGenerated });
    } catch (error) {
      setOutput('');
      const message = error instanceof HashToolError && error.code === 'too-large' ? text.inputTooLarge : text.hashUnavailable;
      setStatus({ kind: 'error', message });
    } finally {
      setBusy(false);
    }
  }, [algorithm, includeBase64, input, text]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        void run();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [run]);

  const loadSample = () => {
    setInput('abc');
    setOutput('');
    setStatus({ kind: 'info', message: text.sampleLoaded });
  };
  const clear = () => {
    setInput('');
    setOutput('');
    setStatus({ kind: 'info', message: text.cleared });
  };
  const copy = async () => {
    if (!output) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(output);
      copied = true;
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = output;
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
    if (!output) return;
    const url = URL.createObjectURL(new Blob([output], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'hash.txt';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({ kind: 'success', message: text.downloaded });
  };

  return (
    <section className="hash-workbench" aria-label={text.hashToolLabel}>
      <p className="workbench-note">{text.hashSecurityNote}</p>
      <div className="workbench-settings">
        <label htmlFor="hash-algorithm">{text.hashAlgorithmLabel}</label>
        <select id="hash-algorithm" value={algorithm} onChange={(event) => setAlgorithm(event.target.value as HashAlgorithm)}>
          {algorithms.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <label className="workbench-option" htmlFor="hash-base64">
          <input id="hash-base64" type="checkbox" checked={includeBase64} onChange={(event) => setIncludeBase64(event.target.checked)} />
          {text.hashIncludeBase64}
        </label>
      </div>
      <EditorPanel locale={locale} label={text.input} value={input} onChange={setInput} language="text" placeholder={text.hashInputHint} />
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={() => void run()} variant="primary" disabled={busy}>{text.hashGenerate}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{busy ? text.loading : status.message}</StatusMessage>}
      <EditorPanel locale={locale} label={text.output} value={output} readOnly language="text" placeholder={text.urlOutputHint} />
      <ActionToolbar>
        <ActionButton onClick={() => void copy()} disabled={!output || busy}>{text.copy}</ActionButton>
        <ActionButton onClick={download} disabled={!output || busy}>{text.downloadText}</ActionButton>
      </ActionToolbar>
    </section>
  );
}
