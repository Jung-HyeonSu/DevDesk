import { describe, expect, it } from 'vitest';
import {
  checkMarkdownLinks,
  compareEnvKeys,
  convertCurlToFetch,
  convertFetchToCurl,
  ExpandedToolError,
  inspectHttpHeaders,
  inspectOpenApi,
  runExpandedTool,
  scrubHar,
  testGitignore,
  validateJsonSchema,
} from '@/lib/tools/expanded-tools';

describe('JSON Schema Draft 2020-12 validation', () => {
  const schema = JSON.stringify({ $schema: 'https://json-schema.org/draft/2020-12/schema', type: 'object', properties: { amount: { type: 'number' } }, required: ['amount'] });

  it('accepts a matching instance and reports a structured result', () => {
    const result = validateJsonSchema(schema, '{"amount": 12}');
    expect(JSON.parse(result.output)).toEqual({ valid: true, issues: [] });
  });

  it('returns paths and keywords for type and required errors', () => {
    const result = validateJsonSchema(schema, '{"amount":"12"}');
    const parsed = JSON.parse(result.output) as { valid: boolean; issues: Array<{ instancePath: string; keyword: string }> };
    expect(parsed.valid).toBe(false);
    expect(parsed.issues.map((issue) => [issue.instancePath, issue.keyword])).toContainEqual(['/amount', 'type']);
    const missing = JSON.parse(validateJsonSchema(schema, '{}').output) as { issues: Array<{ keyword: string }> };
    expect(missing.issues.map((issue) => issue.keyword)).toContain('required');
  });

  it('rejects other drafts, external references, and invalid schemas', () => {
    expect(() => validateJsonSchema('{"$schema":"http://json-schema.org/draft-07/schema#"}', '{}')).toThrowError(ExpandedToolError);
    expect(() => validateJsonSchema('{"$ref":"https://example.test/schema.json"}', '{}')).toThrowError(/External/);
    expect(() => validateJsonSchema('{', '{}')).toThrowError(ExpandedToolError);
  });
});

describe('OpenAPI explorer', () => {
  it('lists operations from a supported local document', () => {
    const result = inspectOpenApi('{"openapi":"3.2.1","info":{"title":"Demo","version":"1"},"paths":{"/items":{"get":{"operationId":"listItems","responses":{"200":{"description":"ok"}}}}}}');
    const document = JSON.parse(result.output) as { operations: Array<{ method: string; path: string }> };
    expect(document.operations).toEqual([expect.objectContaining({ method: 'GET', path: '/items' })]);
  });

  it('rejects unsupported versions and remote references', () => {
    expect(() => inspectOpenApi('{"openapi":"3.1.0","paths":{"/items":{"get":{}}}}')).toThrowError(/3.2/);
    expect(() => inspectOpenApi('{"openapi":"3.2.1","paths":{"/items":{"get":{"responses":{"200":{"$ref":"./responses.json"}}}}}}')).toThrowError(/External/);
  });
});

describe('cURL and Fetch conversion', () => {
  it('converts supported cURL options to a non-executed Fetch snippet', () => {
    const result = convertCurlToFetch("curl -X POST 'https://api.example.test/tasks' -H 'Content-Type: application/json' -d '{\"title\":\"Draft\"}'");
    expect(result.output).toContain('await fetch("https://api.example.test/tasks"');
    expect(result.output).toContain('"method": "POST"');
    expect(result.output).toContain('"body": "{\\"title\\":\\"Draft\\"}"');
  });

  it('converts supported static Fetch calls back to safely quoted cURL', () => {
    const result = convertFetchToCurl('const response = await fetch("https://api.example.test/tasks", {\n  "method": "POST",\n  "headers": { "Content-Type": "application/json" },\n  "body": "{\\"title\\":\\"Draft\\"}"\n});');
    expect(result.output).toBe("curl --request POST --header 'Content-Type: application/json' --data-raw '{\"title\":\"Draft\"}' 'https://api.example.test/tasks'");
    expect(runExpandedTool('curl-fetch-converter', { direction: 'fetch-to-curl', fetchSource: 'fetch("https://api.example.test/items")' }).output).toContain('--request GET');
  });

  it('rejects unsupported cURL flags, dynamic JavaScript, invalid URLs, and GET bodies', () => {
    expect(() => convertCurlToFetch('curl --insecure https://api.example.test')).toThrowError(/Unsupported/);
    expect(() => convertCurlToFetch("curl 'https://api.example.test")).toThrowError(/quote/);
    expect(() => convertCurlToFetch('curl file:///etc/passwd')).toThrowError(ExpandedToolError);
    expect(() => convertCurlToFetch('curl -X GET -d x https://api.example.test')).toThrowError(/cannot include/);
    expect(() => convertFetchToCurl('fetch(url, { method: "POST" })')).toThrowError(/JSON-compatible/);
    expect(() => convertFetchToCurl('fetch("/relative")')).toThrowError(ExpandedToolError);
    expect(() => convertFetchToCurl('fetch("https://api.example.test", { "mode": "cors" })')).toThrowError(/Unsupported Fetch option/);
    expect(() => convertFetchToCurl('fetch("https://api.example.test", { "method": "TRACE" })')).toThrowError(/Unsupported Fetch method/);
  });
});

