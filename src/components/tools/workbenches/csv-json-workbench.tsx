'use client';

import { useState } from 'react';
import type { Locale } from '@/i18n/config';
import { convertCsvJson, CsvJsonToolError, type CsvDelimiter, type CsvJsonDirection } from '@/lib/tools/csv-json';
import { ActionButton, ActionToolbar, EditorPanel, StatusMessage } from '../workbench-primitives';
import { useWorkbenchStatus } from '../workbench-feedback';

const messages = {
  ko: {
    label: 'CSV와 JSON 변환기', input: '입력', output: '결과', direction: '변환 방향', toJson: 'CSV → JSON', toCsv: 'JSON → CSV', delimiter: '구분자', comma: '쉼표 (,)', tab: '탭 (TSV)', semicolon: '세미콜론 (;)', sample: '예제 불러오기', convert: '변환', clear: '지우기', copy: '결과 복사', copied: '결과를 복사했습니다.', converted: '변환했습니다.', empty: '내용을 입력하세요.', invalidCsv: 'CSV 인용부호 또는 행의 열 개수를 확인하세요.', invalidJson: 'JSON 문법을 확인하세요.', badShape: 'JSON은 객체들의 배열이어야 하며 최소 한 개의 열이 필요합니다.', badHeaders: '첫 행에 비어 있지 않고 중복되지 않는 열 이름이 필요합니다.', tooLarge: '입력은 UTF-8 기준 1 MiB 이하로 제한됩니다.', copyError: '클립보드에 복사하지 못했습니다.', caution: 'CSV → JSON에서는 모든 셀을 문자열로 읽고 빈 줄은 건너뜁니다. JSON → CSV에서는 중첩 값이 JSON 텍스트가 되며 없는 속성은 빈 셀로 나옵니다. CSV에는 데이터 타입 정보가 없습니다.',
  },
  en: {
    label: 'CSV and JSON converter', input: 'Input', output: 'Result', direction: 'Conversion direction', toJson: 'CSV → JSON', toCsv: 'JSON → CSV', delimiter: 'Delimiter', comma: 'Comma (,)', tab: 'Tab (TSV)', semicolon: 'Semicolon (;)', sample: 'Load example', convert: 'Convert', clear: 'Clear', copy: 'Copy result', copied: 'Result copied.', converted: 'Conversion complete.', empty: 'Enter some content.', invalidCsv: 'Check CSV quoting and make sure every row has the same number of columns.', invalidJson: 'Check the JSON syntax.', badShape: 'JSON must be an array of objects with at least one column.', badHeaders: 'The first row needs non-empty, unique column names.', tooLarge: 'Input is limited to 1 MiB in UTF-8.', copyError: 'Could not copy to the clipboard.', caution: 'CSV → JSON reads every cell as a string and skips blank lines. JSON → CSV writes nested values as JSON text and missing properties as empty cells. CSV has no data type metadata.',
  },
  ja: {
    label: 'CSV と JSON の変換', input: '入力', output: '結果', direction: '変換方向', toJson: 'CSV → JSON', toCsv: 'JSON → CSV', delimiter: '区切り文字', comma: 'カンマ (,)', tab: 'タブ (TSV)', semicolon: 'セミコロン (;)', sample: 'サンプルを読み込む', convert: '変換', clear: 'クリア', copy: '結果をコピー', copied: '結果をコピーしました。', converted: '変換しました。', empty: '内容を入力してください。', invalidCsv: 'CSV の引用符、または各行の列数を確認してください。', invalidJson: 'JSON の構文を確認してください。', badShape: 'JSON は列を 1 つ以上含むオブジェクトの配列にしてください。', badHeaders: '先頭行には空でなく重複しない列名が必要です。', tooLarge: '入力は UTF-8 で 1 MiB 以下にしてください。', copyError: 'クリップボードにコピーできませんでした。', caution: 'CSV → JSON ではすべてのセルを文字列として読み、空行を無視します。JSON → CSV ではネストした値を JSON テキストとして出力し、存在しないプロパティは空欄にします。CSV に型情報はありません。',
  },
  zh: {
    label: 'CSV 与 JSON 转换器', input: '输入', output: '结果', direction: '转换方向', toJson: 'CSV → JSON', toCsv: 'JSON → CSV', delimiter: '分隔符', comma: '逗号 (,)', tab: '制表符 (TSV)', semicolon: '分号 (;)', sample: '载入示例', convert: '转换', clear: '清除', copy: '复制结果', copied: '已复制结果。', converted: '转换完成。', empty: '请输入内容。', invalidCsv: '请检查 CSV 引号格式，并确保每行的列数相同。', invalidJson: '请检查 JSON 语法。', badShape: 'JSON 必须是对象数组，并且至少包含一列。', badHeaders: '首行必须包含非空且不重复的列名。', tooLarge: 'UTF-8 输入大小限制为 1 MiB。', copyError: '无法复制到剪贴板。', caution: 'CSV → JSON 会将所有单元格读作字符串，并跳过空行。JSON → CSV 会将嵌套值写成 JSON 文本，缺失属性写为空单元格。CSV 不包含数据类型信息。',
  },
} satisfies Record<Locale, Record<string, string>>;

