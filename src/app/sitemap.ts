import type { MetadataRoute } from 'next';
import { toolRegistry } from '@/data/tools';
import { locales } from '@/i18n/config';
import { absoluteUrl, localeAlternates } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const pagePaths = [
    '/', '/guides', '/about', '/privacy', '/terms', '/contact',
    ...toolRegistry.map((tool) => `/tools/${tool.slug}`),
    ...toolRegistry.map((tool) => `/guides/${tool.slug}`),
  ];
  const localizedPages = locales.flatMap((locale) => pagePaths.map((path) => ({
    url: localeAlternates(locale, path).canonical,
    alternates: { languages: localeAlternates(locale, path).languages },
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : path.startsWith('/tools/') || path.startsWith('/guides/') ? 0.8 : 0.6,
  })));
  const languageAlternates = localeAlternates('en', '/').languages;
  return [
    {
      url: absoluteUrl('/'),
      alternates: { languages: languageAlternates },
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...localizedPages,
  ];
}
