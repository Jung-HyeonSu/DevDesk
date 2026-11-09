import { toolBySlug, toolRegistry, type ToolSlug } from '@/data/tools';
import type { Locale } from '@/i18n/config';
import {
  ExpandedToolError,
  runExpandedTool,
  type ExpandedToolInput,
  type ExpandedToolResult,
  type ExpandedToolSlug,
} from './expanded-tools';

export type WorkflowValueType = 'json' | 'schema' | 'openapi' | 'curl' | 'headers' | 'env' | 'ignore' | 'paths' | 'har' | 'markdown' | 'files' | 'text';

export type WorkflowInputPort = {
  id: string;
  type: WorkflowValueType;
  label: Record<Locale, string>;
  required: boolean;
};

export type WorkflowAdapterId = ExpandedToolSlug | 'json-formatter';

export type WorkflowAdapter = {
  id: WorkflowAdapterId;
  toolSlug: ToolSlug;
  inputs: WorkflowInputPort[];
  outputType: WorkflowValueType;
  outputLabel: Record<Locale, string>;
  sampleInputs: Record<string, string>;
};

const labels = <T extends Record<Locale, string>>(value: T) => value;

const adapterDefinitions: Record<WorkflowAdapterId, Omit<WorkflowAdapter, 'toolSlug'>> = {
  'json-formatter': {
    id: 'json-formatter',
    inputs: [{ id: 'json', type: 'json', label: labels({ ko: 'JSON 입력', en: 'JSON input', ja: 'JSON 入力', zh: 'JSON 输入' }), required: true }],
    outputType: 'json',
    outputLabel: labels({ ko: '정리된 JSON', en: 'Formatted JSON', ja: '整形済み JSON', zh: '格式化后的 JSON' }),
    sampleInputs: { json: '{\n  "traceId": "trace-demo-208",\n  "ok": true\n}' },
  },
  'json-schema-validator': {
    id: 'json-schema-validator',
    inputs: [
      { id: 'schema', type: 'schema', label: labels({ ko: 'JSON Schema', en: 'JSON Schema', ja: 'JSON Schema', zh: 'JSON Schema' }), required: true },
      { id: 'instance', type: 'json', label: labels({ ko: '검사할 JSON', en: 'JSON instance', ja: '検証する JSON', zh: '待校验的 JSON' }), required: true },
    ],
    outputType: 'json',
    outputLabel: labels({ ko: '검사 결과 JSON', en: 'Validation result JSON', ja: '検証結果 JSON', zh: '校验结果 JSON' }),
    sampleInputs: {
      schema: '{\n  "$schema": "https://json-schema.org/draft/2020-12/schema",\n  "type": "object",\n  "properties": { "id": { "type": "string" }, "amount": { "type": "number" } },\n  "required": ["id", "amount"]\n}',
      instance: '{\n  "id": "invoice-demo-208",\n  "amount": 2300\n}',
    },
  },
  'openapi-explorer': {
    id: 'openapi-explorer',
    inputs: [{ id: 'document', type: 'openapi', label: labels({ ko: 'OpenAPI 문서', en: 'OpenAPI document', ja: 'OpenAPI ドキュメント', zh: 'OpenAPI 文档' }), required: true }],
    outputType: 'json',
    outputLabel: labels({ ko: '작업 목록 JSON', en: 'Operation list JSON', ja: '操作一覧 JSON', zh: '操作列表 JSON' }),
    sampleInputs: { document: '{\n  "openapi": "3.2.1",\n  "info": { "title": "Invoice API", "version": "1.0.0" },\n  "paths": { "/invoices/{id}": { "get": { "operationId": "getInvoice", "summary": "Read an invoice", "responses": { "200": { "description": "Found" } } } } }\n}' },
  },
  'curl-fetch-converter': {
    id: 'curl-fetch-converter',
    inputs: [{ id: 'command', type: 'curl', label: labels({ ko: 'cURL 명령', en: 'cURL command', ja: 'cURL コマンド', zh: 'cURL 命令' }), required: true }],
    outputType: 'text',
    outputLabel: labels({ ko: 'Fetch 코드', en: 'Fetch code', ja: 'Fetch コード', zh: 'Fetch 代码' }),
    sampleInputs: { command: "curl 'https://api.example.test/v1/invoices' -H 'Accept: application/json'" },
  },
  'http-header-inspector': {
    id: 'http-header-inspector',
    inputs: [{ id: 'headers', type: 'headers', label: labels({ ko: '응답 상태와 헤더', en: 'Response status and headers', ja: '応答ステータスとヘッダー', zh: '响应状态与标头' }), required: true }],
    outputType: 'json',
    outputLabel: labels({ ko: '헤더 진단 JSON', en: 'Header diagnostics JSON', ja: 'ヘッダー診断 JSON', zh: '标头诊断 JSON' }),
    sampleInputs: { headers: 'HTTP/1.1 200 OK\nContent-Type: application/json\nX-Content-Type-Options: nosniff\nStrict-Transport-Security: max-age=31536000; includeSubDomains' },
  },
  'env-diff': {
    id: 'env-diff',
    inputs: [
      { id: 'left', type: 'env', label: labels({ ko: '기준 .env', en: 'Baseline .env', ja: '基準 .env', zh: '基准 .env' }), required: true },
      { id: 'right', type: 'env', label: labels({ ko: '비교 .env', en: 'Comparison .env', ja: '比較 .env', zh: '对比 .env' }), required: true },
    ],
    outputType: 'json',
    outputLabel: labels({ ko: '키 차이 JSON', en: 'Key difference JSON', ja: 'キー差分 JSON', zh: '键差异 JSON' }),
    sampleInputs: { left: 'APP_MODE=production\nDATABASE_URL=example-redacted\nCACHE_TTL=', right: 'APP_MODE=production\nDATABASE_URL=example-redacted\nLOG_LEVEL=info' },
  },
  'gitignore-tester': {
    id: 'gitignore-tester',
    inputs: [
      { id: 'patterns', type: 'ignore', label: labels({ ko: '.gitignore 패턴', en: '.gitignore patterns', ja: '.gitignore パターン', zh: '.gitignore 模式' }), required: true },
      { id: 'paths', type: 'paths', label: labels({ ko: '검사할 상대 경로', en: 'Repository-relative paths', ja: '検査する相対パス', zh: '待检查的相对路径' }), required: true },
    ],
    outputType: 'json',
    outputLabel: labels({ ko: '경로 판정 JSON', en: 'Path results JSON', ja: 'パス判定 JSON', zh: '路径结果 JSON' }),
    sampleInputs: { patterns: '.env\nnode_modules/\n!important.env', paths: '.env\n!important.env\nsrc/app.ts\nnode_modules/pkg/index.js' },
  },
  'har-scrubber': {
    id: 'har-scrubber',
    inputs: [{ id: 'har', type: 'har', label: labels({ ko: 'HAR 1.2 로그', en: 'HAR 1.2 log', ja: 'HAR 1.2 ログ', zh: 'HAR 1.2 日志' }), required: true }],
    outputType: 'json',
    outputLabel: labels({ ko: '가림 처리된 HAR', en: 'Redacted HAR', ja: 'マスキング済み HAR', zh: '已遮盖的 HAR' }),
    sampleInputs: { har: '{\n  "log": { "version": "1.2", "creator": { "name": "DevDesk demo", "version": "1" }, "entries": [{ "request": { "method": "GET", "url": "https://example.test/api?token=demo-secret", "headers": [{ "name": "Authorization", "value": "Bearer demo-secret" }], "cookies": [], "queryString": [{ "name": "token", "value": "demo-secret" }] }, "response": { "status": 200, "headers": [], "cookies": [], "content": { "size": 2, "mimeType": "application/json", "text": "{}" } } }] }\n}' },
  },
  'markdown-link-checker': {
    id: 'markdown-link-checker',
    inputs: [
      { id: 'filename', type: 'text', label: labels({ ko: '현재 파일 경로', en: 'Current file path', ja: '現在のファイルパス', zh: '当前文件路径' }), required: true },
      { id: 'markdown', type: 'markdown', label: labels({ ko: 'Markdown 내용', en: 'Markdown content', ja: 'Markdown 内容', zh: 'Markdown 内容' }), required: true },
      { id: 'relatedFiles', type: 'files', label: labels({ ko: '연결된 파일 맵 JSON (선택)', en: 'Linked file map JSON (optional)', ja: 'リンク先ファイルマップ JSON（任意）', zh: '关联文件映射 JSON（可选）' }), required: false },
    ],
    outputType: 'json',
    outputLabel: labels({ ko: '링크 검사 JSON', en: 'Link check JSON', ja: 'リンク検査 JSON', zh: '链接检查 JSON' }),
    sampleInputs: { filename: 'README.md', markdown: '# API notes\n\nSee [the contract](./contract.md#responses) and [broken section](#missing-section).', relatedFiles: '{\n  "contract.md": "# Contract\\n\\n## Responses\\n"\n}' },
  },
};

