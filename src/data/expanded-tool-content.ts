import type { Locale } from '@/i18n/config';
import type { ToolContent, ToolExample } from './tool-content';
import type { ExpandedToolSlug } from '@/lib/tools/expanded-tools';

export const expandedToolExamples: Record<ExpandedToolSlug, [ToolExample, ToolExample]> = {
  'json-schema-validator': [
    { input: '{"type":"integer","minimum":1}\nvalue: 3', output: 'Valid: value is an integer greater than or equal to 1.' },
    { input: '{"required":["id"],"properties":{"id":{"type":"integer"}}}\nvalue: {"id":"42"}', output: 'Invalid at /id: expected integer; required property checks point to the missing field.' },
  ],
  'openapi-explorer': [
    { input: 'openapi: 3.2.1\npaths:\n  /tasks:\n    get:\n      operationId: listTasks', output: 'GET /tasks · listTasks' },
    { input: 'openapi: 3.2.1\npaths:\n  /tasks/{id}:\n    delete:\n      responses:\n        "204": { description: Removed }', output: 'DELETE /tasks/{id} · response 204' },
  ],
  'curl-fetch-converter': [
    { input: "curl -X POST https://api.example.test/tasks -H 'Content-Type: application/json' -d '{\"title\":\"Draft\"}'", output: 'const response = await fetch("https://api.example.test/tasks", {\n  "method": "POST",\n  "headers": {\n    "Content-Type": "application/json"\n  },\n  "body": "{\\"title\\":\\"Draft\\"}"\n});\nconst body = await response.text();\nconsole.log(response.status, body);' },
    { input: 'const response = await fetch("https://api.example.test/tasks", {\n  "method": "POST",\n  "headers": { "Content-Type": "application/json" },\n  "body": "{\\"title\\":\\"Draft\\"}"\n});', output: "curl --request POST --header 'Content-Type: application/json' --data-raw '{\"title\":\"Draft\"}' 'https://api.example.test/tasks'" },
  ],
  'http-header-inspector': [
    { input: 'HTTP/1.1 200 OK\nContent-Type: application/json\nCache-Control: no-store', output: 'Review: CORS policy and recommended security response headers are absent.' },
    { input: 'HTTP/1.1 200 OK\nAccess-Control-Allow-Origin: *\nAccess-Control-Allow-Credentials: true', output: 'CORS issue: wildcard origin cannot be used for credentialed browser access.' },
  ],
  'env-diff': [
    { input: 'DEV: API_BASE, LOG_LEVEL\nPROD: API_BASE, LOG_LEVEL', output: 'Same keys; values are not shown.' },
    { input: 'DEV: FEATURE_X, LOG_LEVEL\nPROD: LOG_LEVEL, CACHE_TTL', output: 'FEATURE_X is missing in PROD; CACHE_TTL is missing in DEV.' },
  ],
  'gitignore-tester': [
    { input: 'dist/\n*.log\n!important.log\npath: dist/client.js', output: 'Ignored: dist/client.js (dist/)' },
    { input: '*.log\n!important.log\npath: important.log', output: 'Not ignored: the later negation re-includes important.log.' },
  ],
  'har-scrubber': [
    { input: 'HAR request includes Authorization: Bearer demo and ?access_token=demo', output: 'Both the authorization header and access_token query value are replaced with [REDACTED].' },
    { input: 'HAR response body: {"email":"demo@example.test","state":"open"}', output: 'The email field is redacted; state remains available for debugging.' },
  ],
  'markdown-link-checker': [
    { input: '# Setup\n\n[Rollback](guide.md#rollback)\n\n## Rollback', output: 'Valid local target and heading anchor.' },
    { input: '# Setup\n\n[Broken](#not-here)\n[Ref][missing]', output: 'Issues: missing heading anchor #not-here; missing reference definition [missing].' },
  ],
};

