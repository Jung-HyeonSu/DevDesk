# 상세 요구사항 04 — 도구별 상세 명세

> 기존 GOAL.md의 §4를 분리한 문서입니다. 요구사항 본문은 원문을 유지합니다.

## 4. 초기 출시 도구 12개: 상세 명세

**공통 규칙**

- 모든 도구는 입력 예제 로드, 실행/자동 처리(필요 시 debounce), 결과 복사, 입력 초기화, 성공/오류 상태 표현을 제공한다.
- 포맷 가능한 도구는 2/4칸 들여쓰기 등 해당 설정 제공.
- 긴 입력을 편집해도 기본 실행 버튼이 입력창 아래로 밀려나지 않도록 도구별 기본 액션 바를 입력 영역 위에 배치하고 sticky 방식으로 접근 가능하게 유지한다. 성공 상태, 오류 상태, 복사·내보내기 액션은 구분한다.
- 모든 실제 도구 작업·복사·내보내기가 성공하면 공용 성공 피드백(폭죽)을 표시한다. 실패·빈 입력·권한 거절에서는 표시하지 않고 `prefers-reduced-motion`을 준수한다.
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

### T13 — Code Formatter & Image Export (`code-formatter`)

- 사용자가 언어를 선택하고 코드를 입력하면 해당 언어의 구문 강조를 적용해 표시한다.
- 초기 언어 목록: C, C#, C++, CSS, Go, HTML, Java, JavaScript, Perl, PHP, Python, Ruby, SQL, TypeScript. 14개 언어 모두 구문 강조를 제공한다.
- 자동 포맷은 14개 언어 모두 제공한다. Perl은 브라우저에서 Tree-sitter 문법 분석으로 문장 줄바꿈과 블록 들여쓰기를 정리한다. 문법 분석에 실패한 입력은 원문을 보존하고 오류를 표시한다. 지원되지 않는 문법을 정상 포맷한다고 표시하지 않는다.
- 여러 구문 강조 색상 테마를 선택할 수 있고, 자동 포맷 언어는 코드 정렬과 들여쓰기 옵션을 제공한다. Go는 `gofmt`가 정하는 표준 들여쓰기를 사용한다.
- 코드 정렬 결과는 별도 출력 영역을 만들지 않고 같은 입력 에디터의 내용을 갱신한다. 현재 에디터의 코드를 클립보드에 복사하고 에디터 영역만 PNG 이미지로 저장할 수 있다. 정렬·복사·이미지 저장 성공 시 색종이 효과를 표시한다. 입력 초기화, 성공·오류 상태도 제공한다.
- 모든 처리는 브라우저에서 수행한다. 코드 입력·결과를 서버, 외부 변환 API, 분석 로그, 영구 브라우저 저장소로 보내거나 저장하지 않는다.
- 포맷 오류가 나도 원문을 보존하고 이해 가능한 오류를 표시한다. 입력 크기는 1 MiB로 제한하고 초과 시 안내한다. 포맷 처리는 브라우저 Web Worker에서 실행한다.
- 도구 이름, 설명, 언어명, 테마, 버튼, 오류·상태 메시지를 ko/en/ja/zh로 현지화하고 키보드 접근 및 적절한 대비를 지원한다.
- 테스트: 14개 언어 구문 강조와 자동 포맷, Perl 블록·중첩 블록·Unicode·문자열·heredoc·잘못된 문법, 포맷 실패 시 원문 보존, 복사 권한 거절, 테마를 유지한 에디터 영역만 PNG 내보내기, 정렬·복사·이미지 저장 성공 시 색종이 효과, 1 MiB 경계값.

### T14 — JSON Pointer Inspector (`json-pointer`)

- RFC 6901의 단일 JSON Pointer를 적용해 object key와 array index를 순서대로 조회한다. 빈 포인터는 root를 뜻하며, `~1`과 `~0`만 유효한 토큰 escape다.
- JSON 문법 오류, 잘못된 포인터, 존재하지 않는 경로를 구분하고 결과 값과 타입을 표시한다.
- JSONPath, filter, wildcard, multi-result query는 지원하지 않는다고 명시한다. 1 MiB 제한을 적용한다.
- 테스트: root 및 scalar 값, 중첩 객체, 배열 경계, `/`와 `~`가 들어간 키, 잘못된 escape, 비어 있거나 잘못된 JSON, 없는 경로.

### T15 — CSV ↔ JSON Converter (`csv-json`)

