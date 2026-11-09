const MAX_URL_BYTES = 64 * 1024;

export class UrlInspectorToolError extends Error {
  constructor(readonly code: 'empty' | 'too-large' | 'invalid-url' | 'unsupported-protocol') {
    super(code);
    this.name = 'UrlInspectorToolError';
  }
}

export type InspectedUrl = {
  href: string;
  origin: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  searchParams: { name: string; value: string }[];
  hash: string;
  hasUsername: boolean;
  hasPassword: boolean;
};

export function inspectUrl(input: string): InspectedUrl {
  if (!input.trim()) throw new UrlInspectorToolError('empty');
  if (new TextEncoder().encode(input).byteLength > MAX_URL_BYTES) throw new UrlInspectorToolError('too-large');

  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new UrlInspectorToolError('invalid-url');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new UrlInspectorToolError('unsupported-protocol');

  const hasUsername = Boolean(url.username);
  const hasPassword = Boolean(url.password);
  url.username = '';
  url.password = '';

  return {
    href: url.href,
    origin: url.origin,
    protocol: url.protocol,
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    searchParams: [...url.searchParams.entries()].map(([name, value]) => ({ name, value })),
    hash: url.hash,
    hasUsername,
    hasPassword,
  };
}

export function formatInspectedUrl(input: string) {
  return JSON.stringify(inspectUrl(input), null, 2);
}
