# DevDesk 작업 현황

> 마지막 갱신: 2026-10-20 (Asia/Seoul)
>
> 이 문서는 현재 구현 상태와 후속 작업을 기록한다. 현재 목표는 [`GOAL.md`](./GOAL.md), 기존 상세 요구사항 전체는 [`docs/spec/README.md`](./docs/spec/README.md), 초기 구현 결과는 [`IMPLEMENTATION_REPORT.md`](./IMPLEMENTATION_REPORT.md)를 참고한다. 정보가 서로 다르면 이 문서의 최신 확인 내용을 우선하고, 확인하지 못한 운영 상태는 완료로 단정하지 않는다.

## 현재 목표

한국어·영어·일본어·중국어 간체를 지원하는 무료 개발자 도구 사이트 **DevDesk**를 운영한다. 기존 12개 도구를 유지하면서 다국어 코드 정리 도구를 추가하는 것이 현재 제품 목표다. Next.js 정적 Export로 배포하고, 도구 입력과 처리는 브라우저 안에서 수행한다. 사용자-facing 사이트 주소는 <https://devdesk-7e7.pages.dev/> 이다.

상세 기능 요건과 완료 기준은 [`docs/spec/README.md`](./docs/spec/README.md)에서 현재 작업에 맞는 문서를 확인한다. 핵심 제약은 다음과 같다.

- 정적 배포 산출물은 `out/`이며 Cloudflare Pages 정적 호스팅을 사용한다.
- 자체 API, DB, 요청별 서버 렌더링, Pages Functions, Workers 서버 기능을 추가하지 않는다. 브라우저 Web Worker는 허용한다.
- 기본 지원 언어는 `ko`, `en`, `ja`, `zh`이며 중국어는 간체다.
- 입력 데이터는 브라우저 밖으로 전송하지 않는다.
- 광고는 승인과 운영자 설정이 끝날 때까지 비활성화한다.

## 현재 구현 상태

### 제품 기능

- 12개 기존 도구 구현: JSON, SQL, JWT, Cron, Text Diff, Base64, URL, Unix Timestamp, UUID, Hash, Regex, YAML/JSON.
- T13 코드 정리 도구 구현: C, C#, C++, CSS, Go, HTML, Java, JavaScript, Perl, PHP, Python, Ruby, SQL, TypeScript 구문 강조, 5개 테마, 샘플, 브라우저 Worker 기반 포맷, 복사, PNG 저장, 1 MiB 입력 제한을 제공한다. 포맷은 같은 입력 에디터에서 처리하며 별도 결과 에디터를 두지 않는다. 14개 언어 모두 자동 포맷을 제공하며, Perl은 브라우저 WASM Tree-sitter 문법 분석으로 문장 줄바꿈과 블록 들여쓰기를 정리한다. 문법 오류 시 원문을 보존한다. Go는 `gofmt` 표준 들여쓰기를 사용한다.
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
| `npm run lint` | 통과 | 2026-10-20 코드 정리 도구 구현 후 |
| `npm run typecheck` | 통과 | 2026-10-20 코드 정리 도구 구현 후 |
| `npm run test` | 통과: 19개 파일, 120개 테스트 | 2026-10-20, Perl 포맷 테스트 포함 |
| `npm run build` | 통과 | 134개 정적 페이지 생성; 13번째 도구와 Tree-sitter WASM 자산 포함 |
| `npm run verify:static` | 통과 | 131개 필수 경로, 도구·가이드 52개씩, sitemap, robots, metadata, 내부 링크 확인 |
| `npm run verify:i18n` | 통과 | 4개 로케일, 13개 도구, 도구 번역 52개, 예제·FAQ 번역 확인 |
| Playwright 코드 정리 도구 E2E | 통과: 2개 시나리오 | Chromium 데스크톱·모바일에서 단일 입력 에디터 포맷 갱신, 테마, 복사, 에디터 영역 PNG 크기, 정렬·복사·이미지 저장의 개별 성공 색종이 효과, 14개 자동 포맷 언어와 Perl WASM 동작 확인. 로컬 미리보기 서버 실행 권한 승인 후 검증 |
| Playwright 기존 성공 색종이 E2E | 통과: 2개 시나리오 | Chromium 데스크톱·모바일에서 JSON 포맷·검증·압축 성공 효과와 잘못된 입력 오류 시 효과 미표시 확인 |
| 기존 E2E 기준 | 초기 구현 보고서 기준 26개 통과, 16개 건너뜀, 실패 0개 | 과거 기록이며 이번 변경 E2E 결과로 간주하지 않음 |
| Lighthouse 모바일 | 목표 미달 | 초기 보고서 기준 홈 89점, JSON 도구 78점; JSON 도구 LCP 6.1초 |

