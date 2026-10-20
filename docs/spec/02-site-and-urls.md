# 상세 요구사항 02 — 사이트 구성 및 URL

> 기존 GOAL.md의 §2를 분리한 문서입니다. 요구사항 본문은 원문을 유지합니다.

## 2. 사이트 구성 및 URL 설계

### 2.1 정적 URL

언어별 경로를 **실제 빌드 시점에 생성한다**. 런타임 리다이렉트, 쿠키 기반 로케일 탐색, 서버 미들웨어는 사용하지 않는다.

```text
/                        # 4개 언어 선택과 대표 기능을 보여주는 정적 랜딩
/ko/                     # 한국어 홈
/en/                     # English home
/ja/                     # 日本語 home
/zh/                     # 简体中文 home

/{locale}/tools/                  # 전체 도구 검색/목록
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

/{locale}/about/                 # 서비스 소개
/{locale}/privacy/               # 개인정보처리방침
/{locale}/terms/                 # 이용약관/면책
/{locale}/contact/               # 문의 안내
/{locale}/guides/                # 사용 가이드 목록(초기 12개 가이드)
/{locale}/guides/{guideSlug}/    # 해당 언어의 개별 가이드

/sitemap.xml
/robots.txt
/ads.txt                       # AdSense 승인 후 실제 퍼블리셔 정보 입력
```

- `locale` 허용 값: `ko | en | ja | zh`; 중국어는 **간체**만 제공하고 hreflang은 `zh-CN`으로 한다.
- 슬러그는 언어와 무관하게 동일하게 유지하여 번역/경로 연결을 단순화한다.
- `trailingSlash: true`로 정적 호스팅에서 슬래시 URL과 실제 `index.html`이 일치하도록 한다.
- 404 페이지는 정적 페이지로 제공하고 사용자가 홈/목록으로 돌아갈 수 있게 한다.
- `/` 페이지는 JS를 끄거나 검색 봇으로 접근해도 4개 언어 링크를 확인할 수 있어야 한다. `navigator.language`에 따른 자동 강제 리다이렉트 금지.
- 모든 URL은 직접 새로고침하거나 주소창에 입력해도 `out/`만으로 정상 접근 가능해야 한다.

### 2.2 프레임 및 페이지 레이아웃

**Desktop (기본)**

```text
┌──────────────────────────────────────────────────────────────────────┐
│ DevDesk        Tools  Guides                       Search  🌐 Theme │
├──────────────┬───────────────────────────────────────────────────────┤
│ Categories   │ Breadcrumb                                            │
│ Favorites    │ Tool name + short description                         │
│ Recent       │ [ Input Editor   │   Output Editor ]                  │
│ All tools    │ [Format] [Validate] [Copy] [Clear] [Download]        │
│              │ Status, tips and validation messages                 │
│              │ [Reserved Ad Slot - disabled until approval]         │
│              │ How to use / Examples / FAQ / Related tools          │
└──────────────┴───────────────────────────────────────────────────────┘
```

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

