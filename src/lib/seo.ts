import type { Metadata } from 'next';
import { localeMetadata, locales, type Locale } from '@/i18n/config';

/** Override this build-time URL before publishing the exported site. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://devdesk.example').replace(/\/$/, '');

function routePath(locale: Locale, path: string) {
  const normalized = path === '/' ? '' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  return `/${locale}${normalized}/`;
}

export function absoluteUrl(path: string) {
  return new URL(path.startsWith('/') ? path : `/${path}`, `${siteUrl}/`).toString();
}

export function localeAlternates(locale: Locale, path: string) {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((candidate) => [localeMetadata[candidate].hreflang, absoluteUrl(routePath(candidate, path))]),
  );
  languages['x-default'] = absoluteUrl('/');
  return {
    canonical: absoluteUrl(routePath(locale, path)),
    languages,
  };
}

export function localizedMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const alternates = localeAlternates(locale, path);
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: 'DevDesk',
      locale: localeMetadata[locale].htmlLang,
      type: 'website',
    },
    twitter: { card: 'summary', title, description },
  };
}
