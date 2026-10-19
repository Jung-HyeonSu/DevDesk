'use client';

import Link from 'next/link';
import { useToolPreferences } from '@/components/layout/app-shell';
import { shellMessages } from '@/i18n/shell';
import type { Locale } from '@/i18n/config';
import type { ToolDefinition } from '@/data/tools';

export function ToolFavoriteToggle({ locale, tool }: { locale: Locale; tool: ToolDefinition }) {
  const text = shellMessages[locale];
  const { favoriteIds, toggleFavorite } = useToolPreferences();
  const favorite = favoriteIds.includes(tool.id);

  return <button aria-label={favorite ? `${tool.name[locale]} · ${text.removeFavorite}` : `${tool.name[locale]} · ${text.addFavorite}`} aria-pressed={favorite} className={`favorite-toggle${favorite ? ' is-favorite' : ''}`} onClick={() => toggleFavorite(tool.id)} type="button"><span aria-hidden="true">{favorite ? '★' : '☆'}</span></button>;
}

export function ToolCard({ locale, tool }: { locale: Locale; tool: ToolDefinition }) {
  const text = shellMessages[locale];

  return (
    <article className="tool-card">
      <Link className="tool-card-main" href={`/${locale}/tools/${tool.slug}/`}>
        <span className="tool-glyph">{tool.icon}</span>
        <span className="tool-card-copy"><strong>{tool.name[locale]}</strong><small>{text.categoryNames[tool.category]}</small></span>
        <span aria-hidden="true" className="tool-card-arrow">↗</span>
      </Link>
      <ToolFavoriteToggle locale={locale} tool={tool} />
    </article>
  );
}
