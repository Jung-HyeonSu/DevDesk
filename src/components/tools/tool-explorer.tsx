'use client';

import { useMemo, useState } from 'react';
import { toolMatchesSearch, toolRegistry, type ToolCategory } from '@/data/tools';
import { shellMessages } from '@/i18n/shell';
import type { Locale } from '@/i18n/config';
import { ToolCard } from './tool-card';

const categories: ToolCategory[] = ['format', 'encoding', 'security', 'time', 'text', 'generator', 'data'];

export function ToolExplorer({ locale }: { locale: Locale }) {
  const text = shellMessages[locale];
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ToolCategory | 'all'>('all');
  const filtered = useMemo(() => toolRegistry.filter((tool) => {
    return (category === 'all' || tool.category === category) && toolMatchesSearch(tool, query, locale);
  }), [category, locale, query]);

  return (
    <section className="tool-explorer" aria-label={text.allTools}>
      <div className="tool-explorer-controls">
        <label className="search-field"><span aria-hidden="true">⌕</span><input aria-label={text.search} onChange={(event) => setQuery(event.target.value)} placeholder={text.searchPlaceholder} type="search" value={query} />{query && <button aria-label={text.clearSearch} onClick={() => setQuery('')} type="button">×</button>}</label>
        <label className="visually-hidden" htmlFor="category-filter">{text.categories}</label>
        <select className="category-filter" id="category-filter" onChange={(event) => setCategory(event.target.value as ToolCategory | 'all')} value={category}>
          <option value="all">{text.allTools}</option>
          {categories.map((item) => <option key={item} value={item}>{text.categoryNames[item]}</option>)}
        </select>
      </div>
      <p aria-live="polite" className="result-count">{filtered.length}{text.results}</p>
      {filtered.length ? categories.map((item) => {
        const tools = filtered.filter((tool) => tool.category === item);
        if (!tools.length) return null;
        return <section className="tool-category-section" id={item} key={item}><h2>{text.categoryNames[item]}</h2><div className="tool-card-grid">{tools.map((tool) => <ToolCard key={tool.id} locale={locale} tool={tool} />)}</div></section>;
      }) : <div className="empty-results"><span aria-hidden="true">⌕</span><p>{text.noResults}</p></div>}
    </section>
  );
}
