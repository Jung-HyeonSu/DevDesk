# 상세 요구사항 15 — Git 커밋 및 Push 정책

> 기존 GOAL.md의 §15를 분리한 문서입니다. 요구사항 본문은 원문을 유지합니다.

## 15. Git 커밋 및 원격 Push 규칙 (필수)

### 15.1 기본 정책

- **커밋은 기능별, Push는 PHASE별**로 한다. 전체 구현 후 하나의 커밋으로 묶지 않는다.
- 11장의 PHASE 1~5에서 각 독립 기능을 구현한 뒤 관련 테스트를 통과하면 즉시 커밋한다. 같은 도구의 **기능 구현 + 4개 언어 번역 + 해당 도구 테스트**는 하나의 기능 커밋으로 묶어도 된다.
- 각 PHASE의 필수 작업·검증이 끝나면 그 PHASE에서 생성한 커밋들을 **기존 원격 브랜치로 Push**한다. Push 빈도를 제한해 Cloudflare Pages Git 연동 시 불필요한 무료 빌드 사용량을 줄인다.
- 현재 체크아웃된 정상 브랜치와 기존 Git remote를 존중한다. 작업과 무관한 브랜치 변경, 임의 원격 생성, 새 GitHub 저장소 생성은 하지 않는다.
- **`git push --force`, `--force-with-lease`, 원격 기록 덮어쓰기, 무단 rebase/reset, 기존 사용자 변경사항 폐기 금지.**
- 토큰, 비밀번호, 개인 키, 실제 `.env`, 비밀 설정, `out/`, `.next/`, `node_modules/`는 커밋하지 않는다. `.env.example`에는 샘플 값만 포함한다.
- 사용자가 작업 시작 전에 만든 미커밋 변경사항은 덮어쓰거나 몰래 커밋하지 않는다. 구현 관련 파일과 무관한 변경은 staging에서 제외한다.
- **실제 원격 Push 성공은 확인된 Git 결과로만 보고한다.** 로컬 커밋 성공만으로 원격 반영을 주장하지 않는다.

### 15.2 기능 구현 → 테스트 → 커밋 → 단계별 Push

1. 시작 시 `git status --short --branch`, `git remote -v`, `git branch --show-current`로 현재 저장소 상태를 확인한다. 기존 수정 파일과 추적되지 않은 파일을 기록한다.
2. 기능 1개를 완성하고 해당 도구의 테스트, 타입 검사, 린트를 실행한다. 정적 Export 설정에 영향을 주는 변경은 `npm run build`도 실행한다.
3. `git diff --check`, `git diff`로 변경사항을 검토하고, 해당 기능 관련 파일만 명시적으로 `git add <paths...>` 한다. `git add .`로 무관한 변경을 포함하지 않는다.
4. `git diff --cached`를 확인한 뒤 Conventional Commits 형식으로 **로컬 커밋**한다.
5. 다음 기능으로 넘어가 2~4를 반복한다. 서로 다른 기능을 검증 없이 한꺼번에 커밋하지 않는다.
6. PHASE 완료 시 관련 테스트와 `npm run build`를 검증하고, 새 커밋 목록·원격 상태를 확인한 후 **`git push`** 한다.
7. 업스트림이 이미 설정돼 있다면 현재 브랜치에서 `git push`를 수행한다. 업스트림이 없지만 `origin`이 존재하고 브랜치가 정상적으로 체크아웃된 경우에만 `git push -u origin HEAD`를 사용한다. `origin`이 아닌 기존 원격/업스트림이 설정돼 있다면 그 설정을 존중한다.
8. 성공한 Push의 대상 원격·브랜치와 최종 커밋 해시를 기록한다. 모든 PHASE 완료 후 `git status`, `git log --oneline`으로 상태와 커밋 목록을 보고한다.

> **Push 실패 시:** 원격 저장소가 없거나 접근 권한·인증 정보가 없으면 인증을 우회하거나 임의 저장소를 생성하지 않는다. 원격 브랜치가 앞서 있거나 충돌, 브랜치 보호 규칙으로 거절되면 강제 Push하지 않는다. 안전하게 가능한 로컬 구현·커밋·검증은 계속 진행하되 Push 실패와 사용자가 해결해야 할 조건을 명확히 보고한다. CI/CD 자동 배포 실패도 Push 성공과 별도로 기록한다.

### 15.3 커밋 메시지 규칙

- 형식: `<type>(<scope>): <imperative English description>`
- 타입: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`.
- 제목은 영문으로 짧고 명확하게 작성한다. 하나의 커밋은 되돌릴 수 있는 최소한의 논리적 작업 단위로 유지한다.

예상 커밋 예시(실제 구현 단위에 맞게 조정 가능):

```text
chore(project): initialize Next.js static project
feat(layout): implement responsive application shell
feat(theme): add light and dark themes
feat(i18n): add Korean English Japanese and Chinese locales
feat(seo): add multilingual metadata and sitemap
feat(json): implement JSON formatter and validator
feat(base64): implement Base64 encoder and decoder
feat(url): implement URL encoder and decoder
feat(timestamp): implement Unix timestamp converter
feat(uuid): implement UUID generator
feat(hash): implement SHA hash generator
feat(sql): implement SQL formatter
feat(jwt): implement JWT decoder
feat(cron): implement cron expression generator
feat(diff): implement text diff tool
feat(regex): implement regex tester
feat(yaml): implement YAML and JSON converter
feat(ads): add disabled-by-default AdSense components
test(e2e): verify multilingual static routes and core workflows
docs(readme): document local development and free static deployment
```

### 15.4 무료 호스팅 및 자동 배포 유의사항

- GitHub 등 원격 저장소가 Cloudflare Pages에 연결돼 있으면 **Push만으로도 자동 정적 빌드·배포가 발생할 수 있다.** 연결 여부와 대상 브랜치를 확인하고 이를 최종 보고에 명시한다.
- 무료 플랜의 빌드 횟수·용량·자동 배포 정책을 고려해 **모든 커밋마다 Push하지 않고 PHASE 완료 시 묶어서 Push**한다.
- CI/CD가 있어도 서버/API/유료 컴퓨팅 자원을 새로 만들지 않는다. 외부 플랫폼 계정 변경 또는 유료 플랜 활성화는 금지한다.
- 원격 Push 권한이 없더라도 기능 구현은 로컬에서 완료하고, 미반영 커밋의 식별자를 보고한다.

### 15.5 완료 체크리스트

- [ ] 기능별로 명확한 Conventional Commits 커밋 생성.
- [ ] 5개 PHASE의 완료 지점마다 Push 시도 및 결과 기록.
- [ ] 원격 저장소와 현재 브랜치를 추측하지 않고 실제 설정 확인.
- [ ] 강제 Push·임의 원격 생성·민감정보 커밋 없음.
- [ ] 최종 보고서에 `git status`, 커밋 목록, 원격 Push 성공/실패, 대상 브랜치, 최종 SHA 명시.
