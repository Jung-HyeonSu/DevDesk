'use client';

import { useCallback, useEffect, useState } from 'react';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '@/components/tools/workbench-primitives';
import { useWorkbenchStatus } from '@/components/tools/workbench-feedback';
import type { Locale } from '@/i18n/config';
import { workbenchMessages } from '@/i18n/workbench';
import { generateUuids, UuidToolError } from '@/lib/tools/uuid';

export function UuidWorkbench({ locale }: { locale: Locale }) {
  const text = workbenchMessages[locale];
  const [count, setCount] = useState('1');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useWorkbenchStatus(null);

  const run = useCallback(() => {
    if (!window.isSecureContext) {
      setOutput('');
      setStatus({ kind: 'error', message: text.uuidUnavailable });
      return;
    }
    try {
      setOutput(generateUuids(Number(count)).join('\n'));
      setStatus({ kind: 'success', message: text.uuidGenerated });
    } catch (error) {
      setOutput('');
      setStatus({ kind: 'error', message: error instanceof UuidToolError && error.code === 'invalid-count' ? text.uuidInvalidCount : text.uuidUnavailable });
    }
  }, [count, setStatus, text]);

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
    setCount('3');
    setOutput('');
    setStatus({ kind: 'info', message: text.sampleLoaded });
  };
  const clear = () => {
    setCount('1');
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
    anchor.download = 'uuids.txt';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({ kind: 'success', message: text.downloaded });
  };

  return (
    <section className="uuid-workbench" aria-label={text.uuidToolLabel}>
      <p className="workbench-note">{text.uuidSecurityNote}</p>
      <label className="workbench-field" htmlFor="uuid-count">
        <span>{text.uuidCountLabel}</span>
        <input className="workbench-input" id="uuid-count" type="number" min="1" max="100" step="1" value={count} onChange={(event) => setCount(event.target.value)} />
      </label>
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.uuidCountSample}</ActionButton>
        <ActionButton onClick={run} variant="primary">{text.uuidGenerate}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      <EditorPanel locale={locale} label={text.output} value={output} readOnly language="text" placeholder={text.urlOutputHint} />
      <ActionToolbar>
        <ActionButton onClick={() => void copy()} disabled={!output}>{text.copy}</ActionButton>
        <ActionButton onClick={download} disabled={!output}>{text.downloadText}</ActionButton>
      </ActionToolbar>
    </section>
  );
}