- comma, tab, semicolon 구분자를 지원하고 quoted delimiter, quote escaping, quoted newline, CRLF 입력을 처리한다.
- CSV 첫 행을 고유한 object key로 사용해 JSON object array로 변환한다. JSON 방향은 object array를 받아 최초 발견 순서로 CSV columns를 구성한다.
- CSV 타입을 자동 추측하지 않고 모든 imported cell을 string으로 보존한다. 중첩 JSON 값의 직렬화와 빠진 속성의 빈 셀 규칙을 표시한다. 입력은 1 MiB로 제한한다.
- 테스트: delimiter 종류, quoted comma/tab, doubled quote, quoted multiline cell, CRLF, BOM, 빈 줄, 중복/빈 헤더, 행 열 개수 불일치, JSON 비배열·비객체, 값 escaping.

### T16 — URL Inspector (`url-inspector`)

- 브라우저의 표준 URL parser로 absolute HTTP/HTTPS URL의 origin, host, path, query, fragment를 분석한다. 중복 query key와 순서를 보존한다.
- 파싱만 수행하고 입력 URL로 요청하지 않는다. user/password 값은 결과에 넣지 않으며 query string에 민감한 값이 있을 수 있음을 알린다. 64 KiB 제한을 적용한다.
- 테스트: percent-encoded query, 중복 매개변수, 기본·사용자 지정 port, fragment, credentials redaction, relative/invalid URL, 비 HTTP(S) scheme.

### T17 — HTML Entity Encoder / Decoder (`html-entities`)

- HTML 텍스트 문맥을 위해 `&`, `<`, `>`, 큰따옴표, 작은따옴표를 escape한다. decoder는 `amp`, `apos`, `gt`, `lt`, `nbsp`, `quot`와 semicolon-terminated numeric character reference를 처리한다.
- HTML을 DOM에 넣거나 실행하지 않는다. sanitizer나 XSS 방지 도구가 아님을 UI와 콘텐츠에 명시한다. 1 MiB 제한을 적용한다.
- 테스트: 각 escape 문자, 앰퍼샌드 처리 순서, named/numeric/hex references, HTML C1 code point mapping, 잘못된 Unicode scalar, 알 수 없는 entity 보존, 반복 변환, 크기 제한.

### 4.1 공통 실행 편의 기능

- `Ctrl/Cmd + K`: 도구 검색 커맨드 팔레트.
- `Ctrl/Cmd + Enter`: 현재 도구의 기본 실행(코드 에디터 내 단축키 충돌 처리).
- 검색: 도구명, 카테고리, 4개 언어별 별칭·검색 키워드 기반.
- 즐겨찾기 및 최근 사용 **도구 ID만** `localStorage`에 저장; 민감한 입력 원문 저장 금지.
- 실행 결과 Copy/Download, Sample 버튼; 브라우저 권한 오류 시 폴백/메시지.
- 도구 간 연계(선택적): JSON Formatter ↔ YAML Converter, JWT Payload → JSON Formatter. **사용자가 명시적으로 클릭**했을 때만 메모리 내 데이터 전달; URL query/string 또는 분석 로그에 입력값 포함 금지.

## 4.2 콘텐츠 가치 확장 도구 (T18–T25)

공통 규칙은 T01–T17을 따른다. 각 신규 도구는 브라우저에서 실제 입력을 처리하고, 네 언어에 재현 가능한 예제·결과 판독법·지원 범위·한계·FAQ·공식 출처를 제공한다.

### T18 — JSON Schema Validator (`json-schema-validator`)

- JSON Schema Draft 2020-12 스키마와 JSON 인스턴스를 별도로 받아 문법 오류와 유효성 오류를 구분한다. 오류에는 JSON Pointer 경로, keyword, 사람이 읽을 수 있는 설명을 제공한다.
- 외부 `$ref`를 네트워크에서 가져오지 않는다. 사용자 정의 format은 annotation으로만 취급하며, 외부 참조가 필요한 경우 지원하지 않음을 표시한다.
- 테스트: 유효/무효 스키마와 인스턴스, 타입·required 오류, JSON 문법 오류, 로컬 참조 경계, 외부 `$ref` 차단, format annotation.

### T19 — OpenAPI Explorer (`openapi-explorer`)

- JSON 또는 YAML OpenAPI 3.2 문서를 파싱해 제목·버전·HTTP operation·경로·요약·parameter·request content type·response status를 읽기 쉬운 목록으로 보여준다.
- API를 호출하거나 문서의 외부 `$ref`를 네트워크에서 가져오지 않는다. 전체 적합성 검증기는 아니며, paths에서 찾은 operation을 탐색하는 도구다.
- 테스트: 3.2 문서의 operation 추출, 잘못된 문서, 미지원 버전, 빈 paths, 외부 참조, YAML 입력.

### T20 — cURL ↔ Fetch Converter (`curl-fetch-converter`)

