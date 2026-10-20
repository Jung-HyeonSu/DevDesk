# 상세 요구사항 04 — 도구별 상세 명세

> 기존 GOAL.md의 §4를 분리한 문서입니다. 요구사항 본문은 원문을 유지합니다.

## 4. 초기 출시 도구 12개: 상세 명세

**공통 규칙**

- 모든 도구는 입력 예제 로드, 실행/자동 처리(필요 시 debounce), 결과 복사, 입력 초기화, 성공/오류 상태 표현을 제공한다.
- 포맷 가능한 도구는 2/4칸 들여쓰기 등 해당 설정 제공.
- 입력/출력을 로컬에 자동 영구 저장하지 않는다. 도구 전환 시 원문 전달은 반드시 사용자가 명시적으로 선택한다.
- 각 도구에 오류·경계값 테스트를 작성한다.
- 1 MB 정도의 큰 텍스트부터 경고 또는 크기 제한을 적용하고, CPU 부담 도구에는 더 엄격한 제한을 둔다. 도구별 한계는 UI와 README에 명시한다.
- **실제로 지원하지 않는 기능을 버튼·설명·SEO에서 지원하는 것처럼 표시하지 않는다.**

### T01 — JSON Formatter & Validator (`json-formatter`)

- JSON 붙여넣기 → `JSON.parse`로 문법 검사 → 들여쓰기 2/4칸 정렬.
- Minify, Beautify, Validate, Copy, Download `.json`, Sample, Clear.
- 유효하지 않은 JSON의 파서 오류를 표시하고 가능하면 위치(줄·열)를 추출하되 브라우저별 메시지 차이를 안전하게 처리.
- 별도 트리뷰는 시간 내 가능할 경우 추가; 핵심 기능보다 우선하지 않음.
- 테스트: 정상 객체/배열/primitive, 잘못된 따옴표, trailing comma, 큰 JSON, Unicode.

### T02 — SQL Formatter (`sql-formatter`)

- SQL 붙여넣기 → 가독성 있는 줄바꿈/들여쓰기.
- 방언 선택: Generic, MySQL/MariaDB, PostgreSQL, Oracle (라이브러리에서 실제 지원하는 항목만 활성화).
- SELECT, JOIN, WHERE, CTE, CASE, INSERT, UPDATE 등 복잡한 문장 정렬.
- Formatting 외 SQL 실행, 실제 DB 연결, 쿼리 유효성/결과 보장 기능은 없음.
- 포맷터 오류는 번역된 메시지로 표시하고 원문을 잃지 않음.
- 테스트: CTE, 중첩 SELECT, 주석, 문자열 리터럴, 방언별 함수/따옴표.

### T03 — JWT Decoder (`jwt-decoder`)

- `header.payload.signature` 형식의 JWT를 Base64URL UTF-8 방식으로 해독.
- Header/Payload JSON 보기, `iat`, `nbf`, `exp`의 UTC 및 로컬 표시, 만료 상태(브라우저 시간 기준).
- **디코딩은 서명 검증이 아님**을 UI에 명확히 표기. 위조 가능성을 경고.
- 토큰을 로컬 저장, 로그, 분석 이벤트 또는 외부 API로 절대 전송하지 않음.
- 서명 검증 기능은 기본 제공하지 않는다. 향후 제공하더라도 키 입력·보호 설계를 별도 검토.
- 테스트: Base64URL 패딩, Unicode payload, 손상된 세그먼트, 만료/미만료/미래 nbf.

### T04 — Cron Expression Generator (`cron-generator`)

- MVP는 **표준 Linux 5필드 Cron**만 확실하게 지원 (`분 시 일 월 요일`).
- 분/시/일/월/요일 편집 UI와 표현식 직접 입력, 문법 검사, 쉬운 설명.
- 지원 timezone을 명시하고 다음 실행 시각 5개를 브라우저에서 계산/표시.
- DST(서머타임) 및 월말 경계 테스트. 복잡하거나 의미가 모호한 Cron은 알림과 함께 안전하게 실패.
- 6/7필드 Quartz Cron은 **초기 MVP 제외**하며 별도 기능처럼 과장하지 말 것.
- 테스트: `*/5 * * * *`, `0 9 * * 1-5`, `0 0 1 * *`, DST 경계, 잘못된 범위.

### T05 — Text Diff (`text-diff`)

- 원본/변경 텍스트 입력 → 추가·삭제·변경 구간 강조.
- 줄 단위 Diff 및 필요하면 단어 단위 Diff, side-by-side/unified 탭.
- 공백 무시 옵션(실제로 구현 가능할 때), 변경 개수 요약, Copy.
- 긴 입력에 대해 작업량 상한·성능 경고. HTML로 주입하지 않고 텍스트 안전 렌더링.
- 테스트: 한글/일본어/중국어 문자열, CRLF/LF, 빈 줄, 유사 문자열, 큰 텍스트.

