# 상세 요구사항 03 — 다국어 요구사항

> 기존 GOAL.md의 §3를 분리한 문서입니다. 요구사항 본문은 원문을 유지합니다.

## 3. 다국어(i18n) 상세 요구사항 — **초기 출시 필수**

### 3.1 지원 언어

| 경로 키 | 화면 표시명 | HTML lang | hreflang | 방향 |
|---|---|---|---|---|
| `ko` | 한국어 | `ko` | `ko` | LTR |
| `en` | English | `en` | `en` | LTR |
| `ja` | 日本語 | `ja` | `ja` | LTR |
| `zh` | 简体中文 | `zh-CN` | `zh-CN` | LTR |

- 공통 키 기반 `messages/ko.json`, `messages/en.json`, `messages/ja.json`, `messages/zh.json` 또는 타입 안정적인 TS 사전을 사용한다.
- 도구별 설명, 예제, FAQ, 오류, 확인 알림, 버튼, 검색 키워드, SEO 콘텐츠까지 모두 현지화한다.
- 영문 텍스트를 한국어/일본어/중국어 UI에서 번역 누락 상태로 남기지 않는다(표준 기술 식별자 JSON/JWT/Base64 등은 예외).
- 한국어를 번역 기준으로 삼되 영어/일본어/중국어는 자연스러운 개발자 용어를 사용한다.
- **중국어는 중국 본토 기준 간체**를 사용하고 번체는 초기 범위에서 제외한다.
- 날짜·숫자·시간을 `Intl.DateTimeFormat`/`Intl.NumberFormat`으로 현지화한다. 시간대 변환에서는 선택된 timezone을 명시한다.
- 오류 위치(줄/열), 파일 용량 제한, 저장/복사 성공, 클립보드 권한 에러까지 번역한다.
- 빈 검색 결과, 접근성 레이블, 페이지 제목, HTML `lang`도 언어와 일치한다.

### 3.2 정적 i18n 구현

**주의: Next.js의 서버 의존적 자동 locale 라우팅 기능이나 런타임 미들웨어를 사용하지 않는다.**

- App Router의 `[locale]` 세그먼트 및 각 동적 `[slug]` 경로에 `generateStaticParams()`를 사용한다.
- `dynamicParams = false`를 적용하고 모든 조합을 빌드 시 사전 생성한다.
- Next.js 버전에 맞는 `params` 타입(async Promise 형태 등)을 적용한다.
- 루트 레이아웃 전략은 **실제 각 언어 페이지의 `<html lang>`를 올바르게 설정할 수 있는 정적 구조**로 설계한다. 여러 root layout route group 방식 또는 동일한 결과를 내는 정적 호환 구조를 사용한다. 빌드로 검증하지 않은 중첩 `<html>`이나 `lang=ko` 고정 구현은 금지한다.
- 초기 `locale` 및 필요한 사전은 빌드 시 결정하고 인터랙티브 도구 부분에만 Client Component를 둔다.
- 언어 전환은 대응 페이지로 `Link` 이동: `/ko/tools/json-formatter/` → `/ja/tools/json-formatter/`.
- 같은 페이지가 없는 경우 목록으로 안전하게 이동한다(초기 모든 기능은 4개 언어에 존재해야 함).
- 사용자가 선택한 언어는 `localStorage`에 저장할 수 있으나 URL이 유일한 언어 기준이며, 공유/검색 URL은 언어와 무관하게 변조되지 않아야 한다.
- 빌드 중 `window`, `document`, `localStorage`, `navigator` 접근 금지. 브라우저 전용 코드는 Client Component `useEffect` 또는 이벤트에서만 호출한다.

### 3.3 i18n SEO

각 언어의 모든 페이지에 아래를 제공한다.

- locale별 고유 `title`, `description`, 현지화된 본문과 H1.
- 자기 언어 URL을 참조하는 `canonical`.
- 같은 도구의 4개 언어 URL을 연결하는 `hreflang` alternate (`ko`, `en`, `ja`, `zh-CN`).
- `/`는 적절한 `x-default` 언어 선택 페이지로 사용 가능.
- 동일한 언어 집합을 사이트맵에도 반영하고 누락된 경로가 없는지 확인.
- 언어별 Open Graph 제목/설명/locale 반영.
- 클라이언트 hydration 이전 정적 HTML에도 핵심 설명/가이드가 포함되어야 한다.

### 3.4 번역 QA

- 모든 사전에 동일한 키 집합이 있어야 하며 누락은 테스트 실패 처리.
- 보간 변수 (`{count}`, `{name}` 등)가 4개 언어에서 동일하게 존재하는지 검사.
- 언어 전환 시 선택 도구 유지, 헤더/푸터/설명/오류 문구 변경 확인.
- `ko/en/ja/zh` 각각 적어도 JSON Formatter 및 JWT Decoder 전체 E2E 시나리오 실행.
- 긴 일본어·중국어 레이블에서도 버튼 겹침/잘림이 없게 한다.

---

