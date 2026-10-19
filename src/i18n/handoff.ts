import type { Locale } from '@/i18n/config';

export const handoffMessages: Record<Locale, { openJson: string; openYaml: string; openPayload: string; received: string }> = {
  ko: {
    openJson: 'JSON 포맷터에서 열기',
    openYaml: 'YAML 변환기로 열기',
    openPayload: 'Payload를 JSON 포맷터에서 열기',
    received: '입력을 브라우저 메모리에서 전달받았습니다. 실행 전에 확인하세요.',
  },
  en: {
    openJson: 'Open in JSON formatter',
    openYaml: 'Open in YAML converter',
    openPayload: 'Open payload in JSON formatter',
    received: 'Input received in browser memory. Review it before running.',
  },
  ja: {
    openJson: 'JSON フォーマッターで開く',
    openYaml: 'YAML 変換ツールで開く',
    openPayload: 'Payload を JSON フォーマッターで開く',
    received: '入力をブラウザーのメモリで受け取りました。実行前に確認してください。',
  },
  zh: {
    openJson: '在 JSON 格式化工具中打开',
    openYaml: '在 YAML 转换工具中打开',
    openPayload: '在 JSON 格式化工具中打开 Payload',
    received: '已在浏览器内存中接收输入。运行前请先检查。',
  },
};
