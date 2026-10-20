'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { EditorView } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import type { Extension } from '@codemirror/state';
import { StreamLanguage } from '@codemirror/language';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import type { CodeLanguage, CodeTheme } from '@/lib/tools/code-languages';
import { codeEditorThemes } from '@/components/editor/code-themes';

export type EditorLanguage = 'json' | 'sql' | 'yaml' | 'text' | CodeLanguage;

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
  ssr: false,
  loading: () => <div className="code-editor-loading" aria-hidden="true" />,
});

const languageLoaders: Record<Exclude<EditorLanguage, 'text'>, () => Promise<Extension>> = {
  json: async () => (await import('@codemirror/lang-json')).json(),
  sql: async () => (await import('@codemirror/lang-sql')).sql(),
  yaml: async () => (await import('@codemirror/lang-yaml')).yaml(),
  c: async () => (await import('@codemirror/lang-cpp')).cpp(),
  csharp: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/clike')).csharp),
  cpp: async () => (await import('@codemirror/lang-cpp')).cpp(),
  css: async () => (await import('@codemirror/lang-css')).css(),
  go: async () => (await import('@codemirror/lang-go')).go(),
  html: async () => (await import('@codemirror/lang-html')).html(),
  java: async () => (await import('@codemirror/lang-java')).java(),
  javascript: async () => (await import('@codemirror/lang-javascript')).javascript(),
  perl: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/perl')).perl),
  php: async () => (await import('@codemirror/lang-php')).php(),
  python: async () => (await import('@codemirror/lang-python')).python(),
  ruby: async () => StreamLanguage.define((await import('@codemirror/legacy-modes/mode/ruby')).ruby),
  typescript: async () => (await import('@codemirror/lang-javascript')).javascript({ typescript: true }),
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
  editorTheme,
  minHeight = '220px',
}: {
  labelledBy?: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  language?: EditorLanguage;
  editorTheme?: CodeTheme;
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
    theme: editorTheme ? codeEditorThemes[editorTheme] : colorScheme === 'dark' ? oneDark : 'light',
    value,
  };

  return <CodeMirror {...props} />;
}
