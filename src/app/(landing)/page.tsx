import Link from 'next/link';
import { locales, localeMetadata } from '@/i18n/config';

export default function LanguageLandingPage() {
  return (
    <main className="language-landing">
      <div className="landing-mark" aria-hidden="true">D</div>
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
