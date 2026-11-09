'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { inspectJsonPointer, JsonPointerToolError } from '@/lib/tools/json-pointer';
import { useToolHandoff } from '../tool-handoff';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '../workbench-primitives';
import { useWorkbenchStatus } from '../workbench-feedback';
import { handoffMessages } from '@/i18n/handoff';

const messages = {
  ko: {
    label: 'JSON Pointer 탐색기', json: 'JSON 문서', pointer: 'JSON Pointer 경로', result: '찾은 값', hint: '예: /invoice/items/0/sku', jsonHint: 'JSON 응답을 붙여넣으세요.', outputHint: '경로가 가리키는 값이 여기에 표시됩니다.', sample: '예제 불러오기', inspect: '경로 확인', clear: '지우기', copy: '값 복사', found: '경로의 값을 찾았습니다', copied: '결과를 복사했습니다', empty: 'JSON 문서를 입력하세요.', invalidJson: 'JSON 문법을 확인하세요.', invalidPointer: '포인터는 빈 문자열(루트) 또는 /로 시작하는 경로여야 합니다. ~0과 ~1만 이스케이프에 사용할 수 있습니다.', missing: '해당 경로에 값이 없습니다. 키와 배열 인덱스를 확인하세요.', tooLarge: '입력은 UTF-8 기준 1 MiB 이하로 제한됩니다.', copyError: '클립보드에 복사하지 못했습니다.', caution: '이 도구는 RFC 6901 JSON Pointer의 단일 경로를 평가합니다. JSONPath 필터나 와일드카드는 지원하지 않으며, 입력은 브라우저 안에서만 처리합니다.',
  },
  en: {
    label: 'JSON Pointer inspector', json: 'JSON document', pointer: 'JSON Pointer', result: 'Selected value', hint: 'Example: /invoice/items/0/sku', jsonHint: 'Paste a JSON response.', outputHint: 'The value at the pointer appears here.', sample: 'Load example', inspect: 'Inspect path', clear: 'Clear', copy: 'Copy value', found: 'Value found at pointer', copied: 'Result copied', empty: 'Enter a JSON document.', invalidJson: 'Check the JSON syntax.', invalidPointer: 'Use an empty string for the root or a path starting with /. Only ~0 and ~1 are valid escapes.', missing: 'No value exists at this path. Check the key or array index.', tooLarge: 'Input is limited to 1 MiB in UTF-8.', copyError: 'Could not copy to the clipboard.', caution: 'This evaluates one RFC 6901 JSON Pointer. JSONPath filters and wildcards are not supported. Input stays in your browser.',
  },
  ja: {
    label: 'JSON Pointer 検査ツール', json: 'JSON ドキュメント', pointer: 'JSON Pointer', result: '取得した値', hint: '例: /invoice/items/0/sku', jsonHint: 'JSON レスポンスを貼り付けます。', outputHint: '指定した値がここに表示されます。', sample: 'サンプルを読み込む', inspect: 'パスを確認', clear: 'クリア', copy: '値をコピー', found: 'パスの値が見つかりました', copied: '結果をコピーしました', empty: 'JSON ドキュメントを入力してください。', invalidJson: 'JSON の構文を確認してください。', invalidPointer: 'ルートは空文字列、パスは / から始めてください。エスケープには ~0 と ~1 のみ使えます。', missing: '指定したパスに値がありません。キーと配列インデックスを確認してください。', tooLarge: '入力は UTF-8 で 1 MiB 以下にしてください。', copyError: 'クリップボードにコピーできませんでした。', caution: 'RFC 6901 JSON Pointer の単一パスを評価します。JSONPath のフィルターやワイルドカードには対応しません。入力はブラウザー内で処理します。',
  },
  zh: {
    label: 'JSON Pointer 检查器', json: 'JSON 文档', pointer: 'JSON Pointer 路径', result: '选中的值', hint: '例如：/invoice/items/0/sku', jsonHint: '粘贴 JSON 响应。', outputHint: '路径指向的值会显示在此处。', sample: '载入示例', inspect: '检查路径', clear: '清除', copy: '复制值', found: '已找到路径对应的值', copied: '已复制结果', empty: '请输入 JSON 文档。', invalidJson: '请检查 JSON 语法。', invalidPointer: '根路径使用空字符串，其他路径必须以 / 开头。转义只支持 ~0 和 ~1。', missing: '此路径不存在对应的值。请检查键名或数组索引。', tooLarge: 'UTF-8 输入大小限制为 1 MiB。', copyError: '无法复制到剪贴板。', caution: '此工具只计算一个 RFC 6901 JSON Pointer 路径，不支持 JSONPath 过滤器或通配符。输入仅在浏览器中处理。',
  },
} satisfies Record<Locale, Record<string, string>>;

