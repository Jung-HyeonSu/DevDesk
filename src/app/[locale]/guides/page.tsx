import type { Metadata } from 'next';
import Link from 'next/link';
import { toolRegistry } from '@/data/tools';
import { contentLabels } from '@/i18n/content';
import { isLocale, type Locale } from '@/i18n/config';
import { localizedMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';

const guideDescriptions: Record<Locale, string> = {
  ko: '도구별 입력 형식, 사용 방법, 경계 조건과 개인정보 유의사항을 확인할 수 있습니다.',
  en: 'Read practical guidance on each tool’s input format, steps, edge cases, and privacy limits.',
  ja: '各ツールの入力形式、手順、境界条件、プライバシー上の注意を解説します。',
  zh: '了解各工具的输入格式、操作步骤、边界情况和隐私限制。',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const labels = contentLabels[rawLocale];
  return localizedMetadata(rawLocale, '/guides', labels.guideIndexTitle, guideDescriptions[rawLocale]);
}

export default async function GuideIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const labels = contentLabels[locale];
  return (
    <main className="simple-page guide-index">
      <p className="eyebrow">DEVDESK / GUIDES</p>
      <h1>{labels.guideIndexTitle}</h1>
      <p>{labels.guideIndexDescription}</p>
      <ul className="guide-list">
        {toolRegistry.map((tool) => (
          <li key={tool.slug}>
            <Link href={`/${locale}/guides/${tool.slug}/`}><span className="tool-glyph" aria-hidden="true">{tool.icon}</span><span><strong>{tool.name[locale]}</strong><small>{toolContentSummary(locale, tool.slug)}</small></span><span aria-hidden="true">→</span></Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

function toolContentSummary(locale: Locale, slug: (typeof toolRegistry)[number]['slug']) {
  return descriptionsByTool[locale][slug];
}

const descriptionsByTool: Record<Locale, Record<(typeof toolRegistry)[number]['slug'], string>> = {
  ko: {
    'json-formatter': 'JSON 문법을 검사하고 들여쓰기를 정리하는 방법', 'sql-formatter': 'SQL 절과 들여쓰기를 읽기 쉽게 정리하는 방법',
    'jwt-decoder': 'JWT 헤더와 페이로드를 안전하게 확인하는 방법', 'cron-generator': 'Linux 5필드 일정과 실행 시각을 확인하는 방법',
    'text-diff': '두 텍스트의 줄 단위 변경 사항을 비교하는 방법', base64: 'UTF-8 텍스트를 Base64로 변환하는 방법',
    'url-encoder': 'URL 구성 요소를 퍼센트 인코딩하는 방법', 'unix-timestamp': '초·밀리초와 날짜를 시간대별로 변환하는 방법',
    'uuid-generator': 'Web Crypto로 UUID v4를 생성하는 방법', 'hash-generator': 'SHA-2 digest를 브라우저에서 계산하는 방법',
    'regex-tester': 'JavaScript 정규식과 캡처 그룹을 점검하는 방법', 'yaml-json': 'YAML과 JSON을 안전하게 양방향 변환하는 방법',
    'code-formatter': '여러 언어의 코드를 색상 테마로 정렬하고 이미지로 저장하는 방법',
  },
  en: {
    'json-formatter': 'Validate JSON and choose readable indentation', 'sql-formatter': 'Format SQL clauses without running a query',
    'jwt-decoder': 'Inspect JWT claims without verifying a signature', 'cron-generator': 'Build Linux five-field schedules and inspect run times',
    'text-diff': 'Compare line changes between two text blocks', base64: 'Encode and decode UTF-8 text as Base64',
    'url-encoder': 'Percent-encode a URL component safely', 'unix-timestamp': 'Convert seconds, milliseconds, and dates by time zone',
    'uuid-generator': 'Generate UUID v4 values with Web Crypto', 'hash-generator': 'Calculate SHA-2 digests in the browser',
    'regex-tester': 'Inspect JavaScript matches and capture groups', 'yaml-json': 'Convert YAML and JSON in both directions',
    'code-formatter': 'Format code with selectable themes and save it as an image',
  },
  ja: {
    'json-formatter': 'JSON の検証と読みやすいインデント', 'sql-formatter': 'SQL を実行せず句と字下げを整形',
    'jwt-decoder': '署名検証を行わず JWT claim を確認', 'cron-generator': 'Linux 5 フィールドの実行時刻を確認',
    'text-diff': '2 つのテキストの行差分を比較', base64: 'UTF-8 テキストを Base64 に変換',
    'url-encoder': 'URL コンポーネントをパーセントエンコード', 'unix-timestamp': '秒・ミリ秒と日時をタイムゾーン別に変換',
    'uuid-generator': 'Web Crypto で UUID v4 を生成', 'hash-generator': 'ブラウザーで SHA-2 digest を計算',
    'regex-tester': 'JavaScript の一致とキャプチャを確認', 'yaml-json': 'YAML と JSON を双方向に変換',
    'code-formatter': 'テーマを選んでコードを整形し、画像として保存',
  },
  zh: {
    'json-formatter': '校验 JSON 并设置易读缩进', 'sql-formatter': '整理 SQL 子句但不执行查询',
    'jwt-decoder': '查看 JWT 声明但不验证签名', 'cron-generator': '创建 Linux 五字段计划并查看执行时间',
    'text-diff': '逐行比较两段文本的变化', base64: '将 UTF-8 文本编码或解码为 Base64',
    'url-encoder': '安全地对 URL 组件进行百分号编码', 'unix-timestamp': '按时区转换秒、毫秒和日期',
    'uuid-generator': '使用 Web Crypto 生成 UUID v4', 'hash-generator': '在浏览器中计算 SHA-2 摘要',
    'regex-tester': '查看 JavaScript 匹配项和捕获组', 'yaml-json': '双向转换 YAML 与 JSON',
    'code-formatter': '选择主题格式化代码并保存为图片',
  },
};
