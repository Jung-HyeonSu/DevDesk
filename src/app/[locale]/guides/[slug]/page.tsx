import Link from 'next/link';
import { notFound } from 'next/navigation';
import { WorkflowToolAction } from '@/components/guides/workflow-tool-action';
import { toolContent, toolExamples } from '@/data/tool-content';
import { toolBySlug, toolRegistry } from '@/data/tools';
import { workflowGuideBySlug, workflowGuideSlugs } from '@/data/workflow-guides';
import { workflowRecipeGuideBySlug, workflowRecipeGuideSlugs, workflowRecipeToolSlugs } from '@/data/workflow-recipe-guides';
import { contentLabels } from '@/i18n/content';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { localizedMetadata } from '@/lib/seo';
import { workflowUiMessages } from '@/i18n/workflows';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => [
    ...toolRegistry.map((tool) => ({ locale, slug: tool.slug })),
    ...workflowGuideSlugs.map((slug) => ({ locale, slug })),
    ...workflowRecipeGuideSlugs.map((slug) => ({ locale, slug })),
  ]);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) return {};
  const workflow = workflowGuideBySlug(rawLocale, slug);
  if (workflow) return localizedMetadata(rawLocale, `/guides/${slug}`, workflow.title, workflow.summary);
  const recipeGuide = workflowRecipeGuideBySlug(rawLocale, slug);
  if (recipeGuide) return localizedMetadata(rawLocale, `/guides/${slug}`, recipeGuide.title, recipeGuide.summary);
  const tool = toolBySlug(slug);
  if (!tool) return {};
  const labels = contentLabels[rawLocale];
  return {
    ...localizedMetadata(rawLocale, `/tools/${tool.slug}`, `${tool.name[rawLocale]} — ${labels.guideFor}`, toolContent[rawLocale][tool.slug].description),
    robots: { index: false, follow: true },
  };
}

export default async function ToolGuidePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const workflow = workflowGuideBySlug(rawLocale, slug);
  if (workflow) return <WorkflowGuide locale={rawLocale} slug={slug} />;
  const recipeGuide = workflowRecipeGuideBySlug(rawLocale, slug);
  if (recipeGuide) return <WorkflowRecipeGuide locale={rawLocale} slug={slug} />;
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

function WorkflowGuide({ locale, slug }: { locale: Locale; slug: string }) {
  const content = workflowGuideBySlug(locale, slug);
  if (!content) notFound();
  return (
    <main className="simple-page workflow-guide">
      <nav aria-label={{ ko: '이동 경로', en: 'Breadcrumb', ja: 'パンくずリスト', zh: '面包屑导航' }[locale]} className="breadcrumbs">
        <Link href={`/${locale}/guides/`}>{contentLabels[locale].guideIndexTitle}</Link><span aria-hidden="true">/</span><span>{content.title}</span>
      </nav>
      <p className="eyebrow">DEVDESK / {content.eyebrow}</p>
      <h1>{content.title}</h1>
      <p className="workflow-lede">{content.introduction}</p>
      <aside className="notice-card">
        <h2>{content.privacyTitle}</h2>
        <p>{content.privacyNote}</p>
      </aside>
      <section className="content-section" aria-labelledby="workflow-scenario-heading">
        <h2 id="workflow-scenario-heading">{content.scenarioTitle}</h2>
        <p>{content.scenarioNote}</p>
        <div className="content-grid workflow-payloads">
          {[{ label: content.expectedLabel, value: content.expectedPayload }, { label: content.receivedLabel, value: content.receivedPayload }].map((sample) => (
            <article className="content-card" key={sample.label}>
              <h3>{sample.label}</h3>
              <pre><code>{sample.value}</code></pre>
            </article>
          ))}
        </div>
      </section>
      <section className="content-section" aria-labelledby="workflow-steps-heading">
        <h2 id="workflow-steps-heading">{content.stepsTitle}</h2>
        <ol className="content-steps workflow-steps">
          {content.steps.map((step) => {
            const tool = toolBySlug(step.toolSlug);
            return (
              <li className="content-card workflow-step" key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.action}</p>
                {step.example && <div className="example-columns workflow-step-examples">
                  <div><h4>{step.example.inputLabel}</h4><pre><code>{step.example.input}</code></pre></div>
                  <div><h4>{step.example.outputLabel}</h4><pre><code>{step.example.output}</code></pre></div>
                </div>}
                <p><strong>{content.readingLabel}:</strong> {step.reading}</p>
                <p><strong>{content.boundaryLabel}:</strong> {step.boundary}</p>
                {tool && <div className="workflow-step-actions">
                  {step.handoffInput && <WorkflowToolAction locale={locale} toolSlug={step.toolSlug} value={step.handoffInput} label={`${content.useExampleLabel}: ${tool.name[locale]}`} />}
                  <Link href={`/${locale}/tools/${tool.slug}/`}>{content.openToolLabel}: {tool.name[locale]}<span aria-hidden="true"> →</span></Link>
                </div>}
              </li>
            );
          })}
        </ol>
      </section>
      <section className="content-section" aria-labelledby="workflow-checklist-heading">
        <h2 id="workflow-checklist-heading">{content.checklistTitle}</h2>
        <ul className="workflow-checklist">{content.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="content-section" aria-labelledby="workflow-references-heading">
        <h2 id="workflow-references-heading">{content.referencesTitle}</h2>
        <ul className="workflow-references">{content.references.map((reference) => <li key={reference.href}><a href={reference.href} target="_blank" rel="noreferrer">{reference.label}</a></li>)}</ul>
      </section>
    </main>
  );
}

