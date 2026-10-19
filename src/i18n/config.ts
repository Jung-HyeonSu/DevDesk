export const locales = ['ko', 'en', 'ja', 'zh'] as const;

export type Locale = (typeof locales)[number];

export const localeMetadata: Record<Locale, { htmlLang: string; label: string; hreflang: string }> = {
  ko: { htmlLang: 'ko', label: '한국어', hreflang: 'ko' },
  en: { htmlLang: 'en', label: 'English', hreflang: 'en' },
  ja: { htmlLang: 'ja', label: '日本語', hreflang: 'ja' },
  zh: { htmlLang: 'zh-CN', label: '简体中文', hreflang: 'zh-CN' },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
