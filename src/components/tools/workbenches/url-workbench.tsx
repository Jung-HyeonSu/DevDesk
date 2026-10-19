'use client';

import { useCallback, useEffect, useState } from 'react';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '@/components/tools/workbench-primitives';
import type { Locale } from '@/i18n/config';
import { workbenchMessages } from '@/i18n/workbench';
import { encodeUrlComponent, decodeUrlComponent, UrlToolError } from '@/lib/tools/url';

const sample = 'name=DevDesk &tag=tools 🌏';

export function UrlWorkbench({ locale }: { locale: Locale }) {
  const text = workbenchMessages[locale];
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<{ kind: 'success' | 'error' | 'info'; message: string } | null>(null);

  const run = useCallback((mode: 'encode' | 'decode') => {
    if (!input.length) {
      setOutput('');
      setStatus({ kind: 'error', message: text.urlEmptyInput });
      return;
    }
    try {
      setOutput(mode === 'encode' ? encodeUrlComponent(input) : decodeUrlComponent(input));
      setStatus({ kind: 'success', message: mode === 'encode' ? text.urlEncodeSuccess : text.urlDecodeSuccess });
    } catch (error) {
      setOutput('');
      const message = error instanceof UrlToolError
        ? error.code === 'too-large' ? text.inputTooLarge : error.code === 'invalid-unicode' ? text.urlInvalidUnicode : text.urlInvalidEscape
        : text.urlInvalidEscape;
      setStatus({ kind: 'error', message });
    }
  }, [input, text]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        run('encode');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [run]);

  const clear = () => {
    setInput('');
    setOutput('');
    setStatus({ kind: 'info', message: text.cleared });
  };
  const loadSample = () => {
    setInput(sample);
    setOutput('');
    setStatus({ kind: 'info', message: text.sampleLoaded });
  };
  const swap = () => {
    setInput(output);
    setOutput(input);
    setStatus({ kind: 'info', message: text.swapped });
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
    anchor.download = 'url-component.txt';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({ kind: 'success', message: text.downloaded });
  };

  return (
    <section className="url-workbench" aria-label={text.urlToolLabel}>
      <p className="workbench-note">{text.urlComponentNotice}</p>
      <EditorPanel locale={locale} label={text.input} value={input} onChange={setInput} language="text" placeholder={text.urlInputHint} />
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={() => run('encode')} variant="primary">{text.urlEncode}</ActionButton>
        <ActionButton onClick={() => run('decode')}>{text.urlDecode}</ActionButton>
        <ActionButton onClick={swap} disabled={!output}>{text.swap}</ActionButton>
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
