import type { Locale } from '@/i18n/config';

export type ToolCategory = 'format' | 'encoding' | 'security' | 'time' | 'text' | 'generator' | 'data';
export type ToolSlug = 'json-formatter' | 'sql-formatter' | 'jwt-decoder' | 'cron-generator' | 'text-diff' | 'base64' | 'url-encoder' | 'unix-timestamp' | 'uuid-generator' | 'hash-generator' | 'regex-tester' | 'yaml-json' | 'code-formatter' | 'json-pointer' | 'csv-json' | 'url-inspector' | 'html-entities' | 'json-schema-validator' | 'openapi-explorer' | 'curl-fetch-converter' | 'http-header-inspector' | 'env-diff' | 'gitignore-tester' | 'har-scrubber' | 'markdown-link-checker';
export const toolSlugs: readonly ToolSlug[] = ['json-formatter', 'sql-formatter', 'jwt-decoder', 'cron-generator', 'text-diff', 'base64', 'url-encoder', 'unix-timestamp', 'uuid-generator', 'hash-generator', 'regex-tester', 'yaml-json', 'code-formatter', 'json-pointer', 'csv-json', 'url-inspector', 'html-entities', 'json-schema-validator', 'openapi-explorer', 'curl-fetch-converter', 'http-header-inspector', 'env-diff', 'gitignore-tester', 'har-scrubber', 'markdown-link-checker'];

export type ToolDefinition = {
  id: ToolSlug;
  slug: ToolSlug;
  category: ToolCategory;
  icon: string;
  order: number;
  relatedToolIds: ToolSlug[];
  name: Record<Locale, string>;
  keywords: Record<Locale, string[]>;
  workflowAdapterId?: string;
};

