'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useToolPreferences } from '@/components/layout/app-shell';
import { ToolFavoriteToggle } from '@/components/tools/tool-card';
import { shellMessages } from '@/i18n/shell';
import type { Locale } from '@/i18n/config';
import { toolById, toolRegistry, type ToolCategory, type ToolDefinition } from '@/data/tools';
import { toolContent } from '@/data/tool-content';

const categories: ToolCategory[] = ['format', 'encoding', 'security', 'text', 'data', 'generator', 'time'];
const categoryLabels: Record<Locale, { all: string; clearRecent: string; count: (count: number) => string }> = {
  ko: { all: '전체', clearRecent: '모두 지우기', count: (count) => `${count}개 도구` },
  en: { all: 'All', clearRecent: 'Clear all', count: (count) => `${count} ${count === 1 ? 'tool' : 'tools'}` },
  ja: { all: 'すべて', clearRecent: 'すべて消去', count: (count) => `${count}件` },
  zh: { all: '全部', clearRecent: '全部清除', count: (count) => `${count} 个工具` },
};

export function HomeToolDirectory({ locale }: { locale: Locale }) {
  const text = shellMessages[locale];
  const labels = categoryLabels[locale];
  const { favoriteIds, recentIds, clearRecent } = useToolPreferences();
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all' | 'favorites'>('all');
  const favoriteTools = favoriteIds
    .map((id) => toolById(id))
    .filter((tool): tool is ToolDefinition => Boolean(tool));
  const recentTools = recentIds
    .map((id) => toolById(id))
    .filter((tool): tool is ToolDefinition => Boolean(tool))
    .slice(0, 3);
  const visibleCategories = activeCategory === 'all' ? categories : activeCategory === 'favorites' ? [] : [activeCategory];
  useEffect(() => {
    const syncCategoryFromHash = () => {
      const category = window.location.hash.match(/^#home-category-(format|encoding|security|time|text|generator|data)$/)?.[1] as ToolCategory | undefined;
      if (!category) return;
      setActiveCategory(category);
      window.requestAnimationFrame(() => document.getElementById(`home-category-${category}`)?.scrollIntoView());
    };
    const handleHomeCategory = (event: Event) => {
      const category = (event as CustomEvent<ToolCategory | 'all'>).detail;
      if (category !== 'all' && !categories.includes(category)) return;
      setActiveCategory(category);
      window.requestAnimationFrame(() => {
        if (category === 'all') window.scrollTo({ top: 0 });
        else document.getElementById(`home-category-${category}`)?.scrollIntoView();
      });
    };
    syncCategoryFromHash();
    window.addEventListener('hashchange', syncCategoryFromHash);
    window.addEventListener('devdesk:home-category', handleHomeCategory);
    return () => {
      window.removeEventListener('hashchange', syncCategoryFromHash);
      window.removeEventListener('devdesk:home-category', handleHomeCategory);
    };
  }, []);
  const renderToolRow = (tool: ToolDefinition) => (
    <li key={tool.id}>
      <Link href={`/${locale}/tools/${tool.slug}/`}>
        <span aria-hidden="true" className={`tool-glyph small home-tool-icon category-${tool.category}`}>{tool.icon}</span>
        <span className="home-tool-name">{tool.name[locale]}</span>
        <span className="home-tool-description">{toolContent[locale][tool.slug].description}</span>
        <span aria-hidden="true" className="home-tool-arrow">›</span>
      </Link>
      <ToolFavoriteToggle locale={locale} tool={tool} />
    </li>
  );

  return (
    <div className="home-directory">
      <nav aria-label={text.categories} className="home-category-filter">
        <button aria-pressed={activeCategory === 'all'} className={activeCategory === 'all' ? 'is-active' : ''} onClick={() => setActiveCategory('all')} type="button">{labels.all}</button>
        <button aria-pressed={activeCategory === 'favorites'} className={activeCategory === 'favorites' ? 'is-active' : ''} onClick={() => setActiveCategory('favorites')} type="button">{text.favorites}</button>
        {categories.map((category) => (
          <button aria-pressed={activeCategory === category} className={activeCategory === category ? 'is-active' : ''} key={category} onClick={() => setActiveCategory(category)} type="button">
            {text.categoryNames[category]}
          </button>
        ))}
      </nav>

      <section aria-labelledby="home-recent-heading" className="home-recent">
        <header className="home-recent-heading">
          <h2 id="home-recent-heading">
            <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.25" /><path d="M10 5.5v4.8l3.1 1.8" /></svg>
            {text.recent}
          </h2>
          {recentTools.length > 0 && <button onClick={clearRecent} type="button">{labels.clearRecent}</button>}
        </header>
        {recentTools.length > 0 ? (
          <ul className="home-recent-list">
            {recentTools.map((tool) => (
              <li key={tool.id}>
                <Link href={`/${locale}/tools/${tool.slug}/`}>
                  <span aria-hidden="true" className={`tool-glyph small home-tool-icon category-${tool.category}`}>{tool.icon}</span>
                  <span>{tool.name[locale]}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="home-recent-empty">{text.emptyRecent}</p>}
      </section>

      <div className="home-tool-groups">
        {activeCategory === 'favorites' ? (
          <section aria-labelledby="home-favorites-heading" className="home-tool-group">
            <header className="home-tool-group-heading">
              <span aria-hidden="true" className="home-favorites-mark">★</span>
              <h2 id="home-favorites-heading">{text.favorites}</h2>
              <span className="home-tool-count">{labels.count(favoriteTools.length)}</span>
            </header>
            {favoriteTools.length ? <ul className="home-tool-list">{favoriteTools.map(renderToolRow)}</ul> : <p className="home-favorites-empty">{text.emptyFavorites}</p>}
          </section>
        ) : visibleCategories.map((category) => {
          const tools = toolRegistry.filter((tool) => tool.category === category);
          if (!tools.length) return null;

          return (
            <section aria-labelledby={`home-category-${category}`} className="home-tool-group" key={category}>
              <header className="home-tool-group-heading">
                <span aria-hidden="true" className={`category-dot category-${category}`} />
                <h2 id={`home-category-${category}`}>{text.categoryNames[category]}</h2>
                <span className="home-tool-count">{labels.count(tools.length)}</span>
              </header>
              <ul className="home-tool-list">
                {tools.map(renderToolRow)}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
