import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const locales = ['ko', 'en', 'ja', 'zh'];
const baseTools = ['json-formatter', 'sql-formatter', 'jwt-decoder', 'cron-generator', 'text-diff', 'base64', 'url-encoder', 'unix-timestamp', 'uuid-generator', 'hash-generator', 'regex-tester', 'yaml-json', 'code-formatter', 'json-pointer', 'csv-json', 'url-inspector', 'html-entities'];
const expandedTools = ['json-schema-validator', 'openapi-explorer', 'curl-fetch-converter', 'http-header-inspector', 'env-diff', 'gitignore-tester', 'har-scrubber', 'markdown-link-checker'];
const expectedTools = [...baseTools, ...expandedTools];
const expectedToolReferences = {
  'json-pointer': 'https://www.rfc-editor.org/rfc/rfc6901.html',
  'csv-json': 'https://www.rfc-editor.org/rfc/rfc4180.html',
  'url-inspector': 'https://url.spec.whatwg.org/',
  'html-entities': 'https://html.spec.whatwg.org/multipage/syntax.html#character-references',
  'json-schema-validator': 'https://json-schema.org/draft/2020-12',
  'openapi-explorer': 'https://spec.openapis.org/oas/v3.2',
  'curl-fetch-converter': 'https://curl.se/docs/manpage.html',
  'http-header-inspector': 'https://www.rfc-editor.org/rfc/rfc9110.html',
  'env-diff': 'https://nodejs.org/api/cli.html#env-files',
  'gitignore-tester': 'https://git-scm.com/docs/gitignore',
  'har-scrubber': 'https://github.com/ahmadnassri/har-spec/blob/master/versions/1.2.md',
  'markdown-link-checker': 'https://spec.commonmark.org/0.31.2/',
};

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

function variableInitializer(source, variableName) {
  let initializer;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === variableName) initializer = node.initializer;
    if (!initializer) ts.forEachChild(node, visit);
  };
  visit(source);
  if (!initializer) throw new Error(`${variableName} has no initializer`);
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

const workflowUiSource = await parseTypeScript('src/i18n/workflows.ts');
const workflowUi = properties(variableObject(workflowUiSource, 'workflowUiMessages'), 'workflowUiMessages');
assertSameKeys(workflowUi, locales, 'workflow UI locale');
const workflowUiByLocale = new Map(locales.map((locale) => [locale, workflowUi.get(locale)]));
const workflowUiKeys = [...properties(workflowUiByLocale.get('ko'), 'ko workflow UI messages').keys()];
for (const locale of locales) assertSameKeys(properties(workflowUiByLocale.get(locale), `${locale} workflow UI messages`), workflowUiKeys, `${locale} workflow UI message`);
assertPlaceholderParity(workflowUiByLocale, 'workflow UI messages');

const codeFormatterSource = await parseTypeScript('src/i18n/code-formatter.ts');
const codeFormatterMessages = properties(variableObject(codeFormatterSource, 'codeFormatterMessages'), 'codeFormatterMessages');
assertSameKeys(codeFormatterMessages, locales, 'code formatter locale');
const codeFormatterByLocale = new Map(locales.map((locale) => [locale, codeFormatterMessages.get(locale)]));
const codeFormatterKeys = [...properties(codeFormatterByLocale.get('ko'), 'ko code formatter messages').keys()];
for (const locale of locales) assertSameKeys(properties(codeFormatterByLocale.get(locale), `${locale} code formatter messages`), codeFormatterKeys, `${locale} code formatter message`);
assertPlaceholderParity(codeFormatterByLocale, 'code formatter messages');

const baseContentSource = await parseTypeScript('src/data/tool-content.ts');
const baseContent = properties(variableObject(baseContentSource, 'baseToolContent'), 'baseToolContent');
const baseExamples = properties(variableObject(baseContentSource, 'baseToolExamples'), 'baseToolExamples');
const expandedContentSource = await parseTypeScript('src/data/expanded-tool-content.ts');
const expandedContent = properties(variableObject(expandedContentSource, 'expandedToolContent'), 'expandedToolContent');
const expandedExamples = properties(variableObject(expandedContentSource, 'expandedToolExamples'), 'expandedToolExamples');
assertSameKeys(baseContent, locales, 'base tool content locale');
assertSameKeys(expandedContent, locales, 'expanded tool content locale');
assertSameKeys(baseExamples, baseTools, 'base tool example');
assertSameKeys(expandedExamples, expandedTools, 'expanded tool example');

