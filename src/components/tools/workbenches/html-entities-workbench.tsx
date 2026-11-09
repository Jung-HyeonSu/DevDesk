'use client';

import { useState } from 'react';
import type { Locale } from '@/i18n/config';
import { convertHtmlEntities } from '@/lib/tools/html-entities';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '../workbench-primitives';
import { useWorkbenchStatus } from '../workbench-feedback';

type Direction = 'encode' | 'decode';

const messages = {
  ko: {
    label: 'HTML 엔티티 변환기', input: '입력 텍스트', output: '결과', direction: '변환 방향', encode: 'HTML 엔티티로 인코딩', decode: 'HTML 엔티티 디코딩', sample: '예제 불러오기', convert: '변환', clear: '지우기', copy: '결과 복사', copied: '결과를 복사했습니다.', converted: '변환했습니다.', inputHint: '<main title="A & B">"Hello"</main>', outputHint: '변환 결과가 여기에 표시됩니다.', tooLarge: '입력은 UTF-8 기준 1 MiB 이하로 제한됩니다.', copyError: '클립보드에 복사하지 못했습니다.', caution: '인코딩은 &, <, >, 큰따옴표와 작은따옴표를 이스케이프합니다. 디코딩은 amp, apos, gt, lt, nbsp, quot 및 세미콜론이 있는 숫자 문자 참조를 처리합니다. 이 변환은 HTML sanitizer가 아니며 안전하지 않은 마크업을 검증하지 않습니다.',
  },
  en: {
    label: 'HTML entity encoder and decoder', input: 'Input text', output: 'Result', direction: 'Conversion direction', encode: 'Encode as HTML entities', decode: 'Decode HTML entities', sample: 'Load example', convert: 'Convert', clear: 'Clear', copy: 'Copy result', copied: 'Result copied.', converted: 'Conversion complete.', inputHint: '<main title="A & B">"Hello"</main>', outputHint: 'The converted text appears here.', tooLarge: 'Input is limited to 1 MiB in UTF-8.', copyError: 'Could not copy to the clipboard.', caution: 'Encoding escapes &, <, >, double quotes, and apostrophes. Decoding recognizes amp, apos, gt, lt, nbsp, quot, and semicolon-terminated numeric references. This is not an HTML sanitizer and does not validate unsafe markup.',
  },
  ja: {
    label: 'HTML エンティティ変換', input: '入力テキスト', output: '結果', direction: '変換方向', encode: 'HTML エンティティにエンコード', decode: 'HTML エンティティをデコード', sample: 'サンプルを読み込む', convert: '変換', clear: 'クリア', copy: '結果をコピー', copied: '結果をコピーしました。', converted: '変換しました。', inputHint: '<main title="A & B">"Hello"</main>', outputHint: '変換結果をここに表示します。', tooLarge: '入力は UTF-8 で 1 MiB 以下にしてください。', copyError: 'クリップボードにコピーできませんでした。', caution: 'エンコードでは &, <, >、二重引用符、アポストロフィをエスケープします。デコードでは amp、apos、gt、lt、nbsp、quot とセミコロン付きの数値文字参照を処理します。HTML サニタイザーではなく、安全でないマークアップを検証しません。',
  },
  zh: {
    label: 'HTML 实体编码与解码', input: '输入文本', output: '结果', direction: '转换方向', encode: '编码为 HTML 实体', decode: '解码 HTML 实体', sample: '载入示例', convert: '转换', clear: '清除', copy: '复制结果', copied: '已复制结果。', converted: '转换完成。', inputHint: '<main title="A & B">"Hello"</main>', outputHint: '转换结果将显示在此处。', tooLarge: 'UTF-8 输入大小限制为 1 MiB。', copyError: '无法复制到剪贴板。', caution: '编码会转义 &, <, >、双引号和单引号。解码支持 amp、apos、gt、lt、nbsp、quot，以及带分号的数字字符引用。本工具不是 HTML 清理器，也不会验证不安全标记。',
  },
} satisfies Record<Locale, Record<string, string>>;

export function HtmlEntitiesWorkbench({ locale }: { locale: Locale }) {
  const text = messages[locale];
  const [direction, setDirection] = useState<Direction>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useWorkbenchStatus(null);

  const convert = () => {
    try {
      setOutput(convertHtmlEntities(input, direction));
      setStatus({ kind: 'success', message: text.converted });
    } catch {
      setOutput('');
      setStatus({ kind: 'error', message: text.tooLarge });
    }
  };

  const loadSample = () => {
    setInput(direction === 'encode' ? '<main title="A & B">"Hello"</main>' : '&lt;main&gt;Hello &amp; goodbye&#33;&lt;/main&gt;');
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
    <section className="html-entities-workbench" aria-label={text.label}>
      <div className="workbench-settings">
        <label htmlFor="html-entities-direction">{text.direction}</label>
        <select id="html-entities-direction" value={direction} onChange={(event) => setDirection(event.target.value as Direction)}>
          <option value="encode">{text.encode}</option><option value="decode">{text.decode}</option>
        </select>
      </div>
      <EditorPanel locale={locale} label={text.input} value={input} onChange={setInput} language="html" placeholder={text.inputHint} />
      <ActionToolbar sticky>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={convert} variant="primary">{text.convert}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      <EditorPanel locale={locale} label={text.output} value={output} readOnly language={direction === 'encode' ? 'text' : 'html'} placeholder={text.outputHint} />
      <ActionToolbar><ActionButton onClick={() => void copy()} disabled={!output}>{text.copy}</ActionButton></ActionToolbar>
      <p className="tool-caution">{text.caution}</p>
    </section>
  );
}
