import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { localeMetadata, locales, isLocale } from '@/i18n/config';
import { AppShell } from '@/components/layout/app-shell';
import { siteName, siteUrl } from '@/lib/seo';
import '../globals.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const language = localeMetadata[locale];
  const description = {
    ko: '브라우저에서 안전하게 처리하는 무료 개발자 도구.',
    en: 'Free developer tools that process your input in the browser.',
    ja: '入力をブラウザー内で処理する無料の開発者ツール。',
    zh: '在浏览器中处理输入的免费开发者工具。',
  }[locale];
  return {
    metadataBase: new URL(siteUrl),
    title: { default: siteName, template: `%s · ${siteName}` },
    description,
    openGraph: { siteName, locale: language.htmlLang, type: 'website' },
  };
}

export default async function LocaleRootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={localeMetadata[locale].htmlLang}>
      <body>
        <Script
          id="google-adsense"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9509272737484634"
          async
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <AppShell locale={locale}>{children}</AppShell>
      </body>
    </html>
  );
}
