import { describe, expect, it } from 'vitest';
import { formatUnixTimestamp, localDateTimeToMilliseconds, parseUnixTimestamp, TimestampToolError } from '@/lib/tools/timestamp';

describe('Unix timestamp converter', () => {
  it('handles the epoch, seconds, milliseconds, and negative timestamps explicitly', () => {
    expect(parseUnixTimestamp('0', 'seconds')).toBe(0);
    expect(parseUnixTimestamp('-1', 'seconds')).toBe(-1000);
    expect(parseUnixTimestamp('1700000000000', 'milliseconds')).toBe(1700000000000);
    expect(formatUnixTimestamp('0', 'seconds', 'UTC', 'en').iso).toBe('1970-01-01T00:00:00.000Z');
  });

  it('formats dates beyond the 2038 boundary and honors an IANA time zone', () => {
    const utc = formatUnixTimestamp('2147483648', 'seconds', 'UTC', 'en');
    const seoul = formatUnixTimestamp('2147483648', 'seconds', 'Asia/Seoul', 'en');
    expect(utc.iso).toBe('2038-01-19T03:14:08.000Z');
    expect(seoul.zoned).toContain('12:14:08 PM GMT+9');
  });

  it('converts leap-day local date input to UTC milliseconds', () => {
    expect(localDateTimeToMilliseconds('2024-02-29T12:30:45', 'UTC')).toBe(Date.UTC(2024, 1, 29, 12, 30, 45));
    expect(localDateTimeToMilliseconds('2024-02-29T12:30', 'Asia/Seoul')).toBe(Date.UTC(2024, 1, 29, 3, 30));
  });

  it('rejects nonexistent local time during a daylight-saving spring transition', () => {
    expect(() => localDateTimeToMilliseconds('2024-03-10T02:30', 'America/New_York')).toThrowError(expect.objectContaining({ code: 'nonexistent-local-time' }));
  });

  it('uses the earlier occurrence for a repeated daylight-saving fall-back time', () => {
    expect(localDateTimeToMilliseconds('2024-11-03T01:30', 'America/New_York')).toBe(Date.UTC(2024, 10, 3, 5, 30));
  });

  it('rejects invalid timestamps, dates, zones, and unsupported date ranges', () => {
    expect(() => parseUnixTimestamp('12.5', 'seconds')).toThrowError(expect.objectContaining({ code: 'invalid-timestamp' }));
    expect(() => localDateTimeToMilliseconds('2023-02-29T12:00', 'UTC')).toThrowError(expect.objectContaining({ code: 'invalid-date-time' }));
    expect(() => formatUnixTimestamp('0', 'seconds', 'Mars/Olympus', 'en')).toThrowError(expect.objectContaining({ code: 'invalid-time-zone' }));
    expect(() => parseUnixTimestamp('9000000000000', 'seconds')).toThrowError(TimestampToolError);
  });
});