export const workflowAdapters: WorkflowAdapter[] = toolRegistry.flatMap((tool) => {
  const id = tool.workflowAdapterId as WorkflowAdapterId | undefined;
  const definition = id ? adapterDefinitions[id] : undefined;
  return definition ? [{ ...definition, toolSlug: tool.slug }] : [];
});

export function workflowAdapterById(id: string): WorkflowAdapter | undefined {
  return workflowAdapters.find((adapter) => adapter.id === id);
}

function formatJson(input: string): ExpandedToolResult {
  let parsed: unknown;
  try { parsed = JSON.parse(input) as unknown; }
  catch (error) { throw new ExpandedToolError('invalidJson', error instanceof Error ? error.message : 'Invalid JSON.'); }
  return { summary: 'JSON formatted', output: JSON.stringify(parsed, null, 2) };
}

export function runWorkflowAdapter(id: WorkflowAdapterId, input: ExpandedToolInput): ExpandedToolResult {
  if (id === 'json-formatter') return formatJson(input.json ?? '');
  if (id === 'markdown-link-checker') {
    let related: Record<string, string> = {};
    try {
      const value: unknown = JSON.parse(input.relatedFiles || '{}');
      if (!value || typeof value !== 'object' || Array.isArray(value) || Object.values(value).some((entry) => typeof entry !== 'string')) {
        throw new Error('Linked files must be a JSON object of file paths to Markdown text.');
      }
      related = value as Record<string, string>;
    } catch (error) {
      throw new ExpandedToolError('invalidFiles', error instanceof Error ? error.message : 'Invalid linked file map.');
    }
    const filename = input.filename?.trim() || 'README.md';
    return runExpandedTool('markdown-link-checker', {
      files: JSON.stringify({ ...related, [filename]: input.markdown ?? '' }),
    });
  }
  return runExpandedTool(id as ExpandedToolSlug, input);
}

export function workflowAdapterName(id: WorkflowAdapterId, locale: Locale): string {
  const adapter = workflowAdapterById(id);
  return adapter ? toolBySlug(adapter.toolSlug)?.name[locale] ?? id : id;
}
