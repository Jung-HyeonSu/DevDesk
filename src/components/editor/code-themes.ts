import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { EditorView } from '@codemirror/view';
import type { CodeTheme } from '@/lib/tools/code-languages';

const palettes = {
  'github-light': {
    background: '#f6f8fa', foreground: '#24292f', muted: '#6e7781', selection: '#dbeafe',
    keyword: '#cf222e', string: '#0a3069', comment: '#6e7781', number: '#0550ae',
    function: '#8250df', type: '#953800', property: '#116329', operator: '#0550ae',
  },
  monokai: {
    background: '#272822', foreground: '#f8f8f2', muted: '#8f908a', selection: '#49483e',
    keyword: '#f92672', string: '#e6db74', comment: '#75715e', number: '#ae81ff',
    function: '#a6e22e', type: '#66d9ef', property: '#fd971f', operator: '#f92672',
  },
  dracula: {
    background: '#282a36', foreground: '#f8f8f2', muted: '#9a9baa', selection: '#44475a',
    keyword: '#ff79c6', string: '#f1fa8c', comment: '#6272a4', number: '#bd93f9',
    function: '#50fa7b', type: '#8be9fd', property: '#ffb86c', operator: '#ff79c6',
  },
  nord: {
    background: '#2e3440', foreground: '#d8dee9', muted: '#7b88a1', selection: '#434c5e',
    keyword: '#81a1c1', string: '#a3be8c', comment: '#616e88', number: '#b48ead',
    function: '#88c0d0', type: '#8fbcbb', property: '#d08770', operator: '#81a1c1',
  },
  'solarized-dark': {
    background: '#002b36', foreground: '#839496', muted: '#586e75', selection: '#073642',
    keyword: '#859900', string: '#2aa198', comment: '#586e75', number: '#d33682',
    function: '#268bd2', type: '#b58900', property: '#cb4b16', operator: '#859900',
  },
} satisfies Record<CodeTheme, Record<string, string>>;

function themeExtension(theme: CodeTheme): Extension {
  const palette = palettes[theme];
  const highlight = HighlightStyle.define([
    { tag: [tags.keyword, tags.controlKeyword, tags.operatorKeyword], color: palette.keyword },
    { tag: [tags.string, tags.special(tags.string), tags.character], color: palette.string },
    { tag: [tags.comment, tags.lineComment, tags.blockComment], color: palette.comment, fontStyle: 'italic' },
    { tag: [tags.number, tags.bool, tags.null], color: palette.number },
    { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: palette.function },
    { tag: [tags.typeName, tags.className, tags.namespace], color: palette.type },
    { tag: [tags.propertyName, tags.attributeName], color: palette.property },
    { tag: [tags.operator], color: palette.operator },
    { tag: [tags.definition(tags.variableName)], color: palette.foreground },
  ]);

  return [
    EditorView.theme({
      '&': { color: palette.foreground, backgroundColor: palette.background, borderRadius: '10px' },
      '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
      '.cm-gutters': { color: palette.muted, backgroundColor: palette.background, border: 'none' },
      '.cm-activeLineGutter': { color: palette.foreground, backgroundColor: palette.selection },
      '.cm-selectionBackground, ::selection': { backgroundColor: palette.selection },
    }, { dark: theme !== 'github-light' }),
    syntaxHighlighting(highlight),
  ];
}

export const codeEditorThemes: Record<CodeTheme, Extension> = {
  'github-light': themeExtension('github-light'),
  monokai: themeExtension('monokai'),
  dracula: themeExtension('dracula'),
  nord: themeExtension('nord'),
  'solarized-dark': themeExtension('solarized-dark'),
};
