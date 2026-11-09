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
      <p className="guide-link"><Link href={`/${locale}/workflows/`}>{labels.workflowStudio}<span aria-hidden="true"> →</span></Link></p>
      <section className="content-section" aria-labelledby="tool-reference-heading">
        <h2 id="tool-reference-heading">{labels.toolCollectionTitle}</h2>
        <ul className="guide-list">
          {toolRegistry.map((tool) => (
            <li key={tool.slug}>
              <Link href={`/${locale}/tools/${tool.slug}/`}><span className="tool-glyph" aria-hidden="true">{tool.icon}</span><span><strong>{tool.name[locale]}</strong><small>{toolContentSummary(locale, tool.slug)}</small></span><span aria-hidden="true">→</span></Link>
            </li>
          ))}
        </ul>
      </section>
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
    'json-pointer': 'RFC 6901 경로로 응답 JSON의 중첩 값을 찾는 방법', 'csv-json': '따옴표가 있는 CSV와 JSON 배열을 변환하는 방법',
    'url-inspector': '중복 쿼리를 보존하며 URL 구성 요소를 분석하는 방법', 'html-entities': 'HTML 문자 참조를 텍스트로 인코딩하고 디코딩하는 방법',
    'json-schema-validator': 'Draft 2020-12 스키마로 JSON 응답의 필수 필드와 타입을 검사하는 방법',
    'openapi-explorer': '외부 요청 없이 OpenAPI 3.2 문서의 작업과 매개변수를 살펴보는 방법',
    'curl-fetch-converter': '지원하는 cURL 옵션을 검토 가능한 Fetch 코드로 바꾸는 방법',
    'http-header-inspector': '붙여 넣은 HTTP 응답 헤더에서 보안·캐시 설정을 점검하는 방법',
    'env-diff': '.env의 값은 숨기고 키 존재와 빈 값만 비교하는 방법',
    'gitignore-tester': '저장소 상대 경로와 .gitignore 예외 패턴을 시험하는 방법',
    'har-scrubber': 'HAR 1.2의 알려진 민감 필드를 가린 후 직접 검토하는 방법',
    'markdown-link-checker': '선택한 Markdown 파일의 로컬 경로와 제목 앵커를 확인하는 방법',
  },
  en: {
    'json-formatter': 'Validate JSON and choose readable indentation', 'sql-formatter': 'Format SQL clauses without running a query',
    'jwt-decoder': 'Inspect JWT claims without verifying a signature', 'cron-generator': 'Build Linux five-field schedules and inspect run times',
    'text-diff': 'Compare line changes between two text blocks', base64: 'Encode and decode UTF-8 text as Base64',
    'url-encoder': 'Percent-encode a URL component safely', 'unix-timestamp': 'Convert seconds, milliseconds, and dates by time zone',
    'uuid-generator': 'Generate UUID v4 values with Web Crypto', 'hash-generator': 'Calculate SHA-2 digests in the browser',
    'regex-tester': 'Inspect JavaScript matches and capture groups', 'yaml-json': 'Convert YAML and JSON in both directions',
    'code-formatter': 'Format code with selectable themes and save it as an image',
    'json-pointer': 'Find nested response values with RFC 6901 paths', 'csv-json': 'Convert quoted CSV and JSON arrays',
    'url-inspector': 'Inspect URL components while preserving repeated query keys', 'html-entities': 'Encode and decode HTML character references as text',
    'json-schema-validator': 'Check required fields and JSON types with a Draft 2020-12 schema',
    'openapi-explorer': 'Inspect operations and parameters in OpenAPI 3.2 without network requests',
    'curl-fetch-converter': 'Convert supported cURL options into reviewable Fetch code',
    'http-header-inspector': 'Review security and caching headers from pasted HTTP responses',
    'env-diff': 'Compare .env key presence and empty values without showing values',
    'gitignore-tester': 'Test repository-relative paths against .gitignore patterns and exceptions',
    'har-scrubber': 'Redact known sensitive fields in HAR 1.2 for manual review',
    'markdown-link-checker': 'Check local paths and heading anchors across selected Markdown files',
  },
  ja: {
    'json-formatter': 'JSON の検証と読みやすいインデント', 'sql-formatter': 'SQL を実行せず句と字下げを整形',
    'jwt-decoder': '署名検証を行わず JWT claim を確認', 'cron-generator': 'Linux 5 フィールドの実行時刻を確認',
    'text-diff': '2 つのテキストの行差分を比較', base64: 'UTF-8 テキストを Base64 に変換',
    'url-encoder': 'URL コンポーネントをパーセントエンコード', 'unix-timestamp': '秒・ミリ秒と日時をタイムゾーン別に変換',
    'uuid-generator': 'Web Crypto で UUID v4 を生成', 'hash-generator': 'ブラウザーで SHA-2 digest を計算',
    'regex-tester': 'JavaScript の一致とキャプチャを確認', 'yaml-json': 'YAML と JSON を双方向に変換',
    'code-formatter': 'テーマを選んでコードを整形し、画像として保存',
    'json-pointer': 'RFC 6901 パスで JSON のネストした値を確認', 'csv-json': '引用符付き CSV と JSON 配列を変換',
    'url-inspector': '重複したクエリを保って URL 要素を解析', 'html-entities': 'HTML 文字参照をテキストとして変換',
    'json-schema-validator': 'Draft 2020-12 スキーマで JSON の必須項目と型を検証',
    'openapi-explorer': 'ネットワーク要求なしで OpenAPI 3.2 の操作とパラメーターを確認',
    'curl-fetch-converter': '対応する cURL オプションを確認可能な Fetch コードに変換',
    'http-header-inspector': '貼り付けた HTTP 応答のセキュリティとキャッシュヘッダーを確認',
    'env-diff': '.env の値を表示せずキーの有無と空値を比較',
    'gitignore-tester': 'リポジトリ相対パスを .gitignore と例外パターンで検査',
    'har-scrubber': 'HAR 1.2 の既知の機密フィールドをマスキングして確認',
    'markdown-link-checker': '選択した Markdown ファイルのローカルパスと見出しアンカーを検査',
  },
  zh: {
    'json-formatter': '校验 JSON 并设置易读缩进', 'sql-formatter': '整理 SQL 子句但不执行查询',
    'jwt-decoder': '查看 JWT 声明但不验证签名', 'cron-generator': '创建 Linux 五字段计划并查看执行时间',
    'text-diff': '逐行比较两段文本的变化', base64: '将 UTF-8 文本编码或解码为 Base64',
    'url-encoder': '安全地对 URL 组件进行百分号编码', 'unix-timestamp': '按时区转换秒、毫秒和日期',
    'uuid-generator': '使用 Web Crypto 生成 UUID v4', 'hash-generator': '在浏览器中计算 SHA-2 摘要',
    'regex-tester': '查看 JavaScript 匹配项和捕获组', 'yaml-json': '双向转换 YAML 与 JSON',
    'code-formatter': '选择主题格式化代码并保存为图片',
    'json-pointer': '使用 RFC 6901 路径查找嵌套 JSON 值', 'csv-json': '转换带引号字段的 CSV 与 JSON 数组',
    'url-inspector': '保留重复查询键并分析 URL 组成部分', 'html-entities': '以文本形式编码和解码 HTML 字符引用',
    'json-schema-validator': '使用 Draft 2020-12 Schema 检查 JSON 必填字段和类型',
    'openapi-explorer': '无需网络请求即可查看 OpenAPI 3.2 操作和参数',
    'curl-fetch-converter': '将支持的 cURL 选项转换为可检查的 Fetch 代码',
    'http-header-inspector': '检查粘贴的 HTTP 响应中的安全和缓存标头',
    'env-diff': '隐藏 .env 值，只比较键是否存在以及是否为空',
    'gitignore-tester': '根据 .gitignore 模式和例外规则测试仓库相对路径',
    'har-scrubber': '遮盖 HAR 1.2 中已知敏感字段以便人工复核',
    'markdown-link-checker': '检查所选 Markdown 文件中的本地路径和标题锚点',
  },
};
