import { CronExpressionParser } from 'cron-parser';
import { isWithinInputLimit } from './limits';

export type CronToolErrorCode =
  | 'empty-expression'
  | 'too-large'
  | 'expression-too-long'
  | 'field-count'
  | 'unsupported-syntax'
  | 'invalid-expression'
  | 'invalid-time-zone';

export type CronDescription =
  | { kind: 'every-minute' }
  | { kind: 'interval-minutes'; interval: string }
  | { kind: 'hourly'; minute: string }
  | { kind: 'daily'; time: string }
  | { kind: 'weekdays'; time: string }
  | { kind: 'monthly'; time: string }
  | { kind: 'fields'; values: [string, string, string, string, string] };

export class CronToolError extends Error {
  constructor(readonly code: CronToolErrorCode) {
    super(code);
    this.name = 'CronToolError';
  }
}

function getFields(expression: string): [string, string, string, string, string] {
  if (!expression.trim()) throw new CronToolError('empty-expression');
  if (!isWithinInputLimit(expression)) throw new CronToolError('too-large');
  if (expression.length > 256) throw new CronToolError('expression-too-long');

  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) throw new CronToolError('field-count');
  if (fields.some((field) => !/^[A-Za-z0-9*,/-]+$/.test(field))) throw new CronToolError('unsupported-syntax');
  const unsupportedToken = /[?#@]/.test(expression)
    || fields.some((field) => /(^|[^A-Z0-9])(?:L|W|H)(?=$|[^A-Z0-9])|\dW\b|\bLW\b/i.test(field));
  if (unsupportedToken) throw new CronToolError('unsupported-syntax');
  return fields as [string, string, string, string, string];
}

export function describeCronExpression(expression: string): CronDescription {
  const values = getFields(expression);
  const [minute, hour, dayOfMonth, month, dayOfWeek] = values;
  if (values.join(' ') === '* * * * *') return { kind: 'every-minute' };
  const interval = minute.match(/^\*\/(\d+)$/)?.[1];
  if (interval && values.slice(1).every((field) => field === '*')) return { kind: 'interval-minutes', interval };
  if (/^\d+$/.test(minute) && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return { kind: 'hourly', minute };
  }
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) {
    const time = hour.padStart(2, '0') + ':' + minute.padStart(2, '0');
    if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') return { kind: 'daily', time };
    if (dayOfMonth === '*' && month === '*' && dayOfWeek === '1-5') return { kind: 'weekdays', time };
    if (dayOfMonth === '1' && month === '*' && dayOfWeek === '*') return { kind: 'monthly', time };
  }
  return { kind: 'fields', values };
}

export function parseCronSchedule(expression: string, timeZone: string, currentDate = new Date()): Date[] {
  getFields(expression);
  const zone = timeZone.trim();
  if (!zone || zone.length > 128) throw new CronToolError('invalid-time-zone');
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone });
  } catch {
    throw new CronToolError('invalid-time-zone');
  }

  try {
    const schedule = CronExpressionParser.parse(expression, { tz: zone, currentDate });
    const dates = schedule.take(5).map((date) => date.toDate());
    if (dates.length !== 5 || dates.some((date) => !Number.isFinite(date.getTime()))) {
      throw new CronToolError('invalid-expression');
    }
    return dates;
  } catch (error) {
    if (error instanceof CronToolError) throw error;
    throw new CronToolError('invalid-expression');
  }
}
