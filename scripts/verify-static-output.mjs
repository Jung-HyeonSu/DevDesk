import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = join(process.cwd(), 'out');
const locales = ['ko', 'en', 'ja', 'zh'];
const toolSlugs = ['json-formatter', 'sql-formatter', 'jwt-decoder', 'cron-generator', 'text-diff', 'base64', 'url-encoder', 'unix-timestamp', 'uuid-generator', 'hash-generator', 'regex-tester', 'yaml-json'];
const required = ['index.html'];
for (const locale of locales) {
  required.push(`${locale}/index.html`, `${locale}/tools/index.html`);
  for (const slug of toolSlugs) required.push(`${locale}/tools/${slug}/index.html`);
}
for (const path of required) await access(join(root, path));
for (const [locale, htmlLang] of [['ko', 'ko'], ['en', 'en'], ['ja', 'ja'], ['zh', 'zh-CN']]) {
  const page = await readFile(join(root, `${locale}/index.html`), 'utf8');
  if (!new RegExp(`<html[^>]+lang="${htmlLang}"`).test(page)) throw new Error(`${locale} page must use lang="${htmlLang}"`);
}
const files = await (await import('node:fs/promises')).readdir(root, { recursive: true });
if (files.some((path) => /(^|\/)(api|functions|_worker)(\/|$)/i.test(path))) throw new Error('Unexpected server/API output found in out/');
console.log(`Static output verified (${required.length} required pages, including ${locales.length * toolSlugs.length} tool routes).`);