검증 명령은 변경 범위에 맞춰 실행하고, 결과와 실패 원인을 이 표에 갱신한다. 로컬 빌드 통과는 Cloudflare 운영 배포 확인을 의미하지 않는다.

## 다음 작업

1. Cloudflare Pages에 최신 `main`이 배포된 뒤 `https://devdesk-7e7.pages.dev/googlebacd42376b1ee073.html`을 직접 열어 인증 문구를 확인한다.
2. Google Search Console에서 해당 속성의 소유권 확인을 완료하고 `https://devdesk-7e7.pages.dev/sitemap.xml`을 제출한다. 확인 시각과 Search Console 결과를 기록한다.
3. Playwright 브라우저를 사용할 수 있는 환경에서 `tests/e2e/success-confetti.spec.ts`를 실행해 색종이 효과의 성공·실패 조건을 확인한다.
4. 모바일 Lighthouse 성능을 개선해 목표 90점 이상에 근접시키고, 재측정한 URL·환경·점수를 기록한다.
5. AdSense 승인, 광고 게시자/슬롯 ID, 지역별 동의 절차와 정책 문구 검토는 운영자 단계로 남아 있다. 승인 전에는 광고를 활성화하지 않는다.

## 요구사항 및 구현 기록 (2026-10-20)

- 초기 사용자 요청에 따라 언어 목록, 여러 색상 테마, 코드 정렬, 복사, 이미지 저장, 브라우저 내 처리, 다국어·접근성·오류 경계값 기준을 `GOAL.md`와 `docs/spec/04-tools.md`에 기록했다.
- 이후 T13를 구현하고 `docs/spec/10-testing.md`에 언어별 검증 범위를 추가했다. Perl 자동 포맷은 MIT 라이선스 `tree-sitter-perl` 문법과 `web-tree-sitter` WASM 런타임으로 브라우저 Worker 안에서 제공한다. 문장 구분과 블록 들여쓰기를 구조적으로 정리하고, heredoc·다중 행 문자열의 내용은 보존한다. GPL-2.0인 Perl::Tidy는 Apache-2.0 프로젝트에 포함하지 않았다. 라이선스 고지와 WASM 재생성 명령은 `public/licenses/README.md`에 기록했다.
- 사용자 요청에 따라 별도 포맷 결과 에디터를 제거했다. 정렬 결과는 입력 에디터에 바로 반영하고, 복사와 PNG 저장도 해당 에디터의 현재 코드를 사용한다. E2E에서 데스크톱·모바일 동작을 확인했다.
- 전체 단위 테스트 120개, lint, typecheck, static/i18n 검증, 정적 Export 및 데스크톱·모바일 Chromium E2E를 통과했다. 이번 작업은 사용자의 지시에 따라 commit/push하지 않았다.

## Git 스냅샷

- 기준 브랜치: `main`.
- 현재 확인 HEAD: `9e43c1d`; 로컬 `origin/main` 추적 ref와 같은 위치다. 별도 `fetch`는 실행하지 않아 원격 서버의 최신 상태는 확인하지 않았다.
- 이번 코드 정리 도구 변경은 사용자의 지시에 따라 commit/push하지 않았다.
- 초기 PHASE별 Push 실패 내역은 [`IMPLEMENTATION_REPORT.md`](./IMPLEMENTATION_REPORT.md)의 Git 섹션을 참고한다. 이후의 원격 상태는 매 작업 시작 때 다시 확인한다.
- 원격 반영 여부는 별도로 확인해 기록한다.

## 개발 시 유의사항

