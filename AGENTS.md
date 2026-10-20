# DevDesk 개발 하네스

## 작업 시작 시 읽을 문서

1. [`GOAL.md`](./GOAL.md): 다시 작성하기 쉬운 현재 목표와 우선순위.
2. [`WORK_LOG.md`](./WORK_LOG.md): 최신 구현 상태, 검증 결과, 남은 작업, Git 스냅샷.
3. [`docs/spec/README.md`](./docs/spec/README.md): 기존 상세 요구사항 전체의 색인. 작업 범위에 맞는 주제 문서를 함께 읽는다.
4. [`IMPLEMENTATION_REPORT.md`](./IMPLEMENTATION_REPORT.md): 초기 구현의 상세 결과와 역사적 검증 기록. 최신 상태와 다르면 `WORK_LOG.md`를 우선한다.

## 구현 규칙

- 변경 전에 `git status --short --branch`로 staged·unstaged·untracked 파일을 확인하고 사용자 작업을 보존한다.
- 코드 정의와 호출 관계 탐색은 사용 가능한 경우 codebase-memory MCP의 `search_graph`, `trace_path`, `get_code_snippet`, `query_graph`, `search_code`를 우선한다. 저장소가 인덱싱되지 않은 경우 `index_repository`를 먼저 실행한다. 문서·설정·문자열 탐색은 `rg`를 사용한다.
- 루트 `GOAL.md`는 현재 목표로 유지하고, 기존 상세 요구사항은 `docs/spec/`에 보존한다. 새 GOAL을 작성할 때 `docs/spec/`을 덮어쓰거나 삭제하지 않는다.
- 정적 Export, 개인정보, 보안, 배포 제약은 `docs/spec/00-execution-rules.md`, `05-architecture.md`, `08-privacy-security.md`, `12-deployment-operations.md`를 따른다. 서버 API, DB, Pages Functions, Worker 서버 기능을 도입하지 않는다. 기능 입력은 브라우저에서 처리한다.
- 도구를 추가하거나 변경할 때 한국어·영어·일본어·중국어 간체 지원, 키보드 접근성, 오류·경계값 테스트를 함께 검토한다.
- 변경 범위에 맞는 lint, typecheck, unit test, static/i18n 검증, build, E2E를 실행한다. 실행하지 못한 검증은 이유를 기록한다.
- 실제 Cloudflare 배포, Search Console 인증·색인, AdSense 승인 등 외부 상태는 화면이나 공개 URL로 확인하기 전까지 미완료로 둔다.
- 의미 있는 변경 후 `WORK_LOG.md`의 현재 상태, 테스트 결과, 남은 작업을 갱신한다. 요구사항을 바꿀 때는 해당 `docs/spec/` 문서도 갱신한다. `IMPLEMENTATION_REPORT.md`는 초기 상세 보고서로 유지한다.
- commit과 push는 현재 사용자의 요청을 따르고 [`docs/spec/15-git-workflow.md`](./docs/spec/15-git-workflow.md)를 준수한다. 기존 원격·브랜치를 확인하고 무관한 변경을 커밋하지 않는다. Push 전 자동 배포 영향을 고려한다.
