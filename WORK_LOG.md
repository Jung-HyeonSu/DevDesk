# DevDesk 작업 현황

> 마지막 갱신: 2026-10-20 (Asia/Seoul)
>
> 이 문서는 현재 구현 상태와 후속 작업을 기록한다. 현재 목표는 [`GOAL.md`](./GOAL.md), 기존 상세 요구사항 전체는 [`docs/spec/README.md`](./docs/spec/README.md), 초기 구현 결과는 [`IMPLEMENTATION_REPORT.md`](./IMPLEMENTATION_REPORT.md)를 참고한다. 정보가 서로 다르면 이 문서의 최신 확인 내용을 우선하고, 확인하지 못한 운영 상태는 완료로 단정하지 않는다.

## 현재 목표

한국어·영어·일본어·중국어 간체를 지원하는 무료 개발자 도구 사이트 **DevDesk**를 운영한다. Next.js 정적 Export로 배포하고, 도구 입력과 처리는 브라우저 안에서 수행한다. 사용자-facing 사이트 주소는 <https://devdesk-7e7.pages.dev/> 이다.

상세 기능 요건과 완료 기준은 [`docs/spec/README.md`](./docs/spec/README.md)에서 현재 작업에 맞는 문서를 확인한다. 핵심 제약은 다음과 같다.

- 정적 배포 산출물은 `out/`이며 Cloudflare Pages 정적 호스팅을 사용한다.
- 자체 API, DB, 요청별 서버 렌더링, Pages Functions, Workers 서버 기능을 추가하지 않는다. 브라우저 Web Worker는 허용한다.
- 기본 지원 언어는 `ko`, `en`, `ja`, `zh`이며 중국어는 간체다.
- 입력 데이터는 브라우저 밖으로 전송하지 않는다.
- 광고는 승인과 운영자 설정이 끝날 때까지 비활성화한다.

## 현재 구현 상태

### 제품 기능

- 12개 도구 구현: JSON, SQL, JWT, Cron, Text Diff, Base64, URL, Unix Timestamp, UUID, Hash, Regex, YAML/JSON.
- 4개 언어의 홈·도구·가이드·정책 페이지와 정적 경로를 제공한다.
- 검색, 즐겨찾기, 최근 도구, 테마, 도구 간 일회성 데이터 전달을 제공한다.
- 홈 화면을 카탈로그 중심의 시안 2로 바꿨다. 상단 검색 진입, 카테고리 필터, 최근 사용 도구, 설명이 있는 도구 행을 배치했으며, 좁은 화면의 메뉴·목록 배치를 제공한다. 새 화면의 문구는 네 언어에 대응한다.
- 홈 필터에 즐겨찾기를 추가하고 각 도구 행에 별표 토글을 배치했다. 상단 `도구` 링크는 `홈`으로 바꿨고, 카테고리 바로가기와 도구 상세 breadcrumb도 홈 카탈로그로 연결한다. 추가 요청에 따라 별도 `/{locale}/tools/` 목록 경로와 리다이렉트 페이지를 제거했으며 개별 `/{locale}/tools/{slug}/` 상세 경로는 유지한다.
- 입력 성공 시 색종이 효과를 표시한다. 성공 이벤트에서만 실행되고, 동작 감소 설정을 존중하며, 화면 아래에서 위로 약 2.1초 동안 퍼지도록 구현했다.
- SVG 브랜드 아이콘을 루트 페이지와 상단바에 사용한다.
- README는 한국어·영어·일본어·중국어판으로 기능 중심 내용을 제공하고 사이트 주소를 안내한다.

### SEO와 운영 설정

- 다국어 메타데이터, canonical/hreflang, `sitemap.xml`, `robots.txt`를 제공한다.
- JSON formatter/json 포맷터와 도구 메뉴명, 인코더·디코더 관련 검색어를 검색 유입 대상으로 요청받아 반영했다. Google 검색 순위나 색인은 보장되지 않는다.
- Cloudflare Pages의 공개 환경변수 `NEXT_PUBLIC_CONTACT_EMAIL`은 운영자 주소로 설정했다고 사용자가 확인했다. 문의처 미설정 안내는 사이트에 표시되지 않도록 수정했다. 실제 계정 설정은 여기서 독립적으로 조회하지 않았다.
- Google Search Console HTML 인증 파일은 [`public/googlebacd42376b1ee073.html`](./public/googlebacd42376b1ee073.html)에 있다. 정적 빌드 결과 `out/googlebacd42376b1ee073.html`에 파일과 본문이 포함되는 것을 확인했다.
- `pages.dev` 주소만 사용할 경우 DNS 레코드 방식 대신 Search Console의 URL 접두어 속성과 HTML 파일 또는 HTML 태그 인증을 사용한다. DNS TXT 인증은 사용자가 소유·관리하는 도메인의 DNS에 추가한다.

