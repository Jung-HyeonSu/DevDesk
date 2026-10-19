import { describe, expect, it } from 'vitest';
import { describeCronExpression, parseCronSchedule } from '@/lib/tools/cron';

const isoDates = (dates: Date[]) => dates.map((date) => date.toISOString());
const at = (value: string) => new Date(value);

describe('Linux five-field cron generator', () => {
  it('returns the next five occurrences for every-five-minutes syntax', () => {
    expect(isoDates(parseCronSchedule('*/5 * * * *', 'UTC', at('2024-01-01T12:02:00.000Z')))).toEqual([
      '2024-01-01T12:05:00.000Z',
      '2024-01-01T12:10:00.000Z',
      '2024-01-01T12:15:00.000Z',
      '2024-01-01T12:20:00.000Z',
      '2024-01-01T12:25:00.000Z',
    ]);
  });

  it('supports weekday ranges in the selected time zone', () => {
    expect(isoDates(parseCronSchedule('0 9 * * 1-5', 'America/New_York', at('2024-01-05T15:00:00.000Z')))).toEqual([
      '2024-01-08T14:00:00.000Z',
      '2024-01-09T14:00:00.000Z',
      '2024-01-10T14:00:00.000Z',
      '2024-01-11T14:00:00.000Z',
      '2024-01-12T14:00:00.000Z',
    ]);
  });

  it('handles month boundaries and Linux day-of-month/day-of-week OR semantics', () => {
    expect(isoDates(parseCronSchedule('0 0 1 * *', 'UTC', at('2024-01-31T23:59:00.000Z')))[0]).toBe('2024-02-01T00:00:00.000Z');
    expect(isoDates(parseCronSchedule('0 0 1 * MON', 'UTC', at('2024-01-02T00:01:00.000Z')))).toEqual([
      '2024-01-08T00:00:00.000Z',
      '2024-01-15T00:00:00.000Z',
      '2024-01-22T00:00:00.000Z',
      '2024-01-29T00:00:00.000Z',
      '2024-02-01T00:00:00.000Z',
    ]);
  });

  it('accounts for skipped and repeated local times at daylight-saving transitions', () => {
    const spring = parseCronSchedule('30 1 * * *', 'Europe/London', at('2025-03-30T00:00:00.000Z'));
    expect(spring[0].toISOString()).toBe('2025-03-30T01:30:00.000Z');
    expect(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).format(spring[0])).toBe('02:30');
    expect(spring[1].toISOString()).toBe('2025-03-31T00:30:00.000Z');

    const fall = parseCronSchedule('30 1 * * *', 'Europe/London', at('2025-10-26T00:00:00.000Z'));
    expect(fall[0].toISOString()).toBe('2025-10-26T00:30:00.000Z');
    expect(fall[1].toISOString()).toBe('2025-10-27T01:30:00.000Z');
  });

  it.each([
    ['', 'empty-expression'],
    ['0 0 12 * * ?', 'field-count'],
    ['0 0 12 * ?', 'unsupported-syntax'],
    ['0 0 L * *', 'unsupported-syntax'],
    ['0 0 1W * *', 'unsupported-syntax'],
    ['61 * * * *', 'invalid-expression'],
    ['0 25 * * *', 'invalid-expression'],
    ['1'.repeat(257), 'expression-too-long'],
  ] as const)('rejects unsupported or invalid expression: %s', (expression, code) => {
    expect(() => parseCronSchedule(expression, 'UTC')).toThrowError(expect.objectContaining({ code }));
  });

  it('rejects an invalid time zone with a localized error code', () => {
    expect(() => parseCronSchedule('* * * * *', 'Not/AZone')).toThrowError(
      expect.objectContaining({ code: 'invalid-time-zone' }),
    );
  });

  it('provides readable summaries for common schedules and field details for others', () => {
    expect(describeCronExpression('* * * * *')).toEqual({ kind: 'every-minute' });
    expect(describeCronExpression('*/5 * * * *')).toEqual({ kind: 'interval-minutes', interval: '5' });
    expect(describeCronExpression('15 * * * *')).toEqual({ kind: 'hourly', minute: '15' });
    expect(describeCronExpression('0 9 * * *')).toEqual({ kind: 'daily', time: '09:00' });
    expect(describeCronExpression('0 9 * * 1-5')).toEqual({ kind: 'weekdays', time: '09:00' });
    expect(describeCronExpression('0 0 1 * *')).toEqual({ kind: 'monthly', time: '00:00' });
    expect(describeCronExpression('15 9 1,15 JAN MON')).toEqual({ kind: 'fields', values: ['15', '9', '1,15', 'JAN', 'MON'] });
  });
});
