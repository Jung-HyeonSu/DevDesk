'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EditorPanel, ActionButton, ActionToolbar, StatusMessage } from '@/components/tools/workbench-primitives';
import { useWorkbenchStatus } from '@/components/tools/workbench-feedback';
import { useToolHandoff } from '@/components/tools/tool-handoff';
import type { Locale } from '@/i18n/config';
import { handoffMessages } from '@/i18n/handoff';
import { workbenchMessages } from '@/i18n/workbench';
import { formatJson, JsonToolError, minifyJson, validateJson } from '@/lib/tools/json';

const sample = '{"name":"DevDesk","active":true,"count":3}';

export function JsonWorkbench({ locale }: { locale: Locale }) {
  const text = workbenchMessages[locale];
  const handoffText = handoffMessages[locale];
  const router = useRouter();
  const { sendHandoff, peekHandoff, receiveHandoff } = useToolHandoff();
  const [initialHandoff] = useState(() => peekHandoff('json-formatter'));
  const [input, setInput] = useState(initialHandoff?.value ?? '');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<2 | 4>(2);
  const [status, setStatus] = useWorkbenchStatus(
    initialHandoff ? { kind: 'info', message: handoffText.received } : null,
  );

  useEffect(() => {
    if (initialHandoff) receiveHandoff('json-formatter');
  }, [initialHandoff, receiveHandoff]);

  const loadSample = () => {
    setInput(sample);
    setOutput('');
    setStatus({ kind: 'info', message: text.sampleLoaded });
  };
  const clear = () => {
    setInput('');
    setOutput('');
    setStatus({ kind: 'info', message: text.cleared });
  };

  const run = useCallback((mode: 'beautify' | 'minify' | 'validate') => {
    if (!input.trim()) {
      setOutput('');
      setStatus({ kind: 'error', message: text.emptyInput });
      return;
    }
    try {
      if (mode === 'validate') {
        validateJson(input);
        setOutput(input);
        setStatus({ kind: 'success', message: text.validJson });
      } else {
        setOutput(mode === 'minify' ? minifyJson(input) : formatJson(input, indent));
        setStatus({ kind: 'success', message: text.validJson });
      }
    } catch (error) {
      setOutput('');
      if (error instanceof JsonToolError && error.code === 'too-large') {
        setStatus({ kind: 'error', message: text.inputTooLarge });
      } else if (error instanceof JsonToolError) {
        const position = error.line ? ` (${locale === 'ko' ? '줄' : locale === 'ja' ? '行' : locale === 'zh' ? '行' : 'line'} ${error.line}, ${locale === 'ko' ? '열' : locale === 'ja' ? '列' : locale === 'zh' ? '列' : 'column'} ${error.column})` : '';
        setStatus({ kind: 'error', message: `${text.invalidJson}${position}` });
      } else {
        setStatus({ kind: 'error', message: text.invalidJson });
      }
    }
  }, [indent, input, locale, setStatus, text]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        run('beautify');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [run]);

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
    if (!copied) {
      setStatus({ kind: 'error', message: text.copyError });
      return;
    }
    setStatus({ kind: 'success', message: text.copied });
  };

  const download = () => {
    if (!output) return;
    const url = URL.createObjectURL(new Blob([output], { type: 'application/json;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'formatted.json';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({ kind: 'success', message: text.downloaded });
  };

  const openInYaml = () => {
    sendHandoff('yaml-json', input, 'json-to-yaml');
    router.push(`/${locale}/tools/yaml-json/`);
  };

  return (
    <section className="json-workbench" aria-label={text.jsonToolLabel}>
      <div className="workbench-settings">
        <label htmlFor="json-indent">{text.indentation}</label>
        <select id="json-indent" value={indent} onChange={(event) => setIndent(Number(event.target.value) as 2 | 4)}>
          <option value={2}>{text.twoSpaces}</option><option value={4}>{text.fourSpaces}</option>
        </select>
      </div>
      <EditorPanel locale={locale} label={text.input} value={input} onChange={setInput} language="json" placeholder={text.jsonInputHint} />
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={() => run('beautify')} variant="primary">{text.beautify}</ActionButton>
        <ActionButton onClick={() => run('minify')}>{text.minify}</ActionButton>
        <ActionButton onClick={() => run('validate')}>{text.validate}</ActionButton>
        <ActionButton onClick={openInYaml} disabled={!input.trim()}>{handoffText.openYaml}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      <EditorPanel locale={locale} label={text.output} value={output} readOnly language="json" placeholder={text.jsonOutputHint} />
      <ActionToolbar>
        <ActionButton onClick={() => void copy()} disabled={!output}>{text.copy}</ActionButton>
        <ActionButton onClick={download} disabled={!output}>{text.download}</ActionButton>
      </ActionToolbar>
    </section>
  );
}
