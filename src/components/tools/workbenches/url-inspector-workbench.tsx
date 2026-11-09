'use client';

import { useState } from 'react';
import type { Locale } from '@/i18n/config';
import { formatInspectedUrl, UrlInspectorToolError } from '@/lib/tools/url-inspector';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '../workbench-primitives';
import { useWorkbenchStatus } from '../workbench-feedback';

const messages = {
  ko: {
    label: 'URL 분석기', input: '절대 URL', output: 'URL 구성 요소', hint: 'https://example.com/path?tag=a&tag=b#section', outputHint: 'URL 구성 요소가 JSON으로 표시됩니다.', sample: '예제 불러오기', inspect: '분석', clear: '지우기', copy: '결과 복사', copied: '분석 결과를 복사했습니다.', empty: 'URL을 입력하세요.', invalid: 'http 또는 https로 시작하는 올바른 URL을 입력하세요.', unsupported: 'http와 https URL만 지원합니다.', tooLarge: 'URL은 UTF-8 기준 64 KiB 이하로 제한됩니다.', copyError: '클립보드에 복사하지 못했습니다.', done: 'URL 구성 요소를 분석했습니다.', caution: '쿼리 매개변수는 중복 키와 순서를 보존합니다. 사용자 이름·비밀번호 값은 결과에 포함하지 않습니다. 쿼리에 토큰이나 개인정보가 있다면 결과를 공유하지 마세요. 네트워크 요청은 보내지 않습니다.',
  },
  en: {
    label: 'URL inspector', input: 'Absolute URL', output: 'URL components', hint: 'https://example.com/path?tag=a&tag=b#section', outputHint: 'URL components appear as JSON.', sample: 'Load example', inspect: 'Inspect', clear: 'Clear', copy: 'Copy result', copied: 'Analysis copied.', empty: 'Enter a URL.', invalid: 'Enter a valid URL that starts with http or https.', unsupported: 'Only http and https URLs are supported.', tooLarge: 'URL input is limited to 64 KiB in UTF-8.', copyError: 'Could not copy to the clipboard.', done: 'URL components analyzed.', caution: 'Query parameters keep duplicate keys and order. Usernames and passwords are omitted from the result. Do not share results containing sensitive query values. No network request is made.',
  },
  ja: {
    label: 'URL 構成チェッカー', input: '絶対 URL', output: 'URL の構成要素', hint: 'https://example.com/path?tag=a&tag=b#section', outputHint: 'URL の構成要素を JSON で表示します。', sample: 'サンプルを読み込む', inspect: '解析', clear: 'クリア', copy: '結果をコピー', copied: '解析結果をコピーしました。', empty: 'URL を入力してください。', invalid: 'http または https から始まる有効な URL を入力してください。', unsupported: 'http と https の URL のみ対応しています。', tooLarge: 'URL は UTF-8 で 64 KiB 以下にしてください。', copyError: 'クリップボードにコピーできませんでした。', done: 'URL の構成要素を解析しました。', caution: 'クエリパラメーターは重複キーと順序を保持します。ユーザー名とパスワードは結果に含めません。機密情報を含むクエリ結果は共有しないでください。ネットワークリクエストは送信しません。',
  },
  zh: {
    label: 'URL 结构检查器', input: '绝对 URL', output: 'URL 组成部分', hint: 'https://example.com/path?tag=a&tag=b#section', outputHint: 'URL 组成部分将以 JSON 显示。', sample: '载入示例', inspect: '分析', clear: '清除', copy: '复制结果', copied: '已复制分析结果。', empty: '请输入 URL。', invalid: '请输入以 http 或 https 开头的有效 URL。', unsupported: '仅支持 http 和 https URL。', tooLarge: 'UTF-8 URL 大小限制为 64 KiB。', copyError: '无法复制到剪贴板。', done: '已分析 URL 组成部分。', caution: '查询参数会保留重复键及其顺序。结果中不会包含用户名和密码。请勿分享包含敏感查询值的结果。本工具不会发起网络请求。',
  },
} satisfies Record<Locale, Record<string, string>>;

const sampleUrl = 'https://demo:secret@example.test:8443/orders/42?tag=blue&tag=green&limit=10#payment';

export function UrlInspectorWorkbench({ locale }: { locale: Locale }) {
  const text = messages[locale];
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useWorkbenchStatus(null);

  const inspect = () => {
    try {
      setOutput(formatInspectedUrl(input));
      setStatus({ kind: 'success', message: text.done });
    } catch (error) {
      setOutput('');
      const code = error instanceof UrlInspectorToolError ? error.code : 'invalid-url';
      const message = code === 'empty' ? text.empty : code === 'too-large' ? text.tooLarge : code === 'unsupported-protocol' ? text.unsupported : text.invalid;
      setStatus({ kind: 'error', message });
    }
  };

  const loadSample = () => {
    setInput(sampleUrl);
    setOutput('');
    setStatus({ kind: 'info', message: text.sample });
  };

  const clear = () => {
    setInput('');
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

  return (
    <section className="url-inspector-workbench" aria-label={text.label}>
      <EditorPanel locale={locale} label={text.input} value={input} onChange={setInput} language="text" placeholder={text.hint} />
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={inspect} variant="primary">{text.inspect}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      <EditorPanel locale={locale} label={text.output} value={output} readOnly language="json" placeholder={text.outputHint} />
      <ActionToolbar><ActionButton onClick={() => void copy()} disabled={!output}>{text.copy}</ActionButton></ActionToolbar>
      <p className="tool-caution">{text.caution}</p>
    </section>
  );
}
