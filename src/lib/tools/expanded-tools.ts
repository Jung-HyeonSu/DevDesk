import Ajv2020 from 'ajv/dist/2020.js';
import ignore from 'ignore';
import { parse as parseYaml } from 'yaml';

export type ExpandedToolSlug =
  | 'json-schema-validator'
  | 'openapi-explorer'
  | 'curl-fetch-converter'
  | 'http-header-inspector'
  | 'env-diff'
  | 'gitignore-tester'
  | 'har-scrubber'
  | 'markdown-link-checker';

export type ExpandedToolInput = Record<string, string>;

export type ExpandedToolResult = {
  output: string;
  summary: string;
  warning?: string;
};

export class ExpandedToolError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'ExpandedToolError';
  }
}

const MAX_SCHEMA_BYTES = 256 * 1024;
const MAX_TEXT_BYTES = 1024 * 1024;
const MAX_HAR_BYTES = 5 * 1024 * 1024;
const MAX_MARKDOWN_FILES = 20;

function assertSize(value: string, maxBytes: number, label: string) {
  if (new TextEncoder().encode(value).byteLength > maxBytes) {
    throw new ExpandedToolError('tooLarge', `${label} exceeds the supported size.`);
  }
}

function parseJsonOrYaml(value: string, label: string): unknown {
  assertSize(value, MAX_TEXT_BYTES, label);
  try {
    return JSON.parse(value) as unknown;
  } catch {
    try {
      return parseYaml(value, { maxAliasCount: 50 }) as unknown;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON or YAML.';
      throw new ExpandedToolError('invalidDocument', message);
    }
  }
}

function hasExternalRef(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasExternalRef);
  if (!value || typeof value !== 'object') return false;
  for (const [key, child] of Object.entries(value)) {
    if (key === '$ref' && typeof child === 'string' && !child.startsWith('#')) return true;
    if (hasExternalRef(child)) return true;
  }
  return false;
}

export function validateJsonSchema(schemaText: string, instanceText: string): ExpandedToolResult {
  assertSize(schemaText, MAX_SCHEMA_BYTES, 'Schema');
  assertSize(instanceText, MAX_SCHEMA_BYTES, 'JSON instance');
  const schema = parseJsonOrYaml(schemaText, 'Schema');
  const instance = parseJsonOrYaml(instanceText, 'JSON instance');
  if (schema === null || (typeof schema !== 'object' && typeof schema !== 'boolean')) {
    throw new ExpandedToolError('invalidSchema', 'A JSON Schema must be an object or boolean.');
  }
  if (typeof schema === 'object' && '$schema' in schema && schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
    throw new ExpandedToolError('unsupportedDraft', 'Select the JSON Schema Draft 2020-12 dialect.');
  }
  if (hasExternalRef(schema)) {
    throw new ExpandedToolError('externalRef', 'External $ref values are disabled. Use a reference inside this schema document.');
  }

  const validator = new Ajv2020({ allErrors: true, strict: false, validateFormats: false });
  let validate: ReturnType<typeof validator.compile>;
  try {
    validate = validator.compile(schema as object);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The schema could not be compiled.';
    throw new ExpandedToolError('invalidSchema', message);
  }
  const valid = validate(instance);
  if (valid) {
    return {
      summary: 'Valid',
      output: JSON.stringify({ valid: true, issues: [] }, null, 2),
      warning: 'format is treated as an annotation; format strings are not asserted.',
    };
  }
  const errors = (validate.errors ?? []).map((error) => ({
    instancePath: error.instancePath || '/',
    keyword: error.keyword,
    message: error.message ?? 'does not match the schema',
    schemaPath: error.schemaPath,
  }));
  return {
    summary: `${errors.length} validation issue${errors.length === 1 ? '' : 's'}`,
    output: JSON.stringify({ valid: false, issues: errors }, null, 2),
  };
}

