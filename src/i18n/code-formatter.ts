import type { Locale } from './config';

export type CodeFormatterMessages = {
  toolLabel: string;
  languageLabel: string;
  themeLabel: string;
  indentLabel: string;
  inputLabel: string;
  inputHint: string;
  sample: string;
  format: string;
  clear: string;
  copy: string;
  saveImage: string;
  emptyInput: string;
  tooLarge: string;
  unsupported: string;
  formatting: string;
  formatSuccess: string;
  formatError: string;
  copied: string;
  copyError: string;
  imageSaved: string;
  imageError: string;
  sampleLoaded: string;
  cleared: string;
  phpNotice: string;
  goNotice: string;
  localNotice: string;
  shortcut: string;
};

export const codeFormatterMessages: Record<Locale, CodeFormatterMessages> = {
  ko: {
    toolLabel: '코드 포맷터', languageLabel: '언어', themeLabel: '색상 테마', indentLabel: '들여쓰기',
    inputLabel: '입력 코드', inputHint: '코드를 붙여넣거나 예제를 불러오세요.',
    sample: '예제 불러오기', format: '코드 정렬', clear: '초기화', copy: '코드 복사', saveImage: '이미지 저장',
    emptyInput: '포맷할 코드를 입력하세요.', tooLarge: '코드가 1 MiB 제한을 초과했습니다.', unsupported: '이 언어는 자동 포맷을 지원하지 않습니다.',
    formatting: '코드를 정렬하고 있습니다…', formatSuccess: '코드를 정렬했습니다.', formatError: '코드를 정렬하지 못했습니다. 문법과 입력 내용을 확인하세요.',
    copied: '코드를 클립보드에 복사했습니다.', copyError: '복사에 실패했습니다. 브라우저 권한을 확인하세요.',
    imageSaved: '코드 이미지를 저장했습니다.', imageError: '이미지를 만들지 못했습니다. 잠시 후 다시 시도하세요.',
    sampleLoaded: '선택한 언어 예제를 불러왔습니다.', cleared: '입력 코드를 초기화했습니다.',
    phpNotice: 'PHP 포맷은 PHP 코드 전용입니다. HTML과 PHP가 섞인 파일은 결과를 확인하세요.',
    goNotice: 'Go는 gofmt 표준 들여쓰기 규칙을 따르므로 들여쓰기 선택을 적용하지 않습니다.',
    localNotice: '모든 코드는 브라우저에서 처리되며 서버로 전송되지 않습니다.', shortcut: '⌘/Ctrl + Enter로 정렬',
  },
  en: {
    toolLabel: 'Code formatter', languageLabel: 'Language', themeLabel: 'Color theme', indentLabel: 'Indentation',
    inputLabel: 'Input code', inputHint: 'Paste code or load an example.',
    sample: 'Load example', format: 'Format code', clear: 'Clear', copy: 'Copy code', saveImage: 'Save image',
    emptyInput: 'Enter code to format.', tooLarge: 'Code exceeds the 1 MiB limit.', unsupported: 'Automatic formatting is not available for this language.',
    formatting: 'Formatting code…', formatSuccess: 'Code formatted.', formatError: 'Could not format this code. Check its syntax and input.',
    copied: 'Code copied to the clipboard.', copyError: 'Could not copy. Check browser permissions.',
    imageSaved: 'Code image saved.', imageError: 'Could not create the image. Try again in a moment.',
    sampleLoaded: 'Loaded an example for the selected language.', cleared: 'Input code cleared.',
    phpNotice: 'PHP formatting is intended for PHP-only code. Review files that mix HTML and PHP.',
    goNotice: 'Go follows gofmt’s standard indentation, so the indentation setting does not apply.',
    localNotice: 'All code is processed in your browser and is never sent to a server.', shortcut: 'Format with ⌘/Ctrl + Enter',
  },
  ja: {
    toolLabel: 'コードフォーマッター', languageLabel: '言語', themeLabel: 'カラーテーマ', indentLabel: 'インデント',
    inputLabel: '入力コード', inputHint: 'コードを貼り付けるか、サンプルを読み込みます。',
    sample: 'サンプルを読み込む', format: 'コードを整形', clear: 'クリア', copy: 'コードをコピー', saveImage: '画像を保存',
    emptyInput: '整形するコードを入力してください。', tooLarge: 'コードが 1 MiB の上限を超えています。', unsupported: 'この言語の自動整形には対応していません。',
    formatting: 'コードを整形しています…', formatSuccess: 'コードを整形しました。', formatError: 'コードを整形できませんでした。構文と入力内容を確認してください。',
    copied: 'コードをクリップボードにコピーしました。', copyError: 'コピーできませんでした。ブラウザーの権限を確認してください。',
    imageSaved: 'コード画像を保存しました。', imageError: '画像を作成できませんでした。少し待ってから再試行してください。',
    sampleLoaded: '選択した言語のサンプルを読み込みました。', cleared: '入力コードをクリアしました。',
    phpNotice: 'PHP 専用コードの整形を想定しています。HTML と PHP が混在するファイルは結果を確認してください。',
    goNotice: 'Go は gofmt 標準のインデントを使うため、インデント設定は適用されません。',
    localNotice: 'コードはすべてブラウザー内で処理され、サーバーへ送信されません。', shortcut: '⌘/Ctrl + Enter で整形',
  },
  zh: {
    toolLabel: '代码格式化工具', languageLabel: '语言', themeLabel: '颜色主题', indentLabel: '缩进',
    inputLabel: '输入代码', inputHint: '粘贴代码或载入示例。',
    sample: '载入示例', format: '格式化代码', clear: '清空', copy: '复制代码', saveImage: '保存图片',
    emptyInput: '请输入要格式化的代码。', tooLarge: '代码超过 1 MiB 限制。', unsupported: '此语言暂不支持自动格式化。',
    formatting: '正在格式化代码…', formatSuccess: '代码已格式化。', formatError: '无法格式化代码，请检查语法和输入内容。',
    copied: '代码已复制到剪贴板。', copyError: '复制失败，请检查浏览器权限。',
    imageSaved: '代码图片已保存。', imageError: '无法生成图片，请稍后重试。',
    sampleLoaded: '已载入所选语言的示例。', cleared: '已清空输入代码。',
    phpNotice: 'PHP 格式化适用于纯 PHP 代码。对于 HTML 与 PHP 混合文件，请检查结果。',
    goNotice: 'Go 遵循 gofmt 标准缩进，因此缩进设置不会生效。',
    localNotice: '所有代码都在浏览器中处理，不会发送到服务器。', shortcut: '按 ⌘/Ctrl + Enter 格式化',
  },
};
