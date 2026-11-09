import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { localizedMetadata } from '@/lib/seo';
import { HomeToolDirectory } from '@/components/home/home-tool-directory';
import { contentLabels } from '@/i18n/content';
import { workflowGuideBySlug, workflowGuideSlugs } from '@/data/workflow-guides';

const homeText: Record<Locale, { title: string; heading: string; copy: string }> = {
  ko: { title: '개발 도구를, 필요한 순간에.', heading: '도구를 골라 바로 시작하세요', copy: '17개의 개발 도구를 카테고리별로 살펴보세요. 입력과 변환은 브라우저 안에서 처리됩니다.' },
  en: { title: 'Developer tools, ready when you are.', heading: 'Choose a tool and get started', copy: 'Browse 17 developer tools by category. Inputs and conversions stay in your browser.' },
  ja: { title: '必要なときに、すぐ使える開発ツール。', heading: 'ツールを選んですぐに使い始めましょう', copy: '17の開発ツールをカテゴリ別に表示。入力と変換はブラウザー内で処理します。' },
  zh: { title: '随时可用的开发者工具。', heading: '选择工具，立即开始', copy: '按分类浏览 17 款开发工具。输入和转换仅在浏览器中处理。' },
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
      <header className="home-directory-heading">
        <p className="eyebrow">DEVELOPER TOOLKIT</p>
        <h1>{text.heading}</h1>
        <p>{text.copy}</p>
      </header>
      <section aria-labelledby="home-workflow-title" className="content-section home-workflows">
        <h2 id="home-workflow-title">{contentLabels[locale].workflowCollectionTitle}</h2>
        <ul className="guide-list workflow-guide-list">
          {workflowGuideSlugs.map((slug) => {
            const workflow = workflowGuideBySlug(locale, slug);
            if (!workflow) return null;
            return (
              <li key={slug}>
                <Link href={`/${locale}/guides/${slug}/`}><span className="tool-glyph" aria-hidden="true">↗</span><span><strong>{workflow.title}</strong><small>{workflow.summary}</small></span><span aria-hidden="true">→</span></Link>
              </li>
            );
          })}
        </ul>
      </section>
      <HomeToolDirectory locale={locale} />
    </main>
  );
}
