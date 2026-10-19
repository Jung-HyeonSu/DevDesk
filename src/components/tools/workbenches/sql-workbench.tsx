'use client';

import { useCallback, useEffect, useState } from 'react';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '@/components/tools/workbench-primitives';
import { useWorkbenchStatus } from '@/components/tools/workbench-feedback';
import type { Locale } from '@/i18n/config';
import { workbenchMessages } from '@/i18n/workbench';
import { formatSql, SqlToolError, type SqlDialect } from '@/lib/tools/sql';

const sample = "WITH active_users AS (SELECT id, name FROM users WHERE active = 1) SELECT u.id, COALESCE(p.total, 0) AS total FROM active_users u LEFT JOIN payments p ON p.user_id = u.id WHERE u.name = 'DevDesk' ORDER BY total DESC;";

export function SqlWorkbench({ locale }: { locale: Locale }) {
  const text = workbenchMessages[locale];
  const [input, setInput] = useState('');
  const [dialect, setDialect] = useState<SqlDialect>('generic');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useWorkbenchStatus(null);

  const run = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setStatus({ kind: 'error', message: text.sqlEmptyInput });
      return;
    }
    try {
      setOutput(formatSql(input, dialect));
      setStatus({ kind: 'success', message: text.sqlFormatted });
    } catch (error) {
      setOutput('');
      setStatus({ kind: 'error', message: error instanceof SqlToolError && error.code === 'too-large' ? text.inputTooLarge : text.sqlFormatError });
    }
  }, [dialect, input, setStatus, text]);

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
    setInput(sample);
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
    anchor.download = 'formatted.sql';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({ kind: 'success', message: text.downloaded });
  };

  return (
    <section className="sql-workbench" aria-label={text.sqlToolLabel}>
      <p className="workbench-note">{text.sqlNotice}</p>
      <div className="workbench-settings">
        <label htmlFor="sql-dialect">{text.sqlDialectLabel}</label>
        <select id="sql-dialect" value={dialect} onChange={(event) => setDialect(event.target.value as SqlDialect)}>
          <option value="generic">{text.sqlGeneric}</option>
          <option value="mysql">{text.sqlMysql}</option>
          <option value="mariadb">{text.sqlMariadb}</option>
          <option value="postgresql">{text.sqlPostgresql}</option>
          <option value="oracle">{text.sqlOracle}</option>
        </select>
      </div>
      <EditorPanel locale={locale} label={text.input} value={input} onChange={setInput} language="sql" placeholder={text.sqlInputHint} />
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={run} variant="primary">{text.sqlFormat}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      <EditorPanel locale={locale} label={text.output} value={output} readOnly language="sql" placeholder={text.urlOutputHint} />
      <ActionToolbar>
        <ActionButton onClick={() => void copy()} disabled={!output}>{text.copy}</ActionButton>
        <ActionButton onClick={download} disabled={!output}>{text.downloadText}</ActionButton>
      </ActionToolbar>
    </section>
  );
}
