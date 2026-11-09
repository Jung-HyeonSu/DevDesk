'use client';

import { useId, useState } from 'react';
import { toolBySlug, type ToolSlug } from '@/data/tools';
import type { Locale } from '@/i18n/config';
import type { ExpandedToolInput, ExpandedToolResult, ExpandedToolSlug } from '@/lib/tools/expanded-tools';
import { notifyWorkbenchSuccess } from '@/components/tools/workbench-feedback';

type Copy = {
  sample: string; clear: string; run: string; input: string; output: string; copy: string; copied: string;
  copyError: string; idle: string; running: string; done: string; error: string; warning: string;
  schema: string; instance: string; document: string; command: string; fetchSource: string; direction: string; curlToFetch: string; fetchToCurl: string; headers: string; left: string; right: string;
  patterns: string; paths: string; har: string; fileName: string; markdown: string; extraFiles: string;
  formatNote: string; privacyNote: string; linkNote: string; emptyInput: string; tooLarge: string;
  invalidSchema: string; unsupportedDraft: string; externalRef: string; invalidDocument: string;
  invalidOpenApi: string; unsupportedVersion: string; noOperations: string; invalidCurl: string;
  unsupportedOption: string; missingUrl: string; invalidUrl: string; invalidHeader: string; invalidHeaders: string;
  unsupportedMethod: string; invalidFetch: string; unsupportedFetchOption: string;
  invalidHar: string; unsupportedHarVersion: string; tooManyFiles: string; unexpected: string;
};