const csvSample = 'id,name,active\n1,Ada Lovelace,true\n2,"Grace, Hopper",false';
const jsonSample = '[\n  { "id": 1, "name": "Ada Lovelace", "active": true },\n  { "id": 2, "name": "Grace, Hopper", "active": false }\n]';

export function CsvJsonWorkbench({ locale }: { locale: Locale }) {
  const text = messages[locale];
  const [direction, setDirection] = useState<CsvJsonDirection>('csv-to-json');
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(',');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useWorkbenchStatus(null);

  const convert = () => {
    try {
      setOutput(convertCsvJson(input, direction, delimiter));
      setStatus({ kind: 'success', message: text.converted });
    } catch (error) {
      setOutput('');
      const code = error instanceof CsvJsonToolError ? error.code : 'invalid-json';
      const message = code === 'empty' ? text.empty
        : code === 'too-large' ? text.tooLarge
          : code === 'invalid-csv' ? text.invalidCsv
            : code === 'invalid-headers' ? text.badHeaders
              : code === 'invalid-shape' ? text.badShape : text.invalidJson;
      setStatus({ kind: 'error', message });
    }
  };

  const loadSample = () => {
    setInput(direction === 'csv-to-json' ? csvSample : jsonSample);
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
    <section className="csv-json-workbench" aria-label={text.label}>
      <div className="workbench-settings">
        <label htmlFor="csv-json-direction">{text.direction}</label>
        <select id="csv-json-direction" value={direction} onChange={(event) => setDirection(event.target.value as CsvJsonDirection)}>
          <option value="csv-to-json">{text.toJson}</option><option value="json-to-csv">{text.toCsv}</option>
        </select>
        <label htmlFor="csv-json-delimiter">{text.delimiter}</label>
        <select id="csv-json-delimiter" value={delimiter} onChange={(event) => setDelimiter(event.target.value as CsvDelimiter)}>
          <option value=",">{text.comma}</option><option value="\t">{text.tab}</option><option value=";">{text.semicolon}</option>
        </select>
      </div>
      <EditorPanel locale={locale} label={text.input} value={input} onChange={setInput} language={direction === 'json-to-csv' ? 'json' : 'text'} placeholder={direction === 'json-to-csv' ? jsonSample : csvSample} />
      <ActionToolbar>
        <ActionButton onClick={loadSample}>{text.sample}</ActionButton>
        <ActionButton onClick={convert} variant="primary">{text.convert}</ActionButton>
        <ActionButton onClick={clear} variant="quiet">{text.clear}</ActionButton>
      </ActionToolbar>
      {status && <StatusMessage kind={status.kind}>{status.message}</StatusMessage>}
      <EditorPanel locale={locale} label={text.output} value={output} readOnly language={direction === 'csv-to-json' ? 'json' : 'text'} placeholder={direction === 'csv-to-json' ? '[\n  { "id": "1", "name": "Ada" }\n]' : 'id,name\r\n1,Ada'} />
      <ActionToolbar><ActionButton onClick={() => void copy()} disabled={!output}>{text.copy}</ActionButton></ActionToolbar>
      <p className="tool-caution">{text.caution}</p>
    </section>
  );
}
