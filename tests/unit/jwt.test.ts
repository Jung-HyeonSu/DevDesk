import { describe, expect, it } from 'vitest';
import { encodeBase64 } from '@/lib/tools/base64';
import { decodeJwt, getJwtTemporalInfo, JwtToolError } from '@/lib/tools/jwt';

const encodeSegment = (value: unknown) => encodeBase64(JSON.stringify(value), true);
const tokenFor = (header: unknown, payload: unknown, signature = 'c2lnbmF0dXJl') =>
  encodeSegment(header) + '.' + encodeSegment(payload) + '.' + signature;

describe('JWT decoder', () => {
  it('decodes a Base64URL token with Unicode JSON and leaves the signature unverified', () => {
    const token = tokenFor({ alg: 'HS256', typ: 'JWT' }, { name: '안녕하세요 👋', city: '東京' });
    expect(decodeJwt(token)).toEqual({
      header: { alg: 'HS256', typ: 'JWT' },
      payload: { name: '안녕하세요 👋', city: '東京' },
      signature: 'c2lnbmF0dXJl',
    });
  });

  it('accepts valid optional Base64URL padding', () => {
    const [header, payload, signature] = tokenFor({ alg: 'none' }, { role: 'reader' }).split('.');
    const pad = (segment: string) => segment + '='.repeat((4 - segment.length % 4) % 4);
    expect(decodeJwt(pad(header) + '.' + pad(payload) + '.' + pad(signature)).payload).toEqual({ role: 'reader' });
  });

  it.each([
    'only.two',
    'a.b.c.d',
    'e30=.e30=.not+base64url',
    'W10.e30.sig',
    'bnVsbA.e30.sig',
    '__8.e30.sig',
    'e30.__8.sig',
  ])('rejects malformed or non-object JWT segments: %s', (token) => {
    expect(() => decodeJwt(token)).toThrowError(JwtToolError);
  });

  it('distinguishes an oversized token from a malformed token', () => {
    expect(() => decodeJwt('x'.repeat(1024 * 1024 + 1))).toThrowError(
      expect.objectContaining({ code: 'too-large' }),
    );
  });

  it('formats NumericDate claims and reports an active token by the supplied browser clock', () => {
    const now = Date.UTC(2030, 0, 1);
    const info = getJwtTemporalInfo({
      iat: now / 1000 - 60,
      nbf: now / 1000 - 30,
      exp: now / 1000 + 3600,
    }, now, 'en-US');
    expect(info.status).toBe('active');
    expect(info.claims.map((claim) => claim.name)).toEqual(['iat', 'nbf', 'exp']);
    expect(info.claims[0].utc).toBe('2029-12-31T23:59:00.000Z');
    expect(info.claims[0].local).not.toBe('');
  });

  it('reports expired and not-yet-valid claims against the browser clock', () => {
    const now = Date.UTC(2030, 0, 1);
    expect(getJwtTemporalInfo({ exp: now / 1000 }, now, 'en').status).toBe('expired');
    expect(getJwtTemporalInfo({ nbf: now / 1000 + 1 }, now, 'en').status).toBe('not-yet-valid');
  });

  it('keeps malformed optional NumericDate claims visible without rejecting the decoded payload', () => {
    const info = getJwtTemporalInfo({ iat: 'today', exp: Number.MAX_VALUE }, 0, 'en');
    expect(info.status).toBe('unknown');
    expect(info.claims.map((claim) => claim.invalid)).toEqual([true, true]);
    expect(getJwtTemporalInfo({ subject: 'reader' }, 0, 'en').status).toBe('unknown');
    expect(getJwtTemporalInfo({ nbf: -1 }, 0, 'en').status).toBe('unknown');
  });
});
