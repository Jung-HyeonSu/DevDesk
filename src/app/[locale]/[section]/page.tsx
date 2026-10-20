import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { localizedMetadata } from '@/lib/seo';

export const dynamicParams = false;

const sections = ['about', 'privacy', 'terms', 'contact'] as const;
type Section = (typeof sections)[number];
type PolicyLink = { label: string; href: string; external?: boolean };
type ContentSection = { title: string; paragraphs: string[]; links?: PolicyLink[] };
type SectionCopy = {
  title: string;
  description: string;
  intro: string;
  updatedAt?: string;
  updatedLabel?: string;
  resourceLabel: string;
  content: ContentSection[];
};

const sectionCopy: Record<Locale, Record<Section, SectionCopy>> = {
  ko: {
    about: {
      title: 'DevDesk 소개',
      description: '무료 브라우저 기반 개발 도구와 사용 가이드, 개인정보 보호 원칙을 소개합니다.',
      intro: 'DevDesk는 개발자가 반복해서 하는 작은 작업을 빠르게 처리하도록 만든 무료 브라우저 기반 개발 도구 사이트입니다. 별도 계정이나 설치 없이 각 도구 페이지에서 바로 사용할 수 있습니다.',
      resourceLabel: '관련 페이지',
      content: [
        {
          title: '제공하는 도구',
          paragraphs: [
            'JSON 포맷터, SQL 포맷터, JWT 디코더, Cron 표현식 생성기, 텍스트 비교, Base64 인코더·디코더, URL 인코더·디코더, Unix Timestamp 변환기, UUID 생성기, 해시 생성기, 정규식 테스터, YAML·JSON 변환기를 제공합니다.',
            '각 도구는 한 가지 개발 작업을 명확히 처리하도록 구성했습니다. 도구별 가이드에는 입력 형식, 사용 순서, 실제 예시, 자주 묻는 질문과 기능의 제한을 함께 설명합니다.',
          ],
        },
        {
          title: '사용 방법',
          paragraphs: [
            '홈에서 도구를 검색하거나 카테고리별로 찾아 도구를 엽니다. 입력을 넣고 변환을 실행한 뒤 결과를 확인하고, 도구가 제공하는 복사 또는 다운로드 기능을 사용할 수 있습니다. 즐겨찾기와 최근 사용 목록은 도구를 다시 찾는 데 도움을 줍니다.',
            '한국어, 영어, 일본어, 중국어 간체 페이지를 제공합니다. 언어별 주소를 공유해도 같은 도구와 가이드로 이동할 수 있습니다.',
          ],
        },
        {
          title: '브라우저에서 처리하는 개인정보',
          paragraphs: [
            '도구의 입력과 계산은 사용자의 브라우저에서 처리합니다. DevDesk는 변환을 위해 입력 내용을 자체 서버나 외부 변환 API로 보내지 않으며 입력값을 자동 저장하지 않습니다. 화면 설정과 즐겨찾기처럼 민감하지 않은 일부 선호 정보는 현재 브라우저에 저장될 수 있습니다.',
            '정적 사이트를 제공하는 호스팅 서비스는 페이지 요청을 처리하면서 네트워크·보안 관련 정보를 다룰 수 있습니다. 자세한 내용은 개인정보처리방침에서 확인할 수 있습니다.',
          ],
          links: [
            { label: '개인정보처리방침', href: '/privacy/' },
            { label: '사용 가이드', href: '/guides/' },
          ],
        },
        {
          title: '정확성과 사용 한계',
          paragraphs: [
            'DevDesk는 결과를 편리하게 만들기 위한 도구입니다. SQL 포맷터는 쿼리를 데이터베이스에서 실행하지 않고, JWT 디코더는 서명이나 발급자를 검증하지 않습니다. 해시 생성은 암호화나 비밀번호 저장이 아니며, 정규식·시간·인코딩 결과도 입력과 사용 환경에 따라 별도로 확인해야 합니다.',
            '운영 환경이나 보안에 영향을 주는 작업에 결과를 사용하기 전에는 직접 검토하고 해당 시스템에서 독립적으로 검증해 주세요.',
          ],
        },
        {
          title: '광고와 문의',
          paragraphs: [
            '기본 배포 설정에서는 광고와 분석 기능이 비활성화되어 있습니다. 향후 광고를 표시할 때는 실제 광고 파트너, 쿠키와 유사 기술, 동의 및 선택 방법을 개인정보처리방침에 알리고 적용 지역의 요구사항을 확인합니다.',
            '서비스에 관한 질문이나 개인정보 요청은 문의 페이지를 이용해 주세요.',
          ],
          links: [
            { label: '문의', href: '/contact/' },
            { label: '이용약관', href: '/terms/' },
          ],
        },
      ],
    },
    privacy: {
      title: '개인정보처리방침',
      description: 'DevDesk 도구 입력, 브라우저 설정, 호스팅 요청 및 향후 광고 기술의 개인정보 처리 방식을 안내합니다.',
      intro: '이 방침은 DevDesk 웹사이트와 브라우저 도구가 정보를 처리하는 방법을 설명합니다. 현재 사이트에는 계정이나 문의 양식이 없으며, 도구 입력과 결과는 브라우저에서 처리합니다.',
      updatedAt: '2026-10-20',
      updatedLabel: '최종 업데이트',
      resourceLabel: '관련 링크',
      content: [
        {
          title: '1. 운영자와 적용 범위',
          paragraphs: [
            'DevDesk는 브라우저에서 사용할 수 있는 정적 개발 도구 사이트입니다. 이 방침은 DevDesk의 페이지, 도구와 가이드 이용에 적용됩니다. 운영자에게 연락하려면 문의 페이지에 안내된 이메일 주소를 이용해 주세요.',
          ],
          links: [{ label: '운영자 문의', href: '/contact/' }],
        },
        {
          title: '2. 도구 입력과 결과',
          paragraphs: [
            'JSON, SQL, JWT, 텍스트, 정규식, YAML 등 도구에 입력한 내용과 변환 결과는 사용자의 브라우저 안에서 처리됩니다. DevDesk는 이 내용을 변환 서버, 외부 변환 API, 분석 이벤트, URL 또는 콘솔 로그로 보내거나 서버에 저장하지 않습니다. 입력과 결과는 페이지가 열려 있는 동안 브라우저 메모리에 남을 수 있으며, 사용자가 복사·다운로드하거나 다른 곳에 붙여 넣으면 해당 작업은 사용자의 기기와 선택한 앱에서 처리됩니다.',
            '도구 사이에서 값을 전달하는 기능은 앱 메모리에 잠시 보관하고 대상 도구가 한 번 읽은 뒤 제거합니다. 이 값은 URL이나 브라우저 저장소에 기록하지 않습니다.',
          ],
        },
        {
          title: '3. 브라우저에 저장되는 설정',
          paragraphs: [
            '테마, 즐겨찾기 도구 ID, 최근 사용 도구 ID와 같은 비민감한 편의 설정은 브라우저의 로컬 저장소에 저장될 수 있습니다. 도구 입력값, JWT, SQL, 토큰 또는 결과는 자동 저장하지 않습니다. 저장된 설정은 브라우저의 DevDesk 사이트 데이터나 로컬 저장소를 지우면 삭제할 수 있습니다.',
          ],
        },
        {
          title: '4. 사이트 호스팅과 네트워크 정보',
          paragraphs: [
            'DevDesk는 Cloudflare Pages를 통해 정적 페이지를 제공합니다. 페이지를 요청할 때 IP 주소, 요청한 페이지 주소, 브라우저·기기 정보, 참조 페이지, 언어 설정과 요청 시각 같은 통신 정보가 호스팅 또는 보안 인프라에 전달될 수 있습니다. 이는 웹 페이지 전달과 보안 운영에 필요한 정보이며, 도구 입력값이나 결과를 포함하지 않습니다. 해당 사업자의 처리와 보유 기간은 실제 서비스 설정 및 사업자의 정책을 따릅니다.',
          ],
          links: [{ label: 'Cloudflare 개인정보처리방침', href: 'https://www.cloudflare.com/privacypolicy/', external: true }],
        },
        {
          title: '5. 광고 쿠키와 제3자 광고 기술',
          paragraphs: [
            '기본 배포 설정에서는 Google AdSense와 분석 스크립트가 비활성화되어 있으며 DevDesk는 광고 목적으로 쿠키를 설정하지 않습니다. 이 사이트에 Google 광고가 표시되는 경우 Google을 비롯한 제3자 광고 사업자와 광고 기술 제공업체가 쿠키 또는 유사한 브라우저 저장 기술을 사용하거나 기존 쿠키를 읽을 수 있습니다.',
            '이 기술은 사용자의 이 사이트 또는 다른 웹사이트 방문 기록을 바탕으로 광고를 제공하는 데 사용될 수 있습니다. 광고가 활성화되면 방문한 페이지 주소와 IP 주소 등 브라우저가 광고 제공업체에 보내는 정보가 광고 제공, 광고 효과 측정, 부정 사용 방지 및 설정에 따른 광고 개인화에 이용될 수 있습니다. Google의 정보 처리 방식과 광고 맞춤설정 선택 방법은 Google 안내를 참고해 주세요.',
          ],
          links: [
            { label: 'Google이 파트너 사이트의 정보를 사용하는 방법', href: 'https://policies.google.com/technologies/partner-sites?hl=ko', external: true },
            { label: 'Google 광고 설정', href: 'https://adssettings.google.com/', external: true },
            { label: '맞춤형 광고 선택 거부 안내', href: 'https://www.aboutads.info/choices/', external: true },
          ],
        },
        {
          title: '6. 동의와 광고 설정',
          paragraphs: [
            '광고 기능을 활성화하면 적용 법령과 광고 플랫폼 정책에 따라 쿠키·저장소 사용 및 개인정보 처리를 고지하고, 필요한 경우 동의를 받으며 선택을 변경하거나 철회할 수 있는 방법을 제공합니다. 유럽경제지역, 영국 또는 스위스 이용자에게 개인 맞춤 광고를 제공하는 경우 Google이 요구하는 인증된 동의 관리 플랫폼과 IAB TCF 요건을 적용합니다. 현재 광고는 비활성화되어 있으며, 실제 광고 파트너와 동의 설정에 맞춰 이 안내를 갱신합니다.',
          ],
          links: [
            { label: 'Google 게시자용 동의 관리 요건', href: 'https://support.google.com/adsense/answer/13554116?hl=ko', external: true },
          ],
        },
        {
          title: '7. 이메일 문의와 보유',
          paragraphs: [
            '문의 페이지의 이메일 링크를 통해 사용자가 직접 이메일을 보내면 운영자는 회신과 요청 처리를 위해 사용자가 메시지에 포함한 이메일 주소, 본문과 첨부 파일을 받습니다. 계정 비밀번호, API 키, JWT 등 비밀 정보는 이메일로 보내지 마세요. 문의 정보는 답변과 후속 처리에 필요한 기간 동안 이메일 시스템에 보관되며, 법적 의무나 분쟁 대응을 위해 더 보관해야 하는 경우를 제외하고 목적이 끝난 뒤 삭제합니다. 이메일 제공업체의 처리 방식에도 해당 업체의 정책이 적용됩니다.',
          ],
        },
        {
          title: '8. 이용자의 선택, 권리와 방침 변경',
          paragraphs: [
            '브라우저에 저장된 설정은 사용자가 브라우저 사이트 데이터에서 직접 지울 수 있습니다. 문의 이메일 등 운영자가 받은 정보에 관해 접근·정정·삭제 또는 처리 제한을 요청하려면 문의 페이지로 연락해 주세요. 적용되는 법령에 따라 요청을 확인하고 처리합니다.',
            '이 방침은 서비스 기능이나 광고 설정이 바뀔 때 수정할 수 있습니다. 변경 사항은 이 페이지와 최종 업데이트 날짜에 표시합니다.',
          ],
          links: [{ label: '개인정보 관련 문의', href: '/contact/' }],
        },
      ],
    },
    terms: {
      title: '이용약관 및 면책 고지',
      description: 'DevDesk 도구의 제공 범위, 이용자 책임, 결과의 한계와 서비스 이용 조건을 안내합니다.',
      intro: 'DevDesk를 이용하면 아래 조건이 적용됩니다. 도구를 사용하기 전에 목적과 기능의 한계를 확인하고, 결과가 중요한 작업에는 별도의 검증 절차를 거쳐 주세요.',
      updatedAt: '2026-10-20',
      updatedLabel: '최종 업데이트',
      resourceLabel: '관련 링크',
      content: [
        {
          title: '1. 서비스',
          paragraphs: [
            'DevDesk는 JSON·SQL 포맷팅, JWT 디코딩, Cron 표현식 작성, 텍스트 비교, 인코딩·디코딩, 시간 변환, 식별자·해시 생성, 정규식 테스트와 YAML·JSON 변환을 제공하는 무료 브라우저 도구 모음입니다. 가입이나 결제 없이 이용할 수 있으며, 기능과 제공 범위는 페이지에 표시된 설명을 따릅니다.',
          ],
        },
        {
          title: '2. 허용되는 이용',
          paragraphs: [
            '서비스를 합법적인 개발·학습 목적으로 사용해 주세요. 법령을 위반하거나 타인의 권리를 침해하는 행위, 사이트의 정상 작동이나 보안을 방해하는 행위, 취약점을 악용하거나 허가 없이 과도한 자동 요청을 보내는 행위를 해서는 안 됩니다. 운영자는 서비스의 보안과 안정성을 위해 위반 이용을 제한할 수 있습니다.',
          ],
        },
        {
          title: '3. 입력과 개인정보',
          paragraphs: [
            '도구의 계산은 브라우저에서 수행되며 DevDesk는 도구 입력이나 결과를 서버에 저장하지 않습니다. 다만 호스팅 요청의 네트워크 정보는 인프라 제공업체에 전달될 수 있고, 이용자가 문의 이메일을 보내면 그 이메일 내용은 운영자에게 전달됩니다. 자세한 처리 방식은 개인정보처리방침을 확인해 주세요.',
          ],
          links: [{ label: '개인정보처리방침', href: '/privacy/' }],
        },
        {
          title: '4. 결과의 정확성과 이용 책임',
          paragraphs: [
            '도구는 일반적인 편의를 위해 제공됩니다. 결과가 항상 정확하거나 완전하거나 특정 환경에 적합하다고 보장하지 않습니다. SQL 포맷터는 SQL을 실행하지 않고, JWT 디코더는 토큰을 읽기 쉬운 형태로 표시할 뿐 서명·발급자·권한을 검증하지 않습니다. 해시 함수는 암호화, 전자서명 또는 안전한 비밀번호 저장 기능이 아닙니다.',
            '배포·데이터 변경·보안 판단 등 중요한 작업에 결과를 적용하기 전에 사용자가 직접 검토하고 대상 시스템이나 신뢰할 수 있는 별도 도구로 검증해야 합니다. 원본 데이터의 백업과 접근 통제도 이용자가 유지해야 합니다.',
          ],
        },
        {
          title: '5. 콘텐츠와 제3자 권리',
          paragraphs: [
            '사이트의 이름, 로고, 디자인과 콘텐츠에 관한 권리는 각 권리자에게 있습니다. 함께 사용된 오픈소스 소프트웨어와 외부 서비스에는 각각의 라이선스 또는 이용 조건이 적용될 수 있습니다. 이 약관은 제3자의 상표나 자료에 대한 권리를 부여하지 않습니다.',
          ],
        },
        {
          title: '6. 외부 서비스와 광고',
          paragraphs: [
            '외부 서비스로 연결되는 링크나 향후 표시될 광고는 제3자가 제공할 수 있습니다. 해당 외부 서비스의 내용, 가용성, 개인정보 처리와 거래에는 그 제공자의 조건이 적용됩니다. 광고가 활성화되면 광고 쿠키와 선택 방법을 개인정보처리방침에 안내합니다. 광고의 표시나 클릭은 특정 상품·서비스에 대한 DevDesk의 보증을 뜻하지 않습니다.',
          ],
          links: [{ label: '개인정보처리방침', href: '/privacy/' }],
        },
        {
          title: '7. 서비스 변경과 이용 제한',
          paragraphs: [
            '운영자는 정확성, 보안, 유지보수를 위해 기능이나 콘텐츠를 변경하거나 일부 서비스를 일시 중단할 수 있습니다. 가능한 경우 변경 내용을 사이트에 알리며, 네트워크·기기·브라우저 문제로 인한 이용 중단을 방지하거나 모든 버전과 환경을 계속 지원한다고 보장하지 않습니다.',
          ],
        },
        {
          title: '8. 책임의 한계와 문의',
          paragraphs: [
            '관련 법령이 허용하는 범위에서 DevDesk는 도구 결과의 사용 또는 서비스 이용·이용 불가로 발생한 간접적·부수적 손해에 대해 책임을 제한합니다. 이 조항은 법률상 제한할 수 없는 권리나 책임을 배제하지 않습니다.',
            '약관에 관한 질문은 문의 페이지의 이메일 주소로 보내 주세요. 운영자는 서비스 변경에 따라 이 약관을 갱신하고 페이지에 수정 날짜를 표시합니다.',
          ],
          links: [{ label: '운영자 문의', href: '/contact/' }],
        },
      ],
    },
    contact: {
      title: '문의',
      description: 'DevDesk 운영자에게 서비스 및 개인정보 관련 문의를 보내는 방법입니다.',
      intro: '서비스 오류 신고, 기능 제안, 개인정보 관련 요청은 아래 운영자 이메일로 보내 주세요.',
      resourceLabel: '관련 페이지',
      content: [
        {
          title: '문의할 때 알려 주세요',
          paragraphs: [
            '가능하면 사용 중인 도구 이름, 브라우저 종류와 문제를 재현하는 순서를 적어 주세요. 보안상 민감한 입력값, 비밀번호, JWT, API 키는 문의에 포함하지 마세요.',
          ],
        },
      ],
    },
  },
  en: {
    about: {
      title: 'About DevDesk',
      description: 'Learn about DevDesk browser tools, practical guides, and privacy principles.',
      intro: 'DevDesk is a free set of browser-based developer tools for small, repetitive tasks. You can use each tool directly in your browser without creating an account or installing an application.',
      resourceLabel: 'Related pages',
      content: [
        {
          title: 'Tools for everyday development',
          paragraphs: [
            'DevDesk includes a JSON formatter, SQL formatter, JWT decoder, cron expression generator, text diff, Base64 encoder and decoder, URL encoder and decoder, Unix timestamp converter, UUID generator, hash generator, regular expression tester, and YAML-to-JSON converter.',
            'Each tool focuses on a specific task. Its guide explains accepted input, steps, examples, common questions, and known limitations so you can decide whether the output fits your use case.',
          ],
        },
        {
          title: 'How to use the site',
          paragraphs: [
            'Search for a tool on the home page or browse by category, then enter your input and run the operation. Review the result before using the copy or download options provided by that tool. Favorites and recently used tools make it easier to return to a tool.',
            'The site is available in Korean, English, Japanese, and Simplified Chinese. Each language has its own page address for the same tools and guides.',
          ],
        },
        {
          title: 'Privacy by design',
          paragraphs: [
            'Tool inputs are processed in your browser. DevDesk does not send them to its own conversion server or an external conversion API, and it does not automatically save input text. A small set of non-sensitive preferences, such as theme and tool IDs, may be kept in your browser.',
            'The static hosting provider may process network and security information when delivering a page. The Privacy Policy explains what that means and how future advertising would work.',
          ],
          links: [
            { label: 'Privacy Policy', href: '/privacy/' },
            { label: 'User guides', href: '/guides/' },
          ],
        },
        {
          title: 'Accuracy and limitations',
          paragraphs: [
            'DevDesk is designed for convenience. The SQL formatter does not run queries against a database, the JWT decoder does not verify a signature or issuer, and a hash is not encryption or secure password storage. Regular expression, time, and encoding results can also depend on the input and target environment.',
            'Review results yourself and verify them independently in the system where they will be used, especially when a change could affect production data or security.',
          ],
        },
        {
          title: 'Advertising and contact',
          paragraphs: [
            'Advertising and analytics are disabled in the default deployment settings. If advertising is enabled later, this site will explain the actual ad partners, cookies or similar technologies, and available choices in its Privacy Policy.',
            'For questions about the service or a privacy request, use the contact page.',
          ],
          links: [
            { label: 'Contact', href: '/contact/' },
            { label: 'Terms of Use', href: '/terms/' },
          ],
        },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      description: 'How DevDesk handles tool inputs, browser preferences, hosting requests, and possible future advertising.',
      intro: 'This policy describes how the DevDesk website and browser tools handle information. The current site has no user accounts or contact form; tool inputs and results are processed in your browser.',
      updatedAt: '2026-10-20',
      updatedLabel: 'Last updated',
      resourceLabel: 'Related links',
      content: [
        {
          title: '1. Operator and scope',
          paragraphs: [
            'DevDesk is a static website with browser-based developer tools. This policy applies when you visit its pages, use its tools, or read its guides. To contact the operator, use the email address on the contact page.',
          ],
          links: [{ label: 'Contact the operator', href: '/contact/' }],
        },
        {
          title: '2. Tool inputs and results',
          paragraphs: [
            'Inputs and outputs for tools such as JSON, SQL, JWT, text, regular expressions, and YAML are processed in your browser. DevDesk does not send this content to a conversion server, external conversion API, analytics event, URL, or console log, and does not store it on a DevDesk server. Input may remain in browser memory while the page is open. If you copy, download, or paste a result elsewhere, that action is handled by your device and the application you choose.',
            'The tool-to-tool handoff feature holds a value briefly in application memory and removes it after the destination tool reads it once. It is not written to a URL or browser storage.',
          ],
        },
        {
          title: '3. Preferences stored in your browser',
          paragraphs: [
            'Non-sensitive preferences, including theme, favorite tool IDs, and recently used tool IDs, may be stored in your browser local storage. Tool inputs, JWTs, SQL, tokens, and results are not saved automatically. You can remove these preferences by clearing DevDesk site data or local storage in your browser.',
          ],
        },
        {
          title: '4. Hosting and network information',
          paragraphs: [
            'DevDesk serves static pages through Cloudflare Pages. When your browser requests a page, network or security infrastructure may receive connection information such as your IP address, requested page URL, browser or device details, referring page, language preference, and request time. This information is used to deliver and protect the site; it does not include tool input or output. The provider controls its processing and retention under the applicable service settings and policies.',
          ],
          links: [{ label: 'Cloudflare Privacy Policy', href: 'https://www.cloudflare.com/privacypolicy/', external: true }],
        },
        {
          title: '5. Advertising cookies and third-party ad technology',
          paragraphs: [
            'Google AdSense and analytics scripts are disabled in the default deployment settings, and DevDesk does not set cookies for advertising. If Google ads are shown on this site, Google and other third-party ad vendors may use cookies or similar browser storage, or read cookies already present, to serve ads.',
            'These technologies may use your prior visits to this site or other sites to select ads. When ads are enabled, information your browser sends to ad providers, such as the page URL and IP address, may be used to deliver ads, measure their effectiveness, prevent abuse, and personalize ads according to your settings. See Google’s information and controls for details.',
          ],
          links: [
            { label: 'How Google uses information from partner sites', href: 'https://policies.google.com/technologies/partner-sites?hl=en', external: true },
            { label: 'Google Ads Settings', href: 'https://adssettings.google.com/', external: true },
            { label: 'Opt out of personalized ads', href: 'https://www.aboutads.info/choices/', external: true },
          ],
        },
        {
          title: '6. Consent and advertising choices',
          paragraphs: [
            'If advertising is enabled, DevDesk will provide disclosures and, where required by law and platform policy, obtain consent for cookies or similar storage and the processing of personal information. Users will be given a way to change or withdraw a choice where required. For personalized ads to users in the European Economic Area, the United Kingdom, or Switzerland, Google requires a certified consent management platform integrated with the IAB Transparency and Consent Framework. Advertising is currently disabled; this notice will be aligned with the actual partners and consent setup before activation.',
          ],
          links: [{ label: 'Google publisher consent requirements', href: 'https://support.google.com/adsense/answer/13554116?hl=en', external: true }],
        },
        {
          title: '7. Email inquiries and retention',
          paragraphs: [
            'If you choose to send an email using the contact link, the operator receives the email address, message, and attachments you include to respond and handle the request. Do not email passwords, API keys, JWTs, or other secrets. Inquiry information is kept in the email system while the request is handled and deleted when it is no longer needed, unless legal obligations or dispute handling require longer retention. The email provider’s own terms and privacy practices also apply.',
          ],
        },
        {
          title: '8. Your choices, rights, and policy changes',
          paragraphs: [
            'You can clear browser-stored preferences in your browser settings. To request access, correction, deletion, or restriction of information the operator received by email, contact the operator; requests are handled under applicable law.',
            'This policy may change when the service or advertising setup changes. The latest version and update date will be shown on this page.',
          ],
          links: [{ label: 'Privacy inquiries', href: '/contact/' }],
        },
      ],
    },
    terms: {
      title: 'Terms of Use and Disclaimer',
      description: 'Service scope, user responsibilities, output limitations, and conditions for using DevDesk.',
      intro: 'These terms apply when you use DevDesk. Review what each tool does and its limitations, and independently verify results before relying on them for important work.',
      updatedAt: '2026-10-20',
      updatedLabel: 'Last updated',
      resourceLabel: 'Related links',
      content: [
        {
          title: '1. The service',
          paragraphs: [
            'DevDesk is a free collection of browser tools for JSON and SQL formatting, JWT decoding, cron expressions, text comparison, encoding and decoding, time conversion, identifier and hash generation, regular expression testing, and YAML/JSON conversion. No account or payment is required. The features and scope shown on each page describe the service provided.',
          ],
        },
        {
          title: '2. Acceptable use',
          paragraphs: [
            'Use DevDesk for lawful development and learning. Do not use it to violate laws or another person’s rights, interfere with the site’s operation or security, exploit vulnerabilities, or send excessive automated requests without authorization. The operator may restrict use that threatens service security or stability.',
          ],
        },
        {
          title: '3. Inputs and privacy',
          paragraphs: [
            'Tool calculations run in your browser, and DevDesk does not store tool inputs or results on its servers. Hosting infrastructure may receive network information, and an email you choose to send is delivered to the operator. See the Privacy Policy for details.',
          ],
          links: [{ label: 'Privacy Policy', href: '/privacy/' }],
        },
        {
          title: '4. Output and user responsibility',
          paragraphs: [
            'Tools are provided for convenience. DevDesk does not guarantee that output is always accurate, complete, or suitable for your environment. The SQL formatter does not execute SQL. The JWT decoder displays token contents but does not verify signatures, issuers, or permissions. A hash is not encryption, a digital signature, or secure password storage.',
            'Before using a result for deployment, data changes, or security decisions, review it and verify it independently in the target system or with a trusted tool. You are responsible for maintaining backups and access controls for your own data.',
          ],
        },
        {
          title: '5. Content and third-party rights',
          paragraphs: [
            'The rights to the DevDesk name, logo, design, and site content belong to their respective owners. Open-source software and external services may be governed by their own licenses or terms. These terms do not grant rights to third-party trademarks or materials.',
          ],
        },
        {
          title: '6. External services and advertising',
          paragraphs: [
            'Links to external services and any advertising shown in the future may be provided by third parties. Their own terms and privacy practices apply to their content, availability, and transactions. If advertising is enabled, the Privacy Policy will describe ad cookies and available choices. An ad or click does not mean that DevDesk endorses the advertised product or service.',
          ],
          links: [{ label: 'Privacy Policy', href: '/privacy/' }],
        },
        {
          title: '7. Changes and availability',
          paragraphs: [
            'The operator may change features or content, or temporarily suspend part of the service for accuracy, security, or maintenance. Changes will be announced on the site when practical. DevDesk does not guarantee uninterrupted access or support for every device, browser, or network condition.',
          ],
        },
        {
          title: '8. Limitation of liability and contact',
          paragraphs: [
            'To the extent permitted by applicable law, the operator limits liability for indirect or incidental loss arising from use of, or inability to use, the service or its output. Nothing in these terms excludes rights or liability that cannot legally be limited.',
            'For questions about these terms, use the email address on the contact page. The operator may update these terms as the service changes and will display the revision date on this page.',
          ],
          links: [{ label: 'Contact the operator', href: '/contact/' }],
        },
      ],
    },
    contact: {
      title: 'Contact',
      description: 'How to contact the DevDesk operator about the service or a privacy request.',
      intro: 'Send service issue reports, feature suggestions, and privacy requests to the operator’s email address below.',
      resourceLabel: 'Related pages',
      content: [
        {
          title: 'What to include',
          paragraphs: [
            'If possible, include the tool name, your browser, and steps to reproduce the issue. Do not include sensitive input, passwords, JWTs, or API keys in your message.',
          ],
        },
      ],
    },
  },
  ja: {
    about: {
      title: 'DevDesk について',
      description: 'DevDesk のブラウザーツール、実用ガイド、プライバシー保護の方針を紹介します。',
      intro: 'DevDesk は、開発で繰り返し行う小さな作業をすばやく処理するための無料のブラウザーツール集です。アカウント登録やアプリのインストールをせずに、各ツールを利用できます。',
      resourceLabel: '関連ページ',
      content: [
        {
          title: '日常の開発に使えるツール',
          paragraphs: [
            'JSON フォーマッター、SQL フォーマッター、JWT デコーダー、Cron 式ジェネレーター、テキスト比較、Base64 エンコーダー・デコーダー、URL エンコーダー・デコーダー、Unix Timestamp 変換、UUID 生成、ハッシュ生成、正規表現テスター、YAML・JSON 変換を提供しています。',
            '各ツールは特定の作業に焦点を当てています。ガイドでは入力形式、手順、例、よくある質問、機能の制限を説明し、結果が用途に合うか判断できるようにしています。',
          ],
        },
        {
          title: 'サイトの使い方',
          paragraphs: [
            'ホームでツールを検索するか、カテゴリから選んで開きます。入力して処理を実行したら結果を確認し、ツールに用意されたコピーまたはダウンロード機能を使えます。お気に入りと最近使ったツールから、もう一度すばやく開けます。',
            '韓国語、英語、日本語、中国語（簡体字）に対応しています。同じツールやガイドを言語別の URL で共有できます。',
          ],
        },
        {
          title: 'プライバシーを考慮した設計',
          paragraphs: [
            'ツールの入力はブラウザー内で処理します。DevDesk 独自の変換サーバーや外部変換 API へ送信せず、入力内容を自動保存しません。テーマやツール ID など機密性のない設定の一部はブラウザーに保存される場合があります。',
            '静的サイトのホスティング事業者はページ配信の際にネットワークやセキュリティ情報を処理する場合があります。詳しくはプライバシーポリシーをご確認ください。',
          ],
          links: [
            { label: 'プライバシーポリシー', href: '/privacy/' },
            { label: '使い方ガイド', href: '/guides/' },
          ],
        },
        {
          title: '正確性と利用上の制限',
          paragraphs: [
            'DevDesk は利便性を目的としています。SQL フォーマッターはデータベースでクエリを実行せず、JWT デコーダーは署名や発行者を検証しません。ハッシュ生成は暗号化や安全なパスワード保存ではありません。正規表現、時刻、エンコードの結果も入力や利用環境によって異なる場合があります。',
            '本番データやセキュリティに影響する作業に使う前に結果を確認し、実際のシステムで別途検証してください。',
          ],
        },
        {
          title: '広告とお問い合わせ',
          paragraphs: [
            '標準のビルド設定では広告と分析機能を無効にしています。今後広告を有効にする場合は、実際の広告パートナー、Cookie などの技術、同意と選択方法をプライバシーポリシーに記載します。',
            'サービスに関する質問やプライバシーのご相談は、お問い合わせページをご利用ください。',
          ],
          links: [
            { label: 'お問い合わせ', href: '/contact/' },
            { label: '利用規約', href: '/terms/' },
          ],
        },
      ],
    },
    privacy: {
      title: 'プライバシーポリシー',
      description: 'ツール入力、ブラウザー設定、ホスティングへのリクエスト、将来の広告技術における情報の取り扱いを説明します。',
      intro: 'このポリシーでは、DevDesk のウェブサイトとブラウザーツールにおける情報の取り扱いを説明します。現在、ユーザーアカウントや問い合わせフォームはなく、ツールの入力と結果はブラウザー内で処理します。',
      updatedAt: '2026-10-20',
      updatedLabel: '最終更新日',
      resourceLabel: '関連リンク',
      content: [
        {
          title: '1. 運営者と適用範囲',
          paragraphs: [
            'DevDesk はブラウザーで使える静的な開発ツールサイトです。このポリシーは、DevDesk のページ、ツール、ガイドの利用に適用されます。運営者への連絡には、お問い合わせページに記載されたメールアドレスをご利用ください。',
          ],
          links: [{ label: '運営者へのお問い合わせ', href: '/contact/' }],
        },
        {
          title: '2. ツールの入力と結果',
          paragraphs: [
            'JSON、SQL、JWT、テキスト、正規表現、YAML などの入力と結果はブラウザー内で処理します。DevDesk は入力内容を変換サーバー、外部変換 API、分析イベント、URL、コンソールログへ送信せず、DevDesk のサーバーにも保存しません。ページを開いている間は入力がブラウザーのメモリに残る場合があります。結果をコピー・ダウンロードしたり別の場所へ貼り付けたりする操作は、利用者の端末と選択したアプリで行われます。',
            'ツール間のデータ受け渡しはアプリのメモリに一時保持し、移動先のツールが一度読み取った後に削除します。URL やブラウザー保存領域には記録しません。',
          ],
        },
        {
          title: '3. ブラウザーに保存する設定',
          paragraphs: [
            'テーマ、お気に入りのツール ID、最近使ったツール ID など、機密性のない設定をブラウザーのローカルストレージに保存する場合があります。入力内容、JWT、SQL、トークン、結果は自動保存しません。ブラウザーで DevDesk のサイトデータまたはローカルストレージを削除すると、これらの設定を消去できます。',
          ],
        },
        {
          title: '4. ホスティングとネットワーク情報',
          paragraphs: [
            'DevDesk は Cloudflare Pages で静的ページを配信します。ページをリクエストすると、IP アドレス、リクエストしたページ URL、ブラウザーや端末の情報、参照元ページ、言語設定、リクエスト時刻などが配信・セキュリティ用のインフラに渡る場合があります。これはサイトの配信と保護に使われ、ツールの入力や結果は含みません。処理や保存期間は、実際のサービス設定と事業者のポリシーに従います。',
          ],
          links: [{ label: 'Cloudflare プライバシーポリシー', href: 'https://www.cloudflare.com/privacypolicy/', external: true }],
        },
        {
          title: '5. 広告 Cookie と第三者の広告技術',
          paragraphs: [
            '標準のビルド設定では Google AdSense と分析スクリプトを無効にしており、DevDesk は広告目的の Cookie を設定していません。このサイトに Google 広告を表示する場合、Google などの第三者広告事業者や広告技術プロバイダーが Cookie または同様のブラウザー保存技術を使ったり、既存の Cookie を読み取ったりする場合があります。',
            'これらの技術は、このサイトや他のサイトでの過去の訪問に基づいて広告を選ぶために使われることがあります。広告の有効化後は、ページ URL や IP アドレスなどブラウザーから広告事業者へ送られる情報が、広告の配信、効果測定、不正利用の防止、設定に応じた広告のパーソナライズに使われる場合があります。詳細と選択方法は Google の案内をご覧ください。',
          ],
          links: [
            { label: 'Google によるパートナーサイト情報の利用', href: 'https://policies.google.com/technologies/partner-sites?hl=ja', external: true },
            { label: 'Google 広告設定', href: 'https://adssettings.google.com/', external: true },
            { label: 'パーソナライズ広告のオプトアウト', href: 'https://www.aboutads.info/choices/', external: true },
          ],
        },
        {
          title: '6. 同意と広告の選択',
          paragraphs: [
            '広告を有効にする場合、適用法令と広告プラットフォームのポリシーに従い、Cookie などの保存技術や個人情報の処理について説明し、必要な場合は同意を取得します。必要に応じて選択を変更・撤回する方法も提供します。欧州経済領域、英国、スイスの利用者にパーソナライズ広告を配信する場合、Google が求める IAB TCF 対応の認定同意管理プラットフォームを使用します。現在広告は無効であり、有効化前に実際の広告パートナーと同意設定に合わせて案内を更新します。',
          ],
          links: [{ label: 'Google のパブリッシャー向け同意要件', href: 'https://support.google.com/adsense/answer/13554116?hl=ja', external: true }],
        },
        {
          title: '7. メールでのお問い合わせと保存期間',
          paragraphs: [
            '問い合わせリンクからメールを送ると、運営者は回答と依頼への対応のために、利用者が記載したメールアドレス、本文、添付ファイルを受け取ります。パスワード、API キー、JWT などの秘密情報は送らないでください。問い合わせ情報はメールシステムで対応に必要な期間保管し、法的義務や紛争対応で長期保存が必要な場合を除き、目的の終了後に削除します。メール事業者独自の利用条件とプライバシー方針も適用されます。',
          ],
        },
        {
          title: '8. 利用者の選択・権利と変更',
          paragraphs: [
            'ブラウザーに保存された設定は、ブラウザーの設定から消去できます。運営者がメールで受け取った情報について、適用法令に基づく開示、訂正、削除、処理制限を求める場合は運営者にご連絡ください。法令に従って確認し対応します。',
            'サービスや広告設定の変更に応じてこのポリシーを更新する場合があります。最新の内容と更新日はこのページに掲載します。',
          ],
          links: [{ label: 'プライバシーに関するお問い合わせ', href: '/contact/' }],
        },
      ],
    },
    terms: {
      title: '利用規約・免責事項',
      description: 'DevDesk の提供範囲、利用者の責任、出力の制限と利用条件を説明します。',
      intro: 'DevDesk を利用すると、以下の条件が適用されます。各ツールの機能と制限を確認し、重要な作業では結果を別途検証してください。',
      updatedAt: '2026-10-20',
      updatedLabel: '最終更新日',
      resourceLabel: '関連リンク',
      content: [
        {
          title: '1. サービス内容',
          paragraphs: [
            'DevDesk は、JSON・SQL の整形、JWT のデコード、Cron 式の作成、テキスト比較、エンコード・デコード、時刻変換、識別子・ハッシュ生成、正規表現テスト、YAML・JSON 変換を行う無料のブラウザーツール集です。アカウント登録や支払いは不要です。各ページの説明が提供機能と範囲を示します。',
          ],
        },
        {
          title: '2. 利用上のルール',
          paragraphs: [
            '合法的な開発や学習の目的で利用してください。法令違反や他者の権利侵害、サイトの正常な動作・セキュリティを妨げる行為、脆弱性の悪用、許可のない過度な自動リクエストは禁止します。運営者はサービスの安全性や安定性を脅かす利用を制限する場合があります。',
          ],
        },
        {
          title: '3. 入力とプライバシー',
          paragraphs: [
            'ツールの処理はブラウザー内で行い、DevDesk は入力や結果をサーバーに保存しません。ホスティング基盤は通信情報を受け取る場合があり、利用者が送信する問い合わせメールは運営者に届きます。詳しくはプライバシーポリシーをご覧ください。',
          ],
          links: [{ label: 'プライバシーポリシー', href: '/privacy/' }],
        },
        {
          title: '4. 出力と利用者の責任',
          paragraphs: [
            '各ツールは利便性のために提供され、出力の正確性、完全性、利用環境への適合性を保証しません。SQL フォーマッターは SQL を実行しません。JWT デコーダーは内容を表示しますが、署名、発行者、権限を検証しません。ハッシュは暗号化、デジタル署名、安全なパスワード保存の代わりにはなりません。',
            'デプロイ、データ変更、セキュリティ判断などに結果を使う前に内容を確認し、対象システムや信頼できるツールで独立して検証してください。利用者自身のデータのバックアップとアクセス制御も利用者の責任です。',
          ],
        },
        {
          title: '5. コンテンツと第三者の権利',
          paragraphs: [
            'DevDesk の名称、ロゴ、デザイン、サイトコンテンツの権利はそれぞれの権利者に帰属します。オープンソースソフトウェアや外部サービスには、個別のライセンスまたは利用条件が適用される場合があります。この規約は第三者の商標や資料の権利を付与しません。',
          ],
        },
        {
          title: '6. 外部サービスと広告',
          paragraphs: [
            '外部サービスへのリンクや将来表示される広告は第三者が提供する場合があります。外部のコンテンツ、提供状況、取引、プライバシーの取り扱いには各提供者の条件が適用されます。広告を有効にする場合、広告 Cookie と利用者の選択方法をプライバシーポリシーに記載します。広告の表示やクリックは DevDesk による商品・サービスの保証を意味しません。',
          ],
          links: [{ label: 'プライバシーポリシー', href: '/privacy/' }],
        },
        {
          title: '7. サービスの変更と提供状況',
          paragraphs: [
            '運営者は正確性、セキュリティ、保守のために機能やコンテンツを変更したり、一部サービスを一時停止したりする場合があります。可能な場合はサイト上で変更を案内します。常時利用できること、またはすべての端末、ブラウザー、ネットワーク環境での動作を保証しません。',
          ],
        },
        {
          title: '8. 責任の制限とお問い合わせ',
          paragraphs: [
            '適用法令が認める範囲で、運営者はサービスや出力の利用または利用不能に起因する間接的・付随的な損害について責任を制限します。この規約は、法律上制限できない権利や責任を排除しません。',
            '規約に関する質問はお問い合わせページのメールアドレスにお送りください。サービスの変更に応じて規約を更新し、このページに改定日を表示します。',
          ],
          links: [{ label: '運営者へのお問い合わせ', href: '/contact/' }],
        },
      ],
    },
    contact: {
      title: 'お問い合わせ',
      description: 'サービスやプライバシーに関して DevDesk 運営者へ連絡する方法です。',
      intro: 'サービスの不具合報告、機能の提案、プライバシーに関する依頼は、以下の運営者メールアドレスへお送りください。',
      resourceLabel: '関連ページ',
      content: [
        {
          title: 'お問い合わせに含める情報',
          paragraphs: [
            '可能であれば、利用したツール名、ブラウザー、問題を再現する手順をお知らせください。機密性の高い入力、パスワード、JWT、API キーはメッセージに含めないでください。',
          ],
        },
      ],
    },
  },
  zh: {
    about: {
      title: '关于 DevDesk',
      description: '了解 DevDesk 浏览器开发工具、实用指南和隐私保护原则。',
      intro: 'DevDesk 是一组免费的浏览器开发工具，用来快速处理开发中的重复小任务。无需注册账号或安装应用，即可直接使用各个工具。',
      resourceLabel: '相关页面',
      content: [
        {
          title: '日常开发工具',
          paragraphs: [
            'DevDesk 提供 JSON 格式化、SQL 格式化、JWT 解码、Cron 表达式生成、文本比较、Base64 编码与解码、URL 编码与解码、Unix 时间戳转换、UUID 生成、哈希生成、正则表达式测试以及 YAML 与 JSON 转换。',
            '每个工具都专注于一项具体任务。对应指南说明输入格式、操作步骤、示例、常见问题和功能限制，帮助你判断结果是否适合当前用途。',
          ],
        },
        {
          title: '如何使用',
          paragraphs: [
            '在首页搜索工具或按分类浏览，打开后输入内容并执行操作。检查结果后，可使用该工具提供的复制或下载功能。收藏和最近使用列表方便你再次找到工具。',
            '网站支持韩语、英语、日语和简体中文。每种语言都有对应的网址，可分享同一工具或指南的本地化页面。',
          ],
        },
        {
          title: '以隐私为先的处理方式',
          paragraphs: [
            '工具输入在浏览器中处理。DevDesk 不会将输入发送到自有转换服务器或外部转换 API，也不会自动保存输入文本。主题和工具 ID 等少量非敏感偏好可能保存在你的浏览器中。',
            '静态托管服务商在传送网页时可能会处理网络和安全信息。隐私政策说明了相关处理方式以及未来启用广告时的情况。',
          ],
          links: [
            { label: '隐私政策', href: '/privacy/' },
            { label: '使用指南', href: '/guides/' },
          ],
        },
        {
          title: '准确性和使用限制',
          paragraphs: [
            'DevDesk 提供的是便捷工具。SQL 格式化工具不会在数据库中执行查询，JWT 解码器不会验证签名或签发者，哈希生成也不是加密或安全的密码存储。正则表达式、时间和编码结果也可能受输入及目标环境影响。',
            '将结果用于生产数据或安全相关操作前，请先自行检查，并在实际系统中独立验证。',
          ],
        },
        {
          title: '广告与联系',
          paragraphs: [
            '默认构建配置下，广告和分析功能处于关闭状态。将来启用广告时，隐私政策会说明实际广告合作方、Cookie 或类似技术以及可用的选择方式。',
            '如有服务问题或隐私请求，请使用联系页面。',
          ],
          links: [
            { label: '联系', href: '/contact/' },
            { label: '使用条款', href: '/terms/' },
          ],
        },
      ],
    },
    privacy: {
      title: '隐私政策',
      description: '说明 DevDesk 如何处理工具输入、浏览器偏好、托管请求和未来可能使用的广告技术。',
      intro: '本政策说明 DevDesk 网站和浏览器工具如何处理信息。目前网站没有用户账号或联系表单；工具输入和结果均在浏览器中处理。',
      updatedAt: '2026-10-20',
      updatedLabel: '最后更新',
      resourceLabel: '相关链接',
      content: [
        {
          title: '1. 运营者与适用范围',
          paragraphs: [
            'DevDesk 是一组可在浏览器中使用的静态开发工具。本政策适用于你访问 DevDesk 页面、使用工具或阅读指南的情况。如需联系运营者，请使用联系页面提供的电子邮箱。',
          ],
          links: [{ label: '联系运营者', href: '/contact/' }],
        },
        {
          title: '2. 工具输入和结果',
          paragraphs: [
            'JSON、SQL、JWT、文本、正则表达式和 YAML 等工具的输入及结果均在浏览器中处理。DevDesk 不会将这些内容发送到转换服务器、外部转换 API、分析事件、URL 或控制台日志，也不会保存到 DevDesk 服务器。页面打开期间，输入可能暂留在浏览器内存中。复制、下载或粘贴结果的操作由你的设备和所选应用处理。',
            '工具之间传递数据时，数据会暂存在应用内存中，由目标工具读取一次后清除，不会写入 URL 或浏览器存储。',
          ],
        },
        {
          title: '3. 保存在浏览器中的偏好',
          paragraphs: [
            '主题、收藏工具 ID、最近使用工具 ID 等非敏感偏好可能保存在浏览器本地存储中。工具输入、JWT、SQL、令牌和结果不会自动保存。你可以在浏览器设置中清除 DevDesk 网站数据或本地存储，以删除这些偏好。',
          ],
        },
        {
          title: '4. 托管和网络信息',
          paragraphs: [
            'DevDesk 通过 Cloudflare Pages 提供静态网页。浏览器请求页面时，网络或安全基础设施可能会收到 IP 地址、请求页面 URL、浏览器或设备信息、来源页面、语言偏好和请求时间等连接信息。这些信息用于传送和保护网站，不包含工具输入或结果。服务商会根据实际服务设置和自身政策处理这些信息并确定保留期限。',
          ],
          links: [{ label: 'Cloudflare 隐私政策', href: 'https://www.cloudflare.com/privacypolicy/', external: true }],
        },
        {
          title: '5. 广告 Cookie 和第三方广告技术',
          paragraphs: [
            '默认部署配置下，Google AdSense 和分析脚本处于关闭状态，DevDesk 不会为广告目的设置 Cookie。如果本网站展示 Google 广告，Google 及其他第三方广告商或广告技术提供商可能会使用 Cookie 或类似浏览器存储技术，也可能读取已有 Cookie。',
            '这些技术可能根据你此前访问本网站或其他网站的情况选择广告。启用广告后，浏览器发送给广告服务商的信息（例如页面 URL 和 IP 地址）可能用于投放广告、衡量效果、防止滥用，以及根据你的设置个性化广告。详细信息和选择方式请参阅 Google 的说明。',
          ],
          links: [
            { label: 'Google 如何使用合作网站的信息', href: 'https://policies.google.com/technologies/partner-sites?hl=zh-CN', external: true },
            { label: 'Google 广告设置', href: 'https://adssettings.google.com/', external: true },
            { label: '选择退出个性化广告', href: 'https://www.aboutads.info/choices/', external: true },
          ],
        },
        {
          title: '6. 同意与广告选择',
          paragraphs: [
            '启用广告后，DevDesk 会按照适用法律和广告平台政策说明 Cookie 或类似存储及个人信息处理方式，并在必要时征求同意。法律要求时，用户也可以更改或撤回选择。向欧洲经济区、英国或瑞士用户投放个性化广告时，Google 要求使用集成 IAB TCF 的认证同意管理平台。目前广告处于关闭状态；启用前会根据实际合作方和同意设置更新本说明。',
          ],
          links: [{ label: 'Google 面向发布商的同意要求', href: 'https://support.google.com/adsense/answer/13554116?hl=zh-CN', external: true }],
        },
        {
          title: '7. 邮件咨询与信息保留',
          paragraphs: [
            '如果你通过联系链接主动发送邮件，运营者会收到你在邮件中提供的地址、正文和附件，用于回复并处理请求。请勿通过邮件发送密码、API 密钥、JWT 或其他秘密信息。咨询信息会保留在邮件系统中，直到请求处理完毕；除法律义务或争议处理需要更长时间外，处理目的结束后会删除。电子邮件服务商自身的条款和隐私做法也适用。',
          ],
        },
        {
          title: '8. 你的选择、权利和政策更新',
          paragraphs: [
            '你可以在浏览器设置中清除浏览器保存的偏好。如需对运营者通过邮件收到的信息行使适用法律赋予的访问、更正、删除或限制处理权，请联系运营者；我们会根据适用法律核实并处理请求。',
            '服务或广告设置发生变化时，本政策可能会更新。最新内容和更新日期会显示在本页面。',
          ],
          links: [{ label: '隐私相关咨询', href: '/contact/' }],
        },
      ],
    },
    terms: {
      title: '使用条款与免责声明',
      description: '说明 DevDesk 的服务范围、用户责任、工具结果限制和使用条件。',
      intro: '使用 DevDesk 即表示这些条款适用于你的使用行为。请先了解每项工具的功能和限制；重要操作应单独验证结果。',
      updatedAt: '2026-10-20',
      updatedLabel: '最后更新',
      resourceLabel: '相关链接',
      content: [
        {
          title: '1. 服务内容',
          paragraphs: [
            'DevDesk 是免费的浏览器工具集，提供 JSON 与 SQL 格式化、JWT 解码、Cron 表达式生成、文本比较、编码与解码、时间转换、标识符与哈希生成、正则表达式测试以及 YAML/JSON 转换。使用服务无需账号或付费。各页面的说明描述了对应功能和范围。',
          ],
        },
        {
          title: '2. 合理使用',
          paragraphs: [
            '请将 DevDesk 用于合法的开发或学习目的。不得利用本服务违反法律或侵犯他人权利、干扰网站运行或安全、利用漏洞，或未经许可发送过量自动请求。运营者可以限制威胁服务安全或稳定性的使用行为。',
          ],
        },
        {
          title: '3. 输入与隐私',
          paragraphs: [
            '工具计算在浏览器中完成，DevDesk 不会将工具输入或结果保存在自己的服务器上。托管基础设施可能会接收网络信息；你主动发送的咨询邮件会到达运营者。详情请参阅隐私政策。',
          ],
          links: [{ label: '隐私政策', href: '/privacy/' }],
        },
        {
          title: '4. 结果与用户责任',
          paragraphs: [
            '工具仅为方便使用而提供。DevDesk 不保证结果始终准确、完整或适合你的环境。SQL 格式化工具不会执行 SQL；JWT 解码器只显示令牌内容，不会验证签名、签发者或权限；哈希不是加密、数字签名或安全的密码存储功能。',
            '将结果用于部署、数据更改或安全判断前，请先自行检查，并在目标系统或可信工具中独立验证。你有责任为自己的数据保留备份并维护访问控制。',
          ],
        },
        {
          title: '5. 内容和第三方权利',
          paragraphs: [
            'DevDesk 名称、标识、设计和网站内容的权利归各自权利人所有。开源软件和外部服务可能受其各自许可或使用条款约束。本条款不授予第三方商标或材料的权利。',
          ],
        },
        {
          title: '6. 外部服务和广告',
          paragraphs: [
            '外部服务链接和未来可能展示的广告由第三方提供。外部内容、可用性、交易和隐私处理受相应提供方的条款与政策约束。启用广告后，隐私政策会说明广告 Cookie 和可用选择。广告展示或点击不代表 DevDesk 对相关产品或服务作出保证或认可。',
          ],
          links: [{ label: '隐私政策', href: '/privacy/' }],
        },
        {
          title: '7. 服务变更与可用性',
          paragraphs: [
            '运营者可以出于准确性、安全或维护需要更改功能和内容，或暂时停止部分服务。条件允许时会在网站上发布变更信息。DevDesk 不保证服务始终不中断，也不保证适用于所有设备、浏览器或网络环境。',
          ],
        },
        {
          title: '8. 责任限制与联系',
          paragraphs: [
            '在适用法律允许的范围内，运营者限制因使用或无法使用本服务及其结果而产生的间接或附带损失的责任。本条款不排除法律规定不得限制的权利或责任。',
            '如对条款有疑问，请通过联系页面提供的邮箱联系运营者。服务发生变化时，运营者可能更新条款，并会在本页显示修订日期。',
          ],
          links: [{ label: '联系运营者', href: '/contact/' }],
        },
      ],
    },
    contact: {
      title: '联系',
      description: '联系 DevDesk 运营者以咨询服务问题或隐私请求。',
      intro: '如需报告问题、提出功能建议或提交隐私请求，请发送邮件至下方运营者地址。',
      resourceLabel: '相关页面',
      content: [
        {
          title: '邮件中可以说明的内容',
          paragraphs: [
            '如方便，请提供工具名称、浏览器类型和重现问题的步骤。请勿在邮件中附上敏感输入、密码、JWT 或 API 密钥。',
          ],
        },
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
  return localizedMetadata(rawLocale, '/' + section, copy.title, copy.description);
}

export default async function SectionPage({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale: rawLocale, section: rawSection } = await params;
  if (!isLocale(rawLocale) || !sections.includes(rawSection as Section)) notFound();
  const locale = rawLocale;
  const section = rawSection as Section;
  const copy = sectionCopy[locale][section];
  const contactEmail = section === 'contact' ? process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() : undefined;
  const shouldRenderContent = section !== 'contact' || Boolean(contactEmail);
  return (
    <main className="simple-page policy-page">
      <p className="eyebrow">DEVDESK / {section.toUpperCase()}</p>
      <h1>{copy.title}</h1>
      {shouldRenderContent && <p className="policy-intro">{copy.intro}</p>}
      {copy.updatedAt && (
        <p className="policy-updated">
          {copy.updatedLabel}: <time dateTime={copy.updatedAt}>{copy.updatedAt}</time>
        </p>
      )}
      {shouldRenderContent && copy.content.map((block, index) => (
        <section className="policy-section" aria-labelledby={'policy-section-' + index} key={block.title}>
          <h2 id={'policy-section-' + index}>{block.title}</h2>
          {block.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
          {block.links && (
            <ul className="policy-links" aria-label={copy.resourceLabel}>
              {block.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.external ? link.href : '/' + locale + link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noreferrer noopener' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      {contactEmail && <p className="policy-contact"><a href={'mailto:' + contactEmail}>{contactEmail}</a></p>}
    </main>
  );
}