type ApiOperation = {
  method: string;
  path: string;
  operationId: string;
  summary: string;
  parameters: string[];
  requestContentTypes: string[];
  responses: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function inspectOpenApi(documentText: string): ExpandedToolResult {
  const document = parseJsonOrYaml(documentText, 'OpenAPI document');
  if (!isRecord(document)) throw new ExpandedToolError('invalidOpenApi', 'The document root must be an object.');
  const version = typeof document.openapi === 'string' ? document.openapi : '';
  if (!/^3\.2(?:\.\d+)?$/.test(version)) {
    throw new ExpandedToolError('unsupportedVersion', `OpenAPI 3.2.x is supported; received ${version || 'no openapi version'}.`);
  }
  if (hasExternalRef(document)) {
    throw new ExpandedToolError('externalRef', 'External $ref values are listed but never fetched. Replace them with local references to inspect referenced schemas.');
  }
  const info = isRecord(document.info) ? document.info : {};
  const paths = isRecord(document.paths) ? document.paths : {};
  const operations: ApiOperation[] = [];
  const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']);
  for (const [path, pathItemValue] of Object.entries(paths)) {
    if (!isRecord(pathItemValue)) continue;
    for (const [method, operationValue] of Object.entries(pathItemValue)) {
      if (!methods.has(method.toLowerCase()) || !isRecord(operationValue)) continue;
      const parameters = Array.isArray(operationValue.parameters)
        ? operationValue.parameters.map((parameter) => isRecord(parameter) ? `${String(parameter.in ?? 'unknown')}: ${String(parameter.name ?? '(unnamed)')}` : 'unresolved parameter')
        : [];
      const requestBody = isRecord(operationValue.requestBody) ? operationValue.requestBody : {};
      const requestContent = isRecord(requestBody.content) ? Object.keys(requestBody.content) : [];
      const responseMap = isRecord(operationValue.responses) ? operationValue.responses : {};
      operations.push({
        method: method.toUpperCase(),
        path,
        operationId: typeof operationValue.operationId === 'string' ? operationValue.operationId : '',
        summary: typeof operationValue.summary === 'string' ? operationValue.summary : '',
        parameters,
        requestContentTypes: requestContent,
        responses: Object.keys(responseMap),
      });
    }
  }
  if (!operations.length) throw new ExpandedToolError('noOperations', 'No HTTP operations were found under paths.');
  const result = {
    version,
    title: typeof info.title === 'string' ? info.title : '(untitled API)',
    apiVersion: typeof info.version === 'string' ? info.version : '(no API version)',
    operationCount: operations.length,
    operations,
  };
  return { summary: `${operations.length} operation${operations.length === 1 ? '' : 's'} inspected`, output: JSON.stringify(result, null, 2) };
}

function shellWords(command: string): string[] {
  const words: string[] = [];
  let token = '';
  let quote: "'" | '"' | null = null;
  let escaping = false;
  let started = false;
  for (const character of command) {
    if (escaping) { token += character; escaping = false; started = true; continue; }
    if (character === '\\' && quote !== "'") { escaping = true; started = true; continue; }
    if (quote) {
      if (character === quote) quote = null;
      else token += character;
      started = true;
      continue;
    }
    if (character === "'" || character === '"') { quote = character; started = true; continue; }
    if (/\s/.test(character)) {
      if (started) { words.push(token); token = ''; started = false; }
      continue;
    }
    token += character;
    started = true;
  }
  if (escaping || quote) throw new ExpandedToolError('invalidCurl', 'The command has an unfinished quote or escape.');
  if (started) words.push(token);
  return words;
}

export function convertCurlToFetch(command: string): ExpandedToolResult {
  assertSize(command, 64 * 1024, 'Command');
  const words = shellWords(command.trim());
  if (words[0] !== 'curl') throw new ExpandedToolError('invalidCurl', 'Start with the curl command.');
  let method = '';
  let url = '';
  let hasData = false;
  let data = '';
  const headers: string[] = [];
  const valueOptions = new Set(['-X', '--request', '-H', '--header', '-d', '--data', '--data-raw', '--data-binary', '--url']);
  for (let index = 1; index < words.length; index += 1) {
    const word = words[index];
    if (valueOptions.has(word)) {
      const value = words[index + 1];
      if (value === undefined) throw new ExpandedToolError('invalidCurl', `${word} needs a value.`);
      if (word === '-X' || word === '--request') method = value.toUpperCase();
      else if (word === '-H' || word === '--header') headers.push(value);
      else if (word === '-d' || word === '--data' || word === '--data-raw' || word === '--data-binary') {
        hasData = true;
        data = data ? `${data}&${value}` : value;
      } else url = value;
      index += 1;
      continue;
    }
    if (word.startsWith('-')) throw new ExpandedToolError('unsupportedOption', `Unsupported curl option: ${word}`);
    if (url) throw new ExpandedToolError('invalidCurl', 'Only one request URL is supported.');
    url = word;
  }
  if (!url) throw new ExpandedToolError('missingUrl', 'Add a request URL.');
  if (!method) method = hasData ? 'POST' : 'GET';
  let safeUrl = url;
  let credentialsRedacted = false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Only HTTP and HTTPS are supported.');
    if (parsed.username || parsed.password) {
      parsed.username = '';
      parsed.password = '';
      safeUrl = parsed.toString();
      credentialsRedacted = true;
    }
  } catch {
    throw new ExpandedToolError('invalidUrl', 'Use a complete absolute HTTP or HTTPS URL.');
  }
  const headerPairs = headers.map((header) => {
    const separator = header.indexOf(':');
    if (separator <= 0) throw new ExpandedToolError('invalidHeader', `Invalid header: ${header}`);
    return [header.slice(0, separator).trim(), header.slice(separator + 1).trim()] as const;
  });
  if (headerPairs.some(([name]) => !/^[!#$%&'*+.^_`|~0-9a-z-]+$/i.test(name))) {
    throw new ExpandedToolError('invalidHeader', 'Header names must use valid HTTP token characters.');
  }
  const supportedMethods = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
  if (!supportedMethods.has(method)) throw new ExpandedToolError('unsupportedMethod', `Unsupported Fetch method: ${method}`);
  if ((method === 'GET' || method === 'HEAD') && hasData) {
    throw new ExpandedToolError('invalidCurl', `${method} requests cannot include a Fetch body.`);
  }
  const headerObject = Object.fromEntries(headerPairs);
  const options: Record<string, unknown> = { method, headers: headerObject };
  if (hasData) options.body = data;
  const output = `const response = await fetch(${JSON.stringify(safeUrl)}, ${JSON.stringify(options, null, 2)});\nconst body = await response.text();\nconsole.log(response.status, body);`;
  return {
    summary: `${method} request converted`,
    output,
    warning: credentialsRedacted ? 'URL user information was removed from the generated snippet.' : 'The generated fetch snippet is not executed. Review secrets and shell expansions before sharing it.',
  };
}

function safeUrl(value: unknown): { value: string; credentialsRemoved: boolean } {
  if (typeof value !== 'string') throw new ExpandedToolError('invalidFetch', 'The Fetch URL must be a quoted string literal.');
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Only HTTP and HTTPS are supported.');
    const credentialsRemoved = Boolean(parsed.username || parsed.password);
    if (credentialsRemoved) { parsed.username = ''; parsed.password = ''; }
    return { value: parsed.toString(), credentialsRemoved };
  } catch (error) {
    throw new ExpandedToolError('invalidUrl', error instanceof Error ? error.message : 'Use a complete absolute HTTP or HTTPS URL.');
  }
}

function fetchCallArguments(source: string): [string, string?] {
  const match = /\bfetch\s*\(/.exec(source);
  if (!match) throw new ExpandedToolError('invalidFetch', 'Include a static fetch("https://…", options) call.');
  const open = source.indexOf('(', match.index);
  let depth = 0;
  let quote: "'" | '"' | '`' | null = null;
  let escaping = false;
  let close = -1;
  for (let index = open; index < source.length; index += 1) {
    const character = source[index];
    if (escaping) { escaping = false; continue; }
    if (quote && character === '\\') { escaping = true; continue; }
    if (quote) { if (character === quote) quote = null; continue; }
    if (character === "'" || character === '"' || character === '`') { quote = character; continue; }
    if (character === '(') depth += 1;
    else if (character === ')') {
      depth -= 1;
      if (depth === 0) { close = index; break; }
    }
  }
  if (close < 0 || quote) throw new ExpandedToolError('invalidFetch', 'The Fetch call has an unfinished string or parenthesis.');
  const args = source.slice(open + 1, close);
  let nested = 0;
  quote = null;
  escaping = false;
  for (let index = 0; index < args.length; index += 1) {
    const character = args[index];
    if (escaping) { escaping = false; continue; }
    if (quote && character === '\\') { escaping = true; continue; }
    if (quote) { if (character === quote) quote = null; continue; }
    if (character === "'" || character === '"' || character === '`') { quote = character; continue; }
    if (character === '(' || character === '[' || character === '{') nested += 1;
    else if (character === ')' || character === ']' || character === '}') nested -= 1;
    else if (character === ',' && nested === 0) return [args.slice(0, index).trim(), args.slice(index + 1).trim()];
  }
  return [args.trim()];
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

export function convertFetchToCurl(source: string): ExpandedToolResult {
  assertSize(source, 64 * 1024, 'Fetch snippet');
  const [urlExpression, optionsExpression] = fetchCallArguments(source);
  let rawUrl: unknown;
  try { rawUrl = JSON.parse(urlExpression) as unknown; }
  catch { throw new ExpandedToolError('invalidFetch', 'The URL argument must be a JSON-compatible quoted string.'); }
  const url = safeUrl(rawUrl);
  let options: unknown = {};
  if (optionsExpression) {
    try { options = JSON.parse(optionsExpression) as unknown; }
    catch { throw new ExpandedToolError('invalidFetch', 'Options must be a JSON-compatible object literal; dynamic JavaScript is not evaluated.'); }
  }
  if (!isRecord(options)) throw new ExpandedToolError('invalidFetch', 'Fetch options must be an object literal.');
  const unsupported = Object.keys(options).filter((key) => !['method', 'headers', 'body'].includes(key));
  if (unsupported.length) throw new ExpandedToolError('unsupportedFetchOption', `Unsupported Fetch option: ${unsupported.join(', ')}`);
  const methodValue = options.method ?? 'GET';
  if (typeof methodValue !== 'string' || !/^[!#$%&'*+.^_`|~0-9a-z-]+$/i.test(methodValue)) throw new ExpandedToolError('invalidFetch', 'The HTTP method must be a valid token string.');
  const method = methodValue.toUpperCase();
  const supportedMethods = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
  if (!supportedMethods.has(method)) throw new ExpandedToolError('unsupportedFetchOption', `Unsupported Fetch method: ${method}`);
  const headers = options.headers ?? {};
  if (!isRecord(headers) || Object.values(headers).some((value) => typeof value !== 'string')) {
    throw new ExpandedToolError('invalidFetch', 'Headers must be a plain object with string values.');
  }
  for (const name of Object.keys(headers)) {
    if (!/^[!#$%&'*+.^_`|~0-9a-z-]+$/i.test(name)) throw new ExpandedToolError('invalidHeader', `Invalid HTTP header name: ${name}`);
  }
  if (options.body !== undefined && typeof options.body !== 'string') throw new ExpandedToolError('unsupportedFetchOption', 'Only a literal string body can be converted.');
  if ((method === 'GET' || method === 'HEAD') && options.body !== undefined) throw new ExpandedToolError('invalidFetch', `${method} requests cannot include a Fetch body.`);
  const parts = ['curl', '--request', method];
  for (const [name, value] of Object.entries(headers)) parts.push('--header', shellQuote(`${name}: ${value}`));
  if (typeof options.body === 'string') parts.push('--data-raw', shellQuote(options.body));
  parts.push(shellQuote(url.value));
  return {
    summary: `${method} Fetch request converted`,
    output: parts.join(' '),
    warning: `${url.credentialsRemoved ? 'URL user information was removed. ' : ''}Only literal URL, method, headers, and string body are converted. Dynamic JavaScript is not run; review credentials and body data before sharing.`,
  };
}

function parseHeaders(raw: string) {
  const values = new Map<string, string[]>();
  let statusLine = '';
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (!statusLine && /^HTTP\/\d(?:\.\d)?\s+\d{3}/i.test(line.trim())) { statusLine = line.trim(); continue; }
    const colon = line.indexOf(':');
    if (colon <= 0) throw new ExpandedToolError('invalidHeaders', `Header line needs a colon: ${line}`);
    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    values.set(name, [...(values.get(name) ?? []), value]);
  }
  return { statusLine, values };
}

export function inspectHttpHeaders(raw: string): ExpandedToolResult {
  assertSize(raw, 64 * 1024, 'Headers');
  if (!raw.trim()) throw new ExpandedToolError('emptyInput', 'Paste an HTTP status line and response headers.');
  const { statusLine, values } = parseHeaders(raw);
  const get = (name: string) => values.get(name)?.join(', ') ?? '';
  const findings: string[] = [];
  const origin = get('access-control-allow-origin');
  const credentials = get('access-control-allow-credentials').toLowerCase() === 'true';
  if (!origin) findings.push('CORS: Access-Control-Allow-Origin is absent; browser cross-origin reads may be blocked.');
  if (origin === '*' && credentials) findings.push('CORS: wildcard origin cannot be combined with credentialed browser access.');
  if (origin && origin !== '*' && !/\bvary\s*:\s*origin\b/i.test(get('vary'))) findings.push('CORS: Vary: Origin is not present; verify caches when the allowed origin is selected dynamically.');
  const cache = get('cache-control');
  if (!cache) findings.push('Caching: Cache-Control is absent; caching behavior may depend on other headers and intermediaries.');
  if (get('set-cookie') && /\bpublic\b/i.test(cache)) findings.push('Caching: public caching and Set-Cookie need a deliberate review.');
  const securityHeaders: Array<[string, string]> = [
    ['strict-transport-security', 'HSTS'], ['content-security-policy', 'Content Security Policy'],
    ['x-content-type-options', 'X-Content-Type-Options'], ['referrer-policy', 'Referrer-Policy'],
    ['permissions-policy', 'Permissions-Policy'],
  ];
  for (const [name, label] of securityHeaders) if (!get(name)) findings.push(`Security header: ${label} is absent.`);
  return {
    summary: statusLine || 'Response headers inspected',
    output: JSON.stringify({ status: statusLine || null, findings }, null, 2),
    warning: 'This is a heuristic review of pasted headers, not a security audit or a request to the server.',
  };
}

type EnvEntry = { key: string; line: number; valuePresent: boolean };

function parseEnv(input: string): { entries: EnvEntry[]; duplicates: string[]; invalidLines: number[] } {
  assertSize(input, 256 * 1024, '.env input');
  const entries: EnvEntry[] = [];
  const duplicates = new Set<string>();
  const seen = new Set<string>();
  const invalidLines: number[] = [];
  for (const [index, original] of input.split(/\r?\n/).entries()) {
    const line = original.trim();
    if (!line || line.startsWith('#')) continue;
    const candidate = line.startsWith('export ') ? line.slice(7).trimStart() : line;
    const equals = candidate.indexOf('=');
    if (equals < 1) { invalidLines.push(index + 1); continue; }
    const key = candidate.slice(0, equals).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) { invalidLines.push(index + 1); continue; }
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
    entries.push({ key, line: index + 1, valuePresent: candidate.slice(equals + 1).trim().length > 0 });
  }
  return { entries, duplicates: [...duplicates].sort(), invalidLines };
}

export function compareEnvKeys(left: string, right: string): ExpandedToolResult {
  const a = parseEnv(left);
  const b = parseEnv(right);
  const leftKeys = new Set(a.entries.map((entry) => entry.key));
  const rightKeys = new Set(b.entries.map((entry) => entry.key));
  const all = [...new Set([...leftKeys, ...rightKeys])].sort();
  const rows = all.map((key) => ({
    key,
    left: leftKeys.has(key) ? (a.entries.find((entry) => entry.key === key)?.valuePresent ? 'set' : 'empty') : 'missing',
    right: rightKeys.has(key) ? (b.entries.find((entry) => entry.key === key)?.valuePresent ? 'set' : 'empty') : 'missing',
  }));
  const warnings = [
    ...(a.duplicates.length ? [`Left duplicate keys: ${a.duplicates.join(', ')}`] : []),
    ...(b.duplicates.length ? [`Right duplicate keys: ${b.duplicates.join(', ')}`] : []),
    ...(a.invalidLines.length ? [`Left malformed lines: ${a.invalidLines.join(', ')}`] : []),
    ...(b.invalidLines.length ? [`Right malformed lines: ${b.invalidLines.join(', ')}`] : []),
  ];
  return {
    summary: `${all.length} key${all.length === 1 ? '' : 's'} compared`,
    output: JSON.stringify({ entries: rows, warnings }, null, 2),
    warning: 'Values are never included in the report; only key presence and whether a value is empty are compared.',
  };
}

export function testGitignore(patternText: string, pathsText: string): ExpandedToolResult {
  assertSize(patternText, 128 * 1024, '.gitignore patterns');
  assertSize(pathsText, 128 * 1024, 'Paths');
  const patterns = patternText.split(/\r?\n/).filter((line) => line.length > 0);
  const paths = pathsText.split(/\r?\n/).map((path) => path.trim()).filter(Boolean);
  if (!patterns.length || !paths.length) throw new ExpandedToolError('emptyInput', 'Enter at least one pattern and one repository-relative path.');
  const matcher = ignore({ allowRelativePaths: true }).add(patterns);
  const rows = paths.map((path) => {
    if (path.startsWith('/') || path.split('/').includes('..')) return { path, result: 'invalid path' };
    try { return { path, result: matcher.ignores(path) ? 'ignored' : 'not ignored' }; }
    catch { return { path, result: 'invalid path' }; }
  });
  return {
    summary: `${rows.filter((row) => row.result === 'ignored').length} of ${rows.length} path(s) ignored`,
    output: JSON.stringify(rows, null, 2),
    warning: 'Tests only these root-level patterns and untracked paths. Nested .gitignore files, global excludes, and already tracked files are not included.',
  };
}

const sensitiveName = /(?:authorization|proxy-authorization|cookie|set-cookie|api[-_]?key|access[-_]?token|refresh[-_]?token|password|passwd|secret|session|csrf|xsrf|email)/i;

function redactUrl(raw: unknown): { value: unknown; count: number } {
  if (typeof raw !== 'string') return { value: raw, count: 0 };
  try {
    const url = new URL(raw);
    let count = 0;
    if (url.username || url.password) { url.username = '[REDACTED]'; url.password = '[REDACTED]'; count += 1; }
    for (const key of new Set([...url.searchParams.keys()])) {
      if (sensitiveName.test(key)) { url.searchParams.set(key, '[REDACTED]'); count += 1; }
    }
    return { value: url.toString(), count };
  } catch {
    return { value: raw.replace(/([?&][^=&#]*(?:token|secret|password|key|auth|email)[^=&#]*=)[^&#]*/gi, '$1[REDACTED]'), count: 1 };
  }
}

function redactObject(value: unknown, path = ''): { value: unknown; count: number } {
  if (Array.isArray(value)) {
    let count = 0;
    const items = value.map((item, index) => { const result = redactObject(item, `${path}/${index}`); count += result.count; return result.value; });
    return { value: items, count };
  }
  if (!isRecord(value)) return { value, count: 0 };
  let count = 0;
  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (sensitiveName.test(key)) { result[key] = '[REDACTED]'; count += 1; continue; }
    const redacted = redactObject(child, `${path}/${key}`);
    result[key] = redacted.value;
    count += redacted.count;
  }
  return { value: result, count };
}

function redactHeaders(value: unknown): { value: unknown; count: number } {
  if (!Array.isArray(value)) return { value, count: 0 };
  let count = 0;
  const headers = value.map((header) => {
    if (!isRecord(header) || typeof header.name !== 'string' || !sensitiveName.test(header.name)) return header;
    count += 1;
    return { ...header, value: '[REDACTED]' };
  });
  return { value: headers, count };
}

function redactBodyText(value: unknown): { value: unknown; count: number } {
  if (typeof value !== 'string' || !value) return { value, count: 0 };
  try {
    const parsed = JSON.parse(value) as unknown;
    const redacted = redactObject(parsed);
    return { value: JSON.stringify(redacted.value), count: redacted.count };
  } catch {
    return { value: '[REDACTED: non-JSON body]', count: 1 };
  }
}

export function scrubHar(harText: string): ExpandedToolResult {
  assertSize(harText, MAX_HAR_BYTES, 'HAR file');
  let har: unknown;
  try { har = JSON.parse(harText) as unknown; }
  catch { throw new ExpandedToolError('invalidHar', 'The HAR input must be valid JSON.'); }
  if (!isRecord(har) || !isRecord(har.log) || !Array.isArray(har.log.entries)) {
    throw new ExpandedToolError('invalidHar', 'Expected a HAR 1.2 document with log.entries.');
  }
  if (har.log.version !== '1.2') throw new ExpandedToolError('unsupportedHarVersion', 'Only HAR 1.2 is supported.');
  let count = 0;
  for (const entry of har.log.entries) {
    if (!isRecord(entry)) continue;
    for (const sectionName of ['request', 'response']) {
      const section = entry[sectionName];
      if (!isRecord(section)) continue;
      const headers = redactHeaders(section.headers); section.headers = headers.value; count += headers.count;
      const cookies = redactHeaders(section.cookies); section.cookies = cookies.value; count += cookies.count;
      if (sectionName === 'request') {
        const url = redactUrl(section.url); section.url = url.value; count += url.count;
        const postData = section.postData;
        if (isRecord(postData)) {
          const params = redactHeaders(postData.params); postData.params = params.value; count += params.count;
          const text = redactBodyText(postData.text); postData.text = text.value; count += text.count;
        }
      } else if (isRecord(section.content)) {
        const text = redactBodyText(section.content.text); section.content.text = text.value; count += text.count;
      }
    }
  }
  const redacted = redactObject(har);
  count += redacted.count;
  return {
    summary: `${count} sensitive field(s) redacted`,
    output: JSON.stringify(redacted.value, null, 2),
    warning: 'Review the exported file manually. This heuristic may miss secrets in custom fields, free text, or encoded payloads.',
  };
}

function stripCodeBlocks(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '');
}

function slugHeading(heading: string): string {
  const normalized = heading.replace(/`([^`]*)`/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim().toLocaleLowerCase();
  return normalized.replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

function anchorsFor(markdown: string): Set<string> {
  const anchors = new Set<string>();
  const counts = new Map<string, number>();
  const lines = stripCodeBlocks(markdown).split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    let heading = lines[index].match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/)?.[1];
    if (!heading && index + 1 < lines.length && /^\s{0,3}(?:=+|-+)\s*$/.test(lines[index + 1])) heading = lines[index].trim();
    if (!heading) continue;
    const base = slugHeading(heading);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    anchors.add(count ? `${base}-${count}` : base);
  }
  for (const match of stripCodeBlocks(markdown).matchAll(/<a\s+[^>]*id=["']([^"']+)["'][^>]*>/gi)) anchors.add(match[1]);
  return anchors;
}

function normalizeLocalPath(path: string, fromFile: string): string {
  const segments = path.startsWith('/') ? [] : fromFile.split('/').slice(0, -1);
  for (const segment of path.replace(/^\//, '').split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') segments.pop(); else segments.push(segment);
  }
  return segments.join('/');
}

export function checkMarkdownLinks(files: Record<string, string>): ExpandedToolResult {
  const names = Object.keys(files);
  if (!names.length) throw new ExpandedToolError('emptyInput', 'Paste or choose at least one Markdown file.');
  if (names.length > MAX_MARKDOWN_FILES) throw new ExpandedToolError('tooManyFiles', `Choose no more than ${MAX_MARKDOWN_FILES} Markdown files.`);
  for (const [name, text] of Object.entries(files)) assertSize(text, MAX_TEXT_BYTES, name);
  const normalizedFiles = new Map(names.map((name) => [name.replace(/^\.\//, ''), name]));
  const anchorMap = new Map(names.map((name) => [name.replace(/^\.\//, ''), anchorsFor(files[name])]));
  const issues: Array<{ file: string; line: number; link: string; problem: string }> = [];
  for (const [file, markdown] of Object.entries(files)) {
    const source = stripCodeBlocks(markdown);
    const definitions = new Set([...source.matchAll(/^\s{0,3}\[([^\]]+)\]:\s*\S+/gm)].map((match) => match[1].trim().toLowerCase()));
    const lines = source.split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      for (const match of line.matchAll(/!?\[[^\]]*\](?:\(([^)]+)\)|\[([^\]]*)\])/g)) {
        const destination = match[1]?.trim().replace(/^<|>$/g, '');
        const reference = match[2];
        if (reference !== undefined && reference !== '' && !definitions.has(reference.trim().toLowerCase())) {
          issues.push({ file, line: index + 1, link: `[${reference}]`, problem: 'missing reference definition' });
          continue;
        }
        if (!destination) continue;
        if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(destination)) continue;
        const [pathPart, anchorPart] = destination.split('#', 2);
        const target = normalizeLocalPath(pathPart, file);
        const targetFile = target ? (normalizedFiles.get(target) ?? normalizedFiles.get(`${target}.md`) ?? normalizedFiles.get(`${target}/index.md`)) : normalizedFiles.get(file);
        if (pathPart && !targetFile) {
          issues.push({ file, line: index + 1, link: destination, problem: 'local file was not included in the selected files' });
          continue;
        }
        if (anchorPart && targetFile && !anchorMap.get(targetFile)?.has(decodeURIComponent(anchorPart))) {
          issues.push({ file, line: index + 1, link: destination, problem: 'anchor does not match a heading or HTML id' });
        }
      }
    }
  }
  return {
    summary: issues.length ? `${issues.length} link issue(s) found` : `${names.length} file(s) checked; no local link issues found`,
    output: JSON.stringify(issues, null, 2),
    warning: 'External URLs are syntax-only and are not fetched. Include linked local Markdown files to verify their paths and anchors.',
  };
}

export function runExpandedTool(slug: ExpandedToolSlug, input: ExpandedToolInput): ExpandedToolResult {
  switch (slug) {
    case 'json-schema-validator': return validateJsonSchema(input.schema ?? '', input.instance ?? '');
    case 'openapi-explorer': return inspectOpenApi(input.document ?? '');
    case 'curl-fetch-converter': return input.direction === 'fetch-to-curl' ? convertFetchToCurl(input.fetchSource ?? '') : convertCurlToFetch(input.command ?? '');
    case 'http-header-inspector': return inspectHttpHeaders(input.headers ?? '');
    case 'env-diff': return compareEnvKeys(input.left ?? '', input.right ?? '');
    case 'gitignore-tester': return testGitignore(input.patterns ?? '', input.paths ?? '');
    case 'har-scrubber': return scrubHar(input.har ?? '');
    case 'markdown-link-checker': return checkMarkdownLinks(input.files ? JSON.parse(input.files) as Record<string, string> : {});
  }
}
