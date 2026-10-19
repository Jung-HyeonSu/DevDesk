import { isWithinInputLimit } from './limits';

export type TimestampUnit = 'seconds' | 'milliseconds';
export type TimestampToolErrorCode = 'too-large' | 'invalid-timestamp' | 'out-of-range' | 'invalid-time-zone' | 'invalid-date-time' | 'nonexistent-local-time';

export class TimestampToolError extends Error {
  constructor(readonly code: TimestampToolErrorCode) {
    super(code);
    this.name = 'TimestampToolError';
  }
}

const MAX_DATE_MILLISECONDS = 8.64e15;
const localeTags: Record<string, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' };

function assertInputSize(input: string) {
  if (!isWithinInputLimit(input)) throw new TimestampToolError('too-large');
}

function assertTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
  } catch {
    throw new TimestampToolError('invalid-time-zone');
  }
}

export function parseUnixTimestamp(input: string, unit: TimestampUnit): number {
  assertInputSize(input);
  const normalized = input.trim();
  if (!/^-?\d+$/.test(normalized)) throw new TimestampToolError('invalid-timestamp');
  const value = Number(normalized);
  const milliseconds = unit === 'seconds' ? value * 1000 : value;
  if (!Number.isSafeInteger(value) || !Number.isSafeInteger(milliseconds) || Math.abs(milliseconds) > MAX_DATE_MILLISECONDS) {
    throw new TimestampToolError('out-of-range');
  }
  return milliseconds;
}

export function formatTimestamp(milliseconds: number, timeZone: string, locale: string) {
  assertTimeZone(timeZone);
  if (!Number.isFinite(milliseconds) || Math.abs(milliseconds) > MAX_DATE_MILLISECONDS) throw new TimestampToolError('out-of-range');
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) throw new TimestampToolError('out-of-range');
  try {
    return {
      iso: date.toISOString(),
      zoned: new Intl.DateTimeFormat(localeTags[locale] ?? 'en-US', { timeZone, dateStyle: 'full', timeStyle: 'long' }).format(date),
    };
  } catch {
    throw new TimestampToolError('invalid-time-zone');
  }
}

function utcMilliseconds(year: number, month: number, day: number, hour: number, minute: number, second: number) {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);
  return date.getTime();
}

function zonedParts(milliseconds: number, timeZone: string) {
  const values = new Intl.DateTimeFormat('en-US-u-ca-iso8601', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(milliseconds));
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(values.find((value) => value.type === type)?.value);
  return { year: part('year'), month: part('month'), day: part('day'), hour: part('hour'), minute: part('minute'), second: part('second') };
}

function timeZoneOffset(milliseconds: number, timeZone: string) {
  const rounded = Math.floor(milliseconds / 1000) * 1000;
  const local = zonedParts(rounded, timeZone);
  return utcMilliseconds(local.year, local.month, local.day, local.hour, local.minute, local.second) - rounded;
}

export function localDateTimeToMilliseconds(input: string, timeZone: string): number {
  assertInputSize(input);
  assertTimeZone(timeZone);
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) throw new TimestampToolError('invalid-date-time');
  const [, yearText, monthText, dayText, hourText, minuteText, secondText = '0'] = match;
  const requested = { year: Number(yearText), month: Number(monthText), day: Number(dayText), hour: Number(hourText), minute: Number(minuteText), second: Number(secondText) };
  const wallClock = utcMilliseconds(requested.year, requested.month, requested.day, requested.hour, requested.minute, requested.second);
  const check = new Date(wallClock);
  if (check.getUTCFullYear() !== requested.year || check.getUTCMonth() + 1 !== requested.month || check.getUTCDate() !== requested.day || requested.hour > 23 || requested.minute > 59 || requested.second > 59) {
    throw new TimestampToolError('invalid-date-time');
  }

  let result = wallClock;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const next = wallClock - timeZoneOffset(result, timeZone);
    if (next === result) break;
    result = next;
  }
  const actual = zonedParts(result, timeZone);
  if (actual.year !== requested.year || actual.month !== requested.month || actual.day !== requested.day || actual.hour !== requested.hour || actual.minute !== requested.minute || actual.second !== requested.second) {
    throw new TimestampToolError('nonexistent-local-time');
  }
  return result;
}

export function formatUnixTimestamp(input: string, unit: TimestampUnit, timeZone: string, locale: string) {
  return formatTimestamp(parseUnixTimestamp(input, unit), timeZone, locale);
}
