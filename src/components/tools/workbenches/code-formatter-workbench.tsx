'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { codeFormatterMessages } from '@/i18n/code-formatter';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '@/components/tools/workbench-primitives';
import { notifyWorkbenchSuccess } from '@/components/tools/workbench-feedback';
import { canFormatCode, codeLanguages, codeThemes, DEFAULT_CODE_LANGUAGE, DEFAULT_CODE_THEME, isWithinCodeInputLimit, type CodeLanguage, type CodeTheme } from '@/lib/tools/code-languages';
import type { CodeFormatErrorCode } from '@/lib/tools/code-formatter';

const samples: Record<CodeLanguage, string> = {
  c: '#include <stdio.h>\nint main(){printf("Hello, DevDesk!");return 0;}',
  csharp: 'using System;\nclass Program{static void Main(){Console.WriteLine("Hello, DevDesk!");}}',
  cpp: '#include <iostream>\nint main(){std::cout << "Hello, DevDesk!";return 0;}',
  css: '.card{color:#222;padding:16px;border-radius:8px}',
  go: 'package main\nimport "fmt"\nfunc main(){fmt.Println("Hello, DevDesk!")}',
  html: '<main><h1>Hello, DevDesk!</h1><p>Format this HTML.</p></main>',
  java: 'class Hello{public static void main(String[] args){System.out.println("Hello, DevDesk!");}}',
  javascript: 'function greet(name){return "Hello, "+name+"!"}console.log(greet("DevDesk"))',
  perl: 'my $name="DevDesk"; print "Hello, $name!\\n";',
  php: '<?php function greet($name){return "Hello, ".$name."!";} echo greet("DevDesk");',
  python: 'def greet(name):\n return "Hello, " + name + "!"\nprint(greet("DevDesk"))',
  ruby: 'def greet(name)\n"Hello, #{name}!"\nend\nputs greet("DevDesk")',
  sql: 'select id,name from users where active=true order by name',
  typescript: 'type User={name:string};const greet=(user:User)=>`Hello, ${user.name}!`;console.log(greet({name:"DevDesk"}))',
};

type PendingFormat = { id: number; source: string; language: CodeLanguage };
type WorkerResponse = { id: number; output?: string; error?: CodeFormatErrorCode };

