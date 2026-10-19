import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, locales, type Locale } from '@/i18n/config';

export const dynamicParams = false;

const sections = ['guides', 'about', 'privacy', 'terms', 'contact'] as const;
type Section = (typeof sections)[number];

const sectionCopy: Record<Locale, Record<Section, { title: string; body: string }>> = {
  ko: {
    guides: { title: '개발 도구 가이드', body: '각 도구의 입력 형식, 안전한 사용법, 자주 생기는 오류를 설명하는 가이드를 제공합니다.' },
    about: { title: 'DevDesk 소개', body: 'DevDesk는 개발자가 자주 쓰는 작은 변환·검증 작업을 브라우저에서 간단히 처리하도록 만든 무료 도구 모음입니다.' },
    privacy: { title: '개인정보처리방침', body: '도구 입력은 브라우저 안에서 처리되며 DevDesk의 변환 서버로 전송되지 않습니다. 정적 호스팅 과정에서 기본 접속 로그가 생길 수 있고, 광고·분석은 현재 비활성 상태입니다.' },
    terms: { title: '이용약관 및 면책', body: '도구 결과는 참고용이며 데이터베이스 쿼리의 실행이나 보안 검증을 대신하지 않습니다. 중요한 데이터는 결과를 별도로 검토한 뒤 사용하세요.' },
    contact: { title: '문의', body: '운영자 연락처가 아직 설정되지 않았습니다. 공개 전에 실제 문의 주소와 개인정보 안내를 추가해야 합니다.' },
  },
  en: {
    guides: { title: 'Developer tool guides', body: 'Guides explain input formats, safe usage, and common errors for each utility.' },
    about: { title: 'About DevDesk', body: 'DevDesk is a free collection of small conversion and validation tools for everyday development work, processed in your browser.' },
    privacy: { title: 'Privacy policy', body: 'Tool inputs are processed in your browser and are not sent to a DevDesk conversion server. Static hosting may create basic access logs. Advertising and analytics are currently disabled.' },
    terms: { title: 'Terms and disclaimer', body: 'Tool output is provided as a convenience and does not execute database queries or verify security. Review important results before using them.' },
    contact: { title: 'Contact', body: 'An operator contact address has not been configured. Add a real contact address and review privacy disclosures before launch.' },
  },
  ja: {
    guides: { title: '開発ツールガイド', body: '各ツールの入力形式、安全な使い方、よくあるエラーを解説します。' },
    about: { title: 'DevDesk について', body: 'DevDesk は日々の開発で使う小さな変換・検証作業をブラウザー内で行える無料ツール集です。' },
    privacy: { title: 'プライバシーポリシー', body: '入力データはブラウザー内で処理され、DevDesk の変換サーバーには送信されません。静的ホスティングの基本アクセスログが記録される場合があります。広告と分析は現在無効です。' },
    terms: { title: '利用規約と免責事項', body: 'ツールの出力は参考情報です。データベースクエリの実行やセキュリティ検証は行いません。重要な結果は確認してから使用してください。' },
    contact: { title: 'お問い合わせ', body: '運営者の連絡先はまだ設定されていません。公開前に実際の連絡先とプライバシーに関する説明を追加してください。' },
  },
  zh: {
    guides: { title: '开发工具指南', body: '指南将介绍各工具的输入格式、安全用法和常见错误。' },
    about: { title: '关于 DevDesk', body: 'DevDesk 是一组免费的日常开发小工具，可在浏览器中完成常见转换和校验。' },
    privacy: { title: '隐私政策', body: '工具输入在浏览器中处理，不会发送到 DevDesk 转换服务器。静态托管可能会生成基本访问日志。目前广告和分析功能均已关闭。' },
    terms: { title: '使用条款与免责声明', body: '工具结果仅供参考，不会执行数据库查询或验证安全性。重要结果请核对后再使用。' },
    contact: { title: '联系', body: '尚未配置运营者联系地址。正式发布前请填写真实联系地址并完善隐私说明。' },
  },
};

export function generateStaticParams() {
  return locales.flatMap((locale) => sections.map((section) => ({ locale, section })));
}

export default async function SectionPage({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale: rawLocale, section: rawSection } = await params;
  if (!isLocale(rawLocale) || !sections.includes(rawSection as Section)) notFound();
  const section = rawSection as Section;
  const copy = sectionCopy[rawLocale][section];
  return <main className="simple-page"><p className="eyebrow">DEVDESK / {section.toUpperCase()}</p><h1>{copy.title}</h1><p>{copy.body}</p>{section === 'guides' && <Link className="primary-link" href={`/${rawLocale}/tools/`}>{rawLocale === 'ko' ? '도구 목록 보기' : rawLocale === 'ja' ? 'ツール一覧を見る' : rawLocale === 'zh' ? '浏览工具列表' : 'Browse tools'}<span aria-hidden="true">→</span></Link>}</main>;
}
