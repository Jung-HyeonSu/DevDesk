import { canFormatCode, isWithinCodeInputLimit, type CodeLanguage } from './code-languages';
import type { Node } from 'web-tree-sitter';

export type CodeFormatErrorCode = 'empty-input' | 'too-large' | 'unsupported' | 'format-failed';

export class CodeFormatError extends Error {
  constructor(readonly code: CodeFormatErrorCode) {
    super(code);
    this.name = 'CodeFormatError';
  }
}

export async function formatCode(source: string, language: CodeLanguage, indentWidth: 2 | 4, assetBase?: string): Promise<string> {
  if (!source.trim()) throw new CodeFormatError('empty-input');
  if (!isWithinCodeInputLimit(source)) throw new CodeFormatError('too-large');
  if (!canFormatCode(language)) throw new CodeFormatError('unsupported');

  try {
    if (language === 'perl') return await formatPerl(source, indentWidth, assetBase);

    if (['c', 'csharp', 'cpp', 'java'].includes(language)) {
      const { default: initialize, format } = await import('@wasm-fmt/clang-format/web');
      await initialize();
      const extension = language === 'c' ? 'c' : language === 'csharp' ? 'cs' : language === 'java' ? 'java' : 'cpp';
      const style = JSON.stringify({ BasedOnStyle: language === 'csharp' ? 'Microsoft' : 'Google', IndentWidth: indentWidth, ColumnLimit: 100 });
      return format(source, `main.${extension}`, style);
    }

    if (language === 'go') {
      const { format } = await import('@wasm-fmt/gofmt');
      return format(source);
    }

    if (language === 'python') {
      const { format } = await import('@wasm-fmt/ruff_fmt');
      return format(source, 'main.py', { indent_style: 'space', indent_width: indentWidth, line_width: 100 });
    }

    if (language === 'ruby') {
      const { format } = await import('@scalar/ruby-fmt');
      return await format(source, { printWidth: 100, rubocopConfig: { 'Layout/IndentationWidth': { Width: indentWidth } } });
    }

    if (language === 'sql') {
      const { format } = await import('sql-formatter');
      return format(source, { language: 'postgresql', tabWidth: indentWidth, keywordCase: 'upper' });
    }

    const prettier = await import('prettier/standalone');
    const options = { tabWidth: indentWidth, useTabs: false, printWidth: 100, singleQuote: true, semi: true };

    if (language === 'javascript') {
      const [babel, estree] = await Promise.all([import('prettier/plugins/babel'), import('prettier/plugins/estree')]);
      return await prettier.format(source, { ...options, parser: 'babel', plugins: [babel, estree] });
    }
    if (language === 'typescript') {
      const [typescript, estree] = await Promise.all([import('prettier/plugins/typescript'), import('prettier/plugins/estree')]);
      return await prettier.format(source, { ...options, parser: 'typescript', plugins: [typescript, estree] });
    }
    if (language === 'css') {
      const postcss = await import('prettier/plugins/postcss');
      return await prettier.format(source, { ...options, parser: 'css', plugins: [postcss] });
    }
    if (language === 'html') {
      const html = await import('prettier/plugins/html');
      return await prettier.format(source, { ...options, parser: 'html', plugins: [html] });
    }
    if (language === 'php') {
      const php = await import('@prettier/plugin-php');
      const phpNamespace = php as unknown as { parsers?: unknown; default?: unknown };
      const phpPlugin = phpNamespace.parsers ? php : phpNamespace.default;
      return await prettier.format(source, { ...options, parser: 'php', plugins: [phpPlugin as never], phpVersion: '8.5' });
    }

    throw new CodeFormatError('unsupported');
  } catch (error) {
    if (error instanceof CodeFormatError) throw error;
    throw new CodeFormatError('format-failed');
  }
}

let perlLanguagePromise: Promise<import('web-tree-sitter').Language> | null = null;

async function formatPerl(source: string, indentWidth: 2 | 4, assetBase?: string) {
  const { Parser, Language } = await import('web-tree-sitter');
  const base = assetBase ?? (typeof self !== 'undefined' ? new URL('/', self.location.href).href : null);
  if (!base) throw new CodeFormatError('format-failed');
  perlLanguagePromise ??= (async () => {
    await Parser.init(/^https?:/.test(base) ? {
      locateFile: () => new URL('tree-sitter-runtime.wasm', base).href,
    } : undefined);
    return Language.load(new URL('tree-sitter-perl.wasm', base));
  })();

  const language = await perlLanguagePromise;
  const parser = new Parser();
  let tree: ReturnType<typeof parser.parse> = null;
  try {
    parser.setLanguage(language);
    tree = parser.parse(source);
    if (!tree || tree.rootNode.hasError) throw new CodeFormatError('format-failed');

    const newline = source.includes('\r\n') ? '\r\n' : '\n';
    const insertions = collectPerlFormattingInsertions(tree.rootNode, newline);
    const offsets = [...insertions.keys()];
    let normalized = source;
    for (const offset of offsets.sort((a, b) => b - a)) {
      normalized = `${normalized.slice(0, offset)}${insertions.get(offset)}${normalized.slice(offset)}`;
    }

    parser.reset();
    tree.delete();
    tree = null;
    tree = parser.parse(normalized);
    if (!tree || tree.rootNode.hasError) throw new CodeFormatError('format-failed');
    return indentPerlLines(tree.rootNode, normalized, indentWidth);
  } finally {
    tree?.delete();
    parser.delete();
  }
}