- 루트 `GOAL.md`는 짧고 교체 가능한 현재 목표다. 기존의 세부 목표·실행 지침은 `docs/spec/`에 분리해 보존했으므로, 새 GOAL을 작성할 때 해당 자료를 덮어쓰지 않는다.
- 작업 전 `git status --short --branch`를 확인하고, 기존 staged/unstaged 변경을 보존한다.
- 커밋·push는 현재 사용자의 명시적 지시와 [`docs/spec/15-git-workflow.md`](./docs/spec/15-git-workflow.md)의 정책을 함께 확인한다. Push는 Cloudflare 자동 배포를 유발할 수 있다.
- 계정 화면이나 배포 URL을 직접 확인하지 않았다면 환경변수 설정, 배포, Search Console 인증을 완료했다고 보고하지 않는다.
- 실서비스 운영 정보나 사용자 제공 토큰을 필요 이상으로 복제하지 않는다.

## 정책 페이지 콘텐츠 (2026-10-20)

- 소개, 개인정보처리방침, 이용약관을 한국어·영어·일본어·중국어 간체로 확장했다. 각 페이지에 서비스가 제공하는 도구, 브라우저 내 처리 방식, 도구별 한계, 운영자 문의 경로를 구체적으로 설명한다.
- 개인정보처리방침에는 브라우저 로컬 저장 설정, Cloudflare Pages의 일반 요청 정보, 이메일 문의 처리, 기본 광고 비활성 상태, AdSense 광고 쿠키·맞춤 광고 선택, EEA·영국·스위스 동의 관리 안내와 공식 안내 링크를 담았다.
- 이용약관은 금지 이용, 출력 검증 책임, SQL·JWT·해시의 제한, 제3자 서비스, 가용성과 책임 범위를 다룬다. 실제 운영자 신원·지역, 광고 파트너 목록, 보유 설정, 동의 절차의 법률 검토는 광고 활성화 전 작업으로 [`DEPLOYMENT.md`](./DEPLOYMENT.md)에 남겼다.
- 검증: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run verify:static`, `npm run verify:i18n`, `git diff --check` 통과. 단위/E2E 테스트, 공개 배포 URL 확인, Google AdSense 검토 결과는 이번 작업에서 확인하지 않았다.

## 텍스트 비교 다크 테마 가독성 (2026-10-20)

- 추가·삭제 줄에 밝은 배경과 어두운 테마 글자색이 섞이던 문제를 테마별 대비 색으로 수정했다. 선택된 나란히 보기·통합 보기 탭도 강조 배경을 표시한다.
- 나란히 보기 표에 줄 번호 열 너비를 명시해 `colspan` 헤더 때문에 줄 번호 칸이 과도하게 넓어지지 않도록 했다. 브라우저 너비 기준 2.5rem로 제한한다.
- 검증: Text Diff 변경 당시 `npm run lint`, `npm run typecheck`, `git diff --check`를 확인했다. 이후 코드 정리 도구의 Worker 자산 경로를 브라우저 정적 URL로 고쳐 `npm run build`, `npm run verify:static` 및 데스크톱·모바일 코드 정리 도구 E2E를 통과했다.

## 코드 정리 도구 이미지 저장 및 성공 효과 (2026-10-20)

- PNG 저장은 카드나 입력 라벨·하단 상태 표시를 포함하지 않고 `.code-editor` 영역만 캡처하도록 변경했다. 테마 배경과 구문 강조는 유지한다.
- 공용 성공 이벤트 알림을 코드 정리 도구의 실제 정렬 완료, 클립보드 복사 성공, PNG 다운로드 시작 완료 지점에서 호출해 각 동작 성공 시 색종이 효과가 표시되도록 했다. 권한 거절·오류 경로에서는 호출하지 않는다. 기존 공용 효과의 `prefers-reduced-motion` 설정 준수는 유지한다.
- Playwright E2E에서 3개 동작 각각에 색종이 48개가 표시되는 것과 다운로드 PNG의 너비·높이가 에디터 영역 크기(2배 해상도)에 맞는 것을 Chromium 데스크톱·모바일에서 확인했다.
- 검증: `npm run lint`, `npm run test`(19개 파일, 120개 테스트), `npm run build`(134개 정적 페이지), `npm run typecheck`, `npm run verify:static`, `npm run verify:i18n`, `npm run test:e2e -- --grep "code formatter formats code in place" --workers=1`(2개 통과), 기존 성공·실패 색종이 E2E(데스크톱·모바일 2개 통과), `git diff --check` 통과. CodeMirror 모바일 입력 검증은 select-all 후 입력하도록 안정화했다. 변경은 commit/push하지 않았다.