const copy: Record<Locale, Copy> = {
  ko: {
    sample: '예제 불러오기', clear: '초기화', run: '실행', input: '입력', output: '결과', copy: '결과 복사', copied: '복사했습니다.', copyError: '복사할 수 없습니다.',
    idle: '입력을 확인한 뒤 실행하세요.', running: '브라우저에서 처리 중…', done: '완료', error: '입력을 처리하지 못했습니다.', warning: '주의',
    schema: 'JSON Schema', instance: 'JSON 데이터', document: 'OpenAPI 문서', command: 'cURL 명령', fetchSource: '정적 Fetch 코드', direction: '변환 방향', curlToFetch: 'cURL → Fetch', fetchToCurl: 'Fetch → cURL', headers: 'HTTP 상태 줄과 응답 헤더', left: '기준 환경 .env', right: '비교 환경 .env',
    patterns: '.gitignore 패턴', paths: '저장소 상대 경로 (한 줄에 하나)', har: 'HAR 1.2 JSON', fileName: '현재 Markdown 파일명', markdown: 'Markdown 내용', extraFiles: '연결된 Markdown 파일 선택',
    formatNote: 'Draft 2020-12 검증입니다. format 키워드는 표준의 annotation 동작에 맞춰 형식 주장 검사를 하지 않습니다.',
    privacyNote: '값은 화면에 다시 표시하거나 결과에 포함하지 않고 키 존재와 빈 값 여부만 비교합니다.',
    linkNote: '선택한 파일은 브라우저 메모리에서만 읽습니다. 외부 링크는 요청하지 않습니다.',
    emptyInput: '필수 입력이 비어 있습니다.', tooLarge: '입력이 지원 크기를 초과했습니다.', invalidSchema: 'JSON Schema를 해석하거나 컴파일하지 못했습니다.', unsupportedDraft: 'JSON Schema Draft 2020-12만 지원합니다.', externalRef: '외부 $ref는 가져오지 않습니다. 문서 안 참조를 사용하세요.', invalidDocument: 'JSON 또는 YAML 문서를 확인하세요.',
    invalidOpenApi: 'OpenAPI 문서 구조를 확인하세요.', unsupportedVersion: 'OpenAPI 3.2.x만 지원합니다.', noOperations: 'paths에서 HTTP 작업을 찾지 못했습니다.', invalidCurl: 'cURL 구문과 인용부호를 확인하세요.', unsupportedOption: '지원하지 않는 cURL 옵션입니다.', unsupportedMethod: 'Fetch에서 지원하는 일반 HTTP 메서드를 선택하세요.', invalidFetch: '정적 Fetch 호출과 JSON 문자열 인수를 확인하세요.', unsupportedFetchOption: '동적 JavaScript 또는 지원하지 않는 Fetch 옵션입니다.', missingUrl: '완전한 요청 URL이 필요합니다.', invalidUrl: 'HTTP 또는 HTTPS URL을 확인하세요.', invalidHeader: '헤더 줄은 이름: 값 형식이어야 합니다.', invalidHeaders: 'HTTP 상태 줄과 응답 헤더 형식을 확인하세요.', invalidHar: 'HAR 1.2 JSON 구조를 확인하세요.', unsupportedHarVersion: 'HAR 1.2만 지원합니다.', tooManyFiles: 'Markdown 파일은 최대 20개까지 검사할 수 있습니다.', unexpected: '예상하지 못한 오류가 발생했습니다.',
  },
  en: {
    sample: 'Load example', clear: 'Clear', run: 'Run', input: 'Input', output: 'Result', copy: 'Copy result', copied: 'Copied.', copyError: 'Could not copy.',
    idle: 'Review the input, then run the tool.', running: 'Processing in your browser…', done: 'Completed', error: 'The input could not be processed.', warning: 'Notice',
    schema: 'JSON Schema', instance: 'JSON instance', document: 'OpenAPI document', command: 'cURL command', fetchSource: 'Static Fetch code', direction: 'Conversion direction', curlToFetch: 'cURL → Fetch', fetchToCurl: 'Fetch → cURL', headers: 'HTTP status line and response headers', left: 'Baseline .env', right: 'Comparison .env',
    patterns: '.gitignore patterns', paths: 'Repository-relative paths (one per line)', har: 'HAR 1.2 JSON', fileName: 'Current Markdown filename', markdown: 'Markdown content', extraFiles: 'Choose linked Markdown files',
    formatNote: 'Draft 2020-12 validation. The format keyword is treated as an annotation and is not asserted.',
    privacyNote: 'Values are not shown or included in the report; only key presence and empty values are compared.',
    linkNote: 'Selected files are read in browser memory only. External links are never fetched.',
    emptyInput: 'A required input is empty.', tooLarge: 'Input exceeds the supported size.', invalidSchema: 'The JSON Schema could not be parsed or compiled.', unsupportedDraft: 'Only JSON Schema Draft 2020-12 is supported.', externalRef: 'External $ref values are not fetched. Use references inside this document.', invalidDocument: 'Check the JSON or YAML document.',
    invalidOpenApi: 'Check the OpenAPI document structure.', unsupportedVersion: 'Only OpenAPI 3.2.x is supported.', noOperations: 'No HTTP operations were found under paths.', invalidCurl: 'Check the cURL syntax and quoting.', unsupportedOption: 'This cURL option is not supported.', unsupportedMethod: 'Choose a common HTTP method supported by Fetch.', invalidFetch: 'Check for a static Fetch call with JSON string arguments.', unsupportedFetchOption: 'Dynamic JavaScript or this Fetch option is not supported.', missingUrl: 'A complete request URL is required.', invalidUrl: 'Check that the URL uses HTTP or HTTPS.', invalidHeader: 'Header lines must use the name: value format.', invalidHeaders: 'Check the HTTP status line and response-header format.', invalidHar: 'Check the HAR 1.2 JSON structure.', unsupportedHarVersion: 'Only HAR 1.2 is supported.', tooManyFiles: 'Select no more than 20 Markdown files.', unexpected: 'An unexpected error occurred.',
  },
  ja: {
    sample: '例を読み込む', clear: 'クリア', run: '実行', input: '入力', output: '結果', copy: '結果をコピー', copied: 'コピーしました。', copyError: 'コピーできませんでした。',
    idle: '入力を確認してから実行してください。', running: 'ブラウザー内で処理中…', done: '完了', error: '入力を処理できませんでした。', warning: '注意',
    schema: 'JSON Schema', instance: 'JSON インスタンス', document: 'OpenAPI ドキュメント', command: 'cURL コマンド', fetchSource: '静的 Fetch コード', direction: '変換方向', curlToFetch: 'cURL → Fetch', fetchToCurl: 'Fetch → cURL', headers: 'HTTP ステータス行とレスポンスヘッダー', left: '基準環境 .env', right: '比較環境 .env',
    patterns: '.gitignore パターン', paths: 'リポジトリ相対パス（1 行に 1 つ）', har: 'HAR 1.2 JSON', fileName: '現在の Markdown ファイル名', markdown: 'Markdown の内容', extraFiles: 'リンク先の Markdown ファイルを選択',
    formatNote: 'Draft 2020-12 で検証します。format キーワードは annotation として扱い、形式の断定検証は行いません。',
    privacyNote: '値は表示・出力せず、キーの有無と空値かどうかだけを比較します。',
    linkNote: '選択したファイルはブラウザーのメモリー内だけで読み込みます。外部リンクへはアクセスしません。',
    emptyInput: '必須の入力が空です。', tooLarge: '入力が対応サイズを超えています。', invalidSchema: 'JSON Schema を解析またはコンパイルできません。', unsupportedDraft: 'JSON Schema Draft 2020-12 のみ対応しています。', externalRef: '外部の $ref は取得しません。このドキュメント内の参照を使用してください。', invalidDocument: 'JSON または YAML ドキュメントを確認してください。',
    invalidOpenApi: 'OpenAPI ドキュメントの構造を確認してください。', unsupportedVersion: 'OpenAPI 3.2.x のみ対応しています。', noOperations: 'paths に HTTP オペレーションが見つかりません。', invalidCurl: 'cURL の構文と引用符を確認してください。', unsupportedOption: '未対応の cURL オプションです。', unsupportedMethod: 'Fetch で使用できる一般的な HTTP メソッドを選択してください。', invalidFetch: '静的な Fetch 呼び出しと JSON 文字列引数を確認してください。', unsupportedFetchOption: '動的 JavaScript または未対応の Fetch オプションです。', missingUrl: '完全なリクエスト URL が必要です。', invalidUrl: 'HTTP または HTTPS URL を確認してください。', invalidHeader: 'ヘッダーは「名前: 値」の形式で入力してください。', invalidHeaders: 'HTTP ステータス行とレスポンスヘッダーを確認してください。', invalidHar: 'HAR 1.2 JSON の構造を確認してください。', unsupportedHarVersion: 'HAR 1.2 のみ対応しています。', tooManyFiles: 'Markdown ファイルは最大 20 件まで検査できます。', unexpected: '予期しないエラーが発生しました。',
  },
  zh: {
    sample: '载入示例', clear: '清除', run: '运行', input: '输入', output: '结果', copy: '复制结果', copied: '已复制。', copyError: '无法复制。',
    idle: '检查输入后运行工具。', running: '正在浏览器中处理…', done: '已完成', error: '无法处理输入。', warning: '注意',
    schema: 'JSON Schema', instance: 'JSON 实例', document: 'OpenAPI 文档', command: 'cURL 命令', fetchSource: '静态 Fetch 代码', direction: '转换方向', curlToFetch: 'cURL → Fetch', fetchToCurl: 'Fetch → cURL', headers: 'HTTP 状态行和响应标头', left: '基准环境 .env', right: '对比环境 .env',
    patterns: '.gitignore 模式', paths: '仓库相对路径（每行一个）', har: 'HAR 1.2 JSON', fileName: '当前 Markdown 文件名', markdown: 'Markdown 内容', extraFiles: '选择链接到的 Markdown 文件',
    formatNote: '使用 Draft 2020-12 验证。format 关键字按标准作为注解处理，不断言格式有效性。',
    privacyNote: '报告不会显示或包含变量值；只比较键是否存在以及值是否为空。',
    linkNote: '所选文件仅在浏览器内存中读取，不会请求外部链接。',
    emptyInput: '必填输入为空。', tooLarge: '输入超出支持的大小。', invalidSchema: '无法解析或编译 JSON Schema。', unsupportedDraft: '仅支持 JSON Schema Draft 2020-12。', externalRef: '不会获取外部 $ref。请使用本文档内的引用。', invalidDocument: '请检查 JSON 或 YAML 文档。',
    invalidOpenApi: '请检查 OpenAPI 文档结构。', unsupportedVersion: '仅支持 OpenAPI 3.2.x。', noOperations: 'paths 中未找到 HTTP 操作。', invalidCurl: '请检查 cURL 语法和引号。', unsupportedOption: '不支持此 cURL 选项。', unsupportedMethod: '请选择 Fetch 支持的常用 HTTP 方法。', invalidFetch: '请检查静态 Fetch 调用和 JSON 字符串参数。', unsupportedFetchOption: '不支持动态 JavaScript 或此 Fetch 选项。', missingUrl: '需要完整的请求 URL。', invalidUrl: '请检查 URL 是否为 HTTP 或 HTTPS。', invalidHeader: '标头行必须采用“名称: 值”格式。', invalidHeaders: '请检查 HTTP 状态行和响应标头格式。', invalidHar: '请检查 HAR 1.2 JSON 结构。', unsupportedHarVersion: '仅支持 HAR 1.2。', tooManyFiles: '最多检查 20 个 Markdown 文件。', unexpected: '发生意外错误。',
  },
};

