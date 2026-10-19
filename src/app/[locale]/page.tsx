import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { localizedMetadata } from '@/lib/seo';

const homeText: Record<Locale, { title: string; copy: string; tools: string; languages: string }> = {
  ko: { title: '개발 도구를, 필요한 순간에.', copy: '브라우저에서 바로 처리하는 빠르고 안전한 개발자 유틸리티.', tools: '도구 둘러보기', languages: '언어' },
  en: { title: 'Developer tools, ready when you are.', copy: 'Fast, private utilities that work right in your browser.', tools: 'Explore tools', languages: 'Language' },
  ja: { title: '必要なときに、すぐ使える開発ツール。', copy: 'ブラウザー内で処理する、速くて安心な開発者向けツールです。', tools: 'ツールを見る', languages: '言語' },
  zh: { title: '随时可用的开发者工具。', copy: '在浏览器中本地处理，快速又安心。', tools: '浏览工具', languages: '语言' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const text = homeText[rawLocale];
  return localizedMetadata(rawLocale, '/', text.title, text.copy);
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;
  const text = homeText[locale];

  return (
    <main className="home-content">
      <section className="home-hero">
        <p className="eyebrow">DEVELOPER TOOLKIT</p>
        <h1>{text.title}</h1>
        <p>{text.copy}</p>
        <Link className="primary-link" href={`/${locale}/tools/`}>{text.tools}<span aria-hidden="true">→</span></Link>
      </section>
      <div className="home-trust-row"><span>◉ {locale === 'ko' ? '입력은 브라우저 안에서 처리' : locale === 'ja' ? '入力はブラウザー内で処理' : locale === 'zh' ? '输入仅在浏览器中处理' : 'Inputs stay in your browser'}</span><span>⌁ {locale === 'ko' ? '계정 없이 무료 사용' : locale === 'ja' ? '登録不要・無料' : locale === 'zh' ? '免费使用，无需注册' : 'Free, no account required'}</span></div>
    </main>
  );
}
