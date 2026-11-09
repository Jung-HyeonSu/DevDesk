# 상세 요구사항 02 — 사이트 구성 및 URL

> 기존 GOAL.md의 §2를 분리한 문서입니다. 요구사항 본문은 원문을 유지합니다.

## 2. 사이트 구성 및 URL 설계

### 2.1 정적 URL

언어별 경로를 **실제 빌드 시점에 생성한다**. 쿠키 기반 로케일 탐색과 서버 미들웨어는 사용하지 않는다. 도구 목록은 홈에 통합하며 별도의 `/{locale}/tools/` 목록 경로는 제공하지 않는다. 각 도구의 상세 기능은 개별 도구 경로에서 제공한다.

```text
/                        # 4개 언어 선택과 대표 기능을 보여주는 정적 랜딩
/ko/                     # 한국어 홈
/en/                     # English home
/ja/                     # 日本語 home
/zh/                     # 简体中文 home

/{locale}/tools/json-formatter/   # JSON 정렬
/{locale}/tools/sql-formatter/
/{locale}/tools/jwt-decoder/
/{locale}/tools/cron-generator/
/{locale}/tools/text-diff/
/{locale}/tools/base64/
/{locale}/tools/url-encoder/
/{locale}/tools/unix-timestamp/
/{locale}/tools/uuid-generator/
/{locale}/tools/hash-generator/
/{locale}/tools/regex-tester/
/{locale}/tools/yaml-json/
/{locale}/tools/code-formatter/
/{locale}/tools/json-pointer/
/{locale}/tools/csv-json/
/{locale}/tools/url-inspector/
/{locale}/tools/html-entities/
/{locale}/tools/json-schema-validator/
/{locale}/tools/openapi-explorer/
/{locale}/tools/curl-fetch-converter/
/{locale}/tools/http-header-inspector/
/{locale}/tools/env-diff/
/{locale}/tools/gitignore-tester/
/{locale}/tools/har-scrubber/
/{locale}/tools/markdown-link-checker/

/{locale}/about/                 # 서비스 소개
/{locale}/privacy/               # 개인정보처리방침
/{locale}/terms/                 # 이용약관/면책
/{locale}/contact/               # 문의 안내
/{locale}/guides/                # 도구별 사용 가이드 색인
/{locale}/guides/{guideSlug}/    # 워크플로 또는 noindex 처리된 도구별 레거시 주소
/{locale}/workflows/             # 브라우저 내 노드형 워크플로 조립기

/sitemap.xml
/robots.txt
/ads.txt                       # AdSense 승인 후 실제 퍼블리셔 정보 입력
```

- `locale` 허용 값: `ko | en | ja | zh`; 중국어는 **간체**만 제공하고 hreflang은 `zh-CN`으로 한다.
- 슬러그는 언어와 무관하게 동일하게 유지하여 번역/경로 연결을 단순화한다.
- `trailingSlash: true`로 정적 호스팅에서 슬래시 URL과 실제 `index.html`이 일치하도록 한다.
- 홈 화면에 전체 도구 카탈로그를 둔다. 카테고리와 즐겨찾기 필터, 각 도구 행의 별표로 찾기와 즐겨찾기 관리를 제공한다.
- 404 페이지는 정적 페이지로 제공하고 사용자가 홈/목록으로 돌아갈 수 있게 한다.
- `/` 페이지는 JS를 끄거나 검색 봇으로 접근해도 4개 언어 링크를 확인할 수 있어야 한다. `navigator.language`에 따른 자동 강제 리다이렉트 금지.
- 모든 URL은 직접 새로고침하거나 주소창에 입력해도 `out/`만으로 정상 접근 가능해야 한다.

### 2.2 프레임 및 페이지 레이아웃

**홈 화면 (Desktop)**

```text
┌──────────────────────────────────────────────────────────────────────┐
│ DevDesk        Home  Guides                        Search  🌐 Theme │
├──────────────┬───────────────────────────────────────────────────────┤
│              │ Search and localized home heading                     │
│              │ [All] [Favorites] [Format] [Encoding] ...             │
│              │ Recent tools                                           │
│              │ Category groups, descriptions and favorite stars      │
└──────────────┴───────────────────────────────────────────────────────┘
```

**도구 상세 화면 (Desktop)**

- 공통 사이드바에 카테고리, 즐겨찾기, 최근 사용 및 전체 도구 홈 링크를 둔다.
- 상단 내비게이션의 `Home`은 현재 언어 홈으로 이동한다.

**가이드 화면 (Desktop / Mobile)**

- 도구별 가이드 색인은 25개 도구 참조를 제공한다. 홈과 색인에 별도의 실전 워크플로 모음을 반복 배치하지 않는다.
- 여섯 실전 워크플로 문서는 관련 도구 상세 페이지와 sitemap에서 발견할 수 있고, `/{locale}/workflows/`에서 세 신규 레시피와 도구 연결 기능을 제공한다.
- 가이드 색인과 개별 가이드에서는 도구 카테고리 사이드바와 모바일 메뉴 버튼을 숨긴다.
- 상단 헤더는 홈 화면과 같은 열 배치와 검색 바를 사용한다. `Home`과 `Guides`는 브랜드 다음 같은 위치에 두고 현재 경로를 활성 상태로 표시하며, 검색 바는 홈과 같은 너비·placeholder·반응형 축소 동작을 따른다.
- 모바일 헤더도 홈과 같은 배치 기준을 따른다. 도구 사이드바가 없는 가이드 화면에는 모바일 메뉴 버튼을 표시하지 않는다.

**Mobile**

- 상단 헤더, 검색, 접을 수 있는 카테고리 네비게이션.
- 입력과 출력 에디터를 세로로 배치; 긴 코드는 가로 스크롤 지원.
- 실행/복사 버튼은 오작동하지 않을 충분한 크기와 간격 제공.
- 광고는 입력·출력과 실행 버튼 사이에 끼우지 않는다.

### 2.3 디자인 시스템

- 독자적이고 차분한 개발자 도구 UI. 과한 네온, 과도한 그라디언트, 복잡한 일러스트 금지.
- Light/Dark/System 모드 제공, 기본은 시스템 설정.
- 컬러: Neutral slate/gray 기반, 액션에 절제된 블루/인디고 계열 포인트, 에러/성공 상태 색상.
- 폰트: 시스템 폰트 스택, 코드용 monospace; 외부 유료 폰트 및 런타임 원격 폰트 호출 금지.
- 컴포넌트: Button, Input, Select, Tabs, Tooltip, Toast, Dialog, ToolCard, SearchDialog, EditorPanel, ActionToolbar, StatusMessage, AdSlot, Breadcrumbs, LocaleSwitcher, ThemeToggle.
- 접근성: 명확한 라벨, 키보드 탭/포커스, 충분한 대비, `aria-live` 상태 전달, `prefers-reduced-motion` 지원.
- 아이콘: Lucide 또는 유사한 무료 오픈소스 아이콘; 라이선스 고지 준수.
- 라이브러리: Tailwind CSS + 접근성 검증된 Headless UI/shadcn/ui 계열을 선택하되 불필요한 의존성은 최소화.

---

