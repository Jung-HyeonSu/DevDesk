import type { Locale } from './config';

type ContentLabels = {
  backToTools: string; examples: string; example: string; input: string; output: string;
  howTo: string; caution: string; faq: string; related: string; fullGuide: string;
  guideIndexTitle: string; guideIndexDescription: string; guideFor: string; copyExample: string; openTool: string;
};

export const contentLabels: Record<Locale, ContentLabels> = {
  ko: {
    backToTools: '도구 목록', examples: '입력과 출력 예제', example: '예제', input: '입력', output: '출력',
    howTo: '사용 방법', caution: '주의사항과 오류 해결', faq: '자주 묻는 질문', related: '관련 도구',
    fullGuide: '자세한 사용 가이드', guideIndexTitle: '개발 도구 가이드',
    guideIndexDescription: '입력 형식과 실제 사용 방법, 경계 조건, 개인정보 유의사항을 도구별로 확인하세요.',
    guideFor: '사용 가이드', copyExample: '예제 복사', openTool: '도구 열기',
  },
  en: {
    backToTools: 'All tools', examples: 'Input and output examples', example: 'Example', input: 'Input', output: 'Output',
    howTo: 'How to use it', caution: 'Limitations and troubleshooting', faq: 'Frequently asked questions', related: 'Related tools',
    fullGuide: 'Full usage guide', guideIndexTitle: 'Developer tool guides',
    guideIndexDescription: 'Check each tool’s input format, practical steps, edge cases, and privacy notes.',
    guideFor: 'Usage guide', copyExample: 'Copy example', openTool: 'Open tool',
  },
  ja: {
    backToTools: 'ツール一覧', examples: '入力と出力の例', example: '例', input: '入力', output: '出力',
    howTo: '使い方', caution: '注意事項とトラブルシューティング', faq: 'よくある質問', related: '関連ツール',
    fullGuide: '詳しい使い方ガイド', guideIndexTitle: '開発ツールガイド',
    guideIndexDescription: '各ツールの入力形式、使い方、境界条件、プライバシー上の注意を確認できます。',
    guideFor: '使い方ガイド', copyExample: '例をコピー', openTool: 'ツールを開く',
  },
  zh: {
    backToTools: '全部工具', examples: '输入和输出示例', example: '示例', input: '输入', output: '输出',
    howTo: '使用方法', caution: '注意事项与故障排查', faq: '常见问题', related: '相关工具',
    fullGuide: '完整使用指南', guideIndexTitle: '开发工具指南',
    guideIndexDescription: '查看各工具的输入格式、操作步骤、边界情况和隐私注意事项。',
    guideFor: '使用指南', copyExample: '复制示例', openTool: '打开工具',
  },
};

export type ContentLabelKey = keyof ContentLabels;
