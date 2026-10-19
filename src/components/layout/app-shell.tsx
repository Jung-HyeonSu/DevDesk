'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { localeMetadata, locales, type Locale } from '@/i18n/config';
import { shellMessages } from '@/i18n/shell';
import { toolById, toolMatchesSearch, toolRegistry, type ToolCategory } from '@/data/tools';
import { ToolHandoffProvider, useToolHandoff } from '@/components/tools/tool-handoff';

type Preferences = {
  favoriteIds: string[];
  recentIds: string[];
  toggleFavorite: (id: string) => void;
  markRecent: (id: string) => void;
};

type StoredPreferences = { favoriteIds: string[]; recentIds: string[] };
const EMPTY_PREFERENCES = JSON.stringify({ favoriteIds: [], recentIds: [] });
const PREFERENCES_EVENT = 'devdesk:preferences-changed';

function notifyPreferencesChanged() {
  window.dispatchEvent(new Event(PREFERENCES_EVENT));
}

function getPreferencesSnapshot(): string {
  return JSON.stringify({ favoriteIds: readIds('devdesk:favorites'), recentIds: readIds('devdesk:recent') });
}

function subscribePreferences(callback: () => void) {
  window.addEventListener(PREFERENCES_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(PREFERENCES_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

const PreferencesContext = createContext<Preferences | null>(null);

export function useToolPreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error('useToolPreferences must be used inside AppShell');
  return value;
}

function readIds(key: string): string[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === 'string' && Boolean(toolById(item))) : [];
  } catch {
    return [];
  }
}

function PreferencesProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribePreferences, getPreferencesSnapshot, () => EMPTY_PREFERENCES);
  const stored = useMemo<StoredPreferences>(() => {
    try { return JSON.parse(snapshot) as StoredPreferences; } catch { return { favoriteIds: [], recentIds: [] }; }
  }, [snapshot]);

  const toggleFavorite = useCallback((id: string) => {
    const current = readIds('devdesk:favorites');
    const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
    try { window.localStorage.setItem('devdesk:favorites', JSON.stringify(next)); } catch { /* Preferences are optional. */ }
    notifyPreferencesChanged();
  }, []);
  const markRecent = useCallback((id: string) => {
    const current = readIds('devdesk:recent');
    const next = [id, ...current.filter((item) => item !== id)].slice(0, 6);
    try { window.localStorage.setItem('devdesk:recent', JSON.stringify(next)); } catch { /* Recent history is optional. */ }
    notifyPreferencesChanged();
  }, []);

  const value = useMemo(() => ({ ...stored, toggleFavorite, markRecent }), [stored, toggleFavorite, markRecent]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

type Theme = 'system' | 'light' | 'dark';

function getThemeSnapshot(): Theme {
  try {
    const savedTheme = window.localStorage.getItem('devdesk:theme');
    return savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system' ? savedTheme : 'system';
  } catch { return 'system'; }
}

function saveTheme(theme: Theme) {
  try { window.localStorage.setItem('devdesk:theme', theme); } catch { /* Theme may remain session-only. */ }
  notifyPreferencesChanged();
}

function SearchDialog({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const text = shellMessages[locale];
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const matches = toolRegistry.filter((tool) => toolMatchesSearch(tool, query, locale));

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((current) => matches.length ? (current + 1) % matches.length : 0);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((current) => matches.length ? (current + matches.length - 1) % matches.length : 0);
      } else if (event.key === 'Enter' && matches[activeIndex]) {
        event.preventDefault();
        router.push(`/${locale}/tools/${matches[activeIndex].slug}/`);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, locale, matches, onClose, router]);

  return (
    <div className="search-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title">
        <div className="search-dialog-heading">
          <h2 id="search-title">{text.searchTools}</h2>
          <button className="quiet-button" onClick={onClose} type="button">{text.close}<kbd>Esc</kbd></button>
        </div>
        <label className="visually-hidden" htmlFor="tool-search">{text.search}</label>
        <input aria-activedescendant={matches[activeIndex] ? `search-result-${matches[activeIndex].id}` : undefined} id="tool-search" className="search-input" onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} placeholder={text.searchPlaceholder} ref={inputRef} value={query} />
        <ul className="search-results" role="listbox">
          {matches.map((tool, index) => (
            <li aria-selected={index === activeIndex} id={`search-result-${tool.id}`} key={tool.id} role="option">
              <Link href={`/${locale}/tools/${tool.slug}/`} onClick={onClose} onMouseEnter={() => setActiveIndex(index)}>
                <span className="tool-glyph">{tool.icon}</span><span>{tool.name[locale]}</span><span className="search-result-arrow" aria-hidden="true">↵</span>
              </Link>
            </li>
          ))}
          {matches.length === 0 && <li className="search-empty">{text.noResults}</li>}
        </ul>
        <p className="search-hint"><kbd>↑</kbd><kbd>↓</kbd> {locale === 'ko' ? '이동' : locale === 'ja' ? '移動' : locale === 'zh' ? '移动' : 'to navigate'} <kbd>Enter</kbd> {locale === 'ko' ? '열기' : locale === 'ja' ? '開く' : locale === 'zh' ? '打开' : 'to open'}</p>
      </section>
    </div>
  );
}

