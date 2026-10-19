import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { ToolExplorer } from '@/components/tools/tool-explorer';
import { localizedMetadata } from '@/lib/seo';

const listText: Record<Locale, { title: string; description: string; home: string }> = {
  ko: { title: '개발 도구', description: '브라우저에서 안전하게 사용할 수 있는 개발자 도구를 모았습니다.', home: '홈으로' },
  en: { title: 'Developer tools', description: 'A collection of developer tools designed to work privately in your browser.', home: 'Home' },
  ja: { title: '開発ツール', description: 'ブラウザー内で安心して使える開発者向けツールを集めました。', home: 'ホーム' },
  zh: { title: '开发者工具', description: '汇集可在浏览器中安全使用的开发者工具。', home: '首页' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const text = listText[rawLocale];
  return localizedMetadata(rawLocale, '/tools', text.title, text.description);
}

export default async function ToolsIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const text = listText[rawLocale];
  return <main className="tools-page"><div className="page-heading"><Link className="back-link" href={`/${rawLocale}/`}>← {text.home}</Link><p className="eyebrow">DEV DESK / TOOLS</p><h1>{text.title}</h1><p>{text.description}</p></div><ToolExplorer locale={rawLocale} /></main>;
}
