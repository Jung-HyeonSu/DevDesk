import { access, readFile, readdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.cwd(), 'out');
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://devdesk-7e7.pages.dev').replace(/\/$/, '');
const locales = ['ko', 'en', 'ja', 'zh'];
const hreflangs = { ko: 'ko', en: 'en', ja: 'ja', zh: 'zh-CN' };
const toolSlugs = ['json-formatter', 'sql-formatter', 'jwt-decoder', 'cron-generator', 'text-diff', 'base64', 'url-encoder', 'unix-timestamp', 'uuid-generator', 'hash-generator', 'regex-tester', 'yaml-json', 'code-formatter', 'json-pointer', 'csv-json', 'url-inspector', 'html-entities'];
const workbenchBySlug = { 'json-formatter': 'json', base64: 'base64', 'url-encoder': 'url', 'unix-timestamp': 'timestamp', 'uuid-generator': 'uuid', 'hash-generator': 'hash', 'sql-formatter': 'sql', 'jwt-decoder': 'jwt', 'cron-generator': 'cron', 'text-diff': 'diff', 'regex-tester': 'regex', 'yaml-json': 'yaml-json', 'code-formatter': 'code-formatter', 'json-pointer': 'json-pointer', 'csv-json': 'csv-json', 'url-inspector': 'url-inspector', 'html-entities': 'html-entities' };
const toolReferenceBySlug = {
  'json-pointer': 'https://www.rfc-editor.org/rfc/rfc6901.html',
  'csv-json': 'https://www.rfc-editor.org/rfc/rfc4180.html',
  'url-inspector': 'https://url.spec.whatwg.org/',
  'html-entities': 'https://html.spec.whatwg.org/multipage/syntax.html#character-references',
};
const workflowSlugs = ['api-response-debugging', 'cron-timezone-check', 'yaml-type-migration'];
const workflowToolsBySlug = {
  'api-response-debugging': ['json-formatter', 'text-diff', 'unix-timestamp', 'url-encoder', 'jwt-decoder'],
  'cron-timezone-check': ['cron-generator', 'unix-timestamp'],
  'yaml-type-migration': ['yaml-json', 'json-formatter'],
};
const workflowActionToolBySlug = {
  'api-response-debugging': 'json-formatter',
  'cron-timezone-check': 'cron-generator',
  'yaml-type-migration': 'yaml-json',
};
const sections = ['about', 'privacy', 'terms', 'contact'];
const sharedPaths = ['/', '/guides', ...sections.map((section) => `/${section}`)];
const toolPaths = toolSlugs.map((slug) => `/tools/${slug}`);
const workflowPaths = workflowSlugs.map((slug) => `/guides/${slug}`);
const localizedPaths = [...sharedPaths, ...toolPaths, ...workflowPaths];
const legacyToolGuidePaths = toolSlugs.map((slug) => `/guides/${slug}`);

function filePath(path) {
  const normalized = path.replace(/^\/+|\/+$/g, '');
  return join(root, normalized, 'index.html');
}

function localizedUrl(locale, path) {
  const suffix = path === '/' ? '' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  return `${siteUrl}/${locale}${suffix}/`;
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1] ?? '';
}

function linkTags(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
}

