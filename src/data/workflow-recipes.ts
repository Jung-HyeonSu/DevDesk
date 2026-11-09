import type { Locale } from '@/i18n/config';
import type { WorkflowAdapterId } from '@/lib/tools/workflow-adapters';

export const workflowRecipeSlugs = ['api-contract-triage', 'release-config-preflight', 'har-issue-prep'] as const;
export type WorkflowRecipeSlug = (typeof workflowRecipeSlugs)[number];

export type WorkflowNode = { id: string; adapterId: WorkflowAdapterId };
export type WorkflowEdge = { fromNodeId: string; fromPortId: 'output'; toNodeId: string; toPortId: string };
export type WorkflowRecipe = {
  id: WorkflowRecipeSlug;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export const workflowRecipes: WorkflowRecipe[] = [
  {
    id: 'api-contract-triage',
    title: {
      ko: 'API 계약 빠른 진단', en: 'API contract triage', ja: 'API 契約の一次診断', zh: 'API 契约快速诊断',
    },
    description: {
      ko: '응답 JSON을 Draft 2020-12 스키마로 검사하고, 오류 보고서를 읽기 쉬운 JSON으로 정리합니다.',
      en: 'Validate a response against a Draft 2020-12 schema, then format the diagnostic report as readable JSON.',
      ja: 'Draft 2020-12 スキーマで応答 JSON を検証し、診断結果を読みやすく整形します。',
      zh: '使用 Draft 2020-12 Schema 校验响应 JSON，并格式化诊断报告。',
    },
    nodes: [{ id: 'validate-response', adapterId: 'json-schema-validator' }, { id: 'format-report', adapterId: 'json-formatter' }],
    edges: [{ fromNodeId: 'validate-response', fromPortId: 'output', toNodeId: 'format-report', toPortId: 'json' }],
  },
  {
    id: 'release-config-preflight',
    title: {
      ko: '배포 설정 사전 점검', en: 'Release configuration preflight', ja: 'リリース設定の事前確認', zh: '发布配置预检',
    },
    description: {
      ko: '두 환경의 키 누락·빈 값을 비교하고, 후보 저장소 경로가 .gitignore에 걸리는지 확인합니다.',
      en: 'Compare missing or empty environment keys and test candidate repository paths against .gitignore patterns.',
      ja: '環境変数キーの不足・空値を比較し、候補パスが .gitignore に一致するか確認します。',
      zh: '比较环境变量键的缺失和空值，并检查候选路径是否匹配 .gitignore。',
    },
    nodes: [
      { id: 'compare-env', adapterId: 'env-diff' },
      { id: 'format-env-report', adapterId: 'json-formatter' },
      { id: 'test-ignore-rules', adapterId: 'gitignore-tester' },
    ],
    edges: [{ fromNodeId: 'compare-env', fromPortId: 'output', toNodeId: 'format-env-report', toPortId: 'json' }],
  },
  {
    id: 'har-issue-prep',
    title: {
      ko: 'HAR 이슈 제보 준비', en: 'Prepare a HAR issue report', ja: 'HAR を使った不具合報告の準備', zh: '准备 HAR 问题报告',
    },
    description: {
      ko: 'HAR 1.2의 민감해 보이는 값을 가린 뒤, 결과를 공유 전 검토하기 쉬운 JSON으로 정리합니다.',
      en: 'Redact likely sensitive values from HAR 1.2, then format the result for a careful review before sharing.',
      ja: 'HAR 1.2 の機密らしい値をマスキングし、共有前に確認しやすい JSON に整形します。',
      zh: '遮盖 HAR 1.2 中可能敏感的值，再格式化结果以便分享前复核。',
    },
    nodes: [{ id: 'scrub-har', adapterId: 'har-scrubber' }, { id: 'format-scrubbed-har', adapterId: 'json-formatter' }],
    edges: [{ fromNodeId: 'scrub-har', fromPortId: 'output', toNodeId: 'format-scrubbed-har', toPortId: 'json' }],
  },
];

export function workflowRecipeBySlug(slug: string): WorkflowRecipe | undefined {
  return workflowRecipes.find((recipe) => recipe.id === slug);
}
