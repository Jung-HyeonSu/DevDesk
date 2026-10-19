import { describe, expect, it } from 'vitest';
import { isLocale, localeMetadata, locales } from '@/i18n/config';

describe('locale configuration', () => {
  it('lists the four supported locales in stable navigation order', () => {
    expect(locales).toEqual(['ko', 'en', 'ja', 'zh']);
  });

  it('uses Simplified Chinese language tags for HTML and search engines', () => {
    expect(localeMetadata.zh).toEqual({ htmlLang: 'zh-CN', label: '简体中文', hreflang: 'zh-CN' });
  });

  it('rejects unsupported locale segments', () => {
    expect(isLocale('ja')).toBe(true);
    expect(isLocale('zh-TW')).toBe(false);
    expect(isLocale('fr')).toBe(false);
  });
});
