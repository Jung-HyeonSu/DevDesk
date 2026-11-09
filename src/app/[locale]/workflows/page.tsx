import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { workflowRecipes } from '@/data/workflow-recipes';
import { workflowRecipeGuides } from '@/data/workflow-recipe-guides';
import { workflowGuides, workflowGuideSlugs } from '@/data/workflow-guides';
import { isLocale, type Locale } from '@/i18n/config';
import { workflowUiMessages } from '@/i18n/workflows';
import { localizedMetadata } from '@/lib/seo';
import { WorkflowStudio } from '@/components/workflows/workflow-studio';

const pageCopy: Record<Locale, { title: string; description: string; recipes: string }> = {
  ko: { title: '브라우저 개발 워크플로 조립기', description: '개발 도구를 데이터 유형이 맞는 포트로 연결하고 브라우저에서 단계별로 실행하세요.', recipes: '시작 레시피 안내' },
  en: { title: 'Browser developer workflow builder', description: 'Connect developer tools through matching data ports and run each step in your browser.', recipes: 'Starter recipe guides' },
  ja: { title: 'ブラウザー開発ワークフロー組み立てツール', description: 'データ型が一致するポートで開発ツールを接続し、ブラウザー内で各ステップを実行します。', recipes: '開始レシピガイド' },
  zh: { title: '浏览器开发工作流组装器', description: '通过匹配的数据端口连接开发工具，并在浏览器中逐步运行。', recipes: '起始配方指南' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const copy = pageCopy[rawLocale];
  return localizedMetadata(rawLocale, '/workflows', copy.title, copy.description);
}

export default async function WorkflowStudioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const copy = pageCopy[locale];
  const ui = workflowUiMessages[locale];
  const recipeCards = [
    ...workflowGuideSlugs.map((slug) => ({ slug, title: workflowGuides[locale][slug].title, summary: workflowGuides[locale][slug].summary })),
    ...workflowRecipes.map((recipe) => ({ slug: recipe.id, title: workflowRecipeGuides[locale][recipe.id].title, summary: recipe.description[locale] })),
  ];

  return (
    <>
      <WorkflowStudio locale={locale} />
      <section className="simple-page workflow-recipe-index" aria-labelledby="workflow-recipes-heading">
        <h2 id="workflow-recipes-heading">{copy.recipes}</h2>
        <ul className="guide-list">
          {recipeCards.map((recipe) => <li key={recipe.slug}>
            <Link href={`/${locale}/guides/${recipe.slug}/`}><span aria-hidden="true" className="workflow-recipe-mark">↗</span><span><strong>{recipe.title}</strong><small>{recipe.summary}</small></span><span aria-hidden="true">→</span></Link>
          </li>)}
        </ul>
        <p className="visually-hidden">{ui.toolsInRecipe}</p>
      </section>
    </>
  );
}
