'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { EditorView } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import type { Extension } from '@codemirror/state';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';

type EditorLanguage = 'json' | 'sql' | 'yaml' | 'text';

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
  ssr: false,
  loading: () => <div className="code-editor-loading" aria-hidden="true" />,
});

const languageLoaders: Record<Exclude<EditorLanguage, 'text'>, () => Promise<Extension>> = {
  json: async () => (await import('@codemirror/lang-json')).json(),
  sql: async () => (await import('@codemirror/lang-sql')).sql(),
  yaml: async () => (await import('@codemirror/lang-yaml')).yaml(),
};

function getThemeSnapshot(): 'light' | 'dark' {
  const selected = document.documentElement.dataset.theme;
  if (selected === 'dark') return 'dark';
  if (selected === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribeTheme(callback: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  window.addEventListener('devdesk:theme-applied', callback);
  media.addEventListener('change', callback);
  return () => {
    window.removeEventListener('devdesk:theme-applied', callback);
    media.removeEventListener('change', callback);
  };
}

export function CodeEditor({
  labelledBy,
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
  language = 'text',
  minHeight = '220px',
}: {
  labelledBy?: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  language?: EditorLanguage;
  minHeight?: string;
}) {
  const colorScheme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'light');
  const [loadedLanguage, setLoadedLanguage] = useState<{ language: EditorLanguage; extension: Extension | null }>({ language: 'text', extension: null });

  useEffect(() => {
    if (language === 'text') return;
    let cancelled = false;
    languageLoaders[language]().then((extension) => {
      if (!cancelled) setLoadedLanguage({ language, extension });
    }).catch(() => {
      if (!cancelled) setLoadedLanguage({ language, extension: null });
    });
    return () => { cancelled = true; };
  }, [language]);

  const languageExtension = loadedLanguage.language === language ? loadedLanguage.extension : null;

  const extensions = useMemo<Extension[]>(() => {
    const contentAttributes = EditorView.contentAttributes.of({
      role: 'textbox',
      'aria-multiline': 'true',
      ...(readOnly ? { 'aria-readonly': 'true' } : {}),
      'aria-label': label,
      ...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
    });
    return [EditorView.lineWrapping, contentAttributes, ...(languageExtension ? [languageExtension] : [])];
  }, [label, labelledBy, languageExtension, readOnly]);

  const props: ReactCodeMirrorProps = {
    'aria-label': label,
    'aria-labelledby': labelledBy,
    basicSetup: { foldGutter: false, highlightActiveLine: true, lineNumbers: true },
    className: 'devdesk-codemirror',
    extensions,
    height: '100%',
    minHeight,
    onChange: (nextValue) => onChange?.(nextValue),
    placeholder,
    readOnly,
    theme: colorScheme === 'dark' ? oneDark : 'light',
    value,
  };

  return <CodeMirror {...props} />;
}