describe('HTTP response header diagnostics', () => {
  it('returns structured findings for security and cache headers', () => {
    const result = inspectHttpHeaders('HTTP/1.1 200 OK\nContent-Type: application/json\nCache-Control: public\nSet-Cookie: id=demo');
    const report = JSON.parse(result.output) as { status: string; findings: string[] };
    expect(report.status).toBe('HTTP/1.1 200 OK');
    expect(report.findings.some((item) => item.includes('Set-Cookie'))).toBe(true);
    expect(report.findings.some((item) => item.includes('Content Security Policy'))).toBe(true);
  });

  it('rejects malformed header lines', () => {
    expect(() => inspectHttpHeaders('HTTP/1.1 200 OK\nMissingColon')).toThrowError(/colon/);
  });
});

describe('.env key comparison', () => {
  it('compares key presence and empty values without exposing values', () => {
    const result = compareEnvKeys('API_TOKEN=secret-a\nEMPTY=', 'API_TOKEN=secret-b\nNEW_KEY=secret-c');
    const report = JSON.parse(result.output) as { entries: Array<{ key: string; left: string; right: string }> };
    expect(result.output).not.toContain('secret');
    expect(report.entries).toContainEqual({ key: 'EMPTY', left: 'empty', right: 'missing' });
    expect(report.entries).toContainEqual({ key: 'NEW_KEY', left: 'missing', right: 'set' });
  });

  it('reports duplicate keys and malformed lines without values', () => {
    const result = compareEnvKeys('A=hidden\nA=hidden-again\nbad line', 'A=other');
    expect(result.output).not.toContain('hidden');
    expect(JSON.parse(result.output).warnings).toHaveLength(2);
  });
});

describe('.gitignore pattern testing', () => {
  it('honors exception patterns and rejects absolute or parent paths', () => {
    const result = testGitignore('*.env\n!.env.example', '.env\n.env.example\n../outside\n/etc/passwd');
    const rows = JSON.parse(result.output) as Array<{ path: string; result: string }>;
    expect(rows).toContainEqual({ path: '.env', result: 'ignored' });
    expect(rows).toContainEqual({ path: '.env.example', result: 'not ignored' });
    expect(rows.filter((row) => row.result === 'invalid path')).toHaveLength(2);
  });

  it('requires at least one pattern and one path', () => {
    expect(() => testGitignore('', 'README.md')).toThrowError(ExpandedToolError);
  });
});

describe('HAR 1.2 scrubber', () => {
  it('redacts request headers, cookies, query values, and sensitive body fields', () => {
    const har = { log: { version: '1.2', entries: [{ request: { url: 'https://example.test/?access_token=secret', headers: [{ name: 'Authorization', value: 'Bearer secret' }], cookies: [{ name: 'session', value: 'secret' }], postData: { text: '{"password":"secret"}' } }, response: { headers: [], cookies: [], content: { text: '{"email":"person@example.test"}' } } }] } };
    const result = scrubHar(JSON.stringify(har));
    expect(result.output).not.toContain('secret');
    expect(result.output).not.toContain('person@example.test');
    expect(result.warning).toMatch(/may miss/i);
  });

  it('rejects malformed HAR and unsupported versions', () => {
    expect(() => scrubHar('{')).toThrowError(ExpandedToolError);
    expect(() => scrubHar('{"log":{"version":"1.1","entries":[]}}')).toThrowError(/1.2/);
  });
});

describe('Markdown local link checker', () => {
  it('finds missing files, anchors, and reference definitions but ignores code fences', () => {
    const result = checkMarkdownLinks({
      'README.md': '# Guide\n\n[Good](./guide.md#install) [Bad](./missing.md) [Anchor](#missing) [Ref][oops]\n\n```md\n[not checked](./ghost.md)\n```',
      'guide.md': '# Guide\n\n## Install\n',
    });
    const issues = JSON.parse(result.output) as Array<{ problem: string }>;
    expect(issues).toHaveLength(3);
    expect(issues.map((issue) => issue.problem)).toContain('local file was not included in the selected files');
    expect(issues.map((issue) => issue.problem)).toContain('anchor does not match a heading or HTML id');
    expect(issues.map((issue) => issue.problem)).toContain('missing reference definition');
  });

  it('reports unselected local files and accepts valid anchors', () => {
    expect(JSON.parse(checkMarkdownLinks({ 'README.md': '# Home\n\n[Install](#install)\n\n## Install' }).output)).toEqual([]);
    expect(() => checkMarkdownLinks({})).toThrowError(ExpandedToolError);
  });
});
