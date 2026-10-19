'use client';

import { useCallback, useEffect, useState } from 'react';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '@/components/tools/workbench-primitives';
import type { Locale } from '@/i18n/config';
import { workbenchMessages } from '@/i18n/workbench';
import { formatTimestamp, localDateTimeToMilliseconds, parseUnixTimestamp, TimestampToolError, type TimestampUnit } from '@/lib/tools/timestamp';

const suggestedTimeZones = ['UTC', 'America/Los_Angeles', 'America/New_York', 'Europe/London', 'Europe/Berlin', 'Asia/Seoul', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'];

export function TimestampWorkbench({ locale }: { locale: Locale }) {
  const text = workbenchMessages[locale];
  const [timestamp, setTimestamp] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [timeZone, setTimeZone] = useState('UTC');
  const [unit, setUnit] = useState<TimestampUnit>('seconds');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<{ kind: 'success' | 'error' | 'info'; message: string } | null>(null);

  const resultText = useCallback((milliseconds: number) => {
    const formatted = formatTimestamp(milliseconds, timeZone, locale);
    return `${text.isoOutputLabel}: ${formatted.iso}\n${timeZone}: ${formatted.zoned}`;
  }, [locale, text, timeZone]);

  const showError = useCallback((error: unknown) => {
    const message = error instanceof TimestampToolError
      ? error.code === 'too-large' ? text.inputTooLarge
        : error.code === 'invalid-timestamp' ? text.invalidTimestamp
          : error.code === 'invalid-date-time' ? text.invalidDateTime
            : error.code === 'invalid-time-zone' ? text.invalidTimeZone
              : error.code === 'nonexistent-local-time' ? text.nonexistentLocalTime : text.outOfRange
      : text.outOfRange;
    setOutput('');
    setStatus({ kind: 'error', message });
  }, [text]);

  const runTimestamp = useCallback(() => {
    if (!timestamp.trim()) {
      setOutput('');
      setStatus({ kind: 'error', message: text.timestampEmptyInput });
      return;
    }
    try {
      setOutput(resultText(parseUnixTimestamp(timestamp, unit)));
      setStatus({ kind: 'success', message: text.timestampConverted });
    } catch (error) {
      showError(error);
    }
  }, [resultText, showError, text, timestamp, unit]);

  const runDateTime = useCallback(() => {
    if (!dateTime) {
      setOutput('');
      setStatus({ kind: 'error', message: text.invalidDateTime });
      return;
    }
    try {
      const milliseconds = localDateTimeToMilliseconds(dateTime, timeZone);
      const value = unit === 'seconds' ? String(Math.floor(milliseconds / 1000)) : String(milliseconds);
      setTimestamp(value);
      setOutput(`${text.timestampInputLabel} (${unit === 'seconds' ? text.secondsUnit : text.millisecondsUnit}): ${value}\n${resultText(milliseconds)}`);
      setStatus({ kind: 'success', message: text.dateConverted });
    } catch (error) {
      showError(error);
    }
  }, [dateTime, resultText, showError, text, timeZone, unit]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        runTimestamp();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [runTimestamp]);

  const loadSample = () => {
    setTimestamp('0');
    setDateTime('1970-01-01T00:00');
    setUnit('seconds');
    setOutput('');
    setStatus({ kind: 'info', message: text.sampleLoaded });
  };
  const useCurrentTime = () => {
    const milliseconds = Date.now();
    const value = unit === 'seconds' ? String(Math.floor(milliseconds / 1000)) : String(milliseconds);
    setTimestamp(value);
    try {
      setOutput(resultText(milliseconds));
      setStatus({ kind: 'success', message: text.timestampConverted });
    } catch (error) {
      showError(error);
    }
  };
  const clear = () => {
    setTimestamp('');
    setDateTime('');
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

  return (
    <section className="timestamp-workbench" aria-label={text.timestampToolLabel}>
      <p className="workbench-note">{text.timestampNotice}</p>
      <div className="timestamp-fields">
        <label className="workbench-field" htmlFor="timestamp-value">
          <span>{text.timestampInputLabel}</span>
          <input className="workbench-input" id="timestamp-value" inputMode="numeric" type="text" value={timestamp} onChange={(event) => setTimestamp(event.target.value)} />
        </label>
        <label className="workbench-field" htmlFor="timestamp-unit">
          <span>{text.timestampUnitLabel}</span>
          <select className="workbench-input" id="timestamp-unit" value={unit} onChange={(event) => setUnit(event.target.value as TimestampUnit)}>
            <option value="seconds">{text.secondsUnit}</option>
            <option value="milliseconds">{text.millisecondsUnit}</option>
          </select>
        </label>
        <label className="workbench-field" htmlFor="timestamp-date-time">
          <span>{text.dateTimeInputLabel}</span>
          <input className="workbench-input" id="timestamp-date-time" type="datetime-local" step="1" value={dateTime} onChange={(event) => setDateTime(event.target.value)} />
        </label>
        <div className="workbench-field">
          <label htmlFor="timestamp-time-zone">{text.timeZoneLabel}</label>
          <input aria-describedby="timestamp-time-zone-hint" className="workbench-input" id="timestamp-time-zone" list="timestamp-time-zone-options" type="text" value={timeZone} onChange={(event) => setTimeZone(event.target.value)} />
          <datalist id="timestamp-time-zone-options">{suggestedTimeZones.map((zone) => <option key={zone} value={zone} />)}</datalist>
          <small id="timestamp-time-zone-hint">{text.timeZoneHint}</small>
        </div>
      </div>
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.epochSample}</ActionButton>
        <ActionButton onClick={runTimestamp} variant="primary">{text.timestampToDate}</ActionButton>
        <ActionButton onClick={runDateTime}>{text.dateToTimestamp}</ActionButton>
        <ActionButton onClick={useCurrentTime}>{text.useCurrentTime}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      <EditorPanel locale={locale} label={text.output} value={output} readOnly language="text" placeholder={text.urlOutputHint} />
      <ActionToolbar>
        <ActionButton onClick={() => void copy()} disabled={!output}>{text.copy}</ActionButton>
      </ActionToolbar>
    </section>
  );
}
