# 상세 요구사항 10 — 테스트 계획

> 기존 GOAL.md의 §10를 분리한 문서입니다. 요구사항 본문은 원문을 유지합니다.

## 10. 테스트 계획 및 검증 자동화

### 10.1 공통 검증 명령

`package.json`에 아래와 동등한 실행 명령을 제공한다.

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
npm run verify:static
npm run verify:i18n
```

- `npm run dev`: 로컬 개발.
- `npm run build`: Next.js 정적 Export.
- `npm run preview` 또는 문서화된 정적 HTTP 서버 명령: **`out/` 폴더만 실제 호스팅하여 테스트**(개발용 서버와 혼동하지 않음).
- `verify:static`: `out/` 생성, 주요 페이지/SEO 파일 확인, API/Functions 산출물 없음 확인, `out` 내 링크 검사.
- `verify:i18n`: 로케일 사전 키·보간 변수·SEO 콘텐츠의 4개 언어 누락 검사.
- 라이선스, 의존성 취약점의 중대 이슈에 대한 점검 방법을 README에 기록.

### 10.2 도구별 단위 테스트

| 도구 | 필수 테스트 |
|---|---|
| JSON | valid/invalid/minify/Unicode |
| SQL | select/join/CTE/주석/방언 |
| JWT | 정상/파손/만료/Unicode/서명 미검증 고지 |
| Cron | 5필드 문법/다음 5회/DST/범위 오류 |
| Diff | 줄 추가·삭제/동일 텍스트/CJK/CRLF |
| Base64 | UTF-8/emoji/invalid input |
| URL | 예약문자/CJK/잘못된 percent escape |
| Timestamp | 초·밀리초/UTC/timezone/epoch 0 |
| UUID | UUID v4 형식/개수 상한 |
| Hash | SHA-256/384/512 공식 벡터 |
| Regex | 매치/그룹/빈 매치/오류/worker timeout |
| YAML/JSON | 양방향/깊은 객체/타입/오류 |

### 10.3 E2E 주요 시나리오

1. `/` 진입 → 4개 언어 링크 모두 활성.
2. `/ko/`, `/en/`, `/ja/`, `/zh/`에서 각 도구 목록·검색·클릭 정상.
3. 각 언어 JSON formatter → 유효 JSON 포맷 → 결과 검증 → 복사.
4. 각 언어 JWT decoder → 유효 토큰 디코딩 → Header/Payload와 경고 확인.
5. 한국어 SQL 포맷터 → Oracle/MariaDB 예제로 출력 확인.
6. 언어 변경 시 동일 도구·언어별 페이지 메타 유지.
7. 테마 전환 및 즐겨찾기, 최근 도구 저장/복구 정상.
8. 모바일 375px 화면에서 메뉴·에디터·버튼 조작 가능.
9. `out/`만 정적 웹 서버로 서빙한 상태에서 각 URL 직접 접속/새로고침 성공.
10. 잘못된 입력·권한 거절·Worker timeout에도 화면 회복.
11. 광고 ID 미설정 시 광고 관련 네트워크 요청/오류 없음.
12. 핵심 도구 입력이 외부 도메인으로 전송되지 않음을 테스트 또는 네트워크 검사로 검증(정적 asset 요청 제외).

### 10.4 출고 체크리스트 (Definition of Done)

- [ ] 핵심 12개 도구가 작동하고 각 기능의 샘플/오류/복사/초기화가 동작.
- [ ] 4개 로케일 × 12개 도구 = 정적 도구 페이지 48개 존재.
- [ ] 4개 언어의 메뉴/도구/가이드/오류/SEO/정책 페이지 번역 완료.
- [ ] `/` 포함 모든 직접 URL의 정적 새로고침 동작.
- [ ] 브라우저 전용 API 사용이 빌드를 깨지 않음.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` 성공.
- [ ] E2E/정적 출력/i18n 검증 성공.
- [ ] 로그인/DB/런타임 서버·함수/외부 변환 API 의존성이 없음.
- [ ] 입력 원문은 브라우저 밖으로 전송·자동 저장되지 않음.
- [ ] 자체 SEO 콘텐츠와 canonical/hreflang/sitemap/robots 완성.
- [ ] 승인되지 않은 광고가 강제로 노출되지 않음.
- [ ] README/배포 문서 작성 및 새 프로젝트 초기화부터 재현 가능.
- [ ] 구현 작업이 기능 단위로 구분되어 검증 후 Git 커밋됨.
- [ ] 각 PHASE 완료 시 원격 Push 수행; 성공 여부와 원격/브랜치/최종 커밋 해시 보고(원격 접근 불가 시 차단 사유 명시).

---

