import type { Locale } from './config';

export type WorkbenchMessages = {
  input: string; output: string; sample: string; clear: string; copy: string; download: string;
  run: string; loading: string; sampleLoaded: string; cleared: string; copied: string; downloaded: string; copyError: string;
  emptyInput: string; inputTooLarge: string; invalidJson: string; validJson: string; beautify: string;
  minify: string; validate: string; indentation: string; twoSpaces: string; fourSpaces: string;
  jsonToolLabel: string; jsonInputHint: string; jsonOutputHint: string;
};

export const workbenchMessages: Record<Locale, WorkbenchMessages> = {
  ko: {
    input: '입력', output: '결과', sample: '예제 불러오기', clear: '초기화', copy: '결과 복사', download: 'JSON 다운로드',
    run: '실행', loading: '도구를 불러오는 중…', sampleLoaded: '예제를 입력에 불러왔습니다.', cleared: '입력과 결과를 초기화했습니다.',
    copied: '결과를 클립보드에 복사했습니다.', downloaded: 'JSON 파일을 다운로드했습니다.', copyError: '클립보드에 복사하지 못했습니다. 브라우저 권한을 확인하세요.',
    emptyInput: '먼저 JSON을 입력하거나 예제를 불러오세요.', inputTooLarge: '입력은 1 MB 이하로 제한됩니다.',
    invalidJson: '올바르지 않은 JSON입니다.', validJson: '유효한 JSON입니다.', beautify: '정렬', minify: '압축', validate: '검증',
    indentation: '들여쓰기', twoSpaces: '2칸', fourSpaces: '4칸',
    jsonToolLabel: 'JSON 포맷터',
    jsonInputHint: 'JSON 객체, 배열 또는 primitive 값을 붙여넣으세요.', jsonOutputHint: '실행 결과가 여기에 표시됩니다.',
  },
  en: {
    input: 'Input', output: 'Output', sample: 'Load sample', clear: 'Clear', copy: 'Copy result', download: 'Download JSON',
    run: 'Run', loading: 'Loading tool…', sampleLoaded: 'Sample loaded into the input.', cleared: 'Input and output cleared.',
    copied: 'Result copied to the clipboard.', downloaded: 'JSON file downloaded.', copyError: 'Could not copy to the clipboard. Check browser permissions.',
    emptyInput: 'Enter JSON or load a sample first.', inputTooLarge: 'Input is limited to 1 MB.',
    invalidJson: 'The JSON is invalid.', validJson: 'Valid JSON.', beautify: 'Beautify', minify: 'Minify', validate: 'Validate',
    indentation: 'Indentation', twoSpaces: '2 spaces', fourSpaces: '4 spaces',
    jsonToolLabel: 'JSON Formatter',
    jsonInputHint: 'Paste a JSON object, array, or primitive value.', jsonOutputHint: 'The result will appear here.',
  },
  ja: {
    input: '入力', output: '結果', sample: 'サンプルを読み込む', clear: 'クリア', copy: '結果をコピー', download: 'JSON をダウンロード',
    run: '実行', loading: 'ツールを読み込み中…', sampleLoaded: 'サンプルを入力欄に読み込みました。', cleared: '入力と結果をクリアしました。',
    copied: '結果をクリップボードにコピーしました。', downloaded: 'JSON ファイルをダウンロードしました。', copyError: 'コピーできませんでした。ブラウザーの権限を確認してください。',
    emptyInput: 'JSON を入力するか、サンプルを読み込んでください。', inputTooLarge: '入力は 1 MB 以下にしてください。',
    invalidJson: 'JSON の形式が正しくありません。', validJson: '有効な JSON です。', beautify: '整形', minify: '圧縮', validate: '検証',
    indentation: 'インデント', twoSpaces: '2 スペース', fourSpaces: '4 スペース',
    jsonToolLabel: 'JSON フォーマッター',
    jsonInputHint: 'JSON オブジェクト、配列、またはプリミティブ値を貼り付けます。', jsonOutputHint: '実行結果をここに表示します。',
  },
  zh: {
    input: '输入', output: '结果', sample: '载入示例', clear: '清空', copy: '复制结果', download: '下载 JSON',
    run: '执行', loading: '正在加载工具…', sampleLoaded: '已将示例载入输入框。', cleared: '已清空输入和结果。',
    copied: '已将结果复制到剪贴板。', downloaded: '已下载 JSON 文件。', copyError: '无法复制到剪贴板，请检查浏览器权限。',
    emptyInput: '请先输入 JSON 或载入示例。', inputTooLarge: '输入大小限制为 1 MB。',
    invalidJson: 'JSON 格式无效。', validJson: 'JSON 有效。', beautify: '美化', minify: '压缩', validate: '校验',
    indentation: '缩进', twoSpaces: '2 个空格', fourSpaces: '4 个空格',
    jsonToolLabel: 'JSON 格式化工具',
    jsonInputHint: '粘贴 JSON 对象、数组或基本值。', jsonOutputHint: '执行结果会显示在这里。',
  },
};