function WorkflowRecipeGuide({ locale, slug }: { locale: Locale; slug: string }) {
  const content = workflowRecipeGuideBySlug(locale, slug);
  if (!content) notFound();
  const labels = contentLabels[locale];
  return (
    <main className="simple-page workflow-guide workflow-recipe-guide">
      <nav aria-label={{ ko: '이동 경로', en: 'Breadcrumb', ja: 'パンくずリスト', zh: '面包屑导航' }[locale]} className="breadcrumbs">
        <Link href={`/${locale}/workflows/`}>{workflowUiMessages[locale].title}</Link><span aria-hidden="true">/</span><span>{content.title}</span>
      </nav>
      <p className="eyebrow">DEVDESK / WORKFLOW GUIDE</p>
      <h1>{content.title}</h1>
      <p className="workflow-lede">{content.introduction}</p>
      <aside className="notice-card"><h2>{content.privacyTitle}</h2><p>{content.privacyNote}</p></aside>
      <section className="content-section" aria-labelledby="workflow-recipe-scenario">
        <h2 id="workflow-recipe-scenario">{content.scenarioTitle}</h2><p>{content.scenarioNote}</p>
        <div className="content-grid workflow-payloads">
          {[{ label: content.expectedLabel, value: content.expectedPayload }, { label: content.receivedLabel, value: content.receivedPayload }].map((sample) => <article className="content-card" key={sample.label}><h3>{sample.label}</h3><pre><code>{sample.value}</code></pre></article>)}
        </div>
      </section>
      <section className="content-section" aria-labelledby="workflow-recipe-steps">
        <h2 id="workflow-recipe-steps">{content.stepsTitle}</h2>
        <ol className="content-steps workflow-steps">
          {content.steps.map((step) => {
            const tool = toolBySlug(step.toolSlug);
            return <li className="content-card workflow-step" key={step.title}>
              <h3>{step.title}</h3><p>{step.action}</p>
              <p><strong>{workflowUiMessages[locale].readingLabel}:</strong> {step.reading}</p>
              <p><strong>{workflowUiMessages[locale].boundaryLabel}:</strong> {step.boundary}</p>
              {tool && <p className="workflow-step-actions"><Link href={`/${locale}/tools/${tool.slug}/`}>{labels.openTool}: {tool.name[locale]}<span aria-hidden="true"> →</span></Link></p>}
            </li>;
          })}
        </ol>
      </section>
      <section className="content-section" aria-labelledby="workflow-recipe-checklist">
        <h2 id="workflow-recipe-checklist">{content.checklistTitle}</h2><ul className="workflow-checklist">{content.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="content-section" aria-labelledby="workflow-recipe-tools">
        <h2 id="workflow-recipe-tools">{labels.related}</h2>
        <ul className="related-tools">{workflowRecipeToolSlugs[slug as keyof typeof workflowRecipeToolSlugs].map((toolSlug) => {
          const tool = toolBySlug(toolSlug);
          return tool ? <li key={tool.slug}><Link href={`/${locale}/tools/${tool.slug}/`}>{tool.name[locale]}<span aria-hidden="true"> →</span></Link></li> : null;
        })}</ul>
      </section>
      <section className="content-section" aria-labelledby="workflow-recipe-references">
        <h2 id="workflow-recipe-references">{content.referencesTitle}</h2><ul className="workflow-references">{content.references.map((reference) => <li key={reference.href}><a href={reference.href} rel="noreferrer" target="_blank">{reference.label}</a></li>)}</ul>
      </section>
      <p className="guide-link"><Link href={`/${locale}/workflows/`}>{labels.workflowStudio}<span aria-hidden="true"> →</span></Link></p>
    </main>
  );
}