- 제한된 정적 문법으로 `curl`의 URL, 흔한 method, header, data 옵션을 Fetch 코드로 바꾸고, 정적 `fetch("url", {method, headers, body})` 호출을 cURL 명령으로 바꾼다.
- 명령이나 JavaScript를 실행하지 않는다. 동적 표현식과 미지원 옵션을 구분해 오류로 표시하고, URL userinfo는 출력에서 제거한다. 결과를 공유하기 전 민감한 값 검토를 안내한다.
- 테스트: 양방향 기본 변환, 공백·따옴표, 미지원 cURL 옵션, 동적 Fetch 코드, 잘못된 URL·header, GET/HEAD body, 크기 제한.

### T21 — HTTP Response Header Diagnostics (`http-header-inspector`)

- 사용자가 붙여넣은 HTTP status line과 response header만 파싱한다. 보안·캐시·콘텐츠 정책 관련 누락 또는 의심 구성을 설명하되 사이트에 요청을 보내거나 서버 설정을 확정적으로 판정하지 않는다.
- 테스트: status line, 중복·잘못된 헤더, 대소문자, 여러 정책 조합, 빈 입력.

### T22 — `.env` Key Diff (`env-diff`)

- 두 환경 파일의 키 집합과 값의 존재 여부(설정·빈 값·누락)를 비교한다. 중복 키와 파싱 실패 줄을 위치로 알린다. 값 원문은 보고서에 포함하지 않는다.
- 테스트: 추가·누락·중복·빈 키·빈 값, export 접두사, 주석·따옴표, 잘못된 줄, 민감 값이 결과에 없는지 확인.

### T23 — `.gitignore` Pattern Checker (`gitignore-tester`)

- 패턴 목록과 가상 파일 경로 목록으로 각 경로의 무시 여부를 확인하고 마지막으로 일치한 규칙과 예외 패턴(`!`)을 설명한다.
- 실제 파일 시스템이나 Git 저장소를 읽지 않으며, 경로 테스트 결과는 입력한 패턴에 대한 설명으로 한정한다.
- 테스트: glob·디렉터리·슬래시·중첩 경로·마지막 규칙 우선순위·예외 패턴·빈 규칙.

### T24 — HAR Privacy Scrubber (`har-scrubber`)

- HAR 1.2 JSON의 request/response header·cookie·URL query·post data·response text 등 알려진 민감 위치를 휴리스틱으로 가린다. 변환 결과를 검토·복사·다운로드할 수 있다.
- 완전한 익명화를 보장하지 않는다. 사용자 정의 필드, 자유 텍스트, 인코딩된 데이터에 민감 정보가 남을 수 있으므로 공유 전 직접 검토하도록 알린다.
- 테스트: authorization/cookie/query/body의 알려진 민감 값, 중첩 객체 키, 사용자 정의 텍스트 한계 경고, 잘못된 HAR와 미지원 버전.

### T25 — Markdown Link & Anchor Checker (`markdown-link-checker`)

- 사용자가 선택한 Markdown 파일 최대 20개 사이에서 로컬 파일 경로·상대 링크·heading anchor·reference link를 검사한다. 코드 블록 내 링크는 제외하고 파일과 줄 번호를 제공한다.
- 선택한 파일만 메모리에서 다루며 외부 링크는 요청하지 않는다. 선택하지 않은 로컬 파일의 존재나 웹사이트 전체 경로를 검증하지 않는다.
- 테스트: 정상·누락 로컬 경로, 존재하지 않는 anchor, heading slug, reference 정의, 코드 블록 제외, 공백·상대 경로, 파일 개수·크기 한계.

### 4.3 워크플로 조립기

- 도구 레지스트리 어댑터가 타입이 지정된 input/output port와 실행 함수를 선언한다. 타입이 일치하는 포트만 연결할 수 있고, 순환·분기·반복은 막는다.
- 레시피는 로케일별 제목·설명, node ID/adapter ID, typed edge만 담는다. 입력과 실행 결과는 브라우저 메모리에만 존재하고 URL, `localStorage`, 분석 로그 또는 서버에 저장하지 않는다.
- JSON 레시피는 데이터 없이 가져오기/내보내기한다. 실행은 브라우저 Worker를 사용하고 각 단계의 결과·경고·오류를 표시한다.
- 키보드로 도구 추가·연결·실행할 수 있어야 한다. 작은 화면에서는 한 열의 순서형 단계 편집으로 제공한다.
- 초기 레시피는 API 계약 진단, 배포 설정 사전 점검, HAR 이슈 제보 준비다. 사용자 코드 실행, 조건 분기와 반복은 지원하지 않는다.

---

