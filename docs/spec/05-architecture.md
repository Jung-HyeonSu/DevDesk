# 상세 요구사항 05 — 기술 아키텍처

> 기존 GOAL.md의 §5를 분리한 문서입니다. 요구사항 본문은 원문을 유지합니다.

## 5. 기술 아키텍처 및 라이브러리

### 5.1 기반 기술

| 영역 | 기술 | 사용 방식 |
|---|---|---|
| UI | Next.js App Router + React + TypeScript | 정적 HTML 생성 + 브라우저 컴포넌트 |
| 스타일 | Tailwind CSS | 공통 테마·반응형 스타일 |
| UI | shadcn/ui 또는 접근성 검증된 동등 컴포넌트 | 복사·검색·팝오버 등 |
| 편집기 | CodeMirror 6 | lazy loading, 구문 강조, 입력 에디터 |
| SQL | `sql-formatter` 등 호환성 확인된 오픈소스 | 로컬 포맷팅, 방언 범위 문서화 |
| Diff | `diff`/`jsdiff` 계열 | 문자열 비교 |
| Cron | `croner` 또는 `cron-parser` 중 브라우저에서 동작하는 것 | Linux 5필드만 MVP 보장 |
| YAML | `yaml` | 안전한 파싱/출력 |
| 저장 | 브라우저 `localStorage` | 테마·로케일·즐겨찾기·최근 도구 ID만 |
| 고비용 계산 | Browser Web Worker | Regex timeout 및 대용량 처리 |
| 테스트 | Vitest + React Testing Library + Playwright | 단위/E2E |
| 정적 배포 | Cloudflare Pages | 정적 `out/`만 호스팅 |

- 패키지 명칭/호환 버전은 구현 시 검증하고 `package-lock.json`을 커밋한다.
- 클라이언트 런타임에 서버 SDK, 비밀 API 키, 유료 API SDK를 추가하지 않는다.
- 동적 import로 무거운 에디터와 도구별 라이브러리를 해당 도구 페이지에서만 로드한다.
- 정적 생성 단계의 빌드 로직과 브라우저 전용 계산 모듈의 의존성을 분리한다.
- 정적 export에서 `next/image` 사용 시 `unoptimized` 또는 정적 대응 전략 적용. 외부 이미지 최적화 서버 금지.

### 5.2 반드시 사용할 Next.js 설정 예시

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
```

- 빌드는 `next build`를 사용하고 `next export`(제거된 명령)는 사용하지 않는다.
- **허용**: 빌드 시 실행하는 정적 렌더링과 Server Components(정적 빌드 전용), Client Components, `generateStaticParams`, 정적 asset.
- **금지**: request 기반 Route Handler/API Routes, Server Actions, `cookies()`, `headers()`, 동적 SSR, middleware/proxy, rewrite/redirect, ISR, DB 연결, 서버용 인증, API 키가 필요한 클라이언트 기능.
- 정적 `sitemap.xml`, `robots.txt`, 정책/가이드 페이지는 빌드 시 생성하거나 public에서 정적 제공한다. API endpoint에 의존하지 않는다.

### 5.3 추천 디렉터리 구조

```text
devdesk/
├── GOAL.md
├── README.md
├── DEPLOYMENT.md
├── package.json
├── next.config.ts
├── playwright.config.ts
├── public/
│   ├── icons/
│   ├── images/
│   ├── ads.txt                 # 승인 전 비워 두거나 제외
│   └── favicon.ico
├── scripts/
│   ├── verify-i18n.ts
│   ├── verify-static-output.ts
│   └── generate-static-seo.ts # 필요할 경우만
├── src/
│   ├── app/
│   │   ├── (root)/
│   │   │   ├── layout.tsx     # / 전용 root layout
│   │   │   └── page.tsx       # 정적 다국어 선택 랜딩
│   │   ├── [locale]/
│   │   │   ├── layout.tsx     # 해당 언어 HTML lang 설정할 root layout
│   │   │   ├── page.tsx
│   │   │   ├── tools/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── guides/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   ├── terms/page.tsx
│   │   │   └── contact/page.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── editor/
│   │   ├── tools/
│   │   ├── search/
│   │   └── ads/
│   ├── features/
│   │   ├── json-formatter/
│   │   ├── sql-formatter/
│   │   ├── jwt-decoder/
│   │   ├── cron-generator/
│   │   ├── text-diff/
│   │   ├── base64/
│   │   ├── url-encoder/
│   │   ├── unix-timestamp/
│   │   ├── uuid-generator/
│   │   ├── hash-generator/
│   │   ├── regex-tester/
│   │   └── yaml-json/
│   ├── i18n/
│   │   ├── config.ts
│   │   ├── dictionaries.ts
│   │   └── messages/
│   │       ├── ko.json
│   │       ├── en.json
│   │       ├── ja.json
│   │       └── zh.json
│   ├── content/
│   │   ├── tools/             # 도구별 4개 언어 가이드·FAQ
│   │   └── guides/
│   ├── data/
│   │   ├── tools.ts            # 공통 tool registry
│   │   └── seo.ts
│   ├── lib/
│   │   ├── format/
│   │   ├── encoding/
│   │   ├── seo/
│   │   └── storage/
│   ├── workers/
│   │   └── regex.worker.ts
│   └── types/
├── tests/
│   ├── unit/
│   ├── e2e/
│   └── fixtures/
└── out/                          # 빌드 산출물, Git 추적 제외
```

> 구조는 추천안이다. 해당 Next.js 버전에서 복수 root layout·정적 생성이 문제를 일으키면 **같은 URL/HTML 언어/정적 출력**을 만족하는 더 간결한 구조로 조정하되 이를 README에 기록한다.

### 5.4 확장 가능한 Tool Registry

각 도구는 중앙 목록에 다음을 선언한다.

```ts
type ToolDefinition = {
  id: string;
  slug: string;
  category: 'format' | 'encoding' | 'security' | 'time' | 'text' | 'generator' | 'data';
  icon: string;
  tags: string[];
  order: number;
  relatedToolIds: string[];
};
```

- 제목, 설명, 검색 키워드, 가이드는 로케일별 데이터에서 가져온다.
- 도구 추가 시 4개 로케일, 정적 라우트, SEO, 카테고리, 검색, 테스트에 자동 반영되도록 한다.
- `Reuse → Extend → Create`: 공통 UI와 공통 도구 기능을 재사용하며 12개 페이지에 입력·출력 UI를 복제하지 않는다.
- 단, 무리하게 모든 도구의 입출력 상태를 하나의 거대한 범용 컴포넌트에 끼워 넣지 않는다.

---