const sampleJson = '{\n  "invoice": {\n    "id": "INV-42",\n    "items": [{ "sku": "SKU-7", "qty": 2 }]\n  },\n  "a/b": { "~key": true }\n}';

export function JsonPointerWorkbench({ locale }: { locale: Locale }) {
  const text = messages[locale];
  const handoffText = handoffMessages[locale];
  const router = useRouter();
  const { sendHandoff, peekHandoff, receiveHandoff } = useToolHandoff();
  const [initialHandoff] = useState(() => peekHandoff('json-pointer'));
  const [json, setJson] = useState(initialHandoff?.value ?? '');
  const [pointer, setPointer] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useWorkbenchStatus(initialHandoff ? { kind: 'info', message: handoffText.received } : null);

  useEffect(() => {
    if (initialHandoff) receiveHandoff('json-pointer');
  }, [initialHandoff, receiveHandoff]);

  const inspect = () => {
    try {
      const result = inspectJsonPointer(json, pointer);
      setOutput(result.formattedValue);
      setStatus({ kind: 'success', message: `${text.found} · ${result.valueType}` });
    } catch (error) {
      setOutput('');
      const code = error instanceof JsonPointerToolError ? error.code : 'invalid-json';
      const message = code === 'empty' ? text.empty
        : code === 'too-large' ? text.tooLarge
          : code === 'invalid-pointer' ? text.invalidPointer
            : code === 'not-found' ? text.missing : text.invalidJson;
      setStatus({ kind: 'error', message });
    }
  };

  const loadSample = () => {
    setJson(sampleJson);
    setPointer('/invoice/items/0/sku');
    setOutput('');
    setStatus({ kind: 'info', message: text.sample });
  };

  const clear = () => {
    setJson('');
    setPointer('');
    setOutput('');
    setStatus(null);
  };

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setStatus({ kind: 'success', message: text.copied });
    } catch {
      setStatus({ kind: 'error', message: text.copyError });
    }
  };

  const openInJson = () => {
    sendHandoff('json-formatter', json);
    router.push(`/${locale}/tools/json-formatter/`);
  };

  return (
    <section className="json-pointer-workbench" aria-label={text.label}>
      <EditorPanel locale={locale} label={text.json} value={json} onChange={setJson} language="json" placeholder={text.jsonHint} />
      <div className="tool-inline-field">
        <label htmlFor="json-pointer-path">{text.pointer}</label>
        <input id="json-pointer-path" value={pointer} onChange={(event) => setPointer(event.target.value)} placeholder={text.hint} />
      </div>
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={inspect} variant="primary">{text.inspect}</ActionButton>
        <ActionButton onClick={openInJson} disabled={!json.trim()}>{handoffText.openJson}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      <EditorPanel locale={locale} label={text.result} value={output} readOnly language="json" placeholder={text.outputHint} />
      <ActionToolbar><ActionButton onClick={() => void copy()} disabled={!output}>{text.copy}</ActionButton></ActionToolbar>
      <p className="tool-caution">{text.caution}</p>
    </section>
  );
}
