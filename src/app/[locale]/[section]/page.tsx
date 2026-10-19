import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { localizedMetadata } from '@/lib/seo';

export const dynamicParams = false;

const sections = ['about', 'privacy', 'terms', 'contact'] as const;
type Section = (typeof sections)[number];
type SectionCopy = { title: string; description: string; paragraphs: string[] };

const sectionCopy: Record<Locale, Record<Section, SectionCopy>> = {
  ko: {
    about: {
      title: 'DevDesk 소개', description: '브라우저에서 안전하게 사용할 수 있는 무료 개발 도구 모음입니다.',
      paragraphs: [
        'DevDesk는 개발자가 자주 하는 포맷팅, 인코딩, 시간 변환, 텍스트 비교 작업을 빠르게 처리하는 정적 웹 도구 모음입니다. 계정이나 백엔드 변환 API 없이 브라우저에서 계산합니다.',
        '도구별 가이드에는 입력 형식, 사용 절차, 경계 조건과 제한을 적습니다. 결과는 편의를 위한 것이므로 데이터베이스 실행이나 보안 검증처럼 별도 확인이 필요한 작업을 대신하지 않습니다.',
        '현재 광고와 분석은 기본 비활성화 상태입니다. 사이트 운영자는 배포 전에 도메인, 연락처, 개인정보 고지와 법적 검토를 완료해야 합니다.',
      ],
    },
    privacy: {
      title: '개인정보처리방침 초안', description: 'DevDesk가 도구 입력과 브라우저 설정을 처리하는 방식을 설명합니다.',
      paragraphs: [
        '도구 입력과 결과는 현재 브라우저에서 처리합니다. DevDesk 변환 서버, 외부 변환 API, 분석 이벤트, URL, 콘솔 로그에 입력 원문을 보내거나 기록하지 않습니다.',
        '테마, 즐겨찾기 도구 ID, 최근 사용 도구 ID 같은 비민감한 환경설정은 브라우저 저장소에 둘 수 있습니다. 도구 간 전달 값은 앱 메모리에 잠시 보관한 뒤 대상 도구가 한 번 읽고 제거하며 URL이나 브라우저 저장소에 기록하지 않습니다. 입력 텍스트와 토큰은 자동 저장하지 않습니다. 정적 호스팅 사업자는 서비스 제공 과정에서 요청 로그를 처리할 수 있습니다.',
        '광고와 분석 스크립트는 현재 비활성 상태이며 분석 도구는 포함되어 있지 않습니다. AdSense 스크립트는 승인, 게시자·슬롯 ID, 지역별 동의 관리 설정을 운영자가 준비하고 빌드 설정으로 활성화한 경우에만 로드됩니다. 활성화 전에 광고 파트너, 쿠키·저장소, 동의·철회 절차, 제3자 제공과 보유 기간을 실제 설정에 맞게 이 방침에 추가해야 합니다.',
        '이 문서는 서비스 구조를 반영한 공개 전 초안이며 법률 자문이 아닙니다. 운영자는 서비스 지역의 법령에 맞춰 검토·수정해야 합니다.',
      ],
    },
    terms: {
      title: '이용약관 및 면책 초안', description: 'DevDesk 도구의 목적과 결과 사용에 관한 기본 안내입니다.',
      paragraphs: [
        'DevDesk 도구는 일반 개발 작업을 돕기 위한 편의 기능입니다. 입력에 대한 계산은 브라우저에서 수행되며, 서비스는 입력과 결과를 보관하지 않습니다.',
        '결과의 정확성, 완전성 또는 특정 목적에 대한 적합성을 보장하지 않습니다. SQL은 실행되지 않고, JWT 서명은 검증되지 않으며, 해시는 암호화나 비밀번호 저장 기능이 아닙니다. 운영 환경에 적용하기 전에 사용자가 결과를 검토하고 독립적으로 확인해야 합니다.',
        '법률이 허용하는 범위에서 사용자는 도구 결과를 검증하고 적절한 백업·보안 절차를 유지할 책임이 있습니다. 이 초안은 법적 검토를 거친 최종 약관이 아니므로 공개 전에 운영자가 관할 법령에 따라 검토해야 합니다.',
      ],
    },
    contact: {
      title: '문의', description: 'DevDesk 운영자에게 연락하는 방법입니다.',
      paragraphs: [
        '서비스 관련 문의는 아래 운영자 연락처를 이용해 주세요.',
      ],
    },
  },
  en: {
    about: {
      title: 'About DevDesk', description: 'A free set of developer utilities designed to run safely in your browser.',
      paragraphs: [
        'DevDesk is a static collection of tools for common formatting, encoding, date conversion, and text comparison tasks. Calculations run in your browser without an account or a backend conversion API.',
        'Each guide explains accepted input, steps, edge cases, and limitations. Results are provided for convenience and do not replace checks such as database execution or security verification.',
        'Advertising and analytics are disabled by default. The operator must configure a real domain and contact address, review privacy disclosures, and obtain legal review before launch.',
      ],
    },
    privacy: {
      title: 'Privacy policy draft', description: 'How DevDesk handles tool inputs and browser preferences.',
      paragraphs: [
        'Tool inputs and results are processed in your browser. DevDesk does not send or record input text in a conversion server, external conversion API, analytics event, URL, or console log.',
        'Non-sensitive preferences such as theme, favorite tool IDs, and recently used tool IDs may be stored in browser storage. Tool-to-tool handoffs are held briefly in application memory and consumed once by the destination; they are not written to a URL or browser storage. Inputs and tokens are not saved automatically. The static hosting provider may process request logs to deliver the site.',
        'Advertising and analytics scripts are disabled, and this build includes no analytics integration. AdSense loads only after the operator supplies an approved publisher ID and slot, marks consent setup ready, and enables it at build time. Before activation, update this policy with the actual ad partners, cookies or storage, consent and withdrawal flow, third-party disclosures, and retention periods.',
        'This draft reflects the current service design; it is not legal advice. The operator must review and adapt it to the laws of the regions where the service is offered.',
      ],
    },
    terms: {
      title: 'Terms and disclaimer draft', description: 'Basic terms for using DevDesk utilities and their output.',
      paragraphs: [
        'DevDesk utilities assist with general development tasks. Calculations run in your browser, and the service does not retain your inputs or results.',
        'The service does not guarantee that output is accurate, complete, or suitable for a particular purpose. SQL is not executed, JWT signatures are not verified, and hashes are not encryption or password-storage functions. Review and independently verify output before using it in production.',
        'To the extent allowed by law, users are responsible for validating results and maintaining suitable backups and security controls. This draft is not a reviewed final agreement; the operator must obtain legal review for the applicable jurisdictions before launch.',
      ],
    },
    contact: {
      title: 'Contact', description: 'How to contact the DevDesk operator.',
      paragraphs: [
        'For service questions, use the operator contact address below.',
      ],
    },
  },
  ja: {
    about: {
      title: 'DevDesk について', description: 'ブラウザー内で安全に利用できる無料の開発ツール集です。',
      paragraphs: [
        'DevDesk は、書式設定、エンコード、日時変換、テキスト比較など、日常の開発作業を支援する静的ウェブツール集です。アカウントやサーバー側の変換 API は不要で、計算はブラウザー内で行います。',
        '各ガイドでは入力形式、手順、境界条件、制限を説明します。結果は利便性のために提供され、データベースでの実行やセキュリティ検証など別途必要な確認を代替しません。',
        '広告と分析は初期状態で無効です。公開前に運営者がドメインと連絡先を設定し、プライバシー表示と法的確認を完了してください。',
      ],
    },
    privacy: {
      title: 'プライバシーポリシー（案）', description: 'ツール入力とブラウザー設定の取り扱いについて説明します。',
      paragraphs: [
        'ツールの入力と結果はブラウザー内で処理します。DevDesk の変換サーバー、外部変換 API、分析イベント、URL、コンソールログに入力内容を送信・記録しません。',
        'テーマ、お気に入りのツール ID、最近使用したツール ID など機密性のない設定をブラウザー保存領域に保存する場合があります。ツール間の受け渡しデータはアプリのメモリに一時保持し、移動先が一度読み取った後に削除します。URL やブラウザー保存領域には記録しません。入力テキストやトークンは自動保存しません。静的ホスティング事業者はサイト提供のためにリクエストログを処理する場合があります。',
        '広告と分析のスクリプトは無効で、分析機能は含まれていません。AdSense は、運営者が承認済みのパブリッシャー ID と広告ユニット ID、地域に応じた同意管理を用意し、ビルド設定で有効にした場合にのみ読み込まれます。有効化前に広告パートナー、Cookie・保存領域、同意と撤回の方法、第三者提供、保存期間を実際の設定に合わせて追記してください。',
        '本ページは現在のサービス構成を反映した公開前の案であり、法律上の助言ではありません。運営者は提供地域の法令に合わせて確認・修正してください。',
      ],
    },
    terms: {
      title: '利用規約・免責事項（案）', description: 'DevDesk ツールと出力の利用に関する基本事項です。',
      paragraphs: [
        'DevDesk のツールは一般的な開発作業を支援します。計算はブラウザー内で行い、入力内容や結果をサービス側に保存しません。',
        '出力の正確性、完全性、特定目的への適合性を保証しません。SQL は実行せず、JWT 署名は検証せず、ハッシュは暗号化やパスワード保存機能ではありません。本番環境に適用する前に、利用者が結果を確認し独立して検証してください。',
        '法律で認められる範囲で、利用者は結果の検証と適切なバックアップ・セキュリティ対策に責任を負います。本案は法的確認済みの最終規約ではないため、公開前に運営者が対象地域の法令に沿って確認してください。',
      ],
    },
    contact: {
      title: 'お問い合わせ', description: 'DevDesk 運営者への連絡方法です。',
      paragraphs: [
        'サービスに関するお問い合わせは、以下の運営者連絡先をご利用ください。',
      ],
    },
  },
  zh: {
    about: {
      title: '关于 DevDesk', description: '一组可在浏览器中安全使用的免费开发工具。',
      paragraphs: [
        'DevDesk 是一组静态网页工具，用于处理常见的格式化、编码、日期转换和文本比较任务。计算在浏览器中完成，无需账号或后端转换 API。',
        '每篇指南都会说明输入格式、操作步骤、边界情况和限制。工具结果仅为提高效率，不会替代数据库执行或安全验证等必要检查。',
        '广告和分析默认关闭。正式发布前，运营者需要配置真实域名和联系地址，完善隐私说明并进行法律审核。',
      ],
    },
    privacy: {
      title: '隐私政策草案', description: '说明 DevDesk 如何处理工具输入和浏览器偏好设置。',
      paragraphs: [
        '工具输入和结果均在浏览器中处理。DevDesk 不会将输入内容发送或记录到转换服务器、外部转换 API、分析事件、URL 或控制台日志中。',
        '主题、收藏工具 ID、最近使用工具 ID 等非敏感偏好可能保存在浏览器存储中。工具间传递的数据会暂存在应用内存中，由目标工具读取一次后清除，不会写入 URL 或浏览器存储。输入文本和令牌不会自动保存。静态托管服务商可能会为提供网站而处理请求日志。',
        '目前广告和分析脚本均已关闭，且此版本不包含分析集成。只有在运营者取得 AdSense 批准、配置发布者 ID 和广告位 ID、完成所在地区的同意管理设置并在构建时启用后，才会加载 AdSense。启用前，必须按实际配置补充广告合作方、Cookie 或存储、同意与撤回流程、第三方披露和数据保留期限。',
        '本页草案反映当前服务结构，不构成法律意见。运营者应根据服务提供地区的法律进行审核和修改。',
      ],
    },
    terms: {
      title: '使用条款与免责声明草案', description: '使用 DevDesk 工具及其结果的基本说明。',
      paragraphs: [
        'DevDesk 工具用于辅助一般开发任务。计算在浏览器中执行，服务不会保存输入或结果。',
        '本服务不保证结果准确、完整或适合特定用途。SQL 不会被执行，JWT 签名不会被验证，哈希也不是加密或密码存储功能。将结果用于生产环境前，请先检查并独立验证。',
        '在法律允许的范围内，用户有责任核验结果并采取适当的备份与安全措施。本草案尚未经过最终法律审查；运营者应在发布前根据适用地区的法律进行审核。',
      ],
    },
    contact: {
      title: '联系', description: '联系 DevDesk 运营者的方法。',
      paragraphs: [
        '如需咨询服务，请使用下方的运营者联系地址。',
      ],
    },
  },
};

export function generateStaticParams() {
  return locales.flatMap((locale) => sections.map((section) => ({ locale, section })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; section: string }> }): Promise<Metadata> {
  const { locale: rawLocale, section: rawSection } = await params;
  if (!isLocale(rawLocale) || !sections.includes(rawSection as Section)) return {};
  const section = rawSection as Section;
  const copy = sectionCopy[rawLocale][section];
  return localizedMetadata(rawLocale, `/${section}`, copy.title, copy.description);
}

export default async function SectionPage({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale: rawLocale, section: rawSection } = await params;
  if (!isLocale(rawLocale) || !sections.includes(rawSection as Section)) notFound();
  const section = rawSection as Section;
  const copy = sectionCopy[rawLocale][section];
  const contactEmail = section === 'contact' ? process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() : undefined;
  const paragraphs = section === 'contact' && !contactEmail ? [] : copy.paragraphs;
  return (
    <main className="simple-page policy-page">
      <p className="eyebrow">DEVDESK / {section.toUpperCase()}</p>
      <h1>{copy.title}</h1>
      {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      {contactEmail && <p><a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>}
    </main>
  );
}
