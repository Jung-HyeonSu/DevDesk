import { describe, expect, it } from 'vitest';
import { toolById, toolBySlug, toolMatchesSearch, toolRegistry } from '@/data/tools';
import { locales } from '@/i18n/config';

describe('tool registry', () => {
  it('contains the 13 stable tool routes with unique slugs', () => {
    expect(toolRegistry).toHaveLength(13);
    expect(new Set(toolRegistry.map((tool) => tool.slug)).size).toBe(13);
    expect(toolBySlug('json-formatter')?.id).toBe('json-formatter');
  });

  it('has a translated name and keyword list for each initial language', () => {
    for (const tool of toolRegistry) {
      for (const locale of locales) {
        expect(tool.name[locale]).toBeTruthy();
        expect(tool.keywords[locale].length).toBeGreaterThan(0);
      }
    }
  });

  it('keeps related-tool links within the registry', () => {
    const ids = new Set(toolRegistry.map((tool) => tool.id));
    for (const tool of toolRegistry) {
      expect(tool.relatedToolIds).toHaveLength(3);
      for (const relatedId of tool.relatedToolIds) expect(ids.has(relatedId)).toBe(true);
    }
    expect(toolById('yaml-json')?.category).toBe('data');
  });

  it('searches tool names and feature terms across languages', () => {
    const jsonFormatter = toolById('json-formatter')!;
    expect(toolMatchesSearch(jsonFormatter, 'JSON 포맷터', 'ko')).toBe(true);
    expect(toolMatchesSearch(jsonFormatter, 'JSON formatter', 'ko')).toBe(true);
    expect(toolMatchesSearch(jsonFormatter, 'validate', 'ko')).toBe(true);

    const cronGenerator = toolById('cron-generator')!;
    expect(toolMatchesSearch(cronGenerator, '예약 작업', 'en')).toBe(true);
    expect(toolMatchesSearch(cronGenerator, 'crontab', 'ko')).toBe(true);
  });

  it('finds Base64 and URL tools independently by encoder and decoder terms', () => {
    for (const id of ['base64', 'url-encoder'] as const) {
      const tool = toolById(id)!;
      expect(toolMatchesSearch(tool, '인코더', 'ko')).toBe(true);
      expect(toolMatchesSearch(tool, '디코더', 'ko')).toBe(true);
      expect(toolMatchesSearch(tool, 'encoder', 'en')).toBe(true);
      expect(toolMatchesSearch(tool, 'decoder', 'en')).toBe(true);
    }
  });
});
