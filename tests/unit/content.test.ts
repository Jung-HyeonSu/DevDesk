import { describe, expect, it } from 'vitest';
import { toolContent, toolExamples } from '@/data/tool-content';
import { toolRegistry } from '@/data/tools';
import { contentLabels } from '@/i18n/content';
import { locales } from '@/i18n/config';

describe('localized tool content', () => {
  it('keeps the same translated labels and tool routes in all locales', () => {
    const labelKeys = Object.keys(contentLabels.ko).sort();
    for (const locale of locales) {
      expect(Object.keys(contentLabels[locale]).sort()).toEqual(labelKeys);
      expect(Object.keys(toolContent[locale]).sort()).toEqual(toolRegistry.map((tool) => tool.slug).sort());
    }
  });

  it('provides localized SEO content, examples, steps, caution, and distinct FAQs for each tool', () => {
    for (const tool of toolRegistry) {
      const descriptions = locales.map((locale) => toolContent[locale][tool.slug].description);
      expect(new Set(descriptions).size).toBe(locales.length);
      expect(toolExamples[tool.slug]).toHaveLength(2);
      for (const locale of locales) {
        const content = toolContent[locale][tool.slug];
        expect(content.steps.length).toBeGreaterThanOrEqual(3);
        expect(content.steps.length).toBeLessThanOrEqual(5);
        expect(content.caution.length).toBeGreaterThan(20);
        expect(content.faqs).toHaveLength(3);
        expect(new Set(content.faqs.map((faq) => faq.question)).size).toBe(3);
      }
    }
  });
});
