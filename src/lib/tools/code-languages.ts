export const codeLanguages = [
  { id: 'c', label: 'C', formatter: 'clang' },
  { id: 'csharp', label: 'C#', formatter: 'clang' },
  { id: 'cpp', label: 'C++', formatter: 'clang' },
  { id: 'css', label: 'CSS', formatter: 'prettier' },
  { id: 'go', label: 'Go', formatter: 'gofmt' },
  { id: 'html', label: 'HTML', formatter: 'prettier' },
  { id: 'java', label: 'Java', formatter: 'clang' },
  { id: 'javascript', label: 'JavaScript', formatter: 'prettier' },
  { id: 'perl', label: 'Perl', formatter: 'tree-sitter' },
  { id: 'php', label: 'PHP', formatter: 'prettier-php' },
  { id: 'python', label: 'Python', formatter: 'ruff' },
  { id: 'ruby', label: 'Ruby', formatter: 'ruby' },
  { id: 'sql', label: 'SQL', formatter: 'sql' },
  { id: 'typescript', label: 'TypeScript', formatter: 'prettier' },
] as const;

export type CodeLanguage = (typeof codeLanguages)[number]['id'];

export const codeThemes = [
  { id: 'github-light', label: 'GitHub Light', dark: false, background: '#f6f8fa' },
  { id: 'monokai', label: 'Monokai', dark: true, background: '#272822' },
  { id: 'dracula', label: 'Dracula', dark: true, background: '#282a36' },
  { id: 'nord', label: 'Nord', dark: true, background: '#2e3440' },
  { id: 'solarized-dark', label: 'Solarized Dark', dark: true, background: '#002b36' },
] as const;

export type CodeTheme = (typeof codeThemes)[number]['id'];

export const DEFAULT_CODE_LANGUAGE: CodeLanguage = 'java';
export const DEFAULT_CODE_THEME: CodeTheme = 'github-light';
export const MAX_CODE_INPUT_BYTES = 1024 * 1024;

export function canFormatCode(language: CodeLanguage) {
  return codeLanguages.find((item) => item.id === language)?.formatter !== null;
}

export function isWithinCodeInputLimit(code: string) {
  return new TextEncoder().encode(code).byteLength <= MAX_CODE_INPUT_BYTES;
}