## 검증 기록

| 검증 | 최근 확인 결과 | 참고 |
|---|---|---|
| `npm run lint` | 통과 | 2026-10-20 홈·즐겨찾기·목록 경로 제거 후 재실행 |
| `npm run typecheck` | 통과 | 2026-10-20 목록 경로 제거 후 이전 자동 생성 라우트 타입을 정리하고 재실행 |
| `npm run test` | 통과: 18개 파일, 113개 테스트 | 2026-10-20 |
| `npm run build` | 통과 | 126개 로케일 정적 페이지 생성; 목록 route 없이 개별 도구 경로 유지 확인 |
| `npm run verify:static` | 통과 | 123개 필수 경로, 도구·가이드, sitemap, robots, metadata, 내부 링크 확인; `/ko/tools/index.html` 없음과 도구 상세 페이지 존재 확인 |
| `npm run verify:i18n` | 통과 | 4개 언어와 12개 도구의 다국어 항목 확인 |
| 브라우저 확인 | 통과 | 데스크톱 1440×1024, 모바일 390×844에서 홈·즐겨찾기 토글·필터·카테고리 링크 확인; `/ko/tools/` 직접 접근 시 404, 정적 산출물의 도구 상세 경로 유지 확인 |
| `npm run test:e2e` | 실행 차단 | Playwright preview 서버가 샌드박스에서 `127.0.0.1:4173` bind 시 `EPERM`; E2E 결과 미확인 |
| 기존 E2E 기준 | 초기 구현 보고서 기준 26개 통과, 16개 건너뜀, 실패 0개 | 과거 기록이며 이번 변경 E2E 결과로 간주하지 않음 |
| Lighthouse 모바일 | 목표 미달 | 초기 보고서 기준 홈 89점, JSON 도구 78점; JSON 도구 LCP 6.1초 |

검증 명령은 변경 범위에 맞춰 실행하고, 결과와 실패 원인을 이 표에 갱신한다. 로컬 빌드 통과는 Cloudflare 운영 배포 확인을 의미하지 않는다.

## 다음 작업

1. Cloudflare Pages에 최신 `main`이 배포된 뒤 `https://devdesk-7e7.pages.dev/googlebacd42376b1ee073.html`을 직접 열어 인증 문구를 확인한다.
2. Google Search Console에서 해당 속성의 소유권 확인을 완료하고 `https://devdesk-7e7.pages.dev/sitemap.xml`을 제출한다. 확인 시각과 Search Console 결과를 기록한다.
3. Playwright 브라우저를 사용할 수 있는 환경에서 `tests/e2e/success-confetti.spec.ts`를 실행해 색종이 효과의 성공·실패 조건을 확인한다.
4. 모바일 Lighthouse 성능을 개선해 목표 90점 이상에 근접시키고, 재측정한 URL·환경·점수를 기록한다.
5. AdSense 승인, 광고 게시자/슬롯 ID, 지역별 동의 절차와 정책 문구 검토는 운영자 단계로 남아 있다. 승인 전에는 광고를 활성화하지 않는다.

## Git 스냅샷

- 기준 브랜치: `main`.
- 커밋 전 기준 HEAD: `ccd25bd`; 브랜치는 `main`, 로컬 `origin/main` 기준 1 commit ahead다. 별도 `fetch`로 원격 최신 상태를 확인하지 않았다.
- 홈 화면·즐겨찾기·경로 변경은 기능 단위로 로컬 커밋한다. Push는 요청 범위에 포함되지 않았다.
- 초기 PHASE별 Push 실패 내역은 [`IMPLEMENTATION_REPORT.md`](./IMPLEMENTATION_REPORT.md)의 Git 섹션을 참고한다. 이후의 원격 상태는 매 작업 시작 때 다시 확인한다.
- 원격 반영 여부는 별도로 확인해 기록한다.

## 개발 시 유의사항

- 루트 `GOAL.md`는 짧고 교체 가능한 현재 목표다. 기존의 세부 목표·실행 지침은 `docs/spec/`에 분리해 보존했으므로, 새 GOAL을 작성할 때 해당 자료를 덮어쓰지 않는다.
- 작업 전 `git status --short --branch`를 확인하고, 기존 staged/unstaged 변경을 보존한다.
- 커밋·push는 현재 사용자의 명시적 지시와 [`docs/spec/15-git-workflow.md`](./docs/spec/15-git-workflow.md)의 정책을 함께 확인한다. Push는 Cloudflare 자동 배포를 유발할 수 있다.
- 계정 화면이나 배포 URL을 직접 확인하지 않았다면 환경변수 설정, 배포, Search Console 인증을 완료했다고 보고하지 않는다.
- 실서비스 운영 정보나 사용자 제공 토큰을 필요 이상으로 복제하지 않는다.
