import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localeMetadata, locales, isLocale } from '@/i18n/config';
import { AppShell } from '@/components/layout/app-shell';
import '../globals.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const language = localeMetadata[locale];
  return {
    title: { default: 'DevDesk', template: '%s · DevDesk' },
    description: 'Browser-based developer tools for everyday work.',
    openGraph: { siteName: 'DevDesk', locale: language.htmlLang },
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