### T06 — Base64 Encoder / Decoder (`base64`)

- UTF-8 텍스트 → Base64 인코딩, Base64 → UTF-8 텍스트 디코딩.
- Base64 URL-safe 옵션을 구분해 제공하거나 일반 Base64와 옵션을 명확히 표시.
- 멀티바이트 문자열 깨짐 방지 (`TextEncoder`/`TextDecoder`).
- 잘못된 인코딩·문자열에 대해 오류 출력, 입력/출력 교환.
- 테스트: ASCII, 한글, 日本語, 中文, emoji, 빈 문자열, invalid base64.

### T07 — URL Encoder / Decoder (`url-encoder`)

- `encodeURIComponent` / `decodeURIComponent` 기반 문자열 인코딩/디코딩.
- 전체 URL이 아닌 **component** 인코딩임을 기본 UI에 명시; 필요 시 query parameter 예제 제공.
- `%` malformed input 안전한 오류 처리.
- 테스트: `&`, `?`, `=`, space, emoji, CJK, 깨진 percent escape.

### T08 — Unix Timestamp Converter (`unix-timestamp`)

- timestamp 초/밀리초 명시 선택하여 ISO 8601 및 사용자 지정 timezone 날짜로 변환.
- 날짜 입력 → 초/밀리초 timestamp 반환, Copy, 현재 브라우저 시간 가져오기.
- 자동 단위 추정으로 인한 오해를 방지하고 단위 선택 필수.
- `Date` 표현 가능 범위·잘못된 날짜 처리, UTC/로컬 구분.
- 테스트: epoch 0, 2038년 이후, 음수 timestamp, 13자리 밀리초, leap day.

### T09 — UUID Generator (`uuid-generator`)

- Web Crypto `crypto.randomUUID()`를 사용한 UUID v4 생성.
- 개수 지정(예: 1~100), 한 줄씩 복사, 다운로드 `.txt`.
- `Math.random` 기반 UUID 생성 금지. 보안 컨텍스트(HTTPS/localhost) 요구 고지.
- 테스트: v4 패턴·유일성·개수 상한·비지원 브라우저 오류.

### T10 — Hash Generator (`hash-generator`)

- 입력 텍스트를 Web Crypto `crypto.subtle.digest`로 SHA-256, SHA-384, SHA-512 해시 생성.
- 출력 hex(필수), Base64(선택).
- 해시는 되돌릴 수 없는 일방향 변환이며 암호화·비밀번호 저장용 KDF가 아님을 명시.
- 입력 텍스트는 저장/전송하지 않음. 비밀 키·사용자 비밀번호 입력 권장 금지.
- 테스트: 공식 테스트 벡터(빈 문자열, ASCII, UTF-8).

### T11 — Regex Tester (`regex-tester`)

- JS 정규식 패턴, `g/i/m/s/u` 등 플래그, 테스트 문자열 입력.
- 매칭 영역 강조, 캡처 그룹·인덱스·일치 횟수 출력.
- **과도한 backtracking으로 탭이 멈추지 않게 별도 브라우저 Web Worker에서 계산하고 시간 초과 시 Worker를 종료/재생성**한다.
- zero-length `g` 매칭 무한루프 방지, 유효하지 않은 플래그·패턴 오류 처리.
- 테스트: 캡처 그룹, zero-length match, malformed pattern, timeout 유발 패턴.

### T12 — YAML ↔ JSON Converter (`yaml-json`)

- YAML → JSON, JSON → YAML 양방향 변환, 포맷 설정, Validate, Copy, Download.
- 안전하고 유지보수되는 브라우저 호환 YAML 파서 사용. 임의 코드 실행/`eval` 금지.
- YAML alias/깊은 중첩/대용량 입력으로 인한 과도한 연산을 고려해 크기·복잡도 제한.
- 날짜·숫자 등 타입이 자동 변환될 수 있다는 유의사항 제공.
- 테스트: 객체/배열, multiline string, 인용된 숫자, 깨진 YAML, Unicode.

### 4.1 공통 실행 편의 기능

- `Ctrl/Cmd + K`: 도구 검색 커맨드 팔레트.
- `Ctrl/Cmd + Enter`: 현재 도구의 기본 실행(코드 에디터 내 단축키 충돌 처리).
- 검색: 도구명, 카테고리, 4개 언어별 별칭·검색 키워드 기반.
- 즐겨찾기 및 최근 사용 **도구 ID만** `localStorage`에 저장; 민감한 입력 원문 저장 금지.
- 실행 결과 Copy/Download, Sample 버튼; 브라우저 권한 오류 시 폴백/메시지.
- 도구 간 연계(선택적): JSON Formatter ↔ YAML Converter, JWT Payload → JSON Formatter. **사용자가 명시적으로 클릭**했을 때만 메모리 내 데이터 전달; URL query/string 또는 분석 로그에 입력값 포함 금지.

---

