# 상세 요구사항 11 — 구현 단계

> 기존 GOAL.md의 §11를 분리한 문서입니다. 요구사항 본문은 원문을 유지합니다.

## 11. 구현 순서 — 중간에 멈추지 말고 전체 완료

### PHASE 1 — 정적 기반 및 디자인 시스템

1. 저장소 분석, Next.js/TypeScript/Tailwind 설정, Static Export 설정.
2. 글로벌 레이아웃, 헤더, 사이드바, 검색, 라이트/다크 모드, 모바일 메뉴 구현.
3. 공통 툴 카드, 코드 에디터, 액션 바, 알림, 에러 UI 구축.
4. 각 로케일의 홈/목록 페이지와 정적 경로 생성 및 직접 접속 테스트.

**완료 조건:** `out/` 생성 및 4개 언어 홈/목록을 서버 기능 없이 열 수 있음.

### PHASE 2 — 다국어 및 SEO 기반

1. 4개 언어 리소스/타입 검사/locale 전환 구현.
2. 홈/도구 목록/상세/가이드/정책 페이지 공통 템플릿 구현.
3. title/description/canonical/hreflang/sitemap/robots 구성.
4. 도구별 4개 언어 상세 설명·사용법·예제·FAQ 작성.

**완료 조건:** SEO의 주요 내용이 정적 HTML에 포함되고 4개 언어 경로가 모두 빌드됨.

### PHASE 3 — 경량 핵심 도구 6개

1. JSON Formatter.
2. Base64.
3. URL Encoder.
4. Unix Timestamp.
5. UUID Generator.
6. Hash Generator.

**완료 조건:** 6개 도구의 실제 기능과 단위 테스트 완료.

### PHASE 4 — 고급 도구 6개

1. SQL Formatter.
2. JWT Decoder.
3. Cron Generator.
4. Text Diff.
5. Regex Tester(Worker timeout).
6. YAML ↔ JSON.

**완료 조건:** 12개 도구 전체 정상/예외 기능 검증 및 다국어 UI 완성.

### PHASE 5 — 수익화 준비·QA·출시 문서

1. 광고 슬롯 컴포넌트(초기 비활성), 개인정보처리방침/이용약관/문의 등.
2. 도구 간 연계, 즐겨찾기, 최근 사용, 검색 단축키.
3. 4개 언어 E2E, 모바일·접근성·Lighthouse, 성능 개선.
4. 빌드 산출물 검증, Cloudflare Pages 무료 배포 안내, 프로젝트 README.
5. 전체 코드 리뷰, 실패 수정 및 최종 결과 보고.

**완료 조건:** 10.4 체크리스트 전항목 충족. 외부 권한이 필요한 광고 승인/실제 배포만 운영자 작업으로 분리.

---

