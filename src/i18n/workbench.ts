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
  timestampToolLabel: string; timestampInputLabel: string; dateTimeInputLabel: string; timeZoneLabel: string;
  timeZoneHint: string; timestampUnitLabel: string; secondsUnit: string; millisecondsUnit: string;
  timestampToDate: string; dateToTimestamp: string; useCurrentTime: string; epochSample: string;
  isoOutputLabel: string; localOutputLabel: string; timestampEmptyInput: string; invalidTimestamp: string;
  invalidDateTime: string; invalidTimeZone: string; nonexistentLocalTime: string; outOfRange: string;
  timestampConverted: string; dateConverted: string; timestampNotice: string;
  uuidToolLabel: string; uuidCountLabel: string; uuidGenerate: string; uuidCountSample: string;
  uuidGenerated: string; uuidInvalidCount: string; uuidUnavailable: string; uuidSecurityNote: string;
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
    timestampToolLabel: 'Unix 타임스탬프 변환기', timestampInputLabel: 'Unix 타임스탬프', dateTimeInputLabel: '날짜와 시간', timeZoneLabel: '시간대',
    timeZoneHint: 'IANA 시간대 사용 (예: Asia/Seoul)', timestampUnitLabel: '타임스탬프 단위', secondsUnit: '초', millisecondsUnit: '밀리초',
    timestampToDate: '날짜로 변환', dateToTimestamp: '타임스탬프로 변환', useCurrentTime: '현재 시간 사용', epochSample: 'Epoch 예제',
    isoOutputLabel: 'ISO 8601', localOutputLabel: '선택한 시간대', timestampEmptyInput: '타임스탬프를 입력하거나 Epoch 예제를 불러오세요.',
    invalidTimestamp: '정수 초 또는 밀리초 타임스탬프를 입력하세요.', invalidDateTime: '올바른 날짜와 시간을 입력하세요.',
    invalidTimeZone: '지원되는 IANA 시간대를 입력하세요.', nonexistentLocalTime: '선택한 시간대에서 존재하지 않는 현지 시간입니다 (서머타임 전환 구간).',
    outOfRange: '날짜가 JavaScript Date 표현 범위를 벗어났습니다.', timestampConverted: '타임스탬프를 날짜와 시간으로 변환했습니다.',
    dateConverted: '날짜와 시간을 타임스탬프로 변환했습니다.', timestampNotice: '초와 밀리초 단위를 직접 선택하세요. 날짜 입력은 선택한 시간대를 따르며, 서머타임으로 존재하지 않는 현지 시간은 거부합니다. 반복되는 시간은 이른 쪽 시각을 사용합니다.',
    uuidToolLabel: 'UUID v4 생성기', uuidCountLabel: '생성 개수 (1–100)', uuidGenerate: 'UUID 생성', uuidCountSample: '개수를 3으로 설정',
    uuidGenerated: '보안 난수 UUID를 생성했습니다.', uuidInvalidCount: '1부터 100까지의 정수를 입력하세요.',
    uuidUnavailable: '이 브라우저는 보안 UUID 생성 기능을 지원하지 않습니다.', uuidSecurityNote: 'crypto.randomUUID는 HTTPS 또는 localhost 같은 보안 컨텍스트가 필요합니다.',
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
    timestampToolLabel: 'Unix timestamp converter', timestampInputLabel: 'Unix timestamp', dateTimeInputLabel: 'Date and time', timeZoneLabel: 'Time zone',
    timeZoneHint: 'Use an IANA time zone (for example, America/New_York).', timestampUnitLabel: 'Timestamp unit', secondsUnit: 'Seconds', millisecondsUnit: 'Milliseconds',
    timestampToDate: 'Convert to date', dateToTimestamp: 'Convert to timestamp', useCurrentTime: 'Use current time', epochSample: 'Epoch sample',
    isoOutputLabel: 'ISO 8601', localOutputLabel: 'Selected time zone', timestampEmptyInput: 'Enter a timestamp or load the epoch sample.',
    invalidTimestamp: 'Enter an integer timestamp in seconds or milliseconds.', invalidDateTime: 'Enter a valid date and time.',
    invalidTimeZone: 'Enter a supported IANA time zone.', nonexistentLocalTime: 'That local time does not exist in the selected time zone because of a daylight-saving transition.',
    outOfRange: 'The date is outside the range supported by JavaScript Date.', timestampConverted: 'Converted the timestamp to a date and time.',
    dateConverted: 'Converted the date and time to a timestamp.', timestampNotice: 'Choose seconds or milliseconds explicitly. Date input uses the selected time zone; nonexistent local times during daylight-saving changes are rejected. Repeated times use the earlier occurrence.',
    uuidToolLabel: 'UUID v4 generator', uuidCountLabel: 'Number to generate (1–100)', uuidGenerate: 'Generate UUIDs', uuidCountSample: 'Set count to 3',
    uuidGenerated: 'Generated cryptographically random UUIDs.', uuidInvalidCount: 'Enter a whole number from 1 to 100.',
    uuidUnavailable: 'This browser does not support secure UUID generation.', uuidSecurityNote: 'crypto.randomUUID requires a secure context such as HTTPS or localhost.',
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
    timestampToolLabel: 'Unix タイムスタンプ変換ツール', timestampInputLabel: 'Unix タイムスタンプ', dateTimeInputLabel: '日付と時刻', timeZoneLabel: 'タイムゾーン',
    timeZoneHint: 'IANA タイムゾーンを入力します (例: Asia/Tokyo)。', timestampUnitLabel: 'タイムスタンプの単位', secondsUnit: '秒', millisecondsUnit: 'ミリ秒',
    timestampToDate: '日付に変換', dateToTimestamp: 'タイムスタンプに変換', useCurrentTime: '現在時刻を使う', epochSample: 'Epoch の例',
    isoOutputLabel: 'ISO 8601', localOutputLabel: '選択したタイムゾーン', timestampEmptyInput: 'タイムスタンプを入力するか、Epoch の例を読み込みます。',
    invalidTimestamp: '秒またはミリ秒の整数タイムスタンプを入力してください。', invalidDateTime: '正しい日付と時刻を入力してください。',
    invalidTimeZone: '対応する IANA タイムゾーンを入力してください。', nonexistentLocalTime: '選択したタイムゾーンに存在しない現地時刻です (夏時間の切り替え)。',
    outOfRange: '日付が JavaScript Date の表現範囲外です。', timestampConverted: 'タイムスタンプを日付と時刻に変換しました。',
    dateConverted: '日付と時刻をタイムスタンプに変換しました。', timestampNotice: '秒とミリ秒を明示的に選びます。日付入力は選択したタイムゾーンに従い、夏時間で存在しない時刻は拒否します。重複する時刻は早い方を使います。',
    uuidToolLabel: 'UUID v4 生成ツール', uuidCountLabel: '生成数 (1–100)', uuidGenerate: 'UUID を生成', uuidCountSample: '生成数を 3 に設定',
    uuidGenerated: '暗号学的に安全な UUID を生成しました。', uuidInvalidCount: '1 から 100 までの整数を入力してください。',
    uuidUnavailable: 'このブラウザーは安全な UUID 生成に対応していません。', uuidSecurityNote: 'crypto.randomUUID には HTTPS や localhost などのセキュアコンテキストが必要です。',
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
    timestampToolLabel: 'Unix 时间戳转换工具', timestampInputLabel: 'Unix 时间戳', dateTimeInputLabel: '日期和时间', timeZoneLabel: '时区',
    timeZoneHint: '输入 IANA 时区 (例如 Asia/Shanghai)。', timestampUnitLabel: '时间戳单位', secondsUnit: '秒', millisecondsUnit: '毫秒',
    timestampToDate: '转换为日期', dateToTimestamp: '转换为时间戳', useCurrentTime: '使用当前时间', epochSample: 'Epoch 示例',
    isoOutputLabel: 'ISO 8601', localOutputLabel: '所选时区', timestampEmptyInput: '请输入时间戳或载入 Epoch 示例。',
    invalidTimestamp: '请输入整数秒或毫秒时间戳。', invalidDateTime: '请输入有效的日期和时间。',
    invalidTimeZone: '请输入受支持的 IANA 时区。', nonexistentLocalTime: '该时区中不存在这个本地时间 (夏令时切换时段)。',
    outOfRange: '日期超出 JavaScript Date 的表示范围。', timestampConverted: '已将时间戳转换为日期和时间。',
    dateConverted: '已将日期和时间转换为时间戳。', timestampNotice: '请明确选择秒或毫秒。日期输入使用所选时区；夏令时切换中不存在的本地时间会被拒绝。重复时间使用较早的时刻。',
    uuidToolLabel: 'UUID v4 生成工具', uuidCountLabel: '生成数量 (1–100)', uuidGenerate: '生成 UUID', uuidCountSample: '将数量设为 3',
    uuidGenerated: '已生成密码学安全的 UUID。', uuidInvalidCount: '请输入 1 到 100 之间的整数。',
    uuidUnavailable: '此浏览器不支持安全的 UUID 生成。', uuidSecurityNote: 'crypto.randomUUID 需要 HTTPS 或 localhost 等安全上下文。',
  },
};