function assertPageSeo(html, locale, path, label) {
  if (!/<title>[^<]+<\/title>/i.test(html)) throw new Error(`${label} is missing a page title`);
  if (!/<meta\b(?=[^>]*name=["']description["'])(?=[^>]*content=["'][^"']+)[^>]*>/i.test(html)) throw new Error(`${label} is missing a meta description`);
  if (!/<h1\b[^>]*>[\s\S]*?\S[\s\S]*?<\/h1>/i.test(html)) throw new Error(`${label} is missing an H1`);
  const tags = linkTags(html);
  const expectedCanonical = localizedUrl(locale, path);
  if (!tags.some((tag) => attr(tag, 'rel').toLowerCase() === 'canonical' && attr(tag, 'href') === expectedCanonical)) {
    throw new Error(`${label} must have self canonical ${expectedCanonical}`);
  }
  for (const candidate of locales) {
    const lang = hreflangs[candidate];
    const expectedHref = localizedUrl(candidate, path);
    if (!tags.some((tag) => attr(tag, 'rel').toLowerCase() === 'alternate' && attr(tag, 'hreflang') === lang && attr(tag, 'href') === expectedHref)) {
      throw new Error(`${label} is missing hreflang ${lang}`);
    }
  }
  if (!tags.some((tag) => attr(tag, 'rel').toLowerCase() === 'alternate' && attr(tag, 'hreflang').toLowerCase() === 'x-default' && attr(tag, 'href') === `${siteUrl}/`)) {
    throw new Error(`${label} is missing x-default`);
  }
  if (!new RegExp(`<html[^>]+lang=["']${hreflangs[locale]}["']`, 'i').test(html)) throw new Error(`${label} has the wrong HTML language`);
  if (!html.includes(`property="og:locale" content="${hreflangs[locale]}"`)) throw new Error(`${label} has no localized Open Graph locale`);
}

const requiredFiles = ['index.html', 'sitemap.xml', 'robots.txt'];
for (const locale of locales) {
  for (const path of [...localizedPaths, ...legacyToolGuidePaths]) requiredFiles.push(`${locale}${path === '/' ? '' : path}/index.html`);
}
for (const path of requiredFiles) await access(join(root, path));
for (const locale of locales) {
  const toolsIndex = join(root, locale, 'tools', 'index.html');
  try {
    await access(toolsIndex);
    throw new Error(`Unexpected standalone tools index route: ${locale}/tools/`);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  for (const slug of workflowSlugs) {
    const html = await readFile(filePath(`/${locale}/guides/${slug}`), 'utf8');
    const label = `${locale}/guides/${slug}`;
    assertPageSeo(html, locale, `/guides/${slug}`, label);
    if ((html.match(/class="content-card workflow-step"/g) ?? []).length !== 5) throw new Error(`${label} must have five static workflow steps`);
    if (!/class="[^"]*workflow-payloads/.test(html) || (html.match(/<article class="content-card">/g) ?? []).length < 2) throw new Error(`${label} is missing its expected and observed payloads`);
    if (!html.includes('workflow-step-examples')) throw new Error(`${label} is missing its inline worked example`);
    if (slug === 'api-response-debugging' && !html.includes('https%3A%2F%2Fapp.example.test%2Fa%3Fx%3D1%26y%3D2')) throw new Error(`${label} is missing its URL component example`);
    const referenceList = html.match(/<ul class="workflow-references">([\s\S]*?)<\/ul>/)?.[1] ?? '';
    if ((referenceList.match(/<a\b/g) ?? []).length < 3) throw new Error(`${label} is missing its linked standards references`);
    if (!html.includes('class="workflow-checklist"')) throw new Error(`${label} is missing its target-environment checklist`);
    for (const toolSlug of workflowToolsBySlug[slug]) {
      if (!html.includes(`/${locale}/tools/${toolSlug}/`)) throw new Error(`${label} is missing its ${toolSlug} link`);
    }
    const actionTool = workflowActionToolBySlug[slug];
    if ((html.match(/class="[^"]*workflow-tool-action[^"]*"/g) ?? []).length !== 1) throw new Error(`${label} must have one sample action button`);
    if (!html.includes(`data-workflow-tool="${actionTool}"`)) throw new Error(`${label} sample action does not target ${actionTool}`);
  }
  for (const slug of toolSlugs) {
    const html = await readFile(filePath(`/${locale}/guides/${slug}`), 'utf8');
    const label = `${locale}/guides/${slug} legacy URL`;
    assertPageSeo(html, locale, `/tools/${slug}`, label);
    if (!/<meta\b(?=[^>]*name=["']robots["'])(?=[^>]*content=["'][^"']*noindex[^"']*["'])[^>]*>/i.test(html)) throw new Error(`${label} must be excluded from indexing`);
  }
}

const rootHtml = await readFile(join(root, 'index.html'), 'utf8');
if (!/<html[^>]+lang=["']en["']/i.test(rootHtml)) throw new Error('Language selector must have a valid HTML lang');
if (!linkTags(rootHtml).some((tag) => attr(tag, 'rel').toLowerCase() === 'canonical' && attr(tag, 'href') === `${siteUrl}/`)) throw new Error('Language selector is missing its canonical URL');
for (const [locale, lang] of Object.entries(hreflangs)) {
  if (!linkTags(rootHtml).some((tag) => attr(tag, 'hreflang') === lang && attr(tag, 'href') === `${siteUrl}/${locale}/`)) throw new Error(`Language selector is missing ${lang}`);
}
if (!linkTags(rootHtml).some((tag) => attr(tag, 'hreflang').toLowerCase() === 'x-default')) throw new Error('Language selector is missing x-default');

for (const locale of locales) {
  const homeHtml = await readFile(filePath(`/${locale}`), 'utf8');
  const guidesHtml = await readFile(filePath(`/${locale}/guides`), 'utf8');
  for (const slug of workflowSlugs) {
    const workflowUrl = `/${locale}/guides/${slug}/`;
    if (homeHtml.includes(workflowUrl)) throw new Error(`${locale} home page must not repeat the ${slug} workflow collection`);
    if (guidesHtml.includes(workflowUrl)) throw new Error(`${locale} guide index must not repeat the ${slug} workflow collection`);
    const discoveryTool = workflowActionToolBySlug[slug];
    const toolHtml = await readFile(filePath(`/${locale}/tools/${discoveryTool}`), 'utf8');
    if (!toolHtml.includes(workflowUrl)) throw new Error(`${locale}/${discoveryTool} must retain its ${slug} workflow link`);
  }
  for (const slug of toolSlugs) {
    if (!guidesHtml.includes(`/${locale}/tools/${slug}/`)) throw new Error(`${locale} guide index is missing its ${slug} tool reference`);
  }
  for (const path of localizedPaths) {
    const html = await readFile(filePath(`/${locale}${path === '/' ? '' : path}`), 'utf8');
    assertPageSeo(html, locale, path, `${locale}${path}`);
  }
  for (const slug of toolSlugs) {
    const html = await readFile(filePath(`/${locale}/tools/${slug}`), 'utf8');
    const label = `${locale}/tools/${slug}`;
    assertPageSeo(html, locale, `/tools/${slug}`, label);
    if ((html.match(/class="content-card"/g) ?? []).length < 2) throw new Error(`${label} needs two static examples`);
    if ((html.match(/class="faq-item"/g) ?? []).length < 3) throw new Error(`${label} needs three static FAQs`);
    if (!html.includes('content-steps')) throw new Error(`${label} is missing its static usage steps`);
    const workbench = workbenchBySlug[slug];
    if (workbench && !html.includes(`class="${workbench}-workbench"`)) throw new Error(`${label} is missing its statically rendered workbench`);
    if (toolReferenceBySlug[slug] && (!html.includes('class="content-section tool-references"') || !html.includes(`href="${toolReferenceBySlug[slug]}"`))) {
      throw new Error(`${label} is missing its linked primary reference`);
    }
  }
}

const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const actualUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedUrls = new Set([`${siteUrl}/`]);
for (const locale of locales) {
  for (const path of localizedPaths) expectedUrls.add(localizedUrl(locale, path));
}
if (actualUrls.length !== expectedUrls.size || actualUrls.some((url) => !expectedUrls.has(url))) throw new Error(`Sitemap URL set mismatch (${actualUrls.length} entries, expected ${expectedUrls.size})`);
for (const lang of Object.values(hreflangs)) {
  if (!sitemap.includes(`hreflang="${lang}"`)) throw new Error(`Sitemap is missing ${lang} alternates`);
}
if (!sitemap.includes('hreflang="x-default"')) throw new Error('Sitemap is missing x-default alternates');

const robots = await readFile(join(root, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) throw new Error('robots.txt does not identify the sitemap');

const files = await readdir(root, { recursive: true });
if (files.some((path) => /(^|\/)(api|functions|_worker)(\/|$)/i.test(path))) throw new Error('Unexpected server/API output found in out/');
const htmlFiles = files.filter((path) => extname(path) === '.html');
for (const relativeFile of htmlFiles) {
  const html = await readFile(join(root, relativeFile), 'utf8');
  for (const match of html.matchAll(/\bhref=["']([^"']+)["']/gi)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const path = decodeURIComponent(href.split(/[?#]/, 1)[0]);
    const normalized = path.replace(/^\/+/, '');
    const target = join(root, normalized, path.endsWith('/') || !extname(path) ? 'index.html' : '');
    try { await access(target); } catch { throw new Error(`Broken local link in ${relativeFile}: ${href}`); }
  }
}

console.log(`Static output verified (${requiredFiles.length} required paths, ${locales.length * toolSlugs.length} tool pages, ${locales.length * workflowSlugs.length} indexable workflow guides with sample actions, tool-linked guide discovery, canonical/noindex legacy guide URLs, sitemap, robots, metadata, and internal links).`);