function AppShellFrame({ locale, children }: { locale: Locale; children: ReactNode }) {
  const text = shellMessages[locale];
  const pathname = usePathname() || `/${locale}/`;
  const router = useRouter();
  const { favoriteIds, recentIds, markRecent } = useToolPreferences();
  const { discardUnlessTarget } = useToolHandoff();
  const theme = useSyncExternalStore(subscribePreferences, getThemeSnapshot, () => 'system');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.dispatchEvent(new Event('devdesk:theme-applied'));
  }, [theme]);

  useEffect(() => {
    const match = pathname.match(/^\/[a-z]{2}\/tools\/([^/]+)/);
    const tool = match ? toolRegistry.find((item) => item.slug === match[1]) : undefined;
    if (tool) markRecent(tool.id);
  }, [markRecent, pathname]);

  useEffect(() => {
    const match = pathname.match(/^\/[a-z]{2}\/tools\/([^/]+)/);
    const target = match ? toolRegistry.find((item) => item.slug === match[1]) : undefined;
    discardUnlessTarget(target?.id ?? null);
  }, [discardUnlessTarget, pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      } else if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        if ((event.target as HTMLElement | null)?.closest('textarea, input, [contenteditable="true"]')) return;
        event.preventDefault();
        window.dispatchEvent(new Event('devdesk:run'));
      } else if (event.key === 'Escape') {
        setSearchOpen(false);
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const closeMobileNav = () => setMobileNavOpen(false);
  const changeLocale = (nextLocale: Locale) => {
    closeMobileNav();
    const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
    const nextPath = `/${nextLocale}${rest || '/'}`;
    router.push(nextPath);
  };
  const cycleTheme = () => saveTheme(theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system');
  const themeLabel = theme === 'system' ? text.system : theme === 'light' ? text.light : text.dark;
  const categories: ToolCategory[] = ['format', 'encoding', 'security', 'time', 'text', 'generator', 'data'];

  const toolLinks = (ids: string[]) => ids.map((id) => {
    const tool = toolById(id);
    return tool ? <Link className="sidebar-tool-link" href={`/${locale}/tools/${tool.slug}/`} key={id}><span className="tool-glyph small">{tool.icon}</span><span>{tool.name[locale]}</span></Link> : null;
  });

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href={`/${locale}/`} onClick={closeMobileNav}><Image alt="" aria-hidden="true" className="brand-mark" height={32} src="/icon.svg" width={32} /><span>DevDesk</span></Link>
          <nav className="top-nav" aria-label={text.tools}>
            <Link aria-current={pathname.includes('/tools') ? 'page' : undefined} href={`/${locale}/tools/`} onClick={closeMobileNav}>{text.tools}</Link>
            <Link href={`/${locale}/guides/`} onClick={closeMobileNav}>{text.guides}</Link>
          </nav>
          <div className="top-actions">
            <button aria-label={`${text.search} ⌘ K`} className="search-trigger" onClick={() => setSearchOpen(true)} type="button"><span className="search-icon" aria-hidden="true">⌕</span><span>{text.search}</span><kbd aria-hidden="true">⌘ K</kbd></button>
            <label className="visually-hidden" htmlFor="locale-select">{text.language}</label>
            <select className="locale-select" id="locale-select" onChange={(event) => changeLocale(event.target.value as Locale)} value={locale}>
              {locales.map((item) => <option key={item} value={item}>{localeMetadata[item].label}</option>)}
            </select>
            <button aria-label={`${text.theme}: ${themeLabel}`} className="icon-button theme-button" onClick={cycleTheme} type="button"><span aria-hidden="true">{theme === 'dark' ? '☾' : theme === 'light' ? '☼' : '◐'}</span><span className="theme-label">{themeLabel}</span></button>
            <button aria-expanded={mobileNavOpen} aria-label={text.menu} className="icon-button mobile-menu-button" onClick={() => setMobileNavOpen((open) => !open)} type="button"><span aria-hidden="true">☰</span></button>
          </div>
        </div>
      </header>

      <div className="shell-body">
        <aside className={`sidebar${mobileNavOpen ? ' is-open' : ''}`} aria-label={text.categories}>
          <Link className="sidebar-primary-link" href={`/${locale}/tools/`} onClick={closeMobileNav}><span aria-hidden="true">⌘</span>{text.allTools}<kbd>12</kbd></Link>
          <div className="sidebar-group">
            <p className="sidebar-heading">{text.categories}</p>
            {categories.map((category) => <Link className="sidebar-category-link" href={`/${locale}/tools/#${category}`} key={category} onClick={closeMobileNav}><span className={`category-dot category-${category}`} />{text.categoryNames[category]}</Link>)}
          </div>
          <div className="sidebar-group">
            <p className="sidebar-heading">{text.favorites}</p>
            {favoriteIds.length ? toolLinks(favoriteIds) : <p className="sidebar-empty">{text.emptyFavorites}</p>}
          </div>
          <div className="sidebar-group">
            <p className="sidebar-heading">{text.recent}</p>
            {recentIds.length ? toolLinks(recentIds) : <p className="sidebar-empty">{text.emptyRecent}</p>}
          </div>
          <p className="sidebar-privacy"><span aria-hidden="true">◉</span>{text.description}</p>
        </aside>

        <div className="main-column">
          <div className="page-content">{children}</div>
          <footer className="app-footer">
            <span>© {new Date().getFullYear()} DevDesk</span>
            <nav aria-label={locale === 'ko' ? '푸터' : locale === 'ja' ? 'フッター' : locale === 'zh' ? '页脚' : 'Footer'}>
              <Link href={`/${locale}/about/`} onClick={closeMobileNav}>{text.about}</Link><Link href={`/${locale}/privacy/`} onClick={closeMobileNav}>{text.privacy}</Link><Link href={`/${locale}/terms/`} onClick={closeMobileNav}>{text.terms}</Link><Link href={`/${locale}/contact/`} onClick={closeMobileNav}>{text.contact}</Link>
            </nav>
          </footer>
        </div>
      </div>

      {searchOpen && <SearchDialog locale={locale} onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

export function AppShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <PreferencesProvider><ToolHandoffProvider><AppShellFrame locale={locale}>{children}</AppShellFrame></ToolHandoffProvider></PreferencesProvider>;
}
