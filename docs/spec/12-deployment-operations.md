# 상세 요구사항 12 — 배포 및 운영

> 기존 GOAL.md의 §12를 분리한 문서입니다. 요구사항 본문은 원문을 유지합니다.

## 12. 무료 배포 및 운영 가이드

### 12.1 Cloudflare Pages (추천)

**정적 사이트만 사용. Cloudflare Pages Functions, Workers, D1, KV, R2 사용 금지.**

```text
Build command: npm run build
Build output directory: out
Node version: 선택한 Next.js 버전이 지원하는 LTS
Framework preset: Next.js (Static HTML Export)
```

- Git 연결 후 무료 플랜의 정적 빌드/정적 파일 배포 기능 사용.
- 프리뷰는 `*.pages.dev` 도메인을 활용.
- 광고 연결 전 자체 도메인은 필수가 아니며, 별도 도메인 비용은 사용자가 선택.
- 무료 플랜 사용량·파일 개수·빌드 횟수 제한은 공식 문서로 배포 직전 확인.
- 실수로 유료 리소스/유료 플랜이 활성화되지 않도록 DEPLOYMENT.md에 검수 절차 수록.

### 12.2 환경변수

```dotenv
# 빌드 시 읽을 공개 설정만 허용
NEXT_PUBLIC_SITE_URL=https://example.pages.dev
NEXT_PUBLIC_SITE_NAME=DevDesk
NEXT_PUBLIC_ADS_ENABLED=false
# NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...  # 승인 후에만 지정
# Cloudflare Web Analytics 토큰은 코드의 공개 스니펫에서 설정하며 비밀값이 아님
# NEXT_PUBLIC_CONTACT_EMAIL=...              # 운영자가 소유한 주소만
```

- 예시 주소를 실제 도메인이라고 가정하지 않는다. `SITE_URL` 미설정 시 로컬 검증 가능한 안전한 기본값과 배포 전 설정 경고 제공.
- 외부 광고/연락처 설정 없이도 빌드·도구 사용이 가능해야 한다. Cloudflare Web Analytics는 공개 사이트 토큰 스니펫으로 선택적으로 활성화하며 입력값·결과를 전송하지 않는다.
- 실서비스 배포 전에 정확한 도메인·문의처·개인정보 고지·AdSense 설정을 운영자가 입력한다.
- `.env.example`에는 예시만 포함하고 비밀정보는 커밋하지 않는다.
- 운영 저장소의 광고 기본값은 계속 비활성화한다. 2026-11-20 Cloudflare Pages Production에는 AdSense 승인·동의 준비·광고 플래그와 게시자 ID가 설정되어 있으며, `main` 푸시가 자동 배포를 시작한다.

### 12.3 운영자 수동 단계

- Cloudflare Pages 무료 플랜 계정 연결 및 정적 프로젝트 생성.
- 도메인 선택(무료 pages.dev 또는 별도 구매).
- 소유 이메일/연락처 설정, 개인정보 고지 최종 검토.
- Search Console 등록과 사이트맵 제출.
- Cloudflare Web Analytics를 사용할 때 수동 스니펫과 Pages 자동 삽입을 중복 활성화하지 않고, 등록 hostname 및 개인정보 고지를 확인.
- AdSense 승인 후 publisher ID, 승인·동의·광고 플래그 설정. Privacy & Messaging의 메시지를 게시하고 실제 서비스 동작과 맞는 개인정보 안내를 유지한다. `ads.txt`는 계정에서 정확한 내용을 제공한 경우에만 추가한다.
- 콘텐츠 및 의존성 업데이트를 Git 커밋·정적 재배포로 수행. 운영 DB·서버 패치 없음.

---

