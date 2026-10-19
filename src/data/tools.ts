import type { Locale } from '@/i18n/config';

export type ToolCategory = 'format' | 'encoding' | 'security' | 'time' | 'text' | 'generator' | 'data';

export type ToolDefinition = {
  id: string;
  slug: string;
  category: ToolCategory;
  icon: string;
  order: number;
  relatedToolIds: string[];
  name: Record<Locale, string>;
  keywords: Record<Locale, string[]>;
};

export const toolRegistry: ToolDefinition[] = [
  {
    id: 'json-formatter', slug: 'json-formatter', category: 'format', icon: '{ }', order: 1,
    relatedToolIds: ['yaml-json', 'jwt-decoder', 'text-diff'],
    name: { ko: 'JSON 포맷터', en: 'JSON Formatter', ja: 'JSONフォーマッター', zh: 'JSON 格式化工具' },
    keywords: { ko: ['정렬', '검증', '미니파이'], en: ['format', 'validate', 'minify'], ja: ['整形', '検証', '圧縮'], zh: ['格式化', '校验', '压缩'] },
  },
  {
    id: 'sql-formatter', slug: 'sql-formatter', category: 'format', icon: 'SQL', order: 2,
    relatedToolIds: ['json-formatter', 'text-diff', 'yaml-json'],
    name: { ko: 'SQL 포맷터', en: 'SQL Formatter', ja: 'SQLフォーマッター', zh: 'SQL 格式化工具' },
    keywords: { ko: ['쿼리', '정렬', 'MySQL Oracle'], en: ['query', 'format', 'MySQL Oracle'], ja: ['クエリ', '整形', 'MySQL Oracle'], zh: ['查询', '格式化', 'MySQL Oracle'] },
  },
  {
    id: 'jwt-decoder', slug: 'jwt-decoder', category: 'security', icon: 'JWT', order: 3,
    relatedToolIds: ['json-formatter', 'base64', 'hash-generator'],
    name: { ko: 'JWT 디코더', en: 'JWT Decoder', ja: 'JWTデコーダー', zh: 'JWT 解码器' },
    keywords: { ko: ['토큰', 'claim', 'Base64URL'], en: ['token', 'claims', 'Base64URL'], ja: ['トークン', 'クレーム', 'Base64URL'], zh: ['令牌', '声明', 'Base64URL'] },
  },
  {
    id: 'cron-generator', slug: 'cron-generator', category: 'generator', icon: '*/', order: 4,
    relatedToolIds: ['unix-timestamp', 'regex-tester', 'uuid-generator'],
    name: { ko: 'Cron 생성기', en: 'Cron Generator', ja: 'Cron 生成ツール', zh: 'Cron 生成器' },
    keywords: { ko: ['예약 작업', '스케줄', 'Linux'], en: ['schedule', 'expression', 'Linux'], ja: ['スケジュール', '定期実行', 'Linux'], zh: ['计划任务', '定时', 'Linux'] },
  },
  {
    id: 'text-diff', slug: 'text-diff', category: 'text', icon: '±', order: 5,
    relatedToolIds: ['json-formatter', 'sql-formatter', 'regex-tester'],
    name: { ko: '텍스트 비교', en: 'Text Diff', ja: 'テキスト差分', zh: '文本差异对比' },
    keywords: { ko: ['차이', '비교', 'diff'], en: ['compare', 'changes', 'diff'], ja: ['比較', '変更点', 'diff'], zh: ['比较', '差异', 'diff'] },
  },
  {
    id: 'base64', slug: 'base64', category: 'encoding', icon: '64', order: 6,
    relatedToolIds: ['url-encoder', 'jwt-decoder', 'hash-generator'],
    name: { ko: 'Base64 인코더 / 디코더', en: 'Base64 Encoder / Decoder', ja: 'Base64 エンコード / デコード', zh: 'Base64 编码 / 解码' },
    keywords: { ko: ['UTF-8', '텍스트', '변환'], en: ['UTF-8', 'text', 'encode'], ja: ['UTF-8', 'テキスト', '変換'], zh: ['UTF-8', '文本', '转换'] },
  },
  {
    id: 'url-encoder', slug: 'url-encoder', category: 'encoding', icon: 'URL', order: 7,
    relatedToolIds: ['base64', 'json-formatter', 'jwt-decoder'],
    name: { ko: 'URL 인코더 / 디코더', en: 'URL Encoder / Decoder', ja: 'URL エンコード / デコード', zh: 'URL 编码 / 解码' },
    keywords: { ko: ['퍼센트 인코딩', '쿼리', 'URI'], en: ['percent encoding', 'query', 'URI'], ja: ['パーセントエンコード', 'クエリ', 'URI'], zh: ['百分号编码', '查询参数', 'URI'] },
  },
  {
    id: 'unix-timestamp', slug: 'unix-timestamp', category: 'time', icon: 'UTC', order: 8,
    relatedToolIds: ['cron-generator', 'uuid-generator', 'hash-generator'],
    name: { ko: 'Unix 타임스탬프 변환기', en: 'Unix Timestamp Converter', ja: 'Unix タイムスタンプ変換', zh: 'Unix 时间戳转换器' },
    keywords: { ko: ['epoch', '날짜', '시간대'], en: ['epoch', 'date', 'timezone'], ja: ['epoch', '日時', 'タイムゾーン'], zh: ['epoch', '日期', '时区'] },
  },
  {
    id: 'uuid-generator', slug: 'uuid-generator', category: 'generator', icon: 'ID', order: 9,
    relatedToolIds: ['hash-generator', 'unix-timestamp', 'cron-generator'],
    name: { ko: 'UUID 생성기', en: 'UUID Generator', ja: 'UUID 生成ツール', zh: 'UUID 生成器' },
    keywords: { ko: ['GUID', 'v4', '식별자'], en: ['GUID', 'v4', 'identifier'], ja: ['GUID', 'v4', '識別子'], zh: ['GUID', 'v4', '标识符'] },
  },
  {
    id: 'hash-generator', slug: 'hash-generator', category: 'security', icon: '#', order: 10,
    relatedToolIds: ['base64', 'jwt-decoder', 'uuid-generator'],
    name: { ko: '해시 생성기', en: 'Hash Generator', ja: 'ハッシュ生成ツール', zh: '哈希生成器' },
    keywords: { ko: ['SHA-256', 'SHA-384', 'SHA-512'], en: ['SHA-256', 'SHA-384', 'SHA-512'], ja: ['SHA-256', 'SHA-384', 'SHA-512'], zh: ['SHA-256', 'SHA-384', 'SHA-512'] },
  },
  {
    id: 'regex-tester', slug: 'regex-tester', category: 'text', icon: '.*', order: 11,
    relatedToolIds: ['text-diff', 'cron-generator', 'json-formatter'],
    name: { ko: '정규식 테스터', en: 'Regex Tester', ja: '正規表現テスター', zh: '正则表达式测试器' },
    keywords: { ko: ['패턴', '매칭', '캡처 그룹'], en: ['pattern', 'match', 'capture groups'], ja: ['パターン', '一致', 'キャプチャグループ'], zh: ['模式', '匹配', '捕获组'] },
  },
  {
    id: 'yaml-json', slug: 'yaml-json', category: 'data', icon: 'Y↔J', order: 12,
    relatedToolIds: ['json-formatter', 'sql-formatter', 'text-diff'],
    name: { ko: 'YAML ↔ JSON 변환기', en: 'YAML ↔ JSON Converter', ja: 'YAML ↔ JSON 変換', zh: 'YAML ↔ JSON 转换器' },
    keywords: { ko: ['설정', '직렬화', '변환'], en: ['configuration', 'serialize', 'convert'], ja: ['設定', 'シリアライズ', '変換'], zh: ['配置', '序列化', '转换'] },
  },
];

export const toolById = (id: string) => toolRegistry.find((tool) => tool.id === id);
export const toolBySlug = (slug: string) => toolRegistry.find((tool) => tool.slug === slug);