export const toolRegistry: ToolDefinition[] = [
  {
    id: 'json-formatter', slug: 'json-formatter', category: 'format', icon: '{ }', order: 1,
    relatedToolIds: ['yaml-json', 'jwt-decoder', 'text-diff'], workflowAdapterId: 'json-formatter',
    name: { ko: 'JSON 포맷터', en: 'JSON Formatter', ja: 'JSONフォーマッター', zh: 'JSON 格式化工具' },
    keywords: {
      ko: ['정렬', '포맷', '검증', '유효성 검사', '미니파이', '압축', 'JSON beautifier', 'JSON formatter', 'JSON validator'],
      en: ['format', 'formatting', 'beautify', 'validate', 'validation', 'minify', 'compress', 'JSON 포맷터'],
      ja: ['整形', 'フォーマット', '検証', '圧縮', 'JSON formatter', 'JSON validator'],
      zh: ['格式化', '格式校验', '校验', '压缩', 'JSON formatter', 'JSON validator'],
    },
  },
  {
    id: 'sql-formatter', slug: 'sql-formatter', category: 'format', icon: 'SQL', order: 2,
    relatedToolIds: ['json-formatter', 'text-diff', 'yaml-json'],
    name: { ko: 'SQL 포맷터', en: 'SQL Formatter', ja: 'SQLフォーマッター', zh: 'SQL 格式化工具' },
    keywords: {
      ko: ['SQL 쿼리', '쿼리 포맷터', '정렬', '포맷', 'SQL formatter', 'MySQL', 'PostgreSQL', 'Oracle'],
      en: ['query', 'format', 'formatting', 'beautify', 'SQL 쿼리', 'MySQL Oracle', 'PostgreSQL'],
      ja: ['SQL クエリ', 'クエリ', '整形', 'フォーマット', 'MySQL', 'PostgreSQL', 'Oracle'],
      zh: ['SQL 查询', '查询格式化', '格式化', 'MySQL', 'PostgreSQL', 'Oracle'],
    },
  },
  {
    id: 'jwt-decoder', slug: 'jwt-decoder', category: 'security', icon: 'JWT', order: 3,
    relatedToolIds: ['json-formatter', 'base64', 'hash-generator'],
    name: { ko: 'JWT 디코더', en: 'JWT Decoder', ja: 'JWTデコーダー', zh: 'JWT 解码器' },
    keywords: {
      ko: ['JWT 디코딩', 'JWT 토큰', '토큰', '디코더', '디코딩', 'decode', 'decoder', 'claim', 'payload', 'header', 'Base64URL'],
      en: ['token', 'claims', 'decode', 'decoder', 'payload', 'header', 'JWT 디코더', 'Base64URL'],
      ja: ['JWT トークン', 'デコード', 'ペイロード', 'ヘッダー', 'claim', 'Base64URL'],
      zh: ['JWT 令牌', '解码', '载荷', '标头', '声明', 'Base64URL'],
    },
  },
  {
    id: 'cron-generator', slug: 'cron-generator', category: 'generator', icon: '*/', order: 4,
    relatedToolIds: ['unix-timestamp', 'regex-tester', 'uuid-generator'],
    name: { ko: 'Cron 생성기', en: 'Cron Generator', ja: 'Cron 生成ツール', zh: 'Cron 生成器' },
    keywords: {
      ko: ['예약 작업', '크론', 'cron 표현식', 'crontab', '스케줄', '실행 일정', 'Linux cron', 'schedule'],
      en: ['schedule', 'scheduled task', 'cron expression', 'crontab', 'Linux', '예약 작업'],
      ja: ['cron 式', 'cron 表現', '定期実行', 'スケジュール', 'Linux'],
      zh: ['cron 表达式', '计划任务', '定时任务', 'crontab', 'Linux'],
    },
  },
  {
    id: 'text-diff', slug: 'text-diff', category: 'text', icon: '±', order: 5,
    relatedToolIds: ['json-formatter', 'sql-formatter', 'regex-tester'],
    name: { ko: '텍스트 비교', en: 'Text Diff', ja: 'テキスト差分', zh: '文本差异对比' },
    keywords: {
      ko: ['차이', '비교', '변경 비교', '문자열 비교', 'diff', 'difference', 'compare'],
      en: ['compare', 'comparison', 'changes', 'difference', 'diff', '텍스트 비교'],
      ja: ['差分', '比較', 'テキスト比較', '変更点', 'diff', 'compare'],
      zh: ['比较', '差异', '文本对比', '改动', 'diff', 'compare'],
    },
  },
  {
    id: 'base64', slug: 'base64', category: 'encoding', icon: '64', order: 6,
    relatedToolIds: ['url-encoder', 'jwt-decoder', 'hash-generator'],
    name: { ko: 'Base64 인코더 / 디코더', en: 'Base64 Encoder / Decoder', ja: 'Base64 エンコード / デコード', zh: 'Base64 编码 / 解码' },
    keywords: {
      ko: ['UTF-8', '텍스트', '변환', '인코더', '디코더', '인코딩', '디코딩', 'encoder', 'decoder', 'encode', 'decode'],
      en: ['UTF-8', 'text', 'encoder', 'decoder', 'encode', 'decode', '인코더', '디코더'],
      ja: ['UTF-8', 'テキスト', '変換', 'エンコーダー', 'デコーダー', 'encode', 'decode', 'encoder', 'decoder'],
      zh: ['UTF-8', '文本', '转换', '编码器', '解码器', 'encode', 'decode', 'encoder', 'decoder'],
    },
  },
  {
    id: 'url-encoder', slug: 'url-encoder', category: 'encoding', icon: 'URL', order: 7,
    relatedToolIds: ['base64', 'json-formatter', 'jwt-decoder'],
    name: { ko: 'URL 인코더 / 디코더', en: 'URL Encoder / Decoder', ja: 'URL エンコード / デコード', zh: 'URL 编码 / 解码' },
    keywords: {
      ko: ['URL 인코딩', 'URL 인코더', 'URL 디코더', '인코더', '디코더', '인코딩', '디코딩', 'percent encoding', 'query', 'URI'],
      en: ['percent encoding', 'query', 'URI', 'URL encoder', 'URL decoder', 'encoder', 'decoder', 'encode', 'decode', '인코더', '디코더'],
      ja: ['パーセントエンコード', 'URL エンコーダー', 'URL デコーダー', 'エンコーダー', 'デコーダー', 'encode', 'decode', 'クエリ', 'URI'],
      zh: ['百分号编码', 'URL 编码器', 'URL 解码器', '编码器', '解码器', 'encode', 'decode', '查询参数', 'URI'],
    },
  },
  {
    id: 'unix-timestamp', slug: 'unix-timestamp', category: 'time', icon: 'UTC', order: 8,
    relatedToolIds: ['cron-generator', 'uuid-generator', 'hash-generator'],
    name: { ko: 'Unix 타임스탬프 변환기', en: 'Unix Timestamp Converter', ja: 'Unix タイムスタンプ変換', zh: 'Unix 时间戳转换器' },
    keywords: {
      ko: ['epoch', '날짜', '시간대', 'timestamp', '유닉스 시간', '초', '밀리초', '날짜 변환'],
      en: ['epoch', 'date', 'timezone', 'timestamp conversion', 'seconds', 'milliseconds', 'Unix time'],
      ja: ['epoch', '日時', 'タイムゾーン', 'タイムスタンプ', '秒', 'ミリ秒'],
      zh: ['epoch', '日期', '时区', 'Unix 时间戳', '秒', '毫秒', '时间转换'],
    },
  },
  {
    id: 'uuid-generator', slug: 'uuid-generator', category: 'generator', icon: 'ID', order: 9,
    relatedToolIds: ['hash-generator', 'unix-timestamp', 'cron-generator'],
    name: { ko: 'UUID 생성기', en: 'UUID Generator', ja: 'UUID 生成ツール', zh: 'UUID 生成器' },
    keywords: {
      ko: ['GUID', 'v4', '식별자', 'ID 생성', '고유 ID', 'generate UUID'],
      en: ['GUID', 'v4', 'identifier', 'unique ID', '고유 ID'],
      ja: ['GUID', 'v4', '識別子', '一意 ID', 'UUID 生成'],
      zh: ['GUID', 'v4', '标识符', '唯一 ID', 'UUID 生成'],
    },
  },
  {
    id: 'hash-generator', slug: 'hash-generator', category: 'security', icon: '#', order: 10,
    relatedToolIds: ['base64', 'jwt-decoder', 'uuid-generator'],
    name: { ko: '해시 생성기', en: 'Hash Generator', ja: 'ハッシュ生成ツール', zh: '哈希生成器' },
    keywords: {
      ko: ['SHA', 'SHA-256', 'SHA-384', 'SHA-512', '해시', '다이제스트', 'hash', 'digest'],
      en: ['SHA', 'SHA-256', 'SHA-384', 'SHA-512', 'hash', 'digest', '해시'],
      ja: ['SHA', 'SHA-256', 'SHA-384', 'SHA-512', 'ハッシュ', 'ダイジェスト'],
      zh: ['SHA', 'SHA-256', 'SHA-384', 'SHA-512', '哈希', '摘要'],
    },
  },
  {
    id: 'regex-tester', slug: 'regex-tester', category: 'text', icon: '.*', order: 11,
    relatedToolIds: ['text-diff', 'cron-generator', 'json-formatter'],
    name: { ko: '정규식 테스터', en: 'Regex Tester', ja: '正規表現テスター', zh: '正则表达式测试器' },
    keywords: {
      ko: ['정규표현식', '정규식', '패턴', '매칭', '캡처 그룹', 'regular expression', 'regex', 'match'],
      en: ['pattern', 'match', 'matching', 'capture groups', 'regular expression', '정규식'],
      ja: ['正規表現', 'パターン', '一致', 'マッチ', 'キャプチャグループ', 'regex'],
      zh: ['正则表达式', '模式', '匹配', '捕获组', 'regex'],
    },
  },
  {
    id: 'yaml-json', slug: 'yaml-json', category: 'data', icon: 'Y↔J', order: 12,
    relatedToolIds: ['json-formatter', 'sql-formatter', 'text-diff'],
    name: { ko: 'YAML ↔ JSON 변환기', en: 'YAML ↔ JSON Converter', ja: 'YAML ↔ JSON 変換', zh: 'YAML ↔ JSON 转换器' },
    keywords: {
      ko: ['설정', '직렬화', '변환', 'YAML to JSON', 'JSON to YAML', 'yaml json'],
      en: ['configuration', 'serialize', 'convert', 'YAML to JSON', 'JSON to YAML', '설정'],
      ja: ['設定', 'シリアライズ', '変換', '相互変換', 'YAML to JSON', 'JSON to YAML'],
      zh: ['配置', '序列化', '转换', 'YAML 转 JSON', 'JSON 转 YAML'],
    },
  },
  {
    id: 'code-formatter', slug: 'code-formatter', category: 'format', icon: '</>', order: 13,
    relatedToolIds: ['json-formatter', 'sql-formatter', 'yaml-json'],
    name: { ko: '코드 포맷터', en: 'Code Formatter', ja: 'コードフォーマッター', zh: '代码格式化工具' },
    keywords: {
      ko: ['코드 정렬', '코드 포맷', '코드 포맷터', '구문 강조', '색상 테마', '코드 이미지', 'code beautifier', 'code formatter'],
      en: ['format code', 'code formatter', 'code beautifier', 'syntax highlighting', 'color theme', 'save code as image'],
      ja: ['コード整形', 'コードフォーマット', '構文強調表示', 'カラーテーマ', 'コード画像', 'beautifier'],
      zh: ['代码格式化', '代码美化', '语法高亮', '颜色主题', '代码图片', 'beautifier'],
    },
  },
  {
    id: 'json-pointer', slug: 'json-pointer', category: 'data', icon: '#/', order: 14,
    relatedToolIds: ['json-formatter', 'yaml-json', 'csv-json'],
    name: { ko: 'JSON Pointer 탐색기', en: 'JSON Pointer Inspector', ja: 'JSON Pointer 検査ツール', zh: 'JSON Pointer 检查器' },
    keywords: {
      ko: ['JSON 경로', 'JSON 포인터', '중첩 값 찾기', 'RFC 6901', 'JSON Pointer'],
      en: ['JSON path', 'nested value', 'RFC 6901', 'JSON Pointer', 'inspect JSON'],
      ja: ['JSON パス', 'ネスト値', 'RFC 6901', 'JSON Pointer'],
      zh: ['JSON 路径', '嵌套值', 'RFC 6901', 'JSON Pointer'],
    },
  },
  {
    id: 'csv-json', slug: 'csv-json', category: 'data', icon: 'CSV', order: 15,
    relatedToolIds: ['json-formatter', 'json-pointer', 'yaml-json'],
    name: { ko: 'CSV ↔ JSON 변환기', en: 'CSV ↔ JSON Converter', ja: 'CSV ↔ JSON 変換', zh: 'CSV ↔ JSON 转换器' },
    keywords: {
      ko: ['CSV JSON 변환', 'TSV', '쉼표 구분', '표 데이터', 'CSV to JSON'],
      en: ['CSV to JSON', 'JSON to CSV', 'TSV', 'delimited data', 'spreadsheet export'],
      ja: ['CSV JSON 変換', 'TSV', '区切りテキスト', '表データ'],
      zh: ['CSV JSON 转换', 'TSV', '分隔文本', '表格数据'],
    },
  },
  {
    id: 'url-inspector', slug: 'url-inspector', category: 'data', icon: 'URL·', order: 16,
    relatedToolIds: ['url-encoder', 'json-formatter', 'base64'],
    name: { ko: 'URL 분석기', en: 'URL Inspector', ja: 'URL 構成チェッカー', zh: 'URL 结构检查器' },
    keywords: {
      ko: ['URL 파서', 'URL 구성 요소', '쿼리 매개변수', '중복 파라미터', 'URL parser'],
      en: ['URL parser', 'query parameters', 'URL components', 'duplicate query keys', 'inspect URL'],
      ja: ['URL パーサー', 'クエリパラメーター', 'URL 構成要素', '重複キー'],
      zh: ['URL 解析器', '查询参数', 'URL 组成部分', '重复参数'],
    },
  },
  {
    id: 'html-entities', slug: 'html-entities', category: 'encoding', icon: '&;', order: 17,
    relatedToolIds: ['url-encoder', 'code-formatter', 'json-formatter'],
    name: { ko: 'HTML 엔티티 변환기', en: 'HTML Entity Encoder / Decoder', ja: 'HTML エンティティ変換', zh: 'HTML 实体编码 / 解码' },
    keywords: {
      ko: ['HTML 이스케이프', 'HTML 엔티티', '문자 인코딩', '특수 문자', 'escape HTML'],
      en: ['HTML escape', 'HTML entities', 'special characters', 'escape HTML', 'decode entities'],
      ja: ['HTML エスケープ', 'HTML エンティティ', '特殊文字', '文字参照'],
      zh: ['HTML 转义', 'HTML 实体', '特殊字符', '字符引用'],
    },
  },
  {
    id: 'json-schema-validator', slug: 'json-schema-validator', category: 'data', icon: '{✓}', order: 18,
    relatedToolIds: ['openapi-explorer', 'json-formatter', 'json-pointer'], workflowAdapterId: 'json-schema-validator',
    name: { ko: 'JSON Schema 검사기', en: 'JSON Schema Validator', ja: 'JSON Schema 検証ツール', zh: 'JSON Schema 验证器' },
    keywords: {
      ko: ['JSON Schema 검증', 'Draft 2020-12', 'API 계약', '필수 필드', '스키마 검사'],
      en: ['JSON Schema validation', 'Draft 2020-12', 'API contract', 'required fields', 'schema validator'],
      ja: ['JSON Schema 検証', 'Draft 2020-12', 'API 契約', '必須フィールド'],
      zh: ['JSON Schema 验证', 'Draft 2020-12', 'API 契约', '必填字段'],
    },
  },
  {
    id: 'openapi-explorer', slug: 'openapi-explorer', category: 'data', icon: 'OAS', order: 19,
    relatedToolIds: ['json-schema-validator', 'curl-fetch-converter', 'http-header-inspector'], workflowAdapterId: 'openapi-explorer',
    name: { ko: 'OpenAPI 탐색기', en: 'OpenAPI Explorer', ja: 'OpenAPI エクスプローラー', zh: 'OpenAPI 浏览器' },
    keywords: {
      ko: ['OpenAPI 3.2', 'Swagger', 'API 명세', '엔드포인트 목록', '요청 응답'],
      en: ['OpenAPI 3.2', 'Swagger', 'API specification', 'endpoint catalog', 'request response'],
      ja: ['OpenAPI 3.2', 'Swagger', 'API 仕様', 'エンドポイント一覧'],
      zh: ['OpenAPI 3.2', 'Swagger', 'API 规范', '端点目录'],
    },
  },
  {
    id: 'curl-fetch-converter', slug: 'curl-fetch-converter', category: 'encoding', icon: 'c↔f', order: 20,
    relatedToolIds: ['openapi-explorer', 'url-inspector', 'http-header-inspector'], workflowAdapterId: 'curl-fetch-converter',
    name: { ko: 'cURL ↔ Fetch 변환기', en: 'cURL ↔ Fetch Converter', ja: 'cURL ↔ Fetch 変換ツール', zh: 'cURL ↔ Fetch 转换器' },
    keywords: {
      ko: ['curl fetch 변환', 'HTTP 요청 코드', '명령 변환', '브라우저 fetch'],
      en: ['curl to fetch', 'HTTP request code', 'command converter', 'browser fetch'],
      ja: ['curl fetch 変換', 'HTTP リクエストコード', 'コマンド変換'],
      zh: ['curl 转 fetch', 'HTTP 请求代码', '命令转换'],
    },
  },
  {
    id: 'http-header-inspector', slug: 'http-header-inspector', category: 'security', icon: 'H↦', order: 21,
    relatedToolIds: ['curl-fetch-converter', 'url-inspector', 'har-scrubber'], workflowAdapterId: 'http-header-inspector',
    name: { ko: 'HTTP 헤더 진단기', en: 'HTTP Header Inspector', ja: 'HTTP ヘッダー検査ツール', zh: 'HTTP 标头检查器' },
    keywords: {
      ko: ['CORS 검사', 'HTTP 응답 헤더', 'Cache-Control', '보안 헤더', 'CORS 오류'],
      en: ['CORS checker', 'HTTP response headers', 'Cache-Control', 'security headers'],
      ja: ['CORS 検査', 'HTTP レスポンスヘッダー', 'セキュリティヘッダー'],
      zh: ['CORS 检查', 'HTTP 响应标头', '安全标头'],
    },
  },
  {
    id: 'env-diff', slug: 'env-diff', category: 'data', icon: '.env', order: 22,
    relatedToolIds: ['yaml-json', 'gitignore-tester', 'json-formatter'], workflowAdapterId: 'env-diff',
    name: { ko: '.env 키 비교기', en: '.env Key Diff', ja: '.env キー比較', zh: '.env 键对比' },
    keywords: {
      ko: ['환경 변수 비교', '환경 설정 차이', '키 누락', 'dotenv', '배포 설정'],
      en: ['environment variable diff', 'configuration drift', 'missing keys', 'dotenv', 'deployment config'],
      ja: ['環境変数比較', '設定差分', 'キー不足', 'dotenv'],
      zh: ['环境变量对比', '配置漂移', '缺失键', 'dotenv'],
    },
  },
  {
    id: 'gitignore-tester', slug: 'gitignore-tester', category: 'text', icon: 'git', order: 23,
    relatedToolIds: ['env-diff', 'code-formatter', 'markdown-link-checker'], workflowAdapterId: 'gitignore-tester',
    name: { ko: '.gitignore 검사기', en: '.gitignore Tester', ja: '.gitignore テスター', zh: '.gitignore 测试器' },
    keywords: {
      ko: ['Git ignore 패턴', '무시 규칙 테스트', '파일 제외', 'gitignore tester'],
      en: ['Git ignore patterns', 'ignore rule tester', 'exclude files', 'gitignore debugger'],
      ja: ['Git ignore パターン', '除外ルール検査', 'gitignore'],
      zh: ['Git ignore 模式', '忽略规则测试', '排除文件'],
    },
  },
  {
    id: 'har-scrubber', slug: 'har-scrubber', category: 'security', icon: 'HAR', order: 24,
    relatedToolIds: ['http-header-inspector', 'json-schema-validator', 'text-diff'], workflowAdapterId: 'har-scrubber',
    name: { ko: 'HAR 개인정보 가림 도구', en: 'HAR Privacy Scrubber', ja: 'HAR プライバシー加工', zh: 'HAR 隐私信息遮盖器' },
    keywords: {
      ko: ['HAR 익명화', '네트워크 로그 정리', '쿠키 가리기', '토큰 제거', 'HAR scrubber'],
      en: ['HAR redaction', 'network log scrubber', 'mask cookies', 'redact tokens'],
      ja: ['HAR マスキング', 'ネットワークログ', 'Cookie 削除', 'トークン秘匿'],
      zh: ['HAR 脱敏', '网络日志清理', '遮盖 Cookie', '隐藏令牌'],
    },
  },
  {
    id: 'markdown-link-checker', slug: 'markdown-link-checker', category: 'text', icon: 'MD↗', order: 25,
    relatedToolIds: ['gitignore-tester', 'code-formatter', 'env-diff'], workflowAdapterId: 'markdown-link-checker',
    name: { ko: 'Markdown 링크 검사기', en: 'Markdown Link Checker', ja: 'Markdown リンク検査', zh: 'Markdown 链接检查器' },
    keywords: {
      ko: ['Markdown 링크 확인', '앵커 검사', '문서 링크 오류', '깨진 링크'],
      en: ['Markdown link checker', 'anchor checker', 'documentation links', 'broken local links'],
      ja: ['Markdown リンク検査', 'アンカー確認', 'ドキュメントリンク'],
      zh: ['Markdown 链接检查', '锚点检查', '文档链接'],
    },
  },
];

export const toolById = (id: string) => toolRegistry.find((tool) => tool.id === id);
export const toolBySlug = (slug: string) => toolRegistry.find((tool) => tool.slug === slug);

export function toolMatchesSearch(tool: ToolDefinition, query: string, locale: Locale) {
  const search = query.trim().toLocaleLowerCase(locale);
  if (!search) return true;

  const searchableText = [
    tool.id,
    tool.slug,
    ...Object.values(tool.name),
    ...Object.values(tool.keywords).flat(),
  ].join(' ').toLocaleLowerCase(locale);

  return searchableText.includes(search);
}
