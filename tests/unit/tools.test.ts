import { describe, expect, it } from 'vitest';
import { toolById, toolBySlug, toolRegistry } from '@/data/tools';
import { locales } from '@/i18n/config';

describe('tool registry', () => {
  it('contains the 12 stable tool routes with unique slugs', () => {
    expect(toolRegistry).toHaveLength(12);
    expect(new Set(toolRegistry.map((tool) => tool.slug)).size).toBe(12);
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
});
