import type { Locale } from '@/i18n/config';

export type ToolCategory = 'format' | 'encoding' | 'security' | 'time' | 'text' | 'generator' | 'data';
export type ToolSlug = 'json-formatter' | 'sql-formatter' | 'jwt-decoder' | 'cron-generator' | 'text-diff' | 'base64' | 'url-encoder' | 'unix-timestamp' | 'uuid-generator' | 'hash-generator' | 'regex-tester' | 'yaml-json';
export const toolSlugs: readonly ToolSlug[] = ['json-formatter', 'sql-formatter', 'jwt-decoder', 'cron-generator', 'text-diff', 'base64', 'url-encoder', 'unix-timestamp', 'uuid-generator', 'hash-generator', 'regex-tester', 'yaml-json'];

export type ToolDefinition = {
  id: ToolSlug;
  slug: ToolSlug;
  category: ToolCategory;
  icon: string;
  order: number;
  relatedToolIds: ToolSlug[];
  name: Record<Locale, string>;
  keywords: Record<Locale, string[]>;
};

export const toolRegistry: ToolDefinition[] = [
  {
    id: 'json-formatter', slug: 'json-formatter', category: 'format', icon: '{ }', order: 1,
    relatedToolIds: ['yaml-json', 'jwt-decoder', 'text-diff'],
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
