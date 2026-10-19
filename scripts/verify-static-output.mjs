import { access, readFile, readdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.cwd(), 'out');
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://devdesk.example').replace(/\/$/, '');
const locales = ['ko', 'en', 'ja', 'zh'];
const hreflangs = { ko: 'ko', en: 'en', ja: 'ja', zh: 'zh-CN' };
const toolSlugs = ['json-formatter', 'sql-formatter', 'jwt-decoder', 'cron-generator', 'text-diff', 'base64', 'url-encoder', 'unix-timestamp', 'uuid-generator', 'hash-generator', 'regex-tester', 'yaml-json'];
const sections = ['about', 'privacy', 'terms', 'contact'];
const sharedPaths = ['/', '/tools', '/guides', ...sections.map((section) => `/${section}`)];
const toolPaths = toolSlugs.flatMap((slug) => [`/tools/${slug}`, `/guides/${slug}`]);
const localizedPaths = [...sharedPaths, ...toolPaths];

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
  for (const path of localizedPaths) requiredFiles.push(`${locale}${path === '/' ? '' : path}/index.html`);
}
for (const path of requiredFiles) await access(join(root, path));

const rootHtml = await readFile(join(root, 'index.html'), 'utf8');
if (!/<html[^>]+lang=["']en["']/i.test(rootHtml)) throw new Error('Language selector must have a valid HTML lang');
if (!linkTags(rootHtml).some((tag) => attr(tag, 'rel').toLowerCase() === 'canonical' && attr(tag, 'href') === `${siteUrl}/`)) throw new Error('Language selector is missing its canonical URL');
for (const [locale, lang] of Object.entries(hreflangs)) {
  if (!linkTags(rootHtml).some((tag) => attr(tag, 'hreflang') === lang && attr(tag, 'href') === `${siteUrl}/${locale}/`)) throw new Error(`Language selector is missing ${lang}`);
}
if (!linkTags(rootHtml).some((tag) => attr(tag, 'hreflang').toLowerCase() === 'x-default')) throw new Error('Language selector is missing x-default');

for (const locale of locales) {
  for (const path of localizedPaths) {
    const html = await readFile(filePath(`/${locale}${path === '/' ? '' : path}`), 'utf8');
    assertPageSeo(html, locale, path, `${locale}${path}`);
  }
  for (const slug of toolSlugs) {
    for (const type of ['tools', 'guides']) {
      const html = await readFile(filePath(`/${locale}/${type}/${slug}`), 'utf8');
      const label = `${locale}/${type}/${slug}`;
      assertPageSeo(html, locale, `/${type}/${slug}`, label);
      if ((html.match(/class="content-card"/g) ?? []).length < 2) throw new Error(`${label} needs two static examples`);
      if ((html.match(/class="faq-item"/g) ?? []).length < 3) throw new Error(`${label} needs three static FAQs`);
      if (!html.includes('content-steps')) throw new Error(`${label} is missing its static usage steps`);
      if (type === 'tools' && slug === 'json-formatter' && !html.includes('class="json-workbench"')) throw new Error(`${label} is missing its statically rendered workbench`);
      if (type === 'tools' && slug === 'base64' && !html.includes('class="base64-workbench"')) throw new Error(`${label} is missing its statically rendered workbench`);
      if (type === 'tools' && slug === 'url-encoder' && !html.includes('class="url-workbench"')) throw new Error(`${label} is missing its statically rendered workbench`);
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

console.log(`Static output verified (${requiredFiles.length} required paths, ${locales.length * toolSlugs.length} tool pages, ${locales.length * toolSlugs.length} guides, sitemap, robots, metadata, and internal links).`);
