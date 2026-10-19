'use client';

import { useCallback, useEffect, useState } from 'react';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '@/components/tools/workbench-primitives';
import { useWorkbenchStatus } from '@/components/tools/workbench-feedback';
import type { Locale } from '@/i18n/config';
import { workbenchMessages } from '@/i18n/workbench';
import { Base64ToolError, decodeBase64, encodeBase64 } from '@/lib/tools/base64';

const sample = '안녕하세요, DevDesk 👋';

export function Base64Workbench({ locale }: { locale: Locale }) {
  const text = workbenchMessages[locale];
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [status, setStatus] = useWorkbenchStatus(null);

  const run = useCallback((mode: 'encode' | 'decode') => {
    if (!input.length) {
      setOutput('');
      setStatus({ kind: 'error', message: text.base64EmptyInput });
      return;
    }
    try {
      setOutput(mode === 'encode' ? encodeBase64(input, urlSafe) : decodeBase64(input, urlSafe));
      setStatus({ kind: 'success', message: mode === 'encode' ? text.encodingSuccess : text.decodingSuccess });
    } catch (error) {
      setOutput('');
      const message = error instanceof Base64ToolError
        ? error.code === 'too-large' ? text.inputTooLarge : error.code === 'invalid-utf8' ? text.invalidUtf8 : text.invalidBase64
        : text.invalidBase64;
      setStatus({ kind: 'error', message });
    }
  }, [input, setStatus, text, urlSafe]);

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
    anchor.download = 'base64-result.txt';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({ kind: 'success', message: text.downloaded });
  };

  return (
    <section className="base64-workbench" aria-label={text.base64ToolLabel}>
      <EditorPanel locale={locale} label={text.input} value={input} onChange={setInput} language="text" placeholder={text.base64InputHint} />
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={() => run('encode')} variant="primary">{text.encode}</ActionButton>
        <ActionButton onClick={() => run('decode')}>{text.decode}</ActionButton>
        <ActionButton onClick={swap} disabled={!output}>{text.swap}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
        <label className="workbench-option"><input type="checkbox" checked={urlSafe} onChange={(event) => setUrlSafe(event.target.checked)} />{text.urlSafe}</label>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      <EditorPanel locale={locale} label={text.output} value={output} readOnly language="text" placeholder={text.base64OutputHint} />
      <ActionToolbar>
        <ActionButton onClick={() => void copy()} disabled={!output}>{text.copy}</ActionButton>
        <ActionButton onClick={download} disabled={!output}>{text.downloadText}</ActionButton>
      </ActionToolbar>
    </section>
  );
}
