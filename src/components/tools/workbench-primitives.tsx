'use client';

import { useEffect, useId } from 'react';
import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { CodeEditor } from '@/components/editor/code-editor';
import type { EditorLanguage } from '@/components/editor/code-editor';
import type { CodeTheme } from '@/lib/tools/code-languages';

const characterLabels: Record<Locale, string> = { ko: '글자', en: 'characters', ja: '文字', zh: '个字符' };

export function EditorPanel({ locale, label, value, onChange, placeholder, readOnly = false, language = 'text', editorTheme }: { locale: Locale; label: string; value: string; onChange?: (value: string) => void; placeholder?: string; readOnly?: boolean; language?: EditorLanguage; editorTheme?: CodeTheme }) {
  const labelId = useId();
  return (
    <section className="editor-panel">
      <span className="editor-label" id={labelId}>{label}</span>
      <div className="code-editor" data-code-theme={editorTheme}><CodeEditor labelledBy={labelId} label={label} language={language} editorTheme={editorTheme} minHeight="220px" onChange={onChange} placeholder={placeholder} readOnly={readOnly} value={value} /></div>
      <div className="editor-footer"><span>{value.length.toLocaleString(locale)} {characterLabels[locale]}</span><span>UTF-8</span></div>
    </section>
  );
}

export function ActionToolbar({ children }: { children: ReactNode }) {
  return <div className="action-toolbar" role="toolbar">{children}</div>;
}

export function ActionButton({ children, onClick, variant = 'secondary', disabled = false, title }: { children: ReactNode; onClick: () => void; variant?: 'primary' | 'secondary' | 'quiet'; disabled?: boolean; title?: string }) {
  return <button className={`action-button action-${variant}`} disabled={disabled} onClick={onClick} title={title} type="button">{children}</button>;
}

export function StatusMessage({ kind, children }: { kind: 'success' | 'error' | 'info'; children: ReactNode }) {
  return <p aria-live="polite" className={`status-message status-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</p>;
}

export function RunShortcut({ onRun }: { onRun: () => void }) {
  useEffect(() => {
    const handler = () => onRun();
    window.addEventListener('devdesk:run', handler);
    return () => window.removeEventListener('devdesk:run', handler);
  }, [onRun]);
  return null;
}