for (const [label, content, expectedSlugs] of [['base', baseContent, baseTools], ['expanded', expandedContent, expandedTools]]) {
  const byLocale = new Map(locales.map((locale) => [locale, content.get(locale)]));
  for (const locale of locales) {
    const localeTools = properties(byLocale.get(locale), `${locale} ${label} tool content`);
    assertSameKeys(localeTools, expectedSlugs, `${locale} ${label} tool content`);
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
    if (expectedToolReferences[slug]) {
      const references = fields.get('references');
      if (!references || !ts.isArrayLiteralExpression(references) || references.elements.length < 1) throw new Error(`${locale}/${slug} needs a linked source reference`);
      let hasExpectedReference = false;
      for (const reference of references.elements) {
        const referenceFields = properties(reference, `${locale}/${slug} reference`);
        const label = referenceFields.get('label');
        const href = referenceFields.get('href');
        if (!label || !ts.isStringLiteral(label) || !label.text.trim()) throw new Error(`${locale}/${slug} reference needs a label`);
        if (!href || !ts.isStringLiteral(href) || !href.text.startsWith('https://')) throw new Error(`${locale}/${slug} reference must use HTTPS`);
        if (href.text === expectedToolReferences[slug]) hasExpectedReference = true;
      }
      if (!hasExpectedReference) throw new Error(`${locale}/${slug} must link to its expected primary source`);
    }
    }
    assertPlaceholderParity(byLocale, `${label} tool content`);
  }
}

