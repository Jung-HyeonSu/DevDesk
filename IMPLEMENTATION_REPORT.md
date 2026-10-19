# DevDesk implementation report

작성일: 2026-10-19 · 브랜치: `main` · 원격: `origin` (`https://github.com/Jung-HyeonSu/DevDesk.git`)

## 완료 요약

DevDesk를 Next.js App Router 정적 사이트로 구현했다. 한국어(`ko`), 영어(`en`), 일본어(`ja`), 중국어 간체(`zh`, HTML `lang=zh-CN`) 경로에 12개 브라우저 개발자 도구, 사용 가이드, 개인정보·약관·문의 페이지, 다국어 메타데이터를 제공한다.

도구는 JSON 포맷터, SQL 포맷터, JWT 디코더, Linux Cron 생성기, 텍스트 비교, Base64, URL 인코더, Unix 타임스탬프, UUID v4, SHA-2 해시, Web Worker 정규식 검사기, YAML↔JSON 변환기다. JWT 도구는 서명을 검증하지 않는다는 경고를 표시한다. 즐겨찾기와 최근 도구는 브라우저 환경설정으로 저장하고, 검색 단축키와 도구 간 일회성 메모리 전달을 지원한다.

광고 슬롯은 기본 비활성이다. 승인 표시, 동의 준비 표시, 실제 게시자 ID와 슬롯 ID가 모두 설정되지 않으면 광고 마크업과 외부 광고 요청을 만들지 않는다. 개인정보 안내는 입력과 결과가 브라우저에서 처리되고, 도구 간 전달 값은 URL이나 브라우저 저장소에 기록되지 않는 점을 4개 언어로 설명한다. 문서는 공개 전 초안이며 운영자와 법률 검토가 필요하다.

## 정적 아키텍처와 배포

