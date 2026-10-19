import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { locales, localeMetadata } from '@/i18n/config';
import { absoluteUrl, siteName, siteUrl } from '@/lib/seo';

const languageAlternates: Record<string, string> = Object.fromEntries(
  locales.map((locale) => [localeMetadata[locale].hreflang, absoluteUrl(`/${locale}/`)]),
);
languageAlternates['x-default'] = absoluteUrl('/');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${siteName} — Developer tools`,
  description: 'Choose a language to explore free developer utilities that run in your browser.',
  alternates: { canonical: absoluteUrl('/'), languages: languageAlternates },
  openGraph: {
    title: `${siteName} — Developer tools`,
    description: 'Free developer utilities that run in your browser.',
    siteName,
    url: absoluteUrl('/'),
    locale: 'en',
    type: 'website',
  },
};

export default function LanguageLandingPage() {
  return (
    <main className="language-landing">
      <Image alt="" aria-hidden="true" className="landing-mark" height={48} src="/icon.svg" width={48} />
      <p className="eyebrow">DEV DESK / BROWSER TOOLS</p>
      <h1>Developer tools, ready when you are.</h1>
      <p className="landing-copy">Choose a language to explore fast, private utilities that run in your browser.</p>
      <nav className="language-grid" aria-label="Choose language">
        {locales.map((locale) => (
          <Link className="language-choice" href={`/${locale}/`} hrefLang={localeMetadata[locale].hreflang} key={locale}>
            <span>{localeMetadata[locale].label}</span>
            <span className="language-code">{localeMetadata[locale].hreflang}</span>
          </Link>
        ))}
      </nav>
      <p className="privacy-note">Your inputs stay in this browser. No account required.</p>
    </main>
  );
}
