import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localeMetadata, locales, isLocale } from '@/i18n/config';
import { AppShell } from '@/components/layout/app-shell';
import { siteUrl } from '@/lib/seo';
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
    title: { default: 'DevDesk', template: '%s · DevDesk' },
    description,
    openGraph: { siteName: 'DevDesk', locale: language.htmlLang, type: 'website' },
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
      <body><AppShell locale={locale}>{children}</AppShell></body>
    </html>
  );
}
