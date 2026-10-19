import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdSlot } from '@/components/ads/ad-slot';
import { ToolFavoriteToggle } from '@/components/tools/tool-card';
import { ToolWorkbench } from '@/components/tools/tool-workbench';
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
  const content = toolContent[rawLocale][tool.slug];
  return localizedMetadata(rawLocale, `/tools/${tool.slug}`, tool.name[rawLocale], content.description);
}

export default async function ToolDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const tool = toolBySlug(slug);
  if (!tool) notFound();
  const locale: Locale = rawLocale;
  const content = toolContent[locale][tool.slug];
  const examples = toolExamples[tool.slug];
  const labels = contentLabels[locale];
  const related = tool.relatedToolIds
    .map((id) => toolBySlug(id))
    .filter((relatedTool): relatedTool is NonNullable<typeof relatedTool> => Boolean(relatedTool));

  return (
    <main className="tool-detail-page">
      <nav aria-label={{ ko: '이동 경로', en: 'Breadcrumb', ja: 'パンくずリスト', zh: '面包屑导航' }[locale]} className="breadcrumbs">
        <Link href={`/${locale}/tools/`}>{labels.backToTools}</Link><span aria-hidden="true">/</span><span>{tool.name[locale]}</span>
      </nav>
      <p className="eyebrow">{tool.category.toUpperCase()} / DEVDESK</p>
      <div className="tool-title-row"><h1>{tool.name[locale]}</h1><ToolFavoriteToggle locale={locale} tool={tool} /></div>
      <p className="tool-intro">{content.description}</p>
      <ToolWorkbench locale={locale} slug={tool.slug} />
      <AdSlot locale={locale} placement="tool-below" />

      <section className="content-section" aria-labelledby="examples-heading">
        <h2 id="examples-heading">{labels.examples}</h2>
        <div className="content-grid">
          {examples.map((example, index) => (
            <article className="content-card" key={`${tool.slug}-${index}`}>
              <h3>{labels.example} {index + 1}</h3>
              <div className="example-columns">
                <div><h4>{labels.input}</h4><pre><code>{example.input}</code></pre></div>
                <div><h4>{labels.output}</h4><pre><code>{example.output}</code></pre></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section" aria-labelledby="steps-heading">
        <h2 id="steps-heading">{labels.howTo}</h2>
        <ol className="content-steps">{content.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      </section>

      <aside className="notice-card" aria-labelledby="caution-heading">
        <h2 id="caution-heading">{labels.caution}</h2><p>{content.caution}</p>
      </aside>

      <section className="content-section" aria-labelledby="faq-heading">
        <h2 id="faq-heading">{labels.faq}</h2>
        <div className="faq-list">{content.faqs.map((faq) => <article className="faq-item" key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></article>)}</div>
      </section>

      <section className="content-section" aria-labelledby="related-heading">
        <h2 id="related-heading">{labels.related}</h2>
        <ul className="related-tools">{related.map((relatedTool) => <li key={relatedTool.slug}><Link href={`/${locale}/tools/${relatedTool.slug}/`}>{relatedTool.name[locale]}<span aria-hidden="true"> →</span></Link></li>)}</ul>
      </section>
      <p className="guide-link"><Link href={`/${locale}/guides/${tool.slug}/`}>{labels.fullGuide}: {tool.name[locale]}<span aria-hidden="true"> →</span></Link></p>
    </main>
  );
}
