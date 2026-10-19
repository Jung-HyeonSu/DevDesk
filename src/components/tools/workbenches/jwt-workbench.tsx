'use client';

import { useCallback, useEffect, useState } from 'react';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '@/components/tools/workbench-primitives';
import type { Locale } from '@/i18n/config';
import { workbenchMessages } from '@/i18n/workbench';
import { encodeBase64 } from '@/lib/tools/base64';
import { decodeJwt, getJwtTemporalInfo, JwtToolError, type JwtDecoded, type JwtTemporalStatus } from '@/lib/tools/jwt';

function makeSampleToken() {
  const header = encodeBase64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }), true);
  const payload = encodeBase64(JSON.stringify({
    sub: 'user-123',
    name: 'Developer 👋',
    iat: 1_700_000_000,
    nbf: 1_700_000_000,
    exp: 4_102_444_800,
  }), true);
  return header + '.' + payload + '.' + encodeBase64('sample signature', true);
}

export function JwtWorkbench({ locale }: { locale: Locale }) {
  const text = workbenchMessages[locale];
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<JwtDecoded | null>(null);
  const [decodedAt, setDecodedAt] = useState<number | null>(null);
  const [status, setStatus] = useState<{ kind: 'success' | 'error' | 'info'; message: string } | null>(null);

  const run = useCallback(() => {
    if (!input.trim()) {
      setDecoded(null);
      setDecodedAt(null);
      setStatus({ kind: 'error', message: text.jwtEmptyInput });
      return;
    }
    try {
      setDecoded(decodeJwt(input.trim()));
      setDecodedAt(Date.now());
      setStatus({ kind: 'success', message: text.jwtDecoded });
    } catch (error) {
      setDecoded(null);
      setDecodedAt(null);
      setStatus({
        kind: 'error',
        message: error instanceof JwtToolError && error.code === 'too-large' ? text.inputTooLarge : text.jwtInvalidToken,
      });
    }
  }, [input, text]);

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
    setInput(makeSampleToken());
    setDecoded(null);
    setDecodedAt(null);
    setStatus({ kind: 'info', message: text.sampleLoaded });
  };
  const clear = () => {
    setInput('');
    setDecoded(null);
    setDecodedAt(null);
    setStatus({ kind: 'info', message: text.cleared });
  };
  const payloadText = decoded ? JSON.stringify(decoded.payload, null, 2) : '';
  const temporal = decoded && decodedAt !== null ? getJwtTemporalInfo(decoded.payload, decodedAt, locale) : null;
  const statusLabel = (value: JwtTemporalStatus) => ({
    active: text.jwtStatusActive,
    expired: text.jwtStatusExpired,
    'not-yet-valid': text.jwtStatusNotYetValid,
    unknown: text.jwtStatusUnknown,
  })[value];

  const copy = async () => {
    if (!payloadText) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(payloadText);
      copied = true;
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = payloadText;
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
    if (!payloadText) return;
    const url = URL.createObjectURL(new Blob([payloadText], { type: 'application/json;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'jwt-payload.json';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({ kind: 'success', message: text.downloaded });
  };

  return (
    <section className="jwt-workbench" aria-label={text.jwtToolLabel}>
      <p className="workbench-note">{text.jwtNotice}</p>
      <EditorPanel locale={locale} label={text.input} value={input} onChange={setInput} placeholder={text.jwtInputHint} />
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={run} variant="primary">{text.jwtDecode}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      {decoded && temporal && (
        <div className="jwt-results">
          <StatusMessage kind={temporal.status === 'expired' ? 'error' : temporal.status === 'active' ? 'success' : 'info'}>
            {text.jwtTemporalStatus}: {statusLabel(temporal.status)}
          </StatusMessage>
          {temporal.claims.length > 0 && (
            <dl className="jwt-claims">
              {temporal.claims.map((claim) => {
                const label = claim.name === 'iat' ? text.jwtIssuedAt : claim.name === 'nbf' ? text.jwtNotBefore : text.jwtExpiresAt;
                return (
                  <div className="jwt-claim" key={claim.name}>
                    <dt>{label}</dt>
                    <dd>{claim.invalid ? text.jwtInvalidClaim : <><span>{text.jwtUtc}: {claim.utc}</span><span>{text.jwtLocal}: {claim.local}</span></>}</dd>
                  </div>
                );
              })}
            </dl>
          )}
          <EditorPanel locale={locale} label={text.jwtHeader} value={JSON.stringify(decoded.header, null, 2)} readOnly language="json" />
          <EditorPanel locale={locale} label={text.jwtPayload} value={payloadText} readOnly language="json" />
          <EditorPanel locale={locale} label={text.jwtSignature} value={decoded.signature} readOnly />
          <ActionToolbar>
            <ActionButton onClick={() => void copy()} disabled={!payloadText}>{text.copy}</ActionButton>
            <ActionButton onClick={download} disabled={!payloadText}>{text.downloadText}</ActionButton>
          </ActionToolbar>
        </div>
      )}
    </section>
  );
}