type InputField = { key: keyof ExpandedToolInput; label: keyof Copy; placeholder?: string; rows?: number };
const fields: Record<ExpandedToolSlug, InputField[]> = {
  'json-schema-validator': [{ key: 'schema', label: 'schema', rows: 12 }, { key: 'instance', label: 'instance', rows: 10 }],
  'openapi-explorer': [{ key: 'document', label: 'document', rows: 20 }],
  'curl-fetch-converter': [{ key: 'command', label: 'command', rows: 6 }],
  'http-header-inspector': [{ key: 'headers', label: 'headers', rows: 12 }],
  'env-diff': [{ key: 'left', label: 'left', rows: 10 }, { key: 'right', label: 'right', rows: 10 }],
  'gitignore-tester': [{ key: 'patterns', label: 'patterns', rows: 9 }, { key: 'paths', label: 'paths', rows: 9 }],
  'har-scrubber': [{ key: 'har', label: 'har', rows: 16 }],
  'markdown-link-checker': [{ key: 'markdown', label: 'markdown', rows: 16 }],
};

const samples: Record<ExpandedToolSlug, ExpandedToolInput> = {
  'json-schema-validator': {
    schema: '{\n  "$schema": "https://json-schema.org/draft/2020-12/schema",\n  "type": "object",\n  "properties": { "id": { "type": "integer" }, "status": { "enum": ["open", "closed"] } },\n  "required": ["id", "status"],\n  "additionalProperties": false\n}',
    instance: '{\n  "id": "42",\n  "state": "open"\n}',
  },
  'openapi-explorer': { document: 'openapi: 3.2.1\ninfo:\n  title: Task API\n  version: 1.0.0\npaths:\n  /tasks:\n    get:\n      operationId: listTasks\n      summary: List tasks\n      parameters:\n        - name: status\n          in: query\n          schema:\n            type: string\n      responses:\n        "200":\n          description: Task list\n    post:\n      operationId: createTask\n      requestBody:\n        content:\n          application/json:\n            schema:\n              type: object\n              required: [title]\n      responses:\n        "201":\n          description: Created' },
  'curl-fetch-converter': {
    command: "curl -X POST 'https://api.example.test/tasks' -H 'Content-Type: application/json' -H 'X-Request-ID: demo-42' -d '{\"title\":\"Draft\"}'",
    fetchSource: 'const response = await fetch("https://api.example.test/tasks", {\n  "method": "POST",\n  "headers": { "Content-Type": "application/json", "X-Request-ID": "demo-42" },\n  "body": "{\\"title\\":\\"Draft\\"}"\n});',
  },
  'http-header-inspector': { headers: 'HTTP/1.1 200 OK\nContent-Type: application/json\nAccess-Control-Allow-Origin: *\nCache-Control: public, max-age=600\nSet-Cookie: session=demo; Path=/' },
  'env-diff': { left: 'API_BASE=https://dev.example.test\nFEATURE_SEARCH=true\nLOG_LEVEL=debug\nEMPTY_VALUE=', right: 'API_BASE=https://api.example.test\nFEATURE_SEARCH=true\nCACHE_TTL=60\nLOG_LEVEL=info' },
  'gitignore-tester': { patterns: 'dist/\n*.log\n!important.log\n.env*\n!.env.example', paths: 'dist/app.js\nserver.log\nimportant.log\n.env\n.env.example\nsrc/app.ts' },
  'har-scrubber': { har: '{\n  "log": {\n    "version": "1.2",\n    "creator": { "name": "DevTools", "version": "1" },\n    "entries": [{\n      "request": { "method": "GET", "url": "https://api.example.test/tasks?access_token=demo-token", "headers": [{ "name": "Authorization", "value": "Bearer demo-token" }], "cookies": [{ "name": "session", "value": "demo-session" }] },\n      "response": { "status": 200, "headers": [{ "name": "Set-Cookie", "value": "session=demo-session; Path=/" }], "content": { "mimeType": "application/json", "text": "{\\"email\\":\\"demo@example.test\\",\\"status\\":\\"open\\"}" } }\n    }]\n  }\n}' },
  'markdown-link-checker': { markdown: '# Release guide\n\n[Rollback steps](./deploy.md#rollback)\n[Missing section](#future-work)\n\n## Rollback\n\nRun the previous static build.' },
};