- `next.config.ts`의 `output: 'export'`를 사용한다. `npm run build`가 `out/`을 만든다.
- 배포 산출물에는 정적 HTML/CSS/JS/이미지와 Web Worker만 포함된다. 앱 API, DB, 서버 요청별 렌더링, Pages Functions, Workers가 필요하지 않다.
- `npm run verify:static`은 필수 경로 127개, 도구 페이지 48개, 가이드 48개, sitemap, robots, 메타데이터 및 내부 링크를 검사한다.
- Cloudflare Pages 설정: 빌드 `npm run build`, 출력 디렉터리 `out`, 프레임워크 프리셋 `Next.js (Static HTML Export)`. 자세한 순서는 [DEPLOYMENT.md](./DEPLOYMENT.md)에 있다.
- Cloudflare 공식 문서는 Pages Free의 빌드·파일 제한을 안내하며, 이 한도는 바뀔 수 있으므로 배포 시 [현재 제한](https://developers.cloudflare.com/pages/platform/limits/)을 다시 확인한다. 정적 export 절차는 [Next.js 공식 문서](https://nextjs.org/docs/app/guides/static-exports)를 참고한다.

## 검증 결과

마지막 코드 변경 뒤 다음 검증을 통과했다.

| 명령 | 결과 |
|---|---|
| `npm run lint` | 통과 |
| `npm run typecheck` | 통과 |
| `npm run test` | 18개 테스트 파일, 111개 테스트 통과 |
| `npm run build` | 통과, 129개 정적 경로 생성 |
| `npm run verify:static` | 통과, 필수 경로 127개·도구 48개·가이드 48개 확인 |
| `npm run verify:i18n` | 통과, 4개 로케일·12개 도구·48개 현지화 도구 항목·공유 UI 문구 검사 |
| `npm audit --offline` | 캐시된 감사 데이터에서 취약점 0건 |
| `env PLAYWRIGHT_BROWSERS_PATH=/private/tmp/devdesk-playwright npm run test:e2e -- --workers=2` | 42개 실행 항목 중 26개 통과, 16개 의도적 건너뜀, 실패 0건 |

E2E는 데스크톱 Chromium에서 핵심 도구 흐름과 4개 언어, 검색·즐겨찾기, 데이터 전달, 정책·광고 상태를 검사한다. 모바일 Chromium에서는 360px 폭의 4개 로케일 도구 화면, 이름이 있는 입력·버튼, 가로 넘침, 모바일 메뉴를 검사한다. 4개 언어 전체 도구 조작 시나리오는 데스크톱 E2E에서 실행하고, 중복되는 장시간 모바일 시나리오는 모바일 프로젝트에서 건너뛴다.

Lighthouse 13.5.0의 로컬 정적 미리보기 결과:

| 경로 / 폼 팩터 | Performance | Accessibility | SEO | FCP | LCP | TBT | CLS | Speed Index |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/en/`, 모바일 | 89 | 100 | 100 | 0.9s | 3.8s | 20ms | 0 | 1.1s |
| `/en/tools/json-formatter/`, 모바일 | 78 | 100 | 100 | 1.1s | 6.1s | 20ms | 0 | 1.8s |
| `/en/`, 데스크톱 | 100 | 100 | 100 | 0.3s | 0.8s | 0ms | 0 | 0.3s |

모바일 Performance 90 목표는 홈 89, JSON 도구 78로 충족하지 못했다. 특히 JSON 도구의 모바일 LCP가 6.1초였다. 데스크톱 및 접근성·SEO 점수는 100이다. Lighthouse는 로컬 미리보기에서 실행한 실험실 수치이므로 실제 Cloudflare 배포와 실기기 사용 결과를 대체하지 않는다.

## 환경 설정과 운영자 작업

`.env.example`은 공개 빌드 설정만 담고 있으며 실제 비밀값은 없다. `NEXT_PUBLIC_SITE_URL`에는 Pages의 실제 HTTPS 주소를, `NEXT_PUBLIC_SITE_NAME`에는 사용할 브랜드명을 설정한 뒤 다시 빌드한다. 문의 주소는 운영자 소유 주소를 설정할 때만 표시한다.

광고를 활성화하려면 AdSense 승인과 실제 게시자·슬롯 ID, 지역에 맞는 동의 관리, 법률 검토가 필요하다. Google은 EEA·영국·스위스의 개인화 광고에 인증된 TCF CMP를 요구한다. 설정 전에는 Google의 [CMP 요건](https://support.google.com/adsense/answer/13554116?hl=en)과 [유럽 규정 메시지 안내](https://support.google.com/adsense/answer/10961068?hl=en)를 다시 확인한다. 이 저장소의 동의 준비 플래그는 운영자 빌드 게이트이며 CMP 구현 자체가 아니다. 승인 계정에서 제공한 정확한 내용이 있을 때만 `ads.txt`를 추가한다.

실제 Cloudflare 계정 연결, 도메인 설정, 광고 신청·승인, 동의 관리 도구 도입, 정책의 법률 검토, `ads.txt` 추가 및 프로덕션 배포는 실행하지 않았다.

## Git 커밋과 Phase별 Push

기능별 커밋은 다음과 같다.

| Phase | 커밋 |
|---|---|
| 1 — 정적 기반 | `605e2d0 feat(platform): establish static multilingual foundation` |
| 2 — 다국어·SEO | `468c2d2 feat(i18n): add localized tool content`; `9fc1f95 feat(seo): add localized static content and metadata` |
| 3 — 경량 도구 | `068db20 feat(json): add formatter and validation`; `153b794 feat(base64): add UTF-8 encoder and decoder`; `a271355 feat(url): add component encoder and decoder`; `14a9970 feat(timestamp): add timezone-aware conversion`; `7011c87 feat(uuid): add secure v4 generator`; `0094ef0 feat(hash): add Web Crypto SHA-2 generator` |
| 4 — 고급 도구 | `861949f feat(sql): add dialect-aware formatting`; `58e04ff feat(jwt): add JWT decoder`; `7338867 feat(cron): add Linux cron generator`; `d81905c feat(diff): add line-based text comparison`; `86c16d9 feat(regex): add worker-backed regex tester`; `f7b1f9d feat(yaml): add safe YAML and JSON conversion` |
| 5 — 수익화·QA·출시 | `8d792c2 feat(ads): add disabled-first AdSense slots`; `a05a28e feat(handoff): add in-memory tool transfers`; `dd99ca6 fix(a11y): improve editor semantics and contrast`; `43fd8d5 feat(seo): support build-time site naming`; `8de5a50 docs(deploy): document static hosting and ads`; `079dc59 docs(privacy): document actual data handling`; `7f4df7d test(e2e): cover policy and mobile QA` |

각 Phase 완료 때 현재 체크아웃된 `main` 브랜치에서 기존 `origin`으로 Push를 시도했다. Phase 1–4는 모두 실패했다. Phase 5는 기능 커밋을 포함한 `7f4df7d`에서 시도했고, 보고서 커밋 `f137625` 이후 다시 시도했으나 두 번 모두 GitHub HTTPS 인증을 읽지 못했다. 오류는 다음과 같다.

```text
fatal: could not read Username for 'https://github.com': Device not configured
```

성공한 원격 Push는 없다. 마지막 시도 당시 `origin/main`은 갱신되지 않았다. 인증 정보가 연결된 환경에서 `git push`를 다시 실행해야 현재 로컬 커밋 전체가 원격에 반영된다. 강제 Push나 원격 기록 변경은 사용하지 않았다.

시작 시점부터 staged 상태였던 `GOAL.md`와 untracked `.idea/`는 이 작업 커밋에 포함하지 않았다. 빌드 산출물과 테스트 결과물도 커밋하지 않았다.

## 로컬 실행

```bash
npm ci
npm run dev
```

정적 배포 산출물을 확인하려면 `npm run build` 다음 `npm run preview`를 실행한다. Cloudflare Pages에는 `out/` 디렉터리를 배포한다.
