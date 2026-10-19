import { describe, expect, it } from 'vitest';
import { localeAlternates } from '@/lib/seo';

describe('localized SEO metadata', () => {
  it('builds self canonicals and four locale alternates with zh-CN and x-default', () => {
    const alternates = localeAlternates('zh', '/tools/json-formatter');
    expect(new URL(alternates.canonical).pathname).toBe('/zh/tools/json-formatter/');
    expect(new URL(alternates.languages.ko).pathname).toBe('/ko/tools/json-formatter/');
    expect(new URL(alternates.languages.en).pathname).toBe('/en/tools/json-formatter/');
    expect(new URL(alternates.languages.ja).pathname).toBe('/ja/tools/json-formatter/');
    expect(new URL(alternates.languages['zh-CN']).pathname).toBe('/zh/tools/json-formatter/');
    expect(new URL(alternates.languages['x-default']).pathname).toBe('/');
  });
});
