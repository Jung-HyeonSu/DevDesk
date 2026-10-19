import Link from 'next/link';
import { notFound } from 'next/navigation';
import { toolContent, toolExamples } from '@/data/tool-content';
import { toolBySlug, toolRegistry } from '@/data/tools';
import { contentLabels } from '@/i18n/content';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { localizedMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => toolRegistry.map((tool) => ({ locale, slug: tool.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) return {};
  const tool = toolBySlug(slug);
  if (!tool) return {};
  const labels = contentLabels[rawLocale];
  return localizedMetadata(rawLocale, `/guides/${tool.slug}`, `${tool.name[rawLocale]} — ${labels.guideFor}`, toolContent[rawLocale][tool.slug].description);
}

export default async function ToolGuidePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const tool = toolBySlug(slug);
  if (!tool) notFound();
  const locale: Locale = rawLocale;
  const content = toolContent[locale][tool.slug];
  const labels = contentLabels[locale];
  return (
    <main className="simple-page tool-guide">
      <nav aria-label={{ ko: '이동 경로', en: 'Breadcrumb', ja: 'パンくずリスト', zh: '面包屑导航' }[locale]} className="breadcrumbs">
        <Link href={`/${locale}/guides/`}>{labels.guideIndexTitle}</Link><span aria-hidden="true">/</span><span>{tool.name[locale]}</span>
      </nav>
      <p className="eyebrow">DEVDESK / GUIDE</p>
      <h1>{tool.name[locale]} — {labels.guideFor}</h1>
      <p>{content.description}</p>
      <section className="content-section"><h2>{labels.howTo}</h2><ol className="content-steps">{content.steps.map((step) => <li key={step}>{step}</li>)}</ol></section>
      <section className="content-section"><h2>{labels.examples}</h2><div className="content-grid">{toolExamples[tool.slug].map((example, index) => <article className="content-card" key={index}><h3>{labels.example} {index + 1}</h3><div className="example-columns"><div><h4>{labels.input}</h4><pre><code>{example.input}</code></pre></div><div><h4>{labels.output}</h4><pre><code>{example.output}</code></pre></div></div></article>)}</div></section>
      <aside className="notice-card"><h2>{labels.caution}</h2><p>{content.caution}</p></aside>
      <section className="content-section"><h2>{labels.faq}</h2><div className="faq-list">{content.faqs.map((faq) => <article className="faq-item" key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></article>)}</div></section>
      <p className="guide-link"><Link href={`/${locale}/tools/${tool.slug}/`}>{labels.openTool}<span aria-hidden="true"> →</span></Link></p>
    </main>
  );
}