function collectPerlFormattingInsertions(root: Node, newline: string) {
  const insertions = new Map<number, string>();
  const addSpace = (offset: number) => {
    if (!insertions.has(offset)) insertions.set(offset, ' ');
  };
  const addNewline = (offset: number) => insertions.set(offset, newline);
  const ensureSpaceBetween = (left: Node | undefined, right: Node | undefined) => {
    if (left && right && left.endPosition.row === right.startPosition.row && left.endIndex === right.startIndex) {
      addSpace(right.startIndex);
    }
  };
  const visit = (node: Node) => {
    const children = node.children;
    if (node.type === 'assignment_expression') {
      for (const [index, child] of children.entries()) {
        if (!['=', '+=', '-=', '*=', '/=', '%=', '.=', 'x=', '&=', '|=', '^=', '&&=', '||=', '//='].includes(child.type)) continue;
        ensureSpaceBetween(children[index - 1], child);
        ensureSpaceBetween(child, children[index + 1]);
      }
    }

    if (['conditional_statement', 'loop_statement', 'for_statement'].includes(node.type)) {
      for (const [index, child] of children.entries()) {
        if (!['if', 'unless', 'while', 'until', 'for', 'foreach', 'given', 'when'].includes(child.type)) continue;
        if (children[index + 1]?.type === '(') ensureSpaceBetween(child, children[index + 1]);
      }
    }

    if (node.type === 'source_file' || node.type === 'block') {
      for (const [index, child] of children.entries()) {
        if (child.type !== ';') continue;
        const next = children[index + 1];
        if (next && next.startPosition.row === child.endPosition.row && next.type !== 'comment') addNewline(child.endIndex);
      }
    }

    if (node.type === 'block') {
      const openIndex = children.findIndex((child) => child.type === '{');
      const closeIndex = children.findIndex((child) => child.type === '}');
      const open = children[openIndex];
      const close = children[closeIndex];
      if (open && close) {
        const parentChildren = node.parent?.children ?? [];
        const blockIndex = parentChildren.findIndex((sibling) => sibling.type === node.type && sibling.startIndex === node.startIndex && sibling.endIndex === node.endIndex);
        ensureSpaceBetween(parentChildren[blockIndex - 1], open);
      }
      if (open && close && closeIndex > openIndex + 1) {
        const firstBodyNode = children[openIndex + 1];
        if (firstBodyNode && open.endPosition.row === firstBodyNode.startPosition.row) {
          ensureSpaceBetween(open, firstBodyNode);
          if (firstBodyNode.type !== 'comment') addNewline(open.endIndex);
        }

        const lastBodyNode = children[closeIndex - 1];
        if (lastBodyNode && lastBodyNode.endPosition.row === close.startPosition.row) addNewline(close.startIndex);
      }
    }

    if (children.some((child) => child.type === 'block')) {
      const siblings = node.parent?.children ?? [];
      const nodeIndex = siblings.findIndex((sibling) => sibling.type === node.type && sibling.startIndex === node.startIndex && sibling.endIndex === node.endIndex);
      const nextSibling = siblings[nodeIndex + 1];
      if (nextSibling && nextSibling.startPosition.row === node.endPosition.row && nextSibling.type !== 'comment') {
        const nextText = nextSibling.text.trimStart();
        if (!/^(?:else\b|elsif\b|continue\b|while\b|[;,\)\]\}])/.test(nextText)) addNewline(node.endIndex);
      }
    }

    for (const child of children) visit(child);
  };
  visit(root);
  return insertions;
}

function indentPerlLines(root: Node, source: string, indentWidth: 2 | 4) {
  const blockRanges: Array<[number, number]> = [];
  const protectedRanges: Array<[number, number]> = [];
  const visit = (node: Node) => {
    if (node.type === 'block') blockRanges.push([node.startPosition.row, node.endPosition.row]);
    if (/^(?:heredoc_content|pod|data_section|format_body)$/.test(node.type)) {
      protectedRanges.push([node.startPosition.row, node.endPosition.row]);
    } else if ((node.type === 'string_content' || node.type === 'regexp_content') && node.startPosition.row < node.endPosition.row) {
      protectedRanges.push([node.startPosition.row + 1, node.endPosition.row]);
    }
    for (const child of node.children) visit(child);
  };
  visit(root);

  return source.split(/\r?\n/).map((line, row) => {
    if (protectedRanges.some(([start, end]) => row >= start && row <= end)) return line;
    if (!line.trim()) return '';
    const depth = blockRanges.reduce((total, [start, end]) => total + (row > start && row < end ? 1 : 0), 0);
    return `${' '.repeat(depth * indentWidth)}${line.trimStart()}`;
  }).join(source.includes('\r\n') ? '\r\n' : '\n');
}
