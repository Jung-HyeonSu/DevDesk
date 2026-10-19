import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { toolBySlug, toolRegistry } from '@/data/tools';
import { ToolFavoriteToggle } from '@/components/tools/tool-card';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => toolRegistry.map((tool) => ({ locale, slug: tool.slug })));
}

const descriptions: Record<Locale, string> = {
  ko: '입력 데이터를 브라우저 안에서 처리하는 무료 개발자 도구입니다.',
  en: 'A free developer utility that processes your input right in this browser.',
  ja: '入力データをブラウザー内で処理する無料の開発者向けツールです。',
  zh: '这款免费开发者工具会在浏览器中处理输入内容。',
};

const comingSoon: Record<Locale, string> = {
  ko: '도구 기능을 준비하고 있습니다.',
  en: 'This tool is being prepared.',
  ja: 'ツール機能を準備しています。',
  zh: '工具功能正在准备中。',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) return {};
  const tool = toolBySlug(slug);
  if (!tool) return {};
  return { title: tool.name[rawLocale], description: descriptions[rawLocale] };
}

export default async function ToolPlaceholderPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const tool = toolBySlug(slug);
  if (!tool) notFound();
  return (
    <main className="tool-detail-page">
      <nav aria-label={rawLocale === 'ko' ? '이동 경로' : rawLocale === 'ja' ? 'パンくずリスト' : rawLocale === 'zh' ? '面包屑导航' : 'Breadcrumb'} className="breadcrumbs"><Link href={`/${rawLocale}/tools/`}>{rawLocale === 'ko' ? '도구' : rawLocale === 'ja' ? 'ツール' : rawLocale === 'zh' ? '工具' : 'Tools'}</Link><span aria-hidden="true">/</span><span>{tool.name[rawLocale]}</span></nav>
      <p className="eyebrow">{tool.category.toUpperCase()} / DEVDESK</p>
      <div className="tool-title-row"><h1>{tool.name[rawLocale]}</h1><ToolFavoriteToggle locale={rawLocale} tool={tool} /></div>
      <p className="tool-intro">{descriptions[rawLocale]}</p>
      <div className="tool-placeholder"><span className="tool-glyph large">{tool.icon}</span><p>{comingSoon[rawLocale]}</p><Link className="primary-link" href={`/${rawLocale}/tools/`}>{rawLocale === 'ko' ? '다른 도구 보기' : rawLocale === 'ja' ? 'ほかのツールを見る' : rawLocale === 'zh' ? '浏览其他工具' : 'Browse other tools'}<span aria-hidden="true">→</span></Link></div>
    </main>
  );
}
