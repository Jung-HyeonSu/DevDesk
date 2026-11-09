import { describe, expect, it } from 'vitest';
import { formatInspectedUrl, inspectUrl, UrlInspectorToolError } from '@/lib/tools/url-inspector';

describe('URL inspector', () => {
  it('extracts URL components and preserves repeated query parameters', () => {
    expect(inspectUrl('https://example.test:8443/orders/42?tag=blue&tag=green#payment')).toMatchObject({
      protocol: 'https:', host: 'example.test:8443', pathname: '/orders/42', hash: '#payment',
      searchParams: [{ name: 'tag', value: 'blue' }, { name: 'tag', value: 'green' }],
    });
  });

  it('redacts username and password from serialized output', () => {
    const result = formatInspectedUrl('https://demo:secret@example.test/path');
    expect(result).not.toContain('demo');
    expect(result).not.toContain('secret');
    expect(JSON.parse(result)).toMatchObject({ hasUsername: true, hasPassword: true, href: 'https://example.test/path' });
  });

  it('rejects relative URLs and non-HTTP schemes', () => {
    expect(() => inspectUrl('/relative/path')).toThrowError('invalid-url');
    expect(() => inspectUrl('ftp://example.test/file')).toThrowError('unsupported-protocol');
    expect(() => inspectUrl('')).toThrowError(UrlInspectorToolError);
  });
});
