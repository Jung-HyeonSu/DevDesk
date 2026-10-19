'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '@/components/tools/workbench-primitives';
import { useWorkbenchStatus } from '@/components/tools/workbench-feedback';
import { useToolHandoff } from '@/components/tools/tool-handoff';
import type { Locale } from '@/i18n/config';
import { handoffMessages } from '@/i18n/handoff';
import { workbenchMessages } from '@/i18n/workbench';
import { jsonToYaml, YamlJsonToolError, yamlToJson } from '@/lib/tools/yaml-json';

type ConversionDirection = 'yaml-to-json' | 'json-to-yaml';
const yamlSample = 'name: DevDesk\nenabled: true\nversion: "1.0"\ntags:\n  - developer\n  - 工具\ndescription: |\n  Convert YAML and JSON in your browser.\n  No input is sent to a server.\n';
const jsonSample = '{\n  "name": "DevDesk",\n  "enabled": true,\n  "version": "1.0",\n  "tags": ["developer", "工具"],\n  "description": "Convert YAML and JSON in your browser.\\nNo input is sent to a server."\n}';

export function YamlJsonWorkbench({ locale }: { locale: Locale }) {
  const text = workbenchMessages[locale];
  const handoffText = handoffMessages[locale];
  const router = useRouter();
  const { sendHandoff, peekHandoff, receiveHandoff } = useToolHandoff();
  const [initialHandoff] = useState(() => peekHandoff('yaml-json'));
  const [direction, setDirection] = useState<ConversionDirection>(initialHandoff?.mode === 'json-to-yaml' ? 'json-to-yaml' : 'yaml-to-json');
  const [indent, setIndent] = useState<2 | 4>(2);
  const [input, setInput] = useState(initialHandoff?.value ?? '');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useWorkbenchStatus(
    initialHandoff ? { kind: 'info', message: handoffText.received } : null,
  );

  useEffect(() => {
    if (initialHandoff) receiveHandoff('yaml-json');
  }, [initialHandoff, receiveHandoff]);
  const inputLabel = text.input;
  const outputLabel = text.output;
  const isYamlInput = direction === 'yaml-to-json';
  const inputLanguage = isYamlInput ? 'yaml' : 'json';
  const outputLanguage = isYamlInput ? 'json' : 'yaml';

  const convertInput = useCallback((value: string) => (
    isYamlInput ? yamlToJson(value, indent) : jsonToYaml(value, indent)
  ), [indent, isYamlInput]);

  const statusForError = useCallback((error: unknown) => {
    if (!(error instanceof YamlJsonToolError)) return text.yamlNotJsonCompatible;
    const messages = {
      'empty-input': text.emptyInput,
      'too-large': text.inputTooLarge,
      'too-deep': text.yamlTooDeep,
      'too-many-aliases': text.yamlTooManyAliases,
      'invalid-yaml': text.yamlInvalidYaml,
      'invalid-json': text.yamlInvalidJson,
      'not-json-compatible': text.yamlNotJsonCompatible,
    };
    const message = messages[error.code];
    if (error.code === 'invalid-yaml' && error.line && error.column) {
      return message + ' ' + text.yamlErrorPosition.replace('{line}', String(error.line)).replace('{column}', String(error.column));
    }
    return message;
  }, [text]);

  const run = useCallback((mode: 'convert' | 'validate') => {
    try {
      const nextOutput = convertInput(input);
      if (mode === 'convert') setOutput(nextOutput);
      setStatus({ kind: 'success', message: mode === 'convert' ? text.yamlConverted : text.yamlValid });
    } catch (error) {
      if (mode === 'convert') setOutput('');
      setStatus({ kind: 'error', message: statusForError(error) });
    }
  }, [convertInput, input, setStatus, statusForError, text]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        run('convert');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [run]);

  const loadSample = () => {
    setInput(isYamlInput ? yamlSample : jsonSample);
    setOutput('');
    setStatus({ kind: 'info', message: text.sampleLoaded });
  };
  const clear = () => {
    setInput('');
    setOutput('');
    setStatus({ kind: 'info', message: text.cleared });
  };
  const changeDirection = (nextDirection: ConversionDirection) => {
    setDirection(nextDirection);
    setOutput('');
    setStatus(null);
  };
  const changeIndent = (nextIndent: 2 | 4) => {
    setIndent(nextIndent);
    setOutput('');
    setStatus(null);
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
    const extension = isYamlInput ? 'json' : 'yaml';
    const url = URL.createObjectURL(new Blob([output], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'converted.' + extension;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({ kind: 'success', message: text.downloaded });
  };
  const openInJson = () => {
    sendHandoff('json-formatter', output);
    router.push(`/${locale}/tools/json-formatter/`);
  };

  return (
    <section className="yaml-json-workbench" aria-label={text.yamlToolLabel}>
      <p className="workbench-note">{text.yamlNotice}</p>
      <div className="yaml-json-settings">
        <label className="workbench-field" htmlFor="yaml-json-direction">
          <span>{text.yamlDirection}</span>
          <select id="yaml-json-direction" value={direction} onChange={(event) => changeDirection(event.target.value as ConversionDirection)}>
            <option value="yaml-to-json">{text.yamlToJson}</option>
            <option value="json-to-yaml">{text.jsonToYaml}</option>
          </select>
        </label>
        <label className="workbench-field" htmlFor="yaml-json-indent">
          <span>{text.indentation}</span>
          <select id="yaml-json-indent" value={indent} onChange={(event) => changeIndent(Number(event.target.value) as 2 | 4)}>
            <option value={2}>{text.twoSpaces}</option>
            <option value={4}>{text.fourSpaces}</option>
          </select>
        </label>
      </div>
      <div className="yaml-json-editors">
        <EditorPanel locale={locale} label={inputLabel} value={input} onChange={(value) => { setInput(value); setOutput(''); setStatus(null); }} language={inputLanguage} placeholder={isYamlInput ? text.yamlInputHint : text.jsonInputHint} />
        <EditorPanel locale={locale} label={outputLabel} value={output} readOnly language={outputLanguage} placeholder={text.yamlOutputHint} />
      </div>
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={() => run('convert')} variant="primary">{text.yamlConvert}</ActionButton>
        <ActionButton onClick={() => run('validate')}>{text.validate}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      <ActionToolbar>
        <ActionButton onClick={() => void copy()} disabled={!output}>{text.copy}</ActionButton>
        <ActionButton onClick={download} disabled={!output}>{text.downloadText}</ActionButton>
        <ActionButton onClick={openInJson} disabled={!output || !isYamlInput}>{handoffText.openJson}</ActionButton>
      </ActionToolbar>
    </section>
  );
}
