import type { Locale } from './config';

export type ShellMessages = {
  home: string;
  primaryNavigation: string;
  tools: string;
  guides: string;
  search: string;
  searchTools: string;
  searchPlaceholder: string;
  noResults: string;
  close: string;
  theme: string;
  system: string;
  light: string;
  dark: string;
  categories: string;
  favorites: string;
  recent: string;
  allTools: string;
  emptyFavorites: string;
  emptyRecent: string;
  results: string;
  clearSearch: string;
  about: string;
  privacy: string;
  terms: string;
  contact: string;
  menu: string;
  language: string;
  description: string;
  openTool: string;
  addFavorite: string;
  removeFavorite: string;
  categoryNames: Record<'format' | 'encoding' | 'security' | 'time' | 'text' | 'generator' | 'data', string>;
};

export const shellMessages: Record<Locale, ShellMessages> = {
  ko: {
    home: '홈', primaryNavigation: '주요 메뉴', tools: '도구', guides: '가이드', search: '도구 검색', searchTools: '도구 찾기', searchPlaceholder: '도구 이름이나 기능을 입력하세요', noResults: '검색 결과가 없습니다.', close: '닫기',
    theme: '테마', system: '시스템', light: '라이트', dark: '다크', categories: '카테고리', favorites: '즐겨찾기', recent: '최근 사용', allTools: '전체 도구', emptyFavorites: '별표를 눌러 즐겨찾기에 추가하세요.', emptyRecent: '도구를 열면 여기에 표시됩니다.', results: '개 도구', clearSearch: '검색 지우기', about: '소개', privacy: '개인정보', terms: '이용약관', contact: '문의', menu: '메뉴 열기', language: '언어', description: '브라우저에서 안전하게 처리합니다.', openTool: '도구 열기', addFavorite: '즐겨찾기 추가', removeFavorite: '즐겨찾기 해제',
    categoryNames: { format: '포맷', encoding: '인코딩', security: '보안', time: '시간', text: '텍스트', generator: '생성기', data: '데이터' },
  },
  en: {
    home: 'Home', primaryNavigation: 'Main navigation', tools: 'Tools', guides: 'Guides', search: 'Search tools', searchTools: 'Find a tool', searchPlaceholder: 'Search by name or capability', noResults: 'No tools found.', close: 'Close',
    theme: 'Theme', system: 'System', light: 'Light', dark: 'Dark', categories: 'Categories', favorites: 'Favorites', recent: 'Recent', allTools: 'All tools', emptyFavorites: 'Use the star to save a favorite.', emptyRecent: 'Tools you open will appear here.', results: 'tools', clearSearch: 'Clear search', about: 'About', privacy: 'Privacy', terms: 'Terms', contact: 'Contact', menu: 'Open menu', language: 'Language', description: 'Processed safely in your browser.', openTool: 'Open tool', addFavorite: 'Add to favorites', removeFavorite: 'Remove from favorites',
    categoryNames: { format: 'Format', encoding: 'Encoding', security: 'Security', time: 'Time', text: 'Text', generator: 'Generators', data: 'Data' },
  },
  ja: {
    home: 'ホーム', primaryNavigation: 'メインナビゲーション', tools: 'ツール', guides: 'ガイド', search: 'ツールを検索', searchTools: 'ツールを探す', searchPlaceholder: '名前や機能で検索', noResults: 'ツールが見つかりません。', close: '閉じる',
    theme: 'テーマ', system: 'システム', light: 'ライト', dark: 'ダーク', categories: 'カテゴリ', favorites: 'お気に入り', recent: '最近使ったツール', allTools: 'すべてのツール', emptyFavorites: '星印を押すとお気に入りに追加できます。', emptyRecent: '開いたツールがここに表示されます。', results: '件', clearSearch: '検索をクリア', about: 'DevDesk について', privacy: 'プライバシー', terms: '利用規約', contact: 'お問い合わせ', menu: 'メニューを開く', language: '言語', description: 'ブラウザー内で安全に処理します。', openTool: 'ツールを開く', addFavorite: 'お気に入りに追加', removeFavorite: 'お気に入りから削除',
    categoryNames: { format: 'フォーマット', encoding: 'エンコード', security: 'セキュリティ', time: '時間', text: 'テキスト', generator: '生成', data: 'データ' },
  },
  zh: {
    home: '首页', primaryNavigation: '主导航', tools: '工具', guides: '指南', search: '搜索工具', searchTools: '查找工具', searchPlaceholder: '按名称或功能搜索', noResults: '没有找到工具。', close: '关闭',
    theme: '主题', system: '跟随系统', light: '浅色', dark: '深色', categories: '分类', favorites: '收藏', recent: '最近使用', allTools: '全部工具', emptyFavorites: '点击星标即可收藏工具。', emptyRecent: '打开过的工具会显示在这里。', results: '个工具', clearSearch: '清除搜索', about: '关于', privacy: '隐私', terms: '条款', contact: '联系', menu: '打开菜单', language: '语言', description: '在浏览器中安全处理。', openTool: '打开工具', addFavorite: '添加到收藏', removeFavorite: '取消收藏',
    categoryNames: { format: '格式化', encoding: '编码', security: '安全', time: '时间', text: '文本', generator: '生成器', data: '数据' },
  },
};
