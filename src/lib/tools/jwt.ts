import { decodeBase64 } from './base64';
import { isWithinInputLimit } from './limits';

export type JwtObject = Record<string, unknown>;
export type JwtDecoded = {
  header: JwtObject;
  payload: JwtObject;
  signature: string;
};
export type JwtToolErrorCode = 'too-large' | 'invalid-token';
export type JwtClaimName = 'iat' | 'nbf' | 'exp';
export type JwtClaim = { name: JwtClaimName; utc: string; local: string; invalid: boolean };
export type JwtTemporalStatus = 'active' | 'expired' | 'not-yet-valid' | 'unknown';
export type JwtTemporalInfo = { status: JwtTemporalStatus; claims: JwtClaim[] };

export class JwtToolError extends Error {
  constructor(readonly code: JwtToolErrorCode) {
    super(code);
    this.name = 'JwtToolError';
  }
}

function isJsonObject(value: unknown): value is JwtObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBase64UrlSegment(value: string): boolean {
  if (!/^[A-Za-z0-9_-]*={0,2}$/.test(value)) return false;
  const unpadded = value.replace(/=+$/, '');
  if (unpadded.length % 4 === 1) return false;
  const padding = value.length - unpadded.length;
  return padding === 0 || (value.length % 4 === 0 && padding === (4 - (unpadded.length % 4)) % 4);
}

function decodeObject(segment: string): JwtObject {
  if (!isBase64UrlSegment(segment)) throw new JwtToolError('invalid-token');
  try {
    const value: unknown = JSON.parse(decodeBase64(segment, true));
    if (!isJsonObject(value)) throw new JwtToolError('invalid-token');
    return value;
  } catch {
    throw new JwtToolError('invalid-token');
  }
}

export function decodeJwt(token: string): JwtDecoded {
  if (!isWithinInputLimit(token)) throw new JwtToolError('too-large');
  const segments = token.split('.');
  if (segments.length !== 3 || !isBase64UrlSegment(segments[2])) throw new JwtToolError('invalid-token');
  return {
    header: decodeObject(segments[0]),
    payload: decodeObject(segments[1]),
    signature: segments[2],
  };
}

function formatNumericDate(value: unknown, locale: string): Omit<JwtClaim, 'name'> {
  if (typeof value !== 'number' || !Number.isFinite(value)) return { utc: '', local: '', invalid: true };
  const date = new Date(value * 1000);
  if (!Number.isFinite(date.getTime())) return { utc: '', local: '', invalid: true };
  try {
    return {
      utc: date.toISOString(),
      local: new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium' }).format(date),
      invalid: false,
    };
  } catch {
    return { utc: '', local: '', invalid: true };
  }
}

export function getJwtTemporalInfo(payload: JwtObject, nowMs: number, locale: string): JwtTemporalInfo {
  const names: JwtClaimName[] = ['iat', 'nbf', 'exp'];
  const claims = names
    .filter((name) => Object.hasOwn(payload, name))
    .map((name) => ({ name, ...formatNumericDate(payload[name], locale) }));
  const nbf = payload.nbf;
  const exp = payload.exp;
  const expClaim = claims.find((claim) => claim.name === 'exp');
  const nbfClaim = claims.find((claim) => claim.name === 'nbf');
  const hasInvalidValidityClaim = (expClaim && expClaim.invalid) || (nbfClaim && nbfClaim.invalid);
  const status: JwtTemporalStatus = hasInvalidValidityClaim
    ? 'unknown'
    : typeof exp === 'number' && exp * 1000 <= nowMs
      ? 'expired'
      : typeof nbf === 'number' && nbf * 1000 > nowMs
        ? 'not-yet-valid'
        : typeof exp === 'number'
          ? 'active'
          : 'unknown';
  return { status, claims };
}
