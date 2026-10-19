import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/i18n/config.ts', import.meta.url), 'utf8');
for (const locale of ['ko', 'en', 'ja', 'zh']) {
  if (!new RegExp(`['\"]${locale}['\"]`).test(source)) throw new Error(`Missing locale: ${locale}`);
}
console.log('Locale configuration contains ko, en, ja, and zh.');
