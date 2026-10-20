import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const locales = ['ko', 'en', 'ja', 'zh'];
const expectedTools = ['json-formatter', 'sql-formatter', 'jwt-decoder', 'cron-generator', 'text-diff', 'base64', 'url-encoder', 'unix-timestamp', 'uuid-generator', 'hash-generator', 'regex-tester', 'yaml-json', 'code-formatter'];

async function parseTypeScript(relativePath) {
  const text = await readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');
  return ts.createSourceFile(relativePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function variableObject(source, variableName) {
  let initializer;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === variableName) initializer = node.initializer;
    if (!initializer) ts.forEachChild(node, visit);
  };
  visit(source);
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) throw new Error(`${variableName} must be an object literal`);
  return initializer;
}

function properties(node, label) {
  if (!ts.isObjectLiteralExpression(node)) throw new Error(`${label} must be an object literal`);
  return new Map(node.properties.filter(ts.isPropertyAssignment).map((property) => {
    const name = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) ? property.name.text : '';
    return [name, property.initializer];
  }));
}

function assertSameKeys(actual, expected, label) {
  const missing = expected.filter((key) => !actual.has(key));
  const extra = [...actual.keys()].filter((key) => !expected.includes(key));
  if (missing.length || extra.length) throw new Error(`${label} key mismatch; missing=${missing.join(',')} extra=${extra.join(',')}`);
}

function collectStrings(node, result = []) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) result.push(node.text);
  else ts.forEachChild(node, (child) => collectStrings(child, result));
  return result;
}

function assertPlaceholderParity(byLocale, label) {
  const tokenSets = locales.map((locale) => new Set(collectStrings(byLocale.get(locale)).flatMap((value) => [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map((match) => match[1]))));
  const expected = [...tokenSets[0]].sort().join(',');
  for (let index = 1; index < tokenSets.length; index += 1) {
    if ([...tokenSets[index]].sort().join(',') !== expected) throw new Error(`${label} interpolation variables differ for ${locales[index]}`);
  }
}

const shellSource = await parseTypeScript('src/i18n/shell.ts');
const shellMessages = properties(variableObject(shellSource, 'shellMessages'), 'shellMessages');
assertSameKeys(shellMessages, locales, 'shell locale');
const shellByLocale = new Map(locales.map((locale) => [locale, shellMessages.get(locale)]));
const shellKeys = [...properties(shellByLocale.get('ko'), 'ko shell messages').keys()];
for (const locale of locales) assertSameKeys(properties(shellByLocale.get(locale), `${locale} shell messages`), shellKeys, `${locale} shell message`);
assertPlaceholderParity(shellByLocale, 'shell messages');

const contentSource = await parseTypeScript('src/i18n/content.ts');
const contentLabels = properties(variableObject(contentSource, 'contentLabels'), 'contentLabels');
assertSameKeys(contentLabels, locales, 'content label locale');
const labelsByLocale = new Map(locales.map((locale) => [locale, contentLabels.get(locale)]));
const labelKeys = [...properties(labelsByLocale.get('ko'), 'ko content labels').keys()];
for (const locale of locales) assertSameKeys(properties(labelsByLocale.get(locale), `${locale} content labels`), labelKeys, `${locale} content label`);
assertPlaceholderParity(labelsByLocale, 'content labels');

const workbenchSource = await parseTypeScript('src/i18n/workbench.ts');
const workbenchMessages = properties(variableObject(workbenchSource, 'workbenchMessages'), 'workbenchMessages');
assertSameKeys(workbenchMessages, locales, 'workbench locale');
const workbenchByLocale = new Map(locales.map((locale) => [locale, workbenchMessages.get(locale)]));
const workbenchKeys = [...properties(workbenchByLocale.get('ko'), 'ko workbench messages').keys()];
for (const locale of locales) assertSameKeys(properties(workbenchByLocale.get(locale), `${locale} workbench messages`), workbenchKeys, `${locale} workbench message`);
assertPlaceholderParity(workbenchByLocale, 'workbench messages');

const codeFormatterSource = await parseTypeScript('src/i18n/code-formatter.ts');
const codeFormatterMessages = properties(variableObject(codeFormatterSource, 'codeFormatterMessages'), 'codeFormatterMessages');
assertSameKeys(codeFormatterMessages, locales, 'code formatter locale');
const codeFormatterByLocale = new Map(locales.map((locale) => [locale, codeFormatterMessages.get(locale)]));
const codeFormatterKeys = [...properties(codeFormatterByLocale.get('ko'), 'ko code formatter messages').keys()];
for (const locale of locales) assertSameKeys(properties(codeFormatterByLocale.get(locale), `${locale} code formatter messages`), codeFormatterKeys, `${locale} code formatter message`);
assertPlaceholderParity(codeFormatterByLocale, 'code formatter messages');

const dataSource = await parseTypeScript('src/data/tool-content.ts');
const toolContent = properties(variableObject(dataSource, 'toolContent'), 'toolContent');
const toolExamples = properties(variableObject(dataSource, 'toolExamples'), 'toolExamples');
assertSameKeys(toolContent, locales, 'tool content locale');
assertSameKeys(toolExamples, expectedTools, 'tool example');
const toolContentByLocale = new Map(locales.map((locale) => [locale, toolContent.get(locale)]));
for (const locale of locales) {
  const localeTools = properties(toolContentByLocale.get(locale), `${locale} tool content`);
  assertSameKeys(localeTools, expectedTools, `${locale} tool content`);
  for (const [slug, initializer] of localeTools) {
    const fields = properties(initializer, `${locale}/${slug}`);
    const description = fields.get('description');
    if (!description || !ts.isStringLiteral(description) || !description.text.trim()) throw new Error(`${locale}/${slug} has no localized description`);
    const steps = fields.get('steps');
    const faqs = fields.get('faqs');
    if (!steps || !ts.isArrayLiteralExpression(steps) || steps.elements.length < 3 || steps.elements.length > 5) throw new Error(`${locale}/${slug} must have 3 to 5 usage steps`);
    if (!faqs || !ts.isArrayLiteralExpression(faqs) || faqs.elements.length < 3) throw new Error(`${locale}/${slug} must have at least three FAQs`);
    const questions = faqs.elements.map((faq) => properties(faq, `${locale}/${slug} FAQ`).get('question'));
    if (questions.some((question) => !question || !ts.isStringLiteral(question)) || new Set(questions.map((question) => question.text)).size !== questions.length) {
      throw new Error(`${locale}/${slug} has missing or duplicate FAQ questions`);
    }
  }
  assertPlaceholderParity(new Map(locales.map((candidate) => [candidate, toolContentByLocale.get(candidate)])), 'tool content');
}
for (const [slug, initializer] of toolExamples) {
  if (!ts.isArrayLiteralExpression(initializer) || initializer.elements.length < 2) throw new Error(`${slug} must have at least two examples`);
  for (const example of initializer.elements) {
    const fields = properties(example, `${slug} example`);
    for (const field of ['input', 'output']) {
      const value = fields.get(field);
      if (!value || !ts.isStringLiteral(value) || !value.text.trim()) throw new Error(`${slug} example is missing ${field}`);
    }
  }
}

console.log(`i18n verified (${locales.length} locales, ${labelKeys.length} shared content labels, ${workbenchKeys.length} workbench labels, ${expectedTools.length} tools, ${expectedTools.length * locales.length} localized tool entries, 2 examples and 3 FAQs per localized tool).`);