export function CodeFormatterWorkbench({ locale }: { locale: Locale }) {
  const text = codeFormatterMessages[locale];
  const [language, setLanguage] = useState<CodeLanguage>(DEFAULT_CODE_LANGUAGE);
  const [theme, setTheme] = useState<CodeTheme>(DEFAULT_CODE_THEME);
  const [indentWidth, setIndentWidth] = useState<2 | 4>(2);
  const [input, setInput] = useState('');
  const [formatting, setFormatting] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error' | 'info'; message: string } | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<PendingFormat | null>(null);
  const sequenceRef = useRef(0);
  const inputRef = useRef(input);
  const languageRef = useRef(language);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current = input;
    languageRef.current = language;
  }, [input, language]);

  useEffect(() => {
    const worker = new Worker(new URL('../../../lib/tools/code-formatter.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;
      const pending = pendingRef.current;
      if (!pending || response.id !== pending.id) return;
      pendingRef.current = null;
      setFormatting(false);
      if (pending.source !== inputRef.current || pending.language !== languageRef.current) return;
      if (response.output !== undefined) {
        setInput(response.output);
        setStatus({ kind: 'success', message: text.formatSuccess });
        notifyWorkbenchSuccess();
      } else {
        const message = response.error === 'empty-input' ? text.emptyInput
          : response.error === 'too-large' ? text.tooLarge
            : response.error === 'unsupported' ? text.unsupported : text.formatError;
        setStatus({ kind: 'error', message });
      }
    };
    worker.onerror = () => {
      pendingRef.current = null;
      setFormatting(false);
      setStatus({ kind: 'error', message: text.formatError });
    };
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [text]);

  const format = useCallback(() => {
    if (!input.trim()) {
      setStatus({ kind: 'error', message: text.emptyInput });
      return;
    }
    if (!isWithinCodeInputLimit(input)) {
      setStatus({ kind: 'error', message: text.tooLarge });
      return;
    }
    if (!canFormatCode(language)) {
      setStatus({ kind: 'error', message: text.unsupported });
      return;
    }
    const worker = workerRef.current;
    if (!worker) {
      setStatus({ kind: 'error', message: text.formatError });
      return;
    }
    const id = ++sequenceRef.current;
    pendingRef.current = { id, source: input, language };
    setFormatting(true);
    setStatus({ kind: 'info', message: text.formatting });
    worker.postMessage({ id, source: input, language, indentWidth });
  }, [indentWidth, input, language, text]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        format();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [format]);

  const changeLanguage = (nextLanguage: CodeLanguage) => {
    pendingRef.current = null;
    setFormatting(false);
    setLanguage(nextLanguage);
    setStatus(null);
  };

  const loadSample = () => {
    setInput(samples[language]);
    setStatus({ kind: 'info', message: text.sampleLoaded });
  };

  const clear = () => {
    pendingRef.current = null;
    setInput('');
    setFormatting(false);
    setStatus({ kind: 'info', message: text.cleared });
  };

  const copy = async () => {
    if (!input) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(input);
      copied = true;
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = input;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.append(textarea);
        try {
          textarea.select();
          copied = document.execCommand('copy');
        } finally {
          textarea.remove();
        }
      } catch {
        copied = false;
      }
    }
    setStatus(copied ? { kind: 'success', message: text.copied } : { kind: 'error', message: text.copyError });
    if (copied) notifyWorkbenchSuccess();
  };

  const saveImage = async () => {
    const editor = imageRef.current?.querySelector<HTMLElement>('.code-editor');
    if (!input || !editor) return;
    try {
      const { toPng } = await import('html-to-image');
      const themeDefinition = codeThemes.find((item) => item.id === theme);
      const backgroundColor = themeDefinition?.background ?? '#f6f8fa';
      const dataUrl = await toPng(editor, { pixelRatio: 2, cacheBust: false, backgroundColor });
      const anchor = document.createElement('a');
      anchor.href = dataUrl;
      anchor.download = `devdesk-code-${language}.png`;
      anchor.click();
      setStatus({ kind: 'success', message: text.imageSaved });
      notifyWorkbenchSuccess();
    } catch {
      setStatus({ kind: 'error', message: text.imageError });
    }
  };

  return (
    <section className="code-formatter-workbench" aria-label={text.toolLabel}>
      <p className="code-formatter-note">{text.localNotice}</p>
      <div className="code-formatter-settings">
        <label>
          <span>{text.languageLabel}</span>
          <select value={language} onChange={(event) => changeLanguage(event.target.value as CodeLanguage)}>
            {codeLanguages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span>{text.themeLabel}</span>
          <select value={theme} onChange={(event) => setTheme(event.target.value as CodeTheme)}>
            {codeThemes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label>
          <span>{text.indentLabel}</span>
          <select value={indentWidth} onChange={(event) => setIndentWidth(Number(event.target.value) as 2 | 4)}>
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </label>
      </div>
      {language === 'php' && <p className="code-formatter-limitation">{text.phpNotice}</p>}
      {language === 'go' && <p className="code-formatter-limitation">{text.goNotice}</p>}
      <div className="code-image-card" ref={imageRef}>
        <EditorPanel editorTheme={theme} language={language} locale={locale} label={text.inputLabel} value={input} onChange={(nextValue) => { setInput(nextValue); setStatus(null); }} placeholder={text.inputHint} />
      </div>
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={format} variant="primary" disabled={formatting || !canFormatCode(language)}>{text.format}</ActionButton>
        <ActionButton onClick={() => void copy()} disabled={!input}>{text.copy}</ActionButton>
        <ActionButton onClick={() => void saveImage()} disabled={!input}>{text.saveImage}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
        <span className="code-formatter-shortcut">{text.shortcut}</span>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      {formatting && <span className="sr-only" role="status">{text.formatting}</span>}
    </section>
  );
}