type WorkerMessage = { id: number; ok: true; result: ExpandedToolResult } | { id: number; ok: false; code: string; message: string };

function localizedError(locale: Locale, code: string, fallback: string) {
  const messages = copy[locale];
  return messages[code as keyof Copy] ?? (fallback || messages.unexpected);
}

export function ExpandedToolWorkbench({ locale, slug }: { locale: Locale; slug: ToolSlug }) {
  const help = copy[locale];
  const extendedSlug = slug as ExpandedToolSlug;
  const idPrefix = useId();
  const [input, setInput] = useState<ExpandedToolInput>(() => ({ ...samples[extendedSlug] }));
  const [mainFilename, setMainFilename] = useState('README.md');
  const [relatedFiles, setRelatedFiles] = useState<Record<string, string>>({});
  const [curlDirection, setCurlDirection] = useState<'curl-to-fetch' | 'fetch-to-curl'>('curl-to-fetch');
  const [result, setResult] = useState<ExpandedToolResult | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [status, setStatus] = useState(help.idle);
  const [busy, setBusy] = useState(false);

  const tool = toolBySlug(slug);
  if (!tool || !(extendedSlug in samples)) return null;
  const activeFields = extendedSlug === 'curl-fetch-converter'
    ? [{ key: curlDirection === 'curl-to-fetch' ? 'command' : 'fetchSource', label: curlDirection === 'curl-to-fetch' ? 'command' : 'fetchSource', rows: 8 } as InputField]
    : fields[extendedSlug];

  function update(key: string, value: string) {
    setInput((previous) => ({ ...previous, [key]: value }));
    setResult(null);
    setError(null);
    setStatus(help.idle);
  }

  function loadSample() {
    setInput({ ...samples[extendedSlug] });
    setMainFilename('README.md');
    setRelatedFiles({});
    setCurlDirection('curl-to-fetch');
    setResult(null);
    setError(null);
    setStatus(help.idle);
  }

  function run() {
    setBusy(true);
    setResult(null);
    setError(null);
    setStatus(help.running);
    const worker = new Worker(new URL('../../../lib/tools/expanded-tools.worker.ts', import.meta.url), { type: 'module' });
    const requestId = Date.now();
    const workerInput = extendedSlug === 'curl-fetch-converter'
      ? { ...input, direction: curlDirection }
      : extendedSlug === 'markdown-link-checker'
      ? { files: JSON.stringify({ ...relatedFiles, [mainFilename || 'README.md']: input.markdown ?? '' }) }
      : input;
    const timer = window.setTimeout(() => {
      worker.terminate();
      setBusy(false);
      setError({ code: 'unexpected', message: 'Processing exceeded the time limit.' });
      setStatus(help.error);
    }, 8000);
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message.id !== requestId) return;
      window.clearTimeout(timer);
      worker.terminate();
      setBusy(false);
      if (message.ok) {
        setResult(message.result);
        setStatus(help.done);
        notifyWorkbenchSuccess();
      } else {
        setError({ code: message.code, message: message.message });
        setStatus(help.error);
      }
    };
    worker.onerror = () => {
      window.clearTimeout(timer);
      worker.terminate();
      setBusy(false);
      setError({ code: 'unexpected', message: 'Worker failed.' });
      setStatus(help.error);
    };
    worker.postMessage({ id: requestId, slug: extendedSlug, input: workerInput });
  }

  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setStatus(help.copied);
      notifyWorkbenchSuccess();
    } catch {
      setStatus(help.copyError);
    }
  }

  async function readFiles(fileList: FileList | null) {
    if (!fileList) return;
    const next: Record<string, string> = {};
    for (const file of Array.from(fileList).slice(0, 19)) {
      if (!file.name.toLowerCase().endsWith('.md') && !file.name.toLowerCase().endsWith('.mdx')) continue;
      if (file.size > 1024 * 1024) continue;
      next[file.webkitRelativePath || file.name] = await file.text();
    }
    setRelatedFiles(next);
  }

  return (
    <section className="expanded-workbench" aria-label={tool.name[locale]}>
      <div className="expanded-workbench-actions">
        <button type="button" className="expanded-button" onClick={loadSample}>{help.sample}</button>
        <button type="button" className="expanded-button" onClick={() => { setInput({}); setRelatedFiles({}); setCurlDirection('curl-to-fetch'); setResult(null); setError(null); setStatus(help.idle); }}>{help.clear}</button>
        <button type="button" className="expanded-button expanded-button-primary" onClick={run} disabled={busy}>{busy ? help.running : help.run}</button>
      </div>
      {extendedSlug === 'curl-fetch-converter' && <div className="expanded-workbench-field">
        <label htmlFor={`${idPrefix}-direction`}>{help.direction}</label>
        <select id={`${idPrefix}-direction`} onChange={(event) => setCurlDirection(event.target.value as 'curl-to-fetch' | 'fetch-to-curl')} value={curlDirection}>
          <option value="curl-to-fetch">{help.curlToFetch}</option>
          <option value="fetch-to-curl">{help.fetchToCurl}</option>
        </select>
      </div>}
      {activeFields.map((field) => {
        const id = `${idPrefix}-${field.key}`;
        return (
          <div className="expanded-workbench-field" key={field.key}>
            <label htmlFor={id}>{help[field.label]}</label>
            <textarea id={id} value={input[field.key] ?? ''} onChange={(event) => update(field.key, event.target.value)} rows={field.rows ?? 8} spellCheck={false} />
          </div>
        );
      })}
      {extendedSlug === 'markdown-link-checker' && (
        <div className="expanded-workbench-field">
          <label htmlFor={`${idPrefix}-filename`}>{help.fileName}</label>
          <input id={`${idPrefix}-filename`} value={mainFilename} onChange={(event) => setMainFilename(event.target.value)} />
          <label htmlFor={`${idPrefix}-files`}>{help.extraFiles}</label>
          <input id={`${idPrefix}-files`} type="file" accept=".md,.mdx,text/markdown" multiple onChange={(event) => { void readFiles(event.currentTarget.files); }} />
          {Object.keys(relatedFiles).length > 0 && <p className="expanded-workbench-note">{Object.keys(relatedFiles).join(', ')}</p>}
        </div>
      )}
      {extendedSlug === 'json-schema-validator' && <p className="expanded-workbench-note">{help.formatNote}</p>}
      {extendedSlug === 'env-diff' && <p className="expanded-workbench-note">{help.privacyNote}</p>}
      {extendedSlug === 'markdown-link-checker' && <p className="expanded-workbench-note">{help.linkNote}</p>}
      <p className="expanded-workbench-status" role="status" aria-live="polite">{status}</p>
      {error && (
        <div className="expanded-workbench-error" role="alert">
          <p>{localizedError(locale, error.code, error.message)}</p>
          <details><summary>{locale === 'ko' ? '기술 세부 정보' : locale === 'ja' ? '技術詳細' : locale === 'zh' ? '技术详情' : 'Technical details'}</summary><pre>{error.message}</pre></details>
        </div>
      )}
      {result && (
        <div className="expanded-workbench-output">
          <div className="expanded-workbench-output-heading"><h3>{help.output}</h3><button type="button" className="expanded-button" onClick={() => { void copyResult(); }}>{help.copy}</button></div>
          <p>{result.summary}</p>
          <pre><code>{result.output}</code></pre>
          {result.warning && <p className="expanded-workbench-note">{result.warning}</p>}
        </div>
      )}
    </section>
  );
}