export const expandedToolContent: Record<Locale, Partial<Record<ExpandedToolSlug, ToolContent>>> = {
  ko: {
    'json-schema-validator': {
      description: 'JSON Schema Draft 2020-12에 따라 예시 JSON을 검사하고, 실패한 값의 JSON Pointer 경로와 키워드를 보여줍니다. 외부 참조를 가져오지 않아 입력 데이터가 브라우저 밖으로 나가지 않습니다.',
      steps: ['스키마와 검사할 JSON 인스턴스를 각각 붙여넣습니다.', '필요하면 예제를 불러오고 검사를 실행합니다.', '오류 경로와 키워드를 보고 API 계약의 어느 조건이 맞지 않는지 확인합니다.'],
      caution: 'Draft 2020-12 검증을 제공하지만 `format`은 annotation으로 취급해 형식의 참·거짓을 단정하지 않습니다. 외부 `$ref`는 가져오지 않습니다. 민감한 운영 데이터를 예제로 붙여넣지 마세요.',
      faqs: [
        { question: 'JSON 문법이 맞으면 스키마 검사도 통과하나요?', answer: '아닙니다. JSON 문법 검사와 스키마 제약 검사는 별도 단계입니다. 인스턴스의 타입, 필수 키, 값 범위를 스키마와 비교합니다.' },
        { question: '오류 경로는 무엇을 뜻하나요?', answer: '오류가 발생한 인스턴스 위치를 RFC 6901 JSON Pointer 형식으로 표시합니다. `/items/0/id`는 첫 배열 항목의 id 필드를 뜻합니다.' },
        { question: '날짜나 이메일 형식도 검증하나요?', answer: '`format`은 Draft 2020-12에서 기본적으로 주석 의미를 가집니다. 이 도구는 이를 자동으로 거부 조건으로 바꾸지 않습니다.' },
      ],
      references: [{ label: 'JSON Schema Draft 2020-12 — Core 및 Validation', href: 'https://json-schema.org/draft/2020-12' }, { label: 'RFC 6901 — JSON Pointer', href: 'https://www.rfc-editor.org/rfc/rfc6901.html' }],
    },
    'openapi-explorer': {
      description: 'OpenAPI 3.2 YAML 또는 JSON 문서에서 API 작업, 경로 매개변수, 요청 콘텐츠 유형과 응답 코드를 읽기 쉬운 목록으로 펼쳐 봅니다. 문서를 파싱할 뿐 API를 호출하지 않습니다.',
      steps: ['OpenAPI 3.2.x YAML 또는 JSON 문서를 붙여넣습니다.', '실행해 제목·버전과 HTTP 작업별 요약을 펼칩니다.', '파라미터와 요청·응답 항목을 원본 계약과 대조합니다.'],
      caution: '이 도구는 전체 OpenAPI 적합성 검증기가 아니라 작업 카탈로그 탐색기입니다. 외부 `$ref`는 요청하지 않으며, 찾을 수 없는 참조와 지원하지 않는 버전은 별도로 알려줍니다.',
      faqs: [
        { question: 'API를 실제로 요청하나요?', answer: '아니요. 입력한 OpenAPI 문서를 브라우저에서 파싱하고 작업 목록만 추출합니다.' },
        { question: 'Swagger 2.0이나 OpenAPI 3.0도 열리나요?', answer: '첫 버전은 OpenAPI 3.2.x만 지원합니다. 다른 버전은 잘못된 문서로 처리하지 않고 지원 범위 오류를 표시합니다.' },
        { question: '이 결과로 계약 유효성을 보장할 수 있나요?', answer: '아니요. 탐색용 요약이며 문서 전체의 규격 적합성이나 서버 구현과의 일치를 증명하지 않습니다.' },
      ],
      references: [{ label: 'OpenAPI Specification 3.2', href: 'https://spec.openapis.org/oas/v3.2' }],
    },
    'curl-fetch-converter': {
      description: '일반적인 cURL 요청 옵션을 읽어 대응하는 브라우저 `fetch()` 코드로 바꿉니다. 코드를 생성할 뿐 명령이나 네트워크 요청을 실행하지 않습니다.',
      steps: ['지원되는 cURL 명령을 붙여넣습니다.', '실행해 URL·메서드·헤더·본문을 fetch 코드로 변환합니다.', '지원하지 않는 옵션과 제거된 URL 자격 증명을 확인한 뒤 코드를 직접 검토합니다.'],
      caution: '첫 버전은 URL, `-X`, `-H`, `-d` 계열의 기본 요청 옵션만 지원합니다. 셸 변수, 파이프, 파일 업로드, 쿠키 저장, 리다이렉트 같은 동작은 실행하거나 재현하지 않습니다. 생성 코드에 운영 토큰이 남지 않았는지 확인하세요.',
      faqs: [
        { question: '변환 과정에서 API를 호출하나요?', answer: '아닙니다. 명령문을 읽어 코드 문자열만 만듭니다.' },
        { question: '모든 cURL 옵션을 바꾸나요?', answer: '아닙니다. 지원되지 않는 옵션은 무시하지 않고 오류로 알려줍니다.' },
        { question: 'URL에 아이디와 비밀번호가 있으면 어떻게 되나요?', answer: '생성 코드의 URL에서 user information을 지우고 경고를 표시합니다.' },
      ],
      references: [{ label: 'curl man page — 명령 옵션', href: 'https://curl.se/docs/manpage.html' }, { label: 'MDN — Fetch API', href: 'https://developer.mozilla.org/docs/Web/API/Fetch_API' }],
    },
    'http-header-inspector': {
      description: '붙여넣은 HTTP 응답 상태 줄과 헤더를 읽어 CORS 조합, 캐시 지시어와 주요 보안 헤더의 누락 신호를 점검합니다. 대상 서버에 접속하지 않습니다.',
      steps: ['개발자 도구에서 응답 상태 줄과 헤더를 복사합니다.', '입력란에 붙여넣고 진단을 실행합니다.', '각 결과를 브라우저 콘솔, 프록시, 애플리케이션 설정과 대조합니다.'],
      caution: '헤더 존재 여부 기반의 휴리스틱입니다. 보안 감사나 실제 브라우저 동작 재현이 아니며, 누락된 헤더가 항상 취약점을 뜻하지는 않습니다. 실제 응답의 쿠키·토큰은 공유하지 마세요.',
      faqs: [
        { question: 'CORS 오류를 고쳐 주나요?', answer: '오류 원인 후보를 표시합니다. 허용 Origin과 자격 증명 정책은 API 소유자가 의도에 맞게 설정해야 합니다.' },
        { question: 'URL을 입력하면 헤더를 가져오나요?', answer: '아닙니다. 헤더를 직접 붙여넣어야 하며 외부 요청은 하지 않습니다.' },
        { question: '누락된 보안 헤더는 모두 추가하면 되나요?', answer: '아닙니다. CSP나 HSTS 같은 정책은 배포 환경과 서비스 동작에 맞춰 검토해야 합니다.' },
      ],
      references: [{ label: 'RFC 9110 — HTTP Semantics', href: 'https://www.rfc-editor.org/rfc/rfc9110.html' }, { label: 'MDN — CORS', href: 'https://developer.mozilla.org/docs/Web/HTTP/CORS' }],
    },
    'env-diff': {
      description: '두 `.env` 파일의 키 누락, 빈 값, 중복 키와 잘못된 줄을 비교합니다. 값 자체는 표시하거나 결과에 넣지 않아 개발·운영 설정 차이를 안전하게 살펴볼 수 있습니다.',
      steps: ['기준 환경과 비교 환경의 `.env` 내용을 각각 입력합니다.', '비교를 실행해 양쪽의 키 존재 상태를 확인합니다.', '누락된 키와 중복·형식 오류를 확인한 뒤 실제 비밀 값은 환경 관리 시스템에서 점검합니다.'],
      caution: '이 도구는 키 이름과 값이 비었는지만 비교합니다. 값이 같은지, 해당 값이 유효한지 확인하지 않습니다. 붙여넣기는 브라우저에서만 처리되지만 민감한 비밀이 담긴 운영 파일은 입력하지 않는 것이 안전합니다.',
      faqs: [
        { question: '비밀 값이 결과에 포함되나요?', answer: '아니요. 결과에는 키 이름과 set·empty·missing 상태만 나타납니다.' },
        { question: '따옴표 안의 `#` 주석이나 변수 치환을 해석하나요?', answer: '완전한 셸 또는 dotenv 실행기가 아닙니다. `KEY=`의 첫 등호를 기준으로 키와 빈 값 여부만 파악합니다.' },
        { question: '값이 환경마다 같은지도 알려주나요?', answer: '아니요. 값 비교는 하지 않습니다. 이 제한은 비밀 값이 보고서나 화면에 노출되는 것을 줄이기 위한 것입니다.' },
      ],
      references: [{ label: 'Node.js CLI — 환경 변수 파일 형식', href: 'https://nodejs.org/api/cli.html#env-files' }],
    },
    'gitignore-tester': {
      description: '저장소 루트의 `.gitignore` 패턴이 파일 경로를 무시하는지 검사합니다. `*`, `**`, 디렉터리 패턴과 `!` 예외 규칙을 시험해 빌드 산출물이나 예외 파일이 왜 포함되는지 확인합니다.',
      steps: ['루트 `.gitignore` 규칙을 한 줄씩 붙여넣습니다.', '저장소 루트 기준 테스트 경로를 입력합니다.', '무시 여부를 확인하고 Git에서 이미 추적 중인 파일인지도 별도로 확인합니다.'],
      caution: '이 도구는 입력한 루트 규칙만 검사합니다. 하위 `.gitignore`, 전역 제외 설정, 명령행 패턴, 이미 추적 중인 파일은 알 수 없으므로 실제 저장소에서는 `git check-ignore -v` 결과도 확인하세요.',
      faqs: [
        { question: '`!pattern`으로 모든 경로를 다시 포함할 수 있나요?', answer: '아닙니다. 상위 디렉터리를 제외한 뒤 하위 파일만 다시 포함하는 것은 Git 규칙상 제한됩니다.' },
        { question: '이미 커밋한 파일도 무시되나요?', answer: '아닙니다. `.gitignore`는 일반적으로 추적되지 않는 파일에 적용됩니다.' },
        { question: '중첩 `.gitignore`까지 검사하나요?', answer: '아니요. 입력한 규칙은 저장소 루트의 파일 하나로 해석합니다.' },
      ],
      references: [{ label: 'Git Documentation — gitignore', href: 'https://git-scm.com/docs/gitignore' }],
    },
    'har-scrubber': {
      description: 'HAR 1.2 네트워크 기록에서 인증 헤더, 쿠키, 민감한 쿼리 키와 JSON 본문 필드를 찾아 가립니다. 예외가 남을 수 있는 HAR를 공유 전에 검토하도록 돕습니다.',
      steps: ['브라우저 개발자 도구에서 내보낸 HAR 1.2 JSON을 붙여넣습니다.', '가림을 실행해 바뀐 필드와 결과를 확인합니다.', '출력 HAR를 내려받거나 복사하기 전에 요청 URL·본문·사용자 식별자가 남지 않았는지 직접 검토합니다.'],
      caution: '자동 익명화 도구가 아닙니다. 알려진 민감 필드명과 비 JSON 본문을 보수적으로 가리지만 자유 텍스트·인코딩 값·사용자 지정 필드의 비밀을 놓칠 수 있습니다. 실제 자격 증명이 포함된 파일은 공유하지 마세요.',
      faqs: [
        { question: 'HAR를 서버로 보내나요?', answer: '아니요. 파싱과 변환은 브라우저에서 실행하며 입력을 저장하거나 전송하지 않습니다.' },
        { question: '모든 개인정보가 제거되나요?', answer: '보장되지 않습니다. 결과를 공유하기 전에 사람이 전체 요청·응답을 확인해야 합니다.' },
        { question: 'HAR 본문도 처리하나요?', answer: 'JSON 본문에서는 민감한 키를 가립니다. JSON이 아닌 본문은 통째로 가려 데이터 손실을 줄이고 비밀 노출을 막습니다.' },
      ],
      references: [{ label: 'HTTP Archive Format 1.2', href: 'https://github.com/ahmadnassri/har-spec/blob/master/versions/1.2.md' }],
    },
    'markdown-link-checker': {
      description: '선택한 Markdown 파일 사이에서 상대 경로, 제목 앵커와 참조 링크 정의를 확인합니다. 정적 문서 묶음의 깨진 내부 링크를 브라우저에서 찾아냅니다.',
      steps: ['검사할 Markdown 문서를 붙여넣거나 여러 `.md` 파일을 선택합니다.', '실행해 참조 정의, 상대 경로와 제목 앵커 오류를 확인합니다.', '표시된 파일과 줄 번호를 원본 문서에서 수정한 뒤 다시 검사합니다.'],
      caution: '외부 URL은 형식만 보고 실제 응답을 확인하지 않습니다. 링크된 로컬 문서는 검사 입력에 포함해야 합니다. Markdown 확장 문법과 커스텀 앵커 규칙은 모두 해석하지 않을 수 있습니다.',
      faqs: [
        { question: '외부 링크가 살아 있는지도 검사하나요?', answer: '아니요. 입력 링크로 요청하지 않습니다. 외부 주소는 문서 안에 있는지만 봅니다.' },
        { question: '상대 경로 검사를 하려면 무엇을 선택해야 하나요?', answer: '링크 출발 문서와 해당 링크의 대상 Markdown 문서를 함께 선택하세요.' },
        { question: '헤딩 앵커는 어떻게 계산하나요?', answer: '기본 헤딩 텍스트를 소문자 슬러그로 바꾸고 중복 헤딩에는 번호를 붙여 비교합니다. 플랫폼별 확장 규칙은 다를 수 있습니다.' },
      ],
      references: [{ label: 'CommonMark Specification', href: 'https://spec.commonmark.org/0.31.2/' }],
    },
  },
  en: {
    'json-schema-validator': {
      description: 'Validate a JSON instance against JSON Schema Draft 2020-12 and inspect the failing JSON Pointer paths and keywords. External references are never fetched, so your input stays in the browser.',
      steps: ['Paste a schema and a JSON instance into their separate fields.', 'Load the example if useful, then run validation.', 'Read the failing instance paths and keywords to find which API contract rule does not match.'],
      caution: 'This targets Draft 2020-12, but `format` remains an annotation and is not asserted. External `$ref` values are not resolved. Avoid pasting production data or credentials.',
      faqs: [
        { question: 'Does valid JSON also pass schema validation?', answer: 'No. JSON syntax and schema constraints are separate checks. The validator compares instance types, required properties, and value constraints with the schema.' },
        { question: 'What does an error path mean?', answer: 'It is the failing instance location in RFC 6901 JSON Pointer form. `/items/0/id` points to the id property in the first array item.' },
        { question: 'Are date and email formats enforced?', answer: 'No. In Draft 2020-12, `format` is an annotation by default. This tool does not silently turn it into a rejection rule.' },
      ],
      references: [{ label: 'JSON Schema Draft 2020-12 — Core and Validation', href: 'https://json-schema.org/draft/2020-12' }, { label: 'RFC 6901 — JSON Pointer', href: 'https://www.rfc-editor.org/rfc/rfc6901.html' }],
    },
    'openapi-explorer': {
      description: 'Explore operations, path parameters, request media types, and response codes in an OpenAPI 3.2 YAML or JSON document. It parses the document locally and never calls the API.',
      steps: ['Paste an OpenAPI 3.2.x YAML or JSON document.', 'Run the explorer to list its title, version, and HTTP operations.', 'Compare each operation summary with the original contract and implementation.'],
      caution: 'This is an operation catalog, not a complete OpenAPI conformance validator. External `$ref` values are never requested; unsupported versions and unavailable references are reported.',
      faqs: [
        { question: 'Does the tool send an API request?', answer: 'No. It parses the document in your browser and extracts an operation list.' },
        { question: 'Can it read Swagger 2.0 or OpenAPI 3.0?', answer: 'The first version supports OpenAPI 3.2.x only and reports other versions as unsupported.' },
        { question: 'Does the summary prove my API is valid?', answer: 'No. It is for navigation and does not prove full specification conformance or consistency with a server implementation.' },
      ],
      references: [{ label: 'OpenAPI Specification 3.2', href: 'https://spec.openapis.org/oas/v3.2' }],
    },
    'curl-fetch-converter': {
      description: 'Convert common cURL request options into a browser `fetch()` snippet. The converter creates code only; it never runs a command or sends a request.',
      steps: ['Paste a supported cURL command.', 'Convert its URL, method, headers, and body into fetch code.', 'Review unsupported options and any removed URL credentials before using the snippet.'],
      caution: 'The first version supports basic URL, `-X`, `-H`, and `-d` options. It does not run shell variables, pipes, file uploads, cookie stores, or redirects. Check that the generated code does not retain production tokens.',
      faqs: [
        { question: 'Does conversion call the API?', answer: 'No. The command is parsed into a code string only.' },
        { question: 'Are all cURL options converted?', answer: 'No. Unsupported options produce an error instead of being silently ignored.' },
        { question: 'What happens to credentials in a URL?', answer: 'User information is removed from the generated URL and a warning is shown.' },
      ],
      references: [{ label: 'curl man page — command options', href: 'https://curl.se/docs/manpage.html' }, { label: 'MDN — Fetch API', href: 'https://developer.mozilla.org/docs/Web/API/Fetch_API' }],
    },
    'http-header-inspector': {
      description: 'Review a pasted HTTP status line and response headers for CORS combinations, cache directives, and signals from common security headers. The tool never contacts the target server.',
      steps: ['Copy the response status line and headers from browser developer tools.', 'Paste them and run the inspection.', 'Compare the findings with the browser console, proxy, and application configuration.'],
      caution: 'This is a heuristic presence check, not a security audit or browser reproduction. A missing header is not always a vulnerability. Do not share real cookies or tokens.',
      faqs: [
        { question: 'Will it fix a CORS error?', answer: 'It points to likely causes. The API owner must choose an allowed-origin and credential policy that matches the application.' },
        { question: 'Does it fetch headers from a URL?', answer: 'No. You paste the headers yourself, and the tool sends no external request.' },
        { question: 'Should I add every missing security header?', answer: 'No. Policies such as CSP and HSTS need to match the deployment and application behavior.' },
      ],
      references: [{ label: 'RFC 9110 — HTTP Semantics', href: 'https://www.rfc-editor.org/rfc/rfc9110.html' }, { label: 'MDN — CORS', href: 'https://developer.mozilla.org/docs/Web/HTTP/CORS' }],
    },
    'env-diff': {
      description: 'Compare two `.env` files for missing keys, empty values, duplicate keys, and malformed lines. Values are not displayed or included in the report, making it easier to review configuration drift.',
      steps: ['Paste the baseline and comparison `.env` contents separately.', 'Run the comparison to see each key’s presence on both sides.', 'Review missing and duplicate keys, then verify secret values in your environment manager.'],
      caution: 'The tool compares key names and whether a value is empty. It does not compare value equality or validate values. Although processing stays in the browser, avoid pasting production files containing secrets.',
      faqs: [
        { question: 'Are secret values included in the result?', answer: 'No. The report shows only the key and whether it is set, empty, or missing.' },
        { question: 'Does it interpret quoted `#` comments or variable expansion?', answer: 'No. It is not a shell or complete dotenv runtime. It only reads the key before the first equals sign and whether the remaining value is empty.' },
        { question: 'Can it tell whether two values are equal?', answer: 'No. Value comparison is intentionally omitted so values do not appear in the report.' },
      ],
      references: [{ label: 'Node.js CLI — Environment Variables', href: 'https://nodejs.org/api/cli.html#env-files' }],
    },
    'gitignore-tester': {
      description: 'Test whether root `.gitignore` patterns match repository paths. Exercise `*`, `**`, directory patterns, and `!` exceptions to understand why build output or a re-included file is matched.',
      steps: ['Paste the rules from a root `.gitignore`, one per line.', 'Enter repository-relative paths to test.', 'Review the results and check separately whether a file is already tracked by Git.'],
      caution: 'This checks only the supplied root patterns. It cannot see nested `.gitignore` files, global excludes, command-line patterns, or tracked files. Confirm real repository behavior with `git check-ignore -v`.',
      faqs: [
        { question: 'Can `!pattern` re-include every path?', answer: 'No. Git cannot re-include a file when a parent directory remains excluded.' },
        { question: 'Will an already committed file be ignored?', answer: 'No. `.gitignore` normally affects untracked files.' },
        { question: 'Does this include nested ignore files?', answer: 'No. Supplied patterns are treated as one root `.gitignore` file.' },
      ],
      references: [{ label: 'Git Documentation — gitignore', href: 'https://git-scm.com/docs/gitignore' }],
    },
    'har-scrubber': {
      description: 'Find and redact authorization headers, cookies, sensitive query keys, and JSON body fields in a HAR 1.2 capture. Use it to prepare a safer trace for manual review before sharing.',
      steps: ['Paste HAR 1.2 JSON exported from browser developer tools.', 'Run redaction and review the changed fields and output.', 'Before sharing or downloading, manually inspect URLs, bodies, and identifiers that remain.'],
      caution: 'This is not guaranteed anonymization. It masks known sensitive names and non-JSON bodies, but free text, encoded data, and custom fields may still contain secrets. Never share a trace with real credentials.',
      faqs: [
        { question: 'Is the HAR uploaded?', answer: 'No. Parsing and redaction run in the browser; input is not stored or sent.' },
        { question: 'Will every personal detail be removed?', answer: 'No. Review the entire output yourself before sharing it.' },
        { question: 'Are bodies inspected?', answer: 'Sensitive keys are masked in JSON bodies. Non-JSON bodies are replaced entirely to avoid leaking unknown text.' },
      ],
      references: [{ label: 'HTTP Archive Format 1.2', href: 'https://github.com/ahmadnassri/har-spec/blob/master/versions/1.2.md' }],
    },
    'markdown-link-checker': {
      description: 'Check relative paths, heading anchors, and reference definitions across selected Markdown files. Find broken links inside a static documentation set in your browser.',
      steps: ['Paste a Markdown file or select several `.md` files.', 'Run the checker to inspect reference definitions, relative paths, and heading anchors.', 'Use the reported file and line to update the source, then run the check again.'],
      caution: 'External URLs are checked for syntax only and are not fetched. Include linked local files in the input. Some Markdown extensions and custom anchor rules may not be recognized.',
      faqs: [
        { question: 'Does it check whether external links are live?', answer: 'No. It never requests link destinations; external addresses are only found in the text.' },
        { question: 'What files should I select for local paths?', answer: 'Select the link source and each linked Markdown target you want to verify.' },
        { question: 'How are heading anchors calculated?', answer: 'Basic heading text is converted to a lowercase slug, and duplicate headings receive a numeric suffix. Platform extensions may differ.' },
      ],
      references: [{ label: 'CommonMark Specification', href: 'https://spec.commonmark.org/0.31.2/' }],
    },
  },
  ja: {
    'json-schema-validator': {
      description: 'JSON Schema Draft 2020-12 に基づいて JSON インスタンスを検証し、不一致の JSON Pointer パスとキーワードを表示します。外部参照は取得せず、入力はブラウザー内に保ちます。',
      steps: ['スキーマと検査する JSON インスタンスを別々に貼り付けます。', '必要に応じてサンプルを読み込み、検証を実行します。', '失敗したパスとキーワードから、API 契約のどの条件が一致しないかを確認します。'],
      caution: 'Draft 2020-12 を対象としますが、`format` は注釈として扱い、形式を検証条件にはしません。外部 `$ref` は解決しません。実運用データや認証情報を貼り付けないでください。',
      faqs: [
        { question: 'JSON の構文が正しければスキーマ検証も通りますか？', answer: 'いいえ。JSON 構文とスキーマ制約は別の検査です。型、必須プロパティ、値の条件をスキーマと照合します。' },
        { question: 'エラーパスは何を示しますか？', answer: 'RFC 6901 JSON Pointer 形式でインスタンス内の位置を示します。`/items/0/id` は配列の最初の項目の id プロパティです。' },
        { question: '日付やメール形式も検証しますか？', answer: 'いいえ。Draft 2020-12 では `format` は既定で注釈です。このツールは自動的に拒否条件へ変更しません。' },
      ],
      references: [{ label: 'JSON Schema Draft 2020-12 — Core / Validation', href: 'https://json-schema.org/draft/2020-12' }, { label: 'RFC 6901 — JSON Pointer', href: 'https://www.rfc-editor.org/rfc/rfc6901.html' }],
    },
    'openapi-explorer': {
      description: 'OpenAPI 3.2 の YAML または JSON から、操作、パスパラメーター、リクエスト形式、レスポンスコードを一覧表示します。文書を解析するだけで API は呼び出しません。',
      steps: ['OpenAPI 3.2.x の YAML または JSON を貼り付けます。', '実行してタイトル、バージョン、HTTP 操作を一覧表示します。', '各操作の概要と元の契約、実装を照合します。'],
      caution: '完全な OpenAPI 適合性検証器ではなく、操作カタログです。外部 `$ref` は取得せず、未対応バージョンや解決できない参照を知らせます。',
      faqs: [
        { question: 'API に実際のリクエストを送りますか？', answer: 'いいえ。文書をブラウザー内で解析して操作一覧を作るだけです。' },
        { question: 'Swagger 2.0 や OpenAPI 3.0 も読み込めますか？', answer: '初版では OpenAPI 3.2.x のみ対応し、他のバージョンは未対応として表示します。' },
        { question: '要約で API の正しさを保証できますか？', answer: 'いいえ。ナビゲーション用の要約であり、仕様全体への適合やサーバー実装との一致は証明しません。' },
      ],
      references: [{ label: 'OpenAPI Specification 3.2', href: 'https://spec.openapis.org/oas/v3.2' }],
    },
    'curl-fetch-converter': {
      description: '一般的な cURL リクエストオプションをブラウザーの `fetch()` コードに変換します。コードを生成するだけで、コマンドもリクエストも実行しません。',
      steps: ['対応している cURL コマンドを貼り付けます。', 'URL、メソッド、ヘッダー、本文を fetch コードに変換します。', '未対応オプションと削除された URL 認証情報を確認してから利用します。'],
      caution: '初版は URL、`-X`、`-H`、`-d` 系の基本オプションに対応します。シェル変数、パイプ、ファイル送信、Cookie 保存、リダイレクトは実行・再現しません。生成コードに本番トークンが残っていないか確認してください。',
      faqs: [
        { question: '変換時に API を呼び出しますか？', answer: 'いいえ。コマンドを解析してコード文字列を作るだけです。' },
        { question: 'すべての cURL オプションに対応しますか？', answer: 'いいえ。未対応オプションは無視せずエラーとして知らせます。' },
        { question: 'URL 内の認証情報はどうなりますか？', answer: '生成 URL からユーザー情報を削除し、注意を表示します。' },
      ],
      references: [{ label: 'curl man page — コマンドオプション', href: 'https://curl.se/docs/manpage.html' }, { label: 'MDN — Fetch API', href: 'https://developer.mozilla.org/docs/Web/API/Fetch_API' }],
    },
    'http-header-inspector': {
      description: '貼り付けた HTTP ステータス行とレスポンスヘッダーから、CORS の組み合わせ、キャッシュ指示、主要なセキュリティヘッダーの有無を確認します。対象サーバーには接続しません。',
      steps: ['ブラウザー開発者ツールからレスポンスの状態行とヘッダーをコピーします。', '貼り付けて検査を実行します。', '結果をブラウザーコンソール、プロキシ、アプリ設定と照らし合わせます。'],
      caution: 'ヘッダーの有無に基づくヒューリスティックです。セキュリティ監査や実ブラウザー動作の再現ではなく、ヘッダー欠落が常に脆弱性とは限りません。Cookie やトークンを共有しないでください。',
      faqs: [
        { question: 'CORS エラーを修正できますか？', answer: '原因候補を示します。許可 Origin と認証情報の方針は API の所有者が決める必要があります。' },
        { question: 'URL からヘッダーを取得しますか？', answer: 'いいえ。ヘッダーを貼り付けてください。外部リクエストは行いません。' },
        { question: '不足するセキュリティヘッダーは全部追加すべきですか？', answer: 'いいえ。CSP や HSTS は配信環境とアプリの動作に合わせて検討してください。' },
      ],
      references: [{ label: 'RFC 9110 — HTTP Semantics', href: 'https://www.rfc-editor.org/rfc/rfc9110.html' }, { label: 'MDN — CORS', href: 'https://developer.mozilla.org/docs/Web/HTTP/CORS' }],
    },
    'env-diff': {
      description: '2 つの `.env` のキー不足、空値、重複キー、不正な行を比較します。値は表示・出力しないため、環境設定の差を確認しやすくなります。',
      steps: ['基準環境と比較環境の `.env` 内容を別々に入力します。', '比較を実行し、両環境でのキーの有無を確認します。', '不足・重複・形式エラーを確認し、秘密の値は環境管理システムで検証します。'],
      caution: 'キー名と値が空かどうかだけを比較し、値の同一性や妥当性は検証しません。処理はブラウザー内ですが、本番の秘密情報を含むファイルは貼り付けないでください。',
      faqs: [
        { question: '秘密の値が結果に含まれますか？', answer: 'いいえ。キーと set・empty・missing の状態だけを表示します。' },
        { question: '引用符内の `#` や変数展開を解析しますか？', answer: 'いいえ。シェルや完全な dotenv 実行環境ではありません。最初の等号より前のキーと、後ろが空かどうかだけを読みます。' },
        { question: '2 つの値が同じか比較できますか？', answer: 'いいえ。結果に値が出ないよう、値の比較は行いません。' },
      ],
      references: [{ label: 'Node.js CLI — 環境変数ファイル', href: 'https://nodejs.org/api/cli.html#env-files' }],
    },
    'gitignore-tester': {
      description: 'ルート `.gitignore` のパターンがリポジトリ内のパスに一致するかを検査します。`*`、`**`、ディレクトリ、`!` の例外を試せます。',
      steps: ['ルート `.gitignore` の規則を 1 行ずつ貼り付けます。', 'リポジトリからの相対パスを入力します。', '判定を確認し、Git がすでに追跡しているファイルかどうかも別に確認します。'],
      caution: '入力したルート規則だけを検査します。下位 `.gitignore`、グローバル除外、コマンドライン規則、追跡済みファイルは反映しません。実リポジトリでは `git check-ignore -v` も確認してください。',
      faqs: [
        { question: '`!pattern` でどのパスでも再追加できますか？', answer: 'いいえ。親ディレクトリが除外されている場合、Git はその中のファイルだけを再追加できません。' },
        { question: 'コミット済みのファイルも除外されますか？', answer: 'いいえ。`.gitignore` は通常、未追跡ファイルに適用されます。' },
        { question: '下位の ignore ファイルも検査しますか？', answer: 'いいえ。入力した規則はルート `.gitignore` 1 つとして扱います。' },
      ],
      references: [{ label: 'Git Documentation — gitignore', href: 'https://git-scm.com/docs/gitignore' }],
    },
    'har-scrubber': {
      description: 'HAR 1.2 の記録から認証ヘッダー、Cookie、機密性の高いクエリキー、JSON 本文のフィールドを検出してマスクします。共有前にトレースを見直すための補助ツールです。',
      steps: ['ブラウザー開発者ツールから出力した HAR 1.2 JSON を貼り付けます。', 'マスクを実行し、変更箇所と結果を確認します。', '共有・保存の前に、残っている URL、本文、識別子を手作業で確認します。'],
      caution: '完全な匿名化は保証しません。既知の秘密フィールドと非 JSON 本文を処理しますが、自由文、エンコード済みデータ、独自フィールドの秘密を見逃す場合があります。実際の認証情報を含む HAR は共有しないでください。',
      faqs: [
        { question: 'HAR はアップロードされますか？', answer: 'いいえ。解析とマスクはブラウザー内で行い、入力を保存・送信しません。' },
        { question: '個人情報はすべて削除されますか？', answer: '保証できません。共有前に出力全体を確認してください。' },
        { question: 'リクエスト・レスポンス本文も確認しますか？', answer: 'JSON 本文では秘密キーをマスクします。JSON 以外の本文は未知の内容の漏えいを防ぐため全体を置き換えます。' },
      ],
      references: [{ label: 'HTTP Archive Format 1.2', href: 'https://github.com/ahmadnassri/har-spec/blob/master/versions/1.2.md' }],
    },
    'markdown-link-checker': {
      description: '選択した Markdown ファイル間で相対パス、見出しアンカー、参照リンク定義を確認します。静的ドキュメント内のリンク切れをブラウザーで検出します。',
      steps: ['Markdown を貼り付けるか、複数の `.md` ファイルを選択します。', '実行して参照定義、相対パス、見出しアンカーを検査します。', '表示されたファイルと行番号を元ファイルで修正し、再度実行します。'],
      caution: '外部 URL は書式だけを見て、実際の応答は取得しません。リンク先のローカルファイルは入力に含めてください。Markdown 拡張や独自アンカー規則をすべて認識するわけではありません。',
      faqs: [
        { question: '外部リンクの到達性も調べますか？', answer: 'いいえ。リンク先へリクエストしません。外部 URL は文書内にあるかだけを確認します。' },
        { question: 'ローカルパス検査では何を選択しますか？', answer: 'リンク元と、確認したいリンク先の Markdown ファイルを選択してください。' },
        { question: '見出しアンカーはどのように計算しますか？', answer: '基本的な見出し文字列を小文字のスラッグにし、重複見出しには番号を付けます。プラットフォーム拡張とは異なる場合があります。' },
      ],
      references: [{ label: 'CommonMark Specification', href: 'https://spec.commonmark.org/0.31.2/' }],
    },
  },
  zh: {
    'json-schema-validator': {
      description: '按照 JSON Schema Draft 2020-12 检查 JSON 实例，并显示不匹配的 JSON Pointer 路径和关键字。不会获取外部引用，输入仅在浏览器中处理。',
      steps: ['分别粘贴 Schema 和待检查的 JSON 实例。', '需要时载入示例，然后运行验证。', '查看失败路径和关键字，定位 API 契约中的不匹配条件。'],
      caution: '验证目标为 Draft 2020-12，但 `format` 按注解处理，不作为断言。不会解析外部 `$ref`。请勿粘贴生产数据或凭据。',
      faqs: [
        { question: 'JSON 语法正确就能通过 Schema 验证吗？', answer: '不能。JSON 语法检查和 Schema 约束检查是不同步骤。验证器会对照类型、必需属性和值约束。' },
        { question: '错误路径是什么意思？', answer: '它以 RFC 6901 JSON Pointer 表示实例中的位置。`/items/0/id` 指数组第一项的 id 属性。' },
        { question: '会验证日期或电子邮件格式吗？', answer: '不会。Draft 2020-12 默认将 `format` 视为注解，本工具不会自动把它变成拒绝条件。' },
      ],
      references: [{ label: 'JSON Schema Draft 2020-12 — Core 与 Validation', href: 'https://json-schema.org/draft/2020-12' }, { label: 'RFC 6901 — JSON Pointer', href: 'https://www.rfc-editor.org/rfc/rfc6901.html' }],
    },
    'openapi-explorer': {
      description: '从 OpenAPI 3.2 YAML 或 JSON 文档中整理 API 操作、路径参数、请求媒体类型和响应状态码。只在本地解析文档，不会调用 API。',
      steps: ['粘贴 OpenAPI 3.2.x YAML 或 JSON 文档。', '运行后查看标题、版本和 HTTP 操作列表。', '将每个操作摘要与原始契约和实际实现核对。'],
      caution: '这是操作目录浏览器，不是完整的 OpenAPI 一致性验证器。不会获取外部 `$ref`，并会提示不支持的版本和无法解析的引用。',
      faqs: [
        { question: '工具会实际请求 API 吗？', answer: '不会。它只在浏览器中解析文档并提取操作列表。' },
        { question: '可以读取 Swagger 2.0 或 OpenAPI 3.0 吗？', answer: '首版仅支持 OpenAPI 3.2.x，其他版本会被标记为不支持。' },
        { question: '摘要能证明 API 正确吗？', answer: '不能。摘要用于导航，不证明完整规范符合性，也不证明它与服务器实现一致。' },
      ],
      references: [{ label: 'OpenAPI Specification 3.2', href: 'https://spec.openapis.org/oas/v3.2' }],
    },
    'curl-fetch-converter': {
      description: '将常用 cURL 请求选项转换为浏览器 `fetch()` 代码片段。工具只生成代码，不运行命令或发送请求。',
      steps: ['粘贴受支持的 cURL 命令。', '将 URL、方法、标头和正文转换为 fetch 代码。', '检查未支持选项及被移除的 URL 凭据后再使用代码。'],
      caution: '首版支持基本 URL、`-X`、`-H` 和 `-d` 选项。不会执行 Shell 变量、管道、文件上传、Cookie 存储或重定向。请确认生成代码不保留生产令牌。',
      faqs: [
        { question: '转换时会请求 API 吗？', answer: '不会。工具只解析命令并生成代码字符串。' },
        { question: '所有 cURL 选项都会转换吗？', answer: '不会。遇到不支持的选项会显示错误，不会悄悄忽略。' },
        { question: 'URL 中的凭据会怎样处理？', answer: '生成代码会移除 URL 用户信息并显示提示。' },
      ],
      references: [{ label: 'curl man page — 命令选项', href: 'https://curl.se/docs/manpage.html' }, { label: 'MDN — Fetch API', href: 'https://developer.mozilla.org/docs/Web/API/Fetch_API' }],
    },
    'http-header-inspector': {
      description: '检查粘贴的 HTTP 状态行和响应标头，提示 CORS 组合、缓存指令以及常见安全标头的存在情况。不会连接目标服务器。',
      steps: ['从浏览器开发者工具复制响应状态行和标头。', '粘贴内容并运行检查。', '将结果与浏览器控制台、代理和应用配置核对。'],
      caution: '这是基于标头存在情况的启发式检查，不是安全审计或真实浏览器复现。缺少标头不一定意味着漏洞。请勿分享真实 Cookie 或令牌。',
      faqs: [
        { question: '它能修复 CORS 错误吗？', answer: '它会指出可能原因。允许来源和凭据策略应由 API 所有者按应用需求设置。' },
        { question: '输入 URL 后会读取标头吗？', answer: '不会。需要手动粘贴标头，工具不会发送外部请求。' },
        { question: '所有缺少的安全标头都应该添加吗？', answer: '不应该。CSP 或 HSTS 等策略需要结合部署环境和应用行为评估。' },
      ],
      references: [{ label: 'RFC 9110 — HTTP Semantics', href: 'https://www.rfc-editor.org/rfc/rfc9110.html' }, { label: 'MDN — CORS', href: 'https://developer.mozilla.org/docs/Web/HTTP/CORS' }],
    },
    'env-diff': {
      description: '比较两个 `.env` 文件中的缺失键、空值、重复键和格式错误行。结果不显示或包含值，便于检查环境配置差异。',
      steps: ['分别粘贴基准环境和对比环境的 `.env` 内容。', '运行比较并查看每个键在两侧的存在状态。', '检查缺失和重复键，再在环境管理器中验证实际密钥值。'],
      caution: '本工具只比较键名和键值是否为空，不比较值是否相同，也不验证值是否有效。虽然处理仅在浏览器中进行，但请避免粘贴含生产密钥的文件。',
      faqs: [
        { question: '结果会包含密钥值吗？', answer: '不会。报告仅显示键名以及 set、empty 或 missing 状态。' },
        { question: '会解析引号中的 `#` 注释或变量展开吗？', answer: '不会。这不是 Shell 或完整的 dotenv 运行环境，只读取第一个等号前的键名和后面的值是否为空。' },
        { question: '能判断两侧值是否相同吗？', answer: '不能。为避免值进入报告，本工具不比较值内容。' },
      ],
      references: [{ label: 'Node.js CLI — 环境变量文件', href: 'https://nodejs.org/api/cli.html#env-files' }],
    },
    'gitignore-tester': {
      description: '测试根目录 `.gitignore` 规则是否匹配仓库路径。可检查 `*`、`**`、目录模式和 `!` 例外规则，了解构建产物或重新纳入文件的匹配情况。',
      steps: ['逐行粘贴根目录 `.gitignore` 规则。', '输入相对于仓库根目录的待测路径。', '查看结果，并另行确认 Git 是否已经跟踪该文件。'],
      caution: '只检查输入的根目录规则，不包含嵌套 `.gitignore`、全局排除、命令行规则或已跟踪文件。请使用 `git check-ignore -v` 确认真实仓库行为。',
      faqs: [
        { question: '`!pattern` 可以重新包含任何路径吗？', answer: '不可以。如果父目录被排除，Git 无法只重新包含其中的文件。' },
        { question: '已经提交的文件也会被忽略吗？', answer: '不会。`.gitignore` 通常适用于尚未跟踪的文件。' },
        { question: '会检查嵌套的忽略文件吗？', answer: '不会。输入规则一律作为单个根目录 `.gitignore` 处理。' },
      ],
      references: [{ label: 'Git Documentation — gitignore', href: 'https://git-scm.com/docs/gitignore' }],
    },
    'har-scrubber': {
      description: '在 HAR 1.2 记录中查找并遮盖 Authorization 标头、Cookie、敏感查询键和 JSON 正文字段。帮助你在分享前检查网络跟踪信息。',
      steps: ['粘贴从浏览器开发者工具导出的 HAR 1.2 JSON。', '运行遮盖并检查修改字段和输出。', '保存或分享前，手动检查仍存在的 URL、正文和标识符。'],
      caution: '不保证完全匿名。它会处理已知敏感字段名和非 JSON 正文，但可能遗漏自由文本、编码数据和自定义字段中的秘密。请勿分享包含真实凭据的 HAR。',
      faqs: [
        { question: 'HAR 会被上传吗？', answer: '不会。解析和遮盖在浏览器内完成，不会保存或发送输入。' },
        { question: '所有个人信息都会被移除吗？', answer: '不保证。分享前请自行检查完整输出。' },
        { question: '会检查正文吗？', answer: 'JSON 正文中的敏感键会被遮盖。非 JSON 正文会整体替换，以避免未知文本泄露。' },
      ],
      references: [{ label: 'HTTP Archive Format 1.2', href: 'https://github.com/ahmadnassri/har-spec/blob/master/versions/1.2.md' }],
    },
    'markdown-link-checker': {
      description: '检查所选 Markdown 文件之间的相对路径、标题锚点和引用链接定义。在浏览器中查找静态文档集的断链。',
      steps: ['粘贴 Markdown 文档，或选择多个 `.md` 文件。', '运行检查引用定义、相对路径和标题锚点。', '根据报告中的文件和行号修改源文件，然后重新检查。'],
      caution: '外部 URL 只检查文本形式，不会请求目标。请把相关本地文件加入输入。部分 Markdown 扩展和自定义锚点规则可能无法识别。',
      faqs: [
        { question: '会检查外部链接是否可访问吗？', answer: '不会。工具不请求链接，只检查外部 URL 是否出现在文档中。' },
        { question: '检查相对路径时要选择哪些文件？', answer: '选择链接来源文档和希望验证的本地 Markdown 目标文件。' },
        { question: '如何计算标题锚点？', answer: '将基本标题文本转换为小写 slug，并为重复标题添加数字后缀。平台扩展可能有所不同。' },
      ],
      references: [{ label: 'CommonMark Specification', href: 'https://spec.commonmark.org/0.31.2/' }],
    },
  },
};
