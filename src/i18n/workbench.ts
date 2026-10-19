import type { Locale } from './config';

export type WorkbenchMessages = {
  input: string; output: string; sample: string; clear: string; copy: string; download: string;
  run: string; loading: string; sampleLoaded: string; cleared: string; copied: string; downloaded: string; copyError: string;
  emptyInput: string; inputTooLarge: string; invalidJson: string; validJson: string; beautify: string;
  minify: string; validate: string; indentation: string; twoSpaces: string; fourSpaces: string;
  jsonToolLabel: string; jsonInputHint: string; jsonOutputHint: string;
  base64ToolLabel: string; encode: string; decode: string; swap: string; urlSafe: string;
  base64InputHint: string; base64OutputHint: string; base64EmptyInput: string; invalidBase64: string; invalidUtf8: string;
  encodingSuccess: string; decodingSuccess: string; swapped: string; downloadText: string;
  urlToolLabel: string; urlEncode: string; urlDecode: string; urlInputHint: string; urlOutputHint: string;
  urlEmptyInput: string; urlInvalidEscape: string; urlInvalidUnicode: string; urlEncodeSuccess: string;
  urlDecodeSuccess: string; urlComponentNotice: string;
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
    base64ToolLabel: 'Base64 인코더 및 디코더', encode: '인코딩', decode: '디코딩', swap: '입력과 결과 교환', urlSafe: 'URL-safe Base64',
    base64InputHint: 'UTF-8 텍스트 또는 Base64 문자열을 입력하세요.', base64OutputHint: '변환 결과가 여기에 표시됩니다.', base64EmptyInput: '먼저 텍스트를 입력하거나 예제를 불러오세요.',
    invalidBase64: '올바르지 않은 Base64 문자열입니다.', invalidUtf8: 'Base64 데이터가 유효한 UTF-8 텍스트가 아닙니다.',
    encodingSuccess: 'UTF-8 텍스트를 Base64로 인코딩했습니다.', decodingSuccess: 'Base64를 UTF-8 텍스트로 디코딩했습니다.',
    swapped: '입력과 결과를 교환했습니다.', downloadText: '텍스트 다운로드',
    urlToolLabel: 'URL component 인코더 및 디코더', urlEncode: '인코딩', urlDecode: '디코딩',
    urlInputHint: 'URL의 한 부분으로 사용할 텍스트를 입력하세요.', urlOutputHint: '변환 결과가 여기에 표시됩니다.',
    urlEmptyInput: '먼저 텍스트를 입력하거나 예제를 불러오세요.', urlInvalidEscape: '퍼센트 인코딩 문자열이 올바르지 않습니다.',
    urlInvalidUnicode: '입력에 올바르지 않은 Unicode 문자가 있습니다.', urlEncodeSuccess: '텍스트를 URL component로 인코딩했습니다.',
    urlDecodeSuccess: 'URL component를 텍스트로 디코딩했습니다.', urlComponentNotice: '전체 URL이 아닌 단일 component를 처리합니다. 공백은 %20으로 인코딩하고 + 기호는 그대로 유지합니다.',
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
    base64ToolLabel: 'Base64 encoder and decoder', encode: 'Encode', decode: 'Decode', swap: 'Swap input and output', urlSafe: 'URL-safe Base64',
    base64InputHint: 'Enter UTF-8 text or a Base64 string.', base64OutputHint: 'The converted result will appear here.', base64EmptyInput: 'Enter text or load a sample first.',
    invalidBase64: 'The Base64 string is invalid.', invalidUtf8: 'The Base64 data is not valid UTF-8 text.',
    encodingSuccess: 'Encoded UTF-8 text as Base64.', decodingSuccess: 'Decoded Base64 as UTF-8 text.',
    swapped: 'Swapped the input and output.', downloadText: 'Download text',
    urlToolLabel: 'URL component encoder and decoder', urlEncode: 'Encode', urlDecode: 'Decode',
    urlInputHint: 'Enter text to use as one part of a URL.', urlOutputHint: 'The converted result will appear here.',
    urlEmptyInput: 'Enter text or load a sample first.', urlInvalidEscape: 'The percent-encoded string is invalid.',
    urlInvalidUnicode: 'The input contains an invalid Unicode character.', urlEncodeSuccess: 'Encoded text as a URL component.',
    urlDecodeSuccess: 'Decoded the URL component as text.', urlComponentNotice: 'This handles one URL component, not a full URL. Spaces become %20, and + remains a literal plus sign.',
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
    base64ToolLabel: 'Base64 エンコーダーとデコーダー', encode: 'エンコード', decode: 'デコード', swap: '入力と結果を入れ替え', urlSafe: 'URL-safe Base64',
    base64InputHint: 'UTF-8 テキストまたは Base64 文字列を入力します。', base64OutputHint: '変換結果をここに表示します。', base64EmptyInput: 'テキストを入力するか、サンプルを読み込んでください。',
    invalidBase64: 'Base64 文字列が正しくありません。', invalidUtf8: 'Base64 データは有効な UTF-8 テキストではありません。',
    encodingSuccess: 'UTF-8 テキストを Base64 にエンコードしました。', decodingSuccess: 'Base64 を UTF-8 テキストにデコードしました。',
    swapped: '入力と結果を入れ替えました。', downloadText: 'テキストをダウンロード',
    urlToolLabel: 'URL component エンコーダーとデコーダー', urlEncode: 'エンコード', urlDecode: 'デコード',
    urlInputHint: 'URL の一部として使うテキストを入力します。', urlOutputHint: '変換結果をここに表示します。',
    urlEmptyInput: 'テキストを入力するか、サンプルを読み込んでください。', urlInvalidEscape: 'パーセントエンコード文字列が正しくありません。',
    urlInvalidUnicode: '入力に正しくない Unicode 文字があります。', urlEncodeSuccess: 'テキストを URL component にエンコードしました。',
    urlDecodeSuccess: 'URL component をテキストにデコードしました。', urlComponentNotice: '完全な URL ではなく、1 つの component を処理します。空白は %20 になり、+ はそのまま保持します。',
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
    base64ToolLabel: 'Base64 编码和解码工具', encode: '编码', decode: '解码', swap: '交换输入和结果', urlSafe: 'URL-safe Base64',
    base64InputHint: '输入 UTF-8 文本或 Base64 字符串。', base64OutputHint: '转换结果会显示在这里。', base64EmptyInput: '请输入文本或载入示例。',
    invalidBase64: 'Base64 字符串无效。', invalidUtf8: 'Base64 数据不是有效的 UTF-8 文本。',
    encodingSuccess: '已将 UTF-8 文本编码为 Base64。', decodingSuccess: '已将 Base64 解码为 UTF-8 文本。',
    swapped: '已交换输入和结果。', downloadText: '下载文本',
    urlToolLabel: 'URL component 编码和解码工具', urlEncode: '编码', urlDecode: '解码',
    urlInputHint: '输入要作为 URL 单个部分使用的文本。', urlOutputHint: '转换结果会显示在这里。',
    urlEmptyInput: '请输入文本或载入示例。', urlInvalidEscape: '百分号编码字符串无效。',
    urlInvalidUnicode: '输入中包含无效的 Unicode 字符。', urlEncodeSuccess: '已将文本编码为 URL component。',
    urlDecodeSuccess: '已将 URL component 解码为文本。', urlComponentNotice: '此工具处理单个 URL component，不解析完整 URL。空格会编码为 %20，+ 符号会保留为普通字符。',
  },
};