for (const [slug, initializer] of [...baseExamples, ...expandedExamples]) {
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

const workflowSource = await parseTypeScript('src/data/workflow-guides.ts');
const workflowGuides = properties(variableObject(workflowSource, 'workflowGuides'), 'workflowGuides');
const expectedWorkflowGuides = ['api-response-debugging', 'cron-timezone-check', 'yaml-type-migration'];
const workflowHandoffTools = {
  'api-response-debugging': 'json-formatter',
  'cron-timezone-check': 'cron-generator',
  'yaml-type-migration': 'yaml-json',
};
const workflowHandoffsByLocale = new Map();
assertSameKeys(workflowGuides, locales, 'workflow guide locale');
for (const locale of locales) {
  const localeGuides = properties(workflowGuides.get(locale), `${locale} workflow guides`);
  assertSameKeys(localeGuides, expectedWorkflowGuides, `${locale} workflow guide`);
  const localeHandoffs = new Map();
  for (const [slug, initializer] of localeGuides) {
    const fields = properties(initializer, `${locale}/${slug}`);
    for (const field of ['title', 'summary', 'introduction', 'privacyTitle', 'privacyNote', 'scenarioTitle', 'scenarioNote', 'expectedLabel', 'receivedLabel', 'expectedPayload', 'receivedPayload', 'stepsTitle', 'checklistTitle', 'referencesTitle', 'useExampleLabel']) {
      const value = fields.get(field);
      if (!value || !ts.isStringLiteral(value) || !value.text.trim()) throw new Error(`${locale}/${slug} has no ${field}`);
    }
    const steps = fields.get('steps');
    if (!steps || !ts.isArrayLiteralExpression(steps) || steps.elements.length !== 5) throw new Error(`${locale}/${slug} must have five workflow steps`);
    let exampleCount = 0;
    for (const step of steps.elements) {
      const stepFields = properties(step, `${locale}/${slug} workflow step`);
      for (const field of ['title', 'toolSlug', 'action', 'reading', 'boundary']) {
        const value = stepFields.get(field);
        if (!value || !ts.isStringLiteral(value) || !value.text.trim()) throw new Error(`${locale}/${slug} workflow step is missing ${field}`);
      }
      const toolSlug = stepFields.get('toolSlug');
      if (!expectedTools.includes(toolSlug.text)) throw new Error(`${locale}/${slug} workflow step references an unknown tool: ${toolSlug.text}`);
      if (stepFields.has('handoffInput')) {
        const handoffInput = stepFields.get('handoffInput');
        if (!handoffInput || !ts.isStringLiteral(handoffInput) || !handoffInput.text.trim()) throw new Error(`${locale}/${slug} workflow handoff input must be non-empty text`);
        if (toolSlug.text !== workflowHandoffTools[slug]) throw new Error(`${locale}/${slug} handoff input targets ${toolSlug.text}, expected ${workflowHandoffTools[slug]}`);
        if (localeHandoffs.has(slug)) throw new Error(`${locale}/${slug} must have only one sample handoff action`);
        localeHandoffs.set(slug, handoffInput.text);
      }
      const example = stepFields.get('example');
      if (example) {
        exampleCount += 1;
        const exampleFields = properties(example, `${locale}/${slug} workflow example`);
        for (const field of ['inputLabel', 'outputLabel', 'input', 'output']) {
          const value = exampleFields.get(field);
          if (!value || !ts.isStringLiteral(value) || !value.text.trim()) throw new Error(`${locale}/${slug} workflow example is missing ${field}`);
        }
      }
    }
    if (!localeHandoffs.has(slug)) throw new Error(`${locale}/${slug} needs one sample handoff action`);
    if (exampleCount < 1) throw new Error(`${locale}/${slug} needs at least one inline workflow example`);
    const checklist = fields.get('checklist');
    if (!checklist || !ts.isArrayLiteralExpression(checklist) || checklist.elements.length < 5) throw new Error(`${locale}/${slug} needs at least five target-environment checks`);
    if (checklist.elements.some((item) => !ts.isStringLiteral(item) || !item.text.trim())) throw new Error(`${locale}/${slug} has an empty checklist item`);
    const references = fields.get('references');
    if (!references || !ts.isArrayLiteralExpression(references) || references.elements.length < 3) throw new Error(`${locale}/${slug} needs at least three references`);
    for (const reference of references.elements) {
      const referenceFields = properties(reference, `${locale}/${slug} reference`);
      for (const field of ['label', 'href']) {
        const value = referenceFields.get(field);
        if (!value || !ts.isStringLiteral(value) || !value.text.trim()) throw new Error(`${locale}/${slug} reference is missing ${field}`);
      }
      if (!referenceFields.get('href').text.startsWith('https://')) throw new Error(`${locale}/${slug} reference must use HTTPS`);
    }
  }
  workflowHandoffsByLocale.set(locale, localeHandoffs);
}

for (const slug of expectedWorkflowGuides) {
  const expectedInput = workflowHandoffsByLocale.get(locales[0]).get(slug);
  for (const locale of locales.slice(1)) {
    if (workflowHandoffsByLocale.get(locale).get(slug) !== expectedInput) throw new Error(`${slug} sample handoff input differs for ${locale}`);
  }
}

console.log(`Workflow content verified (${locales.length} locales, ${expectedWorkflowGuides.length} original workflow guides, five steps, localized sample actions, five checks, inline examples, and standards references per locale).`);

const recipeGuideSource = await parseTypeScript('src/data/workflow-recipe-guides.ts');
const expectedRecipeGuides = ['api-contract-triage', 'release-config-preflight', 'har-issue-prep'];
const recipeGuideSlugsNode = variableInitializer(recipeGuideSource, 'workflowRecipeGuideSlugs');
if (!ts.isArrayLiteralExpression(recipeGuideSlugsNode) || recipeGuideSlugsNode.elements.map((item) => item.text).join(',') !== expectedRecipeGuides.join(',')) {
  throw new Error('Workflow recipe guide slugs do not match the three starter recipes');
}
const recipeGuides = properties(variableObject(recipeGuideSource, 'workflowRecipeGuides'), 'workflowRecipeGuides');
assertSameKeys(recipeGuides, locales, 'workflow recipe guide locale');
const requiredRecipeGuideFields = ['title', 'summary', 'introduction', 'privacyTitle', 'privacyNote', 'scenarioTitle', 'scenarioNote', 'expectedLabel', 'receivedLabel', 'expectedPayload', 'receivedPayload', 'stepsTitle', 'checklistTitle', 'referencesTitle'];
for (const locale of locales) {
  const localeGuides = properties(recipeGuides.get(locale), `${locale} workflow recipe guides`);
  assertSameKeys(localeGuides, expectedRecipeGuides, `${locale} workflow recipe guide`);
  for (const [slug, initializer] of localeGuides) {
    const fields = properties(initializer, `${locale}/${slug} recipe guide`);
    for (const field of requiredRecipeGuideFields) {
      const value = fields.get(field);
      if (!value || !ts.isStringLiteral(value) || !value.text.trim()) throw new Error(`${locale}/${slug} has no ${field}`);
    }
    const steps = fields.get('steps');
    if (!steps || !ts.isArrayLiteralExpression(steps) || steps.elements.length !== 5) throw new Error(`${locale}/${slug} must have five recipe guide steps`);
    for (const step of steps.elements) {
      const stepFields = properties(step, `${locale}/${slug} recipe guide step`);
      for (const field of ['title', 'toolSlug', 'action', 'reading', 'boundary']) {
        const value = stepFields.get(field);
        if (!value || !ts.isStringLiteral(value) || !value.text.trim()) throw new Error(`${locale}/${slug} step is missing ${field}`);
      }
      if (!expectedTools.includes(stepFields.get('toolSlug').text)) throw new Error(`${locale}/${slug} references an unknown tool`);
    }
    const checklist = fields.get('checklist');
    if (!checklist || !ts.isArrayLiteralExpression(checklist) || checklist.elements.length < 5 || checklist.elements.some((item) => !ts.isStringLiteral(item) || !item.text.trim())) {
      throw new Error(`${locale}/${slug} needs five non-empty checklist items`);
    }
    const references = fields.get('references');
    if (!references || !ts.isArrayLiteralExpression(references) || references.elements.length < 3) throw new Error(`${locale}/${slug} needs three linked references`);
    for (const reference of references.elements) {
      const referenceFields = properties(reference, `${locale}/${slug} recipe reference`);
      if (!ts.isStringLiteral(referenceFields.get('label')) || !referenceFields.get('label').text.trim() || !ts.isStringLiteral(referenceFields.get('href')) || !referenceFields.get('href').text.startsWith('https://')) {
        throw new Error(`${locale}/${slug} has an invalid reference`);
      }
    }
  }
}
console.log(`Recipe guide content verified (${locales.length} locales, ${expectedRecipeGuides.length} guides, five steps, five checks, and three references each).`);

const recipeSource = await parseTypeScript('src/data/workflow-recipes.ts');
const recipesNode = variableInitializer(recipeSource, 'workflowRecipes');
if (!ts.isArrayLiteralExpression(recipesNode) || recipesNode.elements.length !== expectedRecipeGuides.length) throw new Error('Expected exactly three starter workflow recipes');
for (const recipe of recipesNode.elements) {
  const fields = properties(recipe, 'workflow recipe');
  assertSameKeys(fields, ['id', 'title', 'description', 'nodes', 'edges'], 'workflow recipe field');
  const nodes = fields.get('nodes');
  const edges = fields.get('edges');
  if (!nodes || !ts.isArrayLiteralExpression(nodes) || !nodes.elements.length || !edges || !ts.isArrayLiteralExpression(edges)) throw new Error('Workflow recipe needs nodes and edges arrays');
  for (const node of nodes.elements) assertSameKeys(properties(node, 'workflow recipe node'), ['id', 'adapterId'], 'workflow recipe node field');
  for (const edge of edges.elements) assertSameKeys(properties(edge, 'workflow recipe edge'), ['fromNodeId', 'fromPortId', 'toNodeId', 'toPortId'], 'workflow recipe edge field');
}
console.log('Workflow recipes verified (three structures contain only localized title/description, nodes, and typed edges).');
