'use client';

import { useCallback, useEffect, useState } from 'react';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '@/components/tools/workbench-primitives';
import type { Locale } from '@/i18n/config';
import { workbenchMessages } from '@/i18n/workbench';
import { CronToolError, describeCronExpression, parseCronSchedule } from '@/lib/tools/cron';

const suggestedTimeZones = ['UTC', 'America/Los_Angeles', 'America/New_York', 'Europe/London', 'Europe/Berlin', 'Asia/Seoul', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'];
const sampleFields = { minute: '*/5', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' };
const emptyFields = { minute: '', hour: '', dayOfMonth: '', month: '', dayOfWeek: '' };
type CronFieldName = keyof typeof emptyFields;
type CronFields = Record<CronFieldName, string>;
type CronOccurrence = { local: string; utc: string };

export function CronWorkbench({ locale }: { locale: Locale }) {
  const text = workbenchMessages[locale];
  const [fields, setFields] = useState<CronFields>(emptyFields);
  const [expression, setExpression] = useState('');
  const [timeZone, setTimeZone] = useState('UTC');
  const [resultZone, setResultZone] = useState('');
  const [occurrences, setOccurrences] = useState<CronOccurrence[] | null>(null);
  const [explanation, setExplanation] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<{ kind: 'success' | 'error' | 'info'; message: string } | null>(null);

  const explain = useCallback((value: string) => {
    const description = describeCronExpression(value);
    switch (description.kind) {
      case 'every-minute':
        return text.cronExplainEveryMinute;
      case 'interval-minutes':
        return text.cronExplainIntervalMinutes.replace('{interval}', description.interval);
      case 'hourly':
        return text.cronExplainHourly.replace('{minute}', description.minute);
      case 'daily':
        return text.cronExplainDaily.replace('{time}', description.time);
      case 'weekdays':
        return text.cronExplainWeekdays.replace('{time}', description.time);
      case 'monthly':
        return text.cronExplainMonthly.replace('{time}', description.time);
      case 'fields': {
        const labels = [text.cronMinuteLabel, text.cronHourLabel, text.cronDayOfMonthLabel, text.cronMonthLabel, text.cronDayOfWeekLabel];
        const values = description.values.map((item, index) => labels[index] + ': ' + item).join(' · ');
        return text.cronExplainFields.replace('{fields}', values);
      }
    }
  }, [text]);

  const runExpression = useCallback((value: string) => {
    if (!value.trim()) {
      setOccurrences(null);
      setOutput('');
      setStatus({ kind: 'error', message: text.cronEmptyExpression });
      return;
    }
    try {
      const dates = parseCronSchedule(value, timeZone);
      const formatter = new Intl.DateTimeFormat(locale, { timeZone, dateStyle: 'medium', timeStyle: 'medium' });
      const next = dates.map((date) => ({ local: formatter.format(date), utc: date.toISOString() }));
      const report = [
        text.cronOutputLabel,
        text.cronExpressionLabel + ': ' + value.trim(),
        text.cronTimeZoneLabel + ': ' + timeZone.trim(),
        ...next.map((item, index) => (index + 1) + '. ' + item.local + ' (' + item.utc + ')'),
      ].join('\n');
      setOccurrences(next);
      setResultZone(timeZone.trim());
      setExplanation(explain(value));
      setOutput(report);
      setStatus({ kind: 'success', message: text.cronComputed });
    } catch (error) {
      setOccurrences(null);
      setOutput('');
      const code = error instanceof CronToolError ? error.code : 'invalid-expression';
      const messages: Record<CronToolError['code'], string> = {
        'empty-expression': text.cronEmptyExpression,
        'too-large': text.inputTooLarge,
        'expression-too-long': text.cronExpressionTooLong,
        'field-count': text.cronFiveFieldsOnly,
        'unsupported-syntax': text.cronUnsupportedSyntax,
        'invalid-expression': text.cronInvalidExpression,
        'invalid-time-zone': text.cronInvalidTimeZone,
      };
      setStatus({ kind: 'error', message: messages[code] });
    }
  }, [explain, locale, text, timeZone]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        runExpression(expression);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expression, runExpression]);

  const loadSample = () => {
    setFields(sampleFields);
    setExpression(Object.values(sampleFields).join(' '));
    setOccurrences(null);
    setOutput('');
    setStatus({ kind: 'info', message: text.sampleLoaded });
  };
  const buildFromFields = () => {
    const value = [fields.minute, fields.hour, fields.dayOfMonth, fields.month, fields.dayOfWeek].join(' ');
    setExpression(value);
    runExpression(value);
  };
  const clear = () => {
    setFields(emptyFields);
    setExpression('');
    setOccurrences(null);
    setResultZone('');
    setExplanation('');
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
    anchor.download = 'cron-schedule.txt';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({ kind: 'success', message: text.downloaded });
  };

  const fieldDefinitions: { name: CronFieldName; label: string }[] = [
    { name: 'minute', label: text.cronMinuteLabel },
    { name: 'hour', label: text.cronHourLabel },
    { name: 'dayOfMonth', label: text.cronDayOfMonthLabel },
    { name: 'month', label: text.cronMonthLabel },
    { name: 'dayOfWeek', label: text.cronDayOfWeekLabel },
  ];

  return (
    <section className="cron-workbench" aria-label={text.cronToolLabel}>
      <p className="workbench-note">{text.cronNotice}</p>
      <section className="cron-fields" aria-label={text.cronFieldsLabel}>
        {fieldDefinitions.map((field) => (
          <label className="workbench-field" htmlFor={'cron-' + field.name} key={field.name}>
            <span>{field.label}</span>
            <input
              className="workbench-input"
              id={'cron-' + field.name}
              type="text"
              value={fields[field.name]}
              onChange={(event) => setFields((current) => ({ ...current, [field.name]: event.target.value }))}
            />
          </label>
        ))}
      </section>
      <EditorPanel locale={locale} label={text.cronExpressionLabel} value={expression} onChange={setExpression} placeholder={text.cronExpressionHint} />
      <div className="workbench-field">
        <label htmlFor="cron-time-zone">{text.cronTimeZoneLabel}</label>
        <input
          aria-describedby="cron-time-zone-hint"
          className="workbench-input"
          id="cron-time-zone"
          list="cron-time-zone-options"
          type="text"
          value={timeZone}
          onChange={(event) => setTimeZone(event.target.value)}
        />
        <datalist id="cron-time-zone-options">{suggestedTimeZones.map((zone) => <option key={zone} value={zone} />)}</datalist>
        <small id="cron-time-zone-hint">{text.cronTimeZoneHint}</small>
      </div>
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={buildFromFields}>{text.cronBuildFromFields}</ActionButton>
        <ActionButton onClick={() => runExpression(expression)} variant="primary">{text.cronGenerate}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      {occurrences && (
        <section className="cron-results" aria-label={text.cronOutputLabel}>
          <h3>{text.cronNextTimesLabel} ({resultZone})</h3>
          <p className="workbench-note">{explanation}</p>
          <p className="workbench-note">{text.cronDayRule}</p>
          <ol className="cron-next-times">
            {occurrences.map((occurrence) => (
              <li key={occurrence.utc}>
                <span>{occurrence.local}</span>
                <code>{occurrence.utc}</code>
              </li>
            ))}
          </ol>
          <ActionToolbar>
            <ActionButton onClick={() => void copy()}>{text.copy}</ActionButton>
            <ActionButton onClick={download}>{text.downloadText}</ActionButton>
          </ActionToolbar>
        </section>
      )}
    </section>
  );
}
