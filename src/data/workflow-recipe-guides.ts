import type { Locale } from '@/i18n/config';
import type { WorkflowRecipeSlug } from './workflow-recipes';
import type { ToolSlug } from './tools';

export type WorkflowRecipeGuideStep = { title: string; toolSlug: ToolSlug; action: string; reading: string; boundary: string };
export type WorkflowRecipeGuideContent = {
  title: string;
  summary: string;
  introduction: string;
  privacyTitle: string;
  privacyNote: string;
  scenarioTitle: string;
  scenarioNote: string;
  expectedLabel: string;
  receivedLabel: string;
  expectedPayload: string;
  receivedPayload: string;
  stepsTitle: string;
  steps: [WorkflowRecipeGuideStep, WorkflowRecipeGuideStep, WorkflowRecipeGuideStep, WorkflowRecipeGuideStep, WorkflowRecipeGuideStep];
  checklistTitle: string;
  checklist: [string, string, string, string, string];
  referencesTitle: string;
  references: [{ label: string; href: string }, { label: string; href: string }, { label: string; href: string }];
};

export const workflowRecipeGuideSlugs: readonly WorkflowRecipeSlug[] = ['api-contract-triage', 'release-config-preflight', 'har-issue-prep'];
export const workflowRecipeToolSlugs: Record<WorkflowRecipeSlug, ToolSlug[]> = {
  'api-contract-triage': ['json-schema-validator', 'openapi-explorer', 'curl-fetch-converter', 'json-formatter'],
  'release-config-preflight': ['env-diff', 'gitignore-tester', 'json-formatter'],
  'har-issue-prep': ['har-scrubber', 'http-header-inspector', 'json-formatter'],
};

export const workflowRecipeGuides: Record<Locale, Record<WorkflowRecipeSlug, WorkflowRecipeGuideContent>> = {
  ko: {
    'api-contract-triage': {
      title: 'API 응답 계약을 빠르게 진단하는 순서',
      summary: '스키마 작성부터 필드 오류 판독까지 가상의 결제 응답으로 재현합니다.',
      introduction: '성공 상태 코드만으로 응답 형식이 계약과 일치한다고 판단할 수 없습니다. 이 절차는 기대하는 JSON Schema를 세우고 실제 응답을 로컬에서 검증한 뒤, 오류 보고서를 읽기 쉽게 정리합니다.',
      privacyTitle: '운영 응답에는 개인정보나 토큰이 있을 수 있습니다',
      privacyNote: '아래 예시는 가상 청구 데이터입니다. 실제 데이터를 검사할 때는 필요한 필드만 남긴 샘플을 사용하고, 운영 토큰이나 개인 식별 정보를 복사하지 마세요. DevDesk는 입력을 서버로 보내지 않지만 이 도구의 로컬 실행이 민감 정보 취급 절차를 대신하지 않습니다.',
      scenarioTitle: '계약은 숫자를 기대하지만 응답은 문자열을 돌려줍니다',
      scenarioNote: '같은 값처럼 보이는 `"2300"`과 `2300`은 JSON에서 타입이 다릅니다. 실제 소비 코드가 숫자 연산을 한다면 이 차이가 런타임 오류나 잘못된 계산을 만들 수 있습니다.',
      expectedLabel: '계약에서 기대하는 JSON', receivedLabel: '서버가 보낸 재현 응답',
      expectedPayload: '{\n  "invoice_id": "inv_demo_208",\n  "amount": 2300,\n  "currency": "USD"\n}',
      receivedPayload: '{\n  "invoice_id": "inv_demo_208",\n  "amount": "2300",\n  "currency": "USD"\n}',
      stepsTitle: '세부 결과를 원인 분석으로 연결합니다',
      steps: [
        { title: '1. 소비자가 실제로 요구하는 필드를 적습니다', toolSlug: 'json-schema-validator', action: '필수 필드, 허용 타입, 값 범위를 API 명세에서 확인합니다. 예제 스키마에는 `invoice_id`는 문자열, `amount`는 숫자라고 명시합니다.', reading: '스키마는 응답에서 빠지면 안 되는 값과 타입 조건을 실행 가능한 형태로 바꿉니다.', boundary: '클라이언트 코드가 우연히 허용하는 값이 계약상 유효하다는 뜻은 아닙니다. 서버 계약과 실제 소비자의 요구를 따로 확인하세요.' },
        { title: '2. 스키마와 실제 응답을 함께 검사합니다', toolSlug: 'json-schema-validator', action: 'JSON Schema 검사기에 스키마와 재현 응답을 붙여 넣고 실행합니다. 워크플로 스튜디오의 예제에는 두 입력과 검사 노드가 준비되어 있습니다.', reading: '이 예제에서는 `instancePath`가 `/amount`, `keyword`가 `type`으로 표시되고 숫자가 필요하다는 오류가 나옵니다.', boundary: '외부 `$ref`는 가져오지 않습니다. `format`은 annotation으로 취급되며 이메일·날짜 형식 주장을 검사하지 않습니다.' },
        { title: '3. 실패와 통과 결과의 구조를 읽습니다', toolSlug: 'json-formatter', action: '결과 JSON을 펼쳐 `valid` 값과 `issues` 목록을 확인합니다. 오류 경로가 배열 인덱스나 중첩 객체를 포함하면 원본 응답에서 같은 위치를 찾습니다.', reading: '오류마다 인스턴스 위치와 스키마 키워드가 함께 있어 API 제공자에게 보낼 재현 설명을 구체적으로 쓸 수 있습니다.', boundary: '하나의 오류가 수정되면 다음 검증 실행에서 다른 제약이 드러날 수 있습니다. 첫 오류만 고치고 통합 테스트를 생략하지 마세요.' },
        { title: '4. 진단 결과를 후속 도구로 연결합니다', toolSlug: 'json-formatter', action: '스튜디오에서 검사기 출력 포트를 JSON 포맷터 입력 포트에 연결하고 두 단계를 실행합니다. 포트의 JSON 유형이 같아야 연결할 수 있습니다.', reading: '단계별 입력과 결과가 화면에서 구분되어 어느 노드에서 값이 바뀌었는지 확인할 수 있습니다.', boundary: '연결은 현재 탭 메모리에서만 동작합니다. 레시피 파일을 내보내도 스키마와 실제 응답 입력은 포함되지 않습니다.' },
        { title: '5. 오류를 최소 재현 사례로 전달합니다', toolSlug: 'openapi-explorer', action: 'OpenAPI 작업 설명과 응답 스키마를 확인한 뒤 민감 값이 제거된 작은 JSON 예제, 기대 타입, 관찰된 오류를 함께 기록합니다.', reading: '경로·상태 코드·스키마 버전이 포함된 재현 보고서는 API 제공자가 같은 조건을 시험하는 데 도움이 됩니다.', boundary: 'OpenAPI 탐색기는 문서의 작업 목록을 보여주는 도구이며 API 서버에 요청하지 않습니다. 실제 응답을 증명하려면 대상 환경의 로그와 통합 테스트가 필요합니다.' },
      ],
      checklistTitle: '공유 전 확인',
      checklist: ['스키마 버전과 `$schema` 선언이 Draft 2020-12인지 확인했나요?', '필수 필드와 실제 JSON 값의 타입을 API 계약과 대조했나요?', '오류 경로와 키워드를 복사해도 개인 식별 정보가 포함되지 않나요?', '외부 참조나 형식 키워드의 지원 경계를 확인했나요?', '서버 통합 테스트로 재현 여부를 다시 확인했나요?'],
      referencesTitle: '표준과 참고 자료',
      references: [
        { label: 'JSON Schema Draft 2020-12 명세', href: 'https://json-schema.org/specification' },
        { label: 'OpenAPI 3.2.1 명세', href: 'https://spec.openapis.org/oas/v3.2' },
        { label: 'IETF RFC 8259 — JSON 데이터 교환', href: 'https://www.rfc-editor.org/rfc/rfc8259.html' },
      ],
    },
    'release-config-preflight': {
      title: '배포 전 환경 변수와 무시 규칙 점검',
      summary: '비밀값을 노출하지 않고 두 환경의 키 차이와 Git 제외 경로를 확인합니다.',
      introduction: '개발 환경에서는 동작하지만 배포에서는 설정 누락이나 추적 파일 노출이 생길 수 있습니다. 이 점검은 변수 이름과 값 존재 상태만 비교하고, 후보 경로가 루트 `.gitignore` 패턴에 매치되는지 확인합니다.',
      privacyTitle: '.env 값을 보고서나 문의에 복사하지 마세요',
      privacyNote: '도구 결과에는 값 자체가 아니라 키의 존재 여부와 빈 값 여부만 나옵니다. 입력란은 현재 탭 메모리에만 있으며 서버로 전송되지 않습니다. 그래도 제보용 텍스트에 토큰, URL 비밀번호, 인증서 내용을 붙이지 마세요.',
      scenarioTitle: '스테이징에서는 키가 없고 .env는 저장소에 들어갈 수 있습니다',
      scenarioNote: '가상 스테이징 설정에는 `LOG_LEVEL`이 빠져 있고 `CACHE_TTL`은 비어 있습니다. 저장소 경로 검사에서는 `.env.example`은 공유 가능하지만 `.env`는 제외되어야 합니다.',
      expectedLabel: '배포에서 기대하는 상태', receivedLabel: '찾아볼 후보 경로',
      expectedPayload: 'APP_MODE: set\nDATABASE_URL: set\nLOG_LEVEL: set\nCACHE_TTL: set',
      receivedPayload: '.env\n.env.example\nconfig/private.pem\nsrc/app.ts',
      stepsTitle: '설정 존재 여부와 파일 추적 여부를 나누어 봅니다',
      steps: [
        { title: '1. 두 환경에서 변수 이름만 준비합니다', toolSlug: 'env-diff', action: '기준·비교 `.env`에서 민감한 값은 예시 문자열로 바꾸고, 변수 이름과 비어 있는지 여부만 비교합니다.', reading: '결과에서 `missing`, `empty`, `set` 상태로 환경 간 불일치를 찾을 수 있습니다. 실제 값은 출력에 포함되지 않습니다.', boundary: '값의 정확성이나 연결 가능 여부는 검사하지 않습니다. 키 이름이 존재해도 URL·인증서·암호가 유효하다는 뜻은 아닙니다.' },
        { title: '2. 중복 키와 형식 오류를 확인합니다', toolSlug: 'env-diff', action: '비교 보고서에서 중복 키 또는 해석할 수 없는 줄 경고를 확인하고, 실제 설정 파일의 규칙을 기준으로 수정합니다.', reading: '같은 키가 여러 번 있으면 실행 환경에 따라 마지막 값이 적용될 수 있으므로 모호성을 없애야 합니다.', boundary: '따옴표, 변수 확장, 셸 구문은 실행하지 않습니다. 이 도구는 `.env` 파일을 서비스 런타임처럼 해석하지 않습니다.' },
        { title: '3. 무시 규칙에 검사할 경로를 넣습니다', toolSlug: 'gitignore-tester', action: '저장소 루트 `.gitignore` 패턴과 `.env`, `.env.example`, 개인 키 경로를 상대 경로로 나눠 입력합니다.', reading: '각 경로가 무시되는지 확인하면 실수로 개인 설정을 커밋할 가능성을 점검할 수 있습니다.', boundary: '하위 폴더별 `.gitignore`, 전역 제외 파일, 이미 Git이 추적 중인 파일은 이 테스트에 포함되지 않습니다.' },
        { title: '4. 예외 패턴의 순서를 시험합니다', toolSlug: 'gitignore-tester', action: '예를 들어 `*.env` 뒤에 `!.env.example`을 둔 뒤 두 경로 결과를 비교합니다. 필요한 파일만 예외 규칙으로 다시 포함합니다.', reading: '예외 규칙은 앞선 패턴과 순서가 중요하며, 부모 디렉터리가 제외된 상태에서는 자식 파일 예외가 기대대로 작동하지 않을 수 있습니다.', boundary: '복잡한 패턴은 대상 저장소에서 `git check-ignore -v`와 실제 Git 인덱스로 재확인하세요.' },
        { title: '5. 변경 후 상태를 실제 저장소에서 재검증합니다', toolSlug: 'gitignore-tester', action: '수정된 `.env.example`은 문서용 샘플만 포함하는지 확인하고, 민감 파일은 `git status`와 Git ignore 진단으로 추적되지 않는지 검사합니다.', reading: '브라우저 검사 결과와 Git 인덱스 상태를 함께 확인하면 패턴 검사만으로 놓치는 추적 파일을 찾을 수 있습니다.', boundary: '이 브라우저 도구는 로컬 저장소를 읽지 않으며 Git 명령도 실행하지 않습니다. 경로 목록은 직접 준비해야 합니다.' },
      ],
      checklistTitle: '배포 승인 전 확인',
      checklist: ['필요한 키가 양쪽 환경에 있고 빈 값이 아닌가요?', '비밀 값이나 연결 정보가 예제·로그에 포함되지 않았나요?', '`.env`와 개인 키는 제외되고 샘플 파일만 의도적으로 포함되나요?', '예외 패턴을 순서와 상위 디렉터리 조건까지 확인했나요?', 'Git이 이미 추적 중인 민감 파일이 없는지 저장소에서 확인했나요?'],
      referencesTitle: '표준과 참고 자료',
      references: [
        { label: 'Git 공식 문서 — gitignore 패턴', href: 'https://git-scm.com/docs/gitignore' },
        { label: 'Git 공식 문서 — git check-ignore', href: 'https://git-scm.com/docs/git-check-ignore' },
        { label: 'OWASP Secrets Management Cheat Sheet', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html' },
      ],
    },
    'har-issue-prep': {
      title: 'HAR 파일에서 민감 정보를 줄이고 이슈 제보하기',
      summary: '브라우저 네트워크 기록을 정리하고, 누락 가능한 정보까지 수동 검토하는 절차입니다.',
      introduction: 'HAR은 요청·응답 헤더, 쿠키, URL, 본문을 포함할 수 있어 빠른 재현에는 유용하지만 그대로 공유하면 계정 정보가 노출될 수 있습니다. 가림 도구를 거친 후에도 파일을 직접 살펴보고 최소 재현 사례만 남기세요.',
      privacyTitle: '가림 처리는 익명화를 보장하지 않습니다',
      privacyNote: '도구는 알려진 토큰·쿠키·개인정보 패턴을 휴리스틱으로 가립니다. 사용자 정의 헤더, 본문 문장, 인코딩된 값은 놓칠 수 있습니다. 결과를 신뢰해 바로 업로드하지 말고 전체 텍스트를 직접 검토하세요.',
      scenarioTitle: '테스트 요청의 인증 토큰이 HAR에 남아 있습니다',
      scenarioNote: '가상 기록에는 Authorization 헤더와 `token` 쿼리 값이 있습니다. 가린 결과에서도 계정명, 조직 ID, 고유한 URL 경로, 응답 본문은 별도 검토 대상입니다.',
      expectedLabel: '공유하려는 재현 정보', receivedLabel: '검토할 HAR 민감 위치',
      expectedPayload: '요청 경로와 HTTP 상태\n브라우저·재현 단계\n최소 응답 예제',
      receivedPayload: 'Authorization / Cookie 헤더\nURL query와 form params\n요청·응답 본문과 사용자 정의 필드',
      stepsTitle: '가림 이후에도 자료 전체를 직접 검토합니다',
      steps: [
        { title: '1. 필요한 요청만 포함한 HAR 1.2를 만듭니다', toolSlug: 'har-scrubber', action: '브라우저 개발자 도구에서 이슈와 관련된 요청만 선택해 HAR로 저장합니다. 가능하면 개인 계정 대신 테스트 계정과 가짜 데이터를 사용합니다.', reading: '작은 로그는 검토 범위를 줄이고 재현과 무관한 요청의 우발적 노출을 줄입니다.', boundary: '브라우저 버전마다 내보내기 옵션과 HAR 필드가 다릅니다. 원본 파일은 공개 경로나 제3자 웹 서비스에 올리지 마세요.' },
        { title: '2. 알려진 민감 필드를 가립니다', toolSlug: 'har-scrubber', action: 'HAR 스크러버에 JSON을 넣어 Authorization, 쿠키, 토큰처럼 보이는 URL 값, 폼 값과 본문 패턴을 가립니다.', reading: '결과에는 변환된 HAR과 가려진 필드 수가 나옵니다. 가림 수가 0이어도 민감 값이 없다고 단정할 수 없습니다.', boundary: '사용자 정의 필드, 자유 형식 문장, 이중 인코딩 값은 놓칠 수 있습니다. 도구는 완전한 익명화나 규정 준수를 보증하지 않습니다.' },
        { title: '3. 전체 결과에서 식별 정보를 다시 찾습니다', toolSlug: 'json-formatter', action: 'JSON 포맷터에서 결과를 읽기 좋게 펼치고 이메일, 세션 식별자, 고객 번호, 내부 호스트 이름, 고유 경로를 검색합니다.', reading: '요청 헤더 외에도 응답 본문, `comment` 같은 사용자 정의 메타데이터, URL 경로에 개인 정보가 남을 수 있습니다.', boundary: '도구는 화면에 보이는 결과를 자동으로 비식별 처리하지 않습니다. 사람이 읽고 조직의 자료 공유 정책에 따라 판단해야 합니다.' },
        { title: '4. 설명에 필요한 요청만 남깁니다', toolSlug: 'http-header-inspector', action: '문제와 관련 있는 경로·메서드·상태 코드·안전한 헤더만 이슈 본문으로 옮기고, 불필요한 응답 본문과 계정 정보를 제거합니다.', reading: '짧은 단계별 재현 절차와 예상·실제 결과는 전체 네트워크 기록 없이도 문제를 분류하는 데 도움이 됩니다.', boundary: '헤더 진단은 사용자가 붙여 넣은 값만 확인합니다. 실제 서버 응답, TLS 연결 또는 보안 정책을 검사하지 않습니다.' },
        { title: '5. 승인된 경로로 최소 파일을 공유합니다', toolSlug: 'har-scrubber', action: '가린 사본을 다시 열어 검토하고, 조직의 이슈 추적기나 보안 채널이 승인한 경로로 필요한 파일만 전달합니다.', reading: '수신자, 보관 기간, 삭제 방법을 확인하고 접근 범위를 최소화하면 디버깅 자료의 노출 위험을 줄일 수 있습니다.', boundary: 'DevDesk는 업로드나 제보를 대신하지 않습니다. 자료 공유 권한과 보존 정책은 수신 서비스와 조직 기준을 따르세요.' },
      ],
      checklistTitle: '보내기 전 파일을 처음부터 끝까지 확인',
      checklist: ['테스트 계정 또는 최소 권한 계정으로 요청을 다시 캡처했나요?', 'Authorization, 쿠키, 쿼리, 본문, 커스텀 필드를 각각 확인했나요?', '고객·조직 ID, 이메일, 내부 호스트와 고유 경로를 제거했나요?', '재현에 필요하지 않은 네트워크 항목과 응답 데이터를 삭제했나요?', '조직이 승인한 전달 경로와 보존 기간을 확인했나요?'],
      referencesTitle: '표준과 참고 자료',
      references: [
        { label: 'HTTP Archive (HAR) 1.2 형식 명세', href: 'https://w3c.github.io/web-performance/specs/HAR/Overview.html' },
        { label: 'OWASP Logging Cheat Sheet — 민감 데이터', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html' },
        { label: 'IETF RFC 9110 — HTTP Semantics', href: 'https://www.rfc-editor.org/rfc/rfc9110.html' },
      ],
    },
  },
  en: {
    'api-contract-triage': {
      title: 'A practical sequence for diagnosing an API response contract',
      summary: 'Reproduce a field-type mismatch with a fictional payment response, from schema to error reading.',
      introduction: 'A successful status code does not prove that a response matches its contract. Define the expected JSON Schema, validate a minimal response locally, and format the resulting diagnostic for review.',
      privacyTitle: 'Production responses may contain personal data or tokens',
      privacyNote: 'The example uses fictional invoice data. Keep only the fields needed for a reproduction and do not paste production tokens or identifiers. DevDesk processes input in the browser, but that does not replace your sensitive-data handling procedure.',
      scenarioTitle: 'The contract expects a number but receives a string',
      scenarioNote: '`"2300"` and `2300` look similar but have different JSON types. A consumer that performs numeric operations can fail or calculate the wrong value.',
      expectedLabel: 'Expected JSON in the contract', receivedLabel: 'Reproduction response from the server',
      expectedPayload: '{\n  "invoice_id": "inv_demo_208",\n  "amount": 2300,\n  "currency": "USD"\n}',
      receivedPayload: '{\n  "invoice_id": "inv_demo_208",\n  "amount": "2300",\n  "currency": "USD"\n}',
      stepsTitle: 'Turn the diagnostic into a reproducible investigation',
      steps: [
        { title: '1. Write down what the consumer requires', toolSlug: 'json-schema-validator', action: 'Check required fields, allowed types, and value limits in the API contract. The example schema declares `invoice_id` as a string and `amount` as a number.', reading: 'A schema turns required values and type rules into executable checks.', boundary: 'A value accepted by current client code is not necessarily valid under the contract. Review server guarantees and consumer needs separately.' },
        { title: '2. Validate the schema and received response', toolSlug: 'json-schema-validator', action: 'Paste the schema and a minimal response into the validator. The workflow studio starter recipe includes both inputs and the validation node.', reading: 'The example reports `/amount` as the instance path and `type` as the failed keyword.', boundary: 'External `$ref` values are not fetched. `format` is an annotation here; email and date strings are not asserted.' },
        { title: '3. Read both passing and failing results', toolSlug: 'json-formatter', action: 'Inspect the result JSON for `valid` and the `issues` list. Use the reported path to find the same location in the response.', reading: 'Each issue includes its instance path and schema keyword, which makes a report to the API owner more specific.', boundary: 'Fixing one issue can reveal another on the next run. Do not stop after correcting the first diagnostic.' },
        { title: '4. Connect the diagnostic to a follow-up tool', toolSlug: 'json-formatter', action: 'Connect the validator output port to the JSON formatter input in Workflow Studio and run both steps. The connection is available because both ports carry JSON.', reading: 'Each node displays its own input and result, making value changes visible across the sequence.', boundary: 'Connections run only in the current tab. Exported recipe files omit schema and response inputs.' },
        { title: '5. Send a minimal reproduction', toolSlug: 'openapi-explorer', action: 'Review the operation and response schema in the OpenAPI document, then record a small redacted payload, expected type, and observed error.', reading: 'Including the path, status code, and schema version helps the API owner reproduce the same condition.', boundary: 'The explorer lists operations; it does not call the API. Confirm behavior with target-environment logs and integration tests.' },
      ],
      checklistTitle: 'Before sharing the report', checklist: ['Does the schema declare Draft 2020-12?', 'Did you compare required fields and JSON types against the contract?', 'Can you share the path and keyword without personal data?', 'Did you account for external references and `format` support limits?', 'Did an integration test confirm the issue against the server?'],
      referencesTitle: 'Standards and references', references: [
        { label: 'JSON Schema Draft 2020-12 specification', href: 'https://json-schema.org/specification' },
        { label: 'OpenAPI 3.2.1 specification', href: 'https://spec.openapis.org/oas/v3.2' },
        { label: 'IETF RFC 8259 — JSON data interchange', href: 'https://www.rfc-editor.org/rfc/rfc8259.html' },
      ],
    },
    'release-config-preflight': {
      title: 'Check environment keys and ignore rules before a release',
      summary: 'Compare key presence without exposing values and test candidate files against Git ignore patterns.',
      introduction: 'A release can fail because a setting is missing or expose local credentials because a file is tracked. This check compares key names and empty-value status, then tests candidate paths against root `.gitignore` patterns.',
      privacyTitle: 'Do not copy .env values into reports or support requests',
      privacyNote: 'The report contains key presence and empty-value status, never the values. Inputs stay in this tab’s memory and are not sent to a server. Keep tokens, passwords in URLs, and certificate contents out of issue text as well.',
      scenarioTitle: 'A staging key is missing and a local .env could be committed',
      scenarioNote: 'In this fictional example, staging lacks `LOG_LEVEL` and `CACHE_TTL` is empty. `.env.example` can be shared, while `.env` should be ignored.',
      expectedLabel: 'Expected release configuration', receivedLabel: 'Candidate repository paths to check',
      expectedPayload: 'APP_MODE: set\nDATABASE_URL: set\nLOG_LEVEL: set\nCACHE_TTL: set',
      receivedPayload: '.env\n.env.example\nconfig/private.pem\nsrc/app.ts',
      stepsTitle: 'Separate configuration presence from file tracking',
      steps: [
        { title: '1. Prepare key names from both environments', toolSlug: 'env-diff', action: 'Replace sensitive values with demo text in baseline and comparison `.env` files. Compare only variable names and whether values are empty.', reading: 'The report identifies `missing`, `empty`, or `set` states without exposing values.', boundary: 'This does not validate a value or test a connection. A present URL or certificate can still be wrong.' },
        { title: '2. Review duplicate keys and malformed lines', toolSlug: 'env-diff', action: 'Check the report for duplicate-key or malformed-line notices and resolve them according to your runtime’s file rules.', reading: 'Duplicate definitions can be ambiguous because runtimes may choose one of the values.', boundary: 'Quotes, variable expansion, and shell syntax are not executed. The tool does not parse an `.env` file as your service runtime would.' },
        { title: '3. Test candidate paths against ignore rules', toolSlug: 'gitignore-tester', action: 'Enter root `.gitignore` patterns and repository-relative paths such as `.env`, `.env.example`, and a private-key path.', reading: 'The result shows which candidates match the patterns so you can catch a likely accidental commit.', boundary: 'Nested `.gitignore` files, global excludes, and already tracked files are outside this test.' },
        { title: '4. Try exception order explicitly', toolSlug: 'gitignore-tester', action: 'Place a pattern such as `*.env` before `!.env.example`, then compare the two paths. Re-include only files intended for sharing.', reading: 'Negation rules depend on order, and an ignored parent directory can prevent a child exception from taking effect.', boundary: 'For complex rules, verify the target repository with `git check-ignore -v` and its actual index.' },
        { title: '5. Verify the changed repository state', toolSlug: 'gitignore-tester', action: 'Confirm `.env.example` contains documentation-safe samples, then check `git status` and Git’s ignore diagnostics for sensitive files.', reading: 'Combining browser results with Git index state catches tracked files that pattern tests alone cannot detect.', boundary: 'The browser tool does not read your repository or execute Git commands. Supply the paths yourself.' },
      ],
      checklistTitle: 'Before approving the release', checklist: ['Are required keys present and non-empty in both environments?', 'Are values and connection details absent from examples and logs?', 'Are `.env` and private keys ignored while safe sample files stay shareable?', 'Did you review exception order and parent-directory behavior?', 'Did you check whether any sensitive file is already tracked?'],
      referencesTitle: 'Standards and references', references: [
        { label: 'Git documentation — gitignore patterns', href: 'https://git-scm.com/docs/gitignore' },
        { label: 'Git documentation — git check-ignore', href: 'https://git-scm.com/docs/git-check-ignore' },
        { label: 'OWASP Secrets Management Cheat Sheet', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html' },
      ],
    },
    'har-issue-prep': {
      title: 'Reduce sensitive data in a HAR before reporting an issue',
      summary: 'Review a browser network capture, scrub likely secrets, and manually inspect what the heuristic may miss.',
      introduction: 'HAR files can contain request and response headers, cookies, URLs, and bodies. They help reproduce a problem, but sharing them unchanged can expose account data. Scrub the file, inspect it yourself, and keep only the minimum useful reproduction.',
      privacyTitle: 'Redaction does not guarantee anonymization',
      privacyNote: 'The tool uses heuristics for known token, cookie, and personal-data patterns. Custom headers, free text, and encoded values can be missed. Review the whole file before uploading it anywhere.',
      scenarioTitle: 'A test request leaves an authorization token in the capture',
      scenarioNote: 'The fictional capture includes an Authorization header and a `token` query value. Account names, organization IDs, unique paths, and response bodies may still need separate review.',
      expectedLabel: 'Information needed to reproduce the issue', receivedLabel: 'HAR locations to review',
      expectedPayload: 'Request path and HTTP status\nBrowser and reproduction steps\nMinimal response example',
      receivedPayload: 'Authorization / Cookie headers\nURL query and form parameters\nRequest and response bodies; custom fields',
      stepsTitle: 'Review the whole artifact after redaction',
      steps: [
        { title: '1. Capture only the requests needed', toolSlug: 'har-scrubber', action: 'In browser developer tools, select the requests related to the issue and save a HAR. Prefer a test account and fictional data.', reading: 'A smaller capture reduces review time and accidental exposure of unrelated requests.', boundary: 'Export options vary by browser. Do not upload the original file to a public location or a third-party web service.' },
        { title: '2. Scrub known sensitive fields', toolSlug: 'har-scrubber', action: 'Paste the HAR 1.2 JSON into the scrubber to redact Authorization, cookies, likely token query values, form values, and matching body patterns.', reading: 'The result shows a redacted HAR and a count of fields changed. A count of zero does not prove the file is safe.', boundary: 'Custom fields, free text, and double-encoded values can be missed. The tool does not guarantee anonymization or compliance.' },
        { title: '3. Search the full output for identifiers', toolSlug: 'json-formatter', action: 'Open the result in the JSON formatter, then inspect email addresses, session identifiers, customer numbers, internal hostnames, and unique paths.', reading: 'Personal data may remain in response bodies, custom metadata such as `comment`, or URL paths even after headers are scrubbed.', boundary: 'The formatter makes output readable; it does not anonymize it. Apply your organization’s sharing policy.' },
        { title: '4. Keep only requests that explain the failure', toolSlug: 'http-header-inspector', action: 'Copy only the relevant path, method, status, and safe headers into the issue report. Remove unrelated response data and account details.', reading: 'A short reproduction procedure and expected-versus-observed result can help triage without a full network history.', boundary: 'Header diagnostics inspect only pasted values. They do not test the server, TLS connection, or security policy.' },
        { title: '5. Share the reviewed minimum through an approved channel', toolSlug: 'har-scrubber', action: 'Reopen the redacted copy for a final review and share only the necessary artifact using an issue tracker or security channel approved by your organization.', reading: 'Check the recipient, retention period, and deletion process to limit the exposure of debugging data.', boundary: 'DevDesk does not upload or submit the file. Follow the receiving service and organization’s access and retention rules.' },
      ],
      checklistTitle: 'Review the file from beginning to end', checklist: ['Did you capture the issue using a test or least-privilege account?', 'Did you inspect headers, cookies, query values, bodies, and custom fields?', 'Did you remove customer IDs, emails, internal hosts, and unique paths?', 'Did you remove unrelated requests and response data?', 'Did you confirm the approved transfer path and retention period?'],
      referencesTitle: 'Standards and references', references: [
        { label: 'HTTP Archive (HAR) 1.2 format specification', href: 'https://w3c.github.io/web-performance/specs/HAR/Overview.html' },
        { label: 'OWASP Logging Cheat Sheet — sensitive data', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html' },
        { label: 'IETF RFC 9110 — HTTP Semantics', href: 'https://www.rfc-editor.org/rfc/rfc9110.html' },
      ],
    },
  },
  ja: {
    'api-contract-triage': {
      title: 'API 応答契約を診断する実践的な手順',
      summary: '架空の決済応答で、スキーマ作成から型エラーの読み方まで再現します。',
      introduction: '成功ステータスだけでは応答が契約に一致するとは限りません。期待する JSON Schema を定義し、最小限の応答をローカルで検証して、診断結果を読みやすく整えます。',
      privacyTitle: '本番応答には個人データやトークンが含まれる場合があります',
      privacyNote: '例は架空の請求データです。実データを使う場合は必要なフィールドだけを残し、本番トークンや識別子を貼り付けないでください。入力はブラウザー内で処理しますが、機密情報の取り扱い手順の代わりにはなりません。',
      scenarioTitle: '契約は数値を期待するのに、応答は文字列を返します',
      scenarioNote: '`"2300"` と `2300` は似ていますが JSON の型は異なります。数値演算を行うクライアントでは実行時エラーや誤計算につながることがあります。',
      expectedLabel: '契約が期待する JSON', receivedLabel: 'サーバー応答の再現例',
      expectedPayload: '{\n  "invoice_id": "inv_demo_208",\n  "amount": 2300,\n  "currency": "USD"\n}',
      receivedPayload: '{\n  "invoice_id": "inv_demo_208",\n  "amount": "2300",\n  "currency": "USD"\n}',
      stepsTitle: '診断結果を再現可能な調査につなげます',
      steps: [
        { title: '1. 利用側が必要とする条件を書き出す', toolSlug: 'json-schema-validator', action: 'API 契約で必須フィールド、許容型、値の範囲を確認します。例のスキーマでは `invoice_id` は文字列、`amount` は数値と指定します。', reading: 'スキーマにより必須値や型の規則を実行可能な検査にできます。', boundary: '現在のクライアントコードで受け入れられる値が契約上有効とは限りません。サーバーの保証と利用側の要件を分けて確認してください。' },
        { title: '2. スキーマと受信 JSON を検証する', toolSlug: 'json-schema-validator', action: '検証ツールにスキーマと最小応答を貼り付けて実行します。ワークフロースタジオの開始レシピには両方の入力と検証ノードがあります。', reading: '例ではインスタンスパス `/amount` と失敗したキーワード `type` が表示されます。', boundary: '外部 `$ref` は取得しません。ここで `format` は annotation として扱い、メールや日付形式を検証しません。' },
        { title: '3. 成功・失敗結果の構造を読む', toolSlug: 'json-formatter', action: '結果 JSON の `valid` と `issues` を確認し、報告されたパスと元の応答の同じ場所を照合します。', reading: '各問題にはインスタンスパスとスキーマキーワードがあり、API 提供者へ具体的に報告できます。', boundary: '1 つの問題を直すと次の実行で別の制約が現れることがあります。最初の診断だけで調査を終えないでください。' },
        { title: '4. 診断を後続ツールへ接続する', toolSlug: 'json-formatter', action: 'スタジオで検証結果の出力を JSON フォーマッターの入力に接続し、2 ステップを実行します。両方のポートが JSON 型のため接続できます。', reading: '各ノードに入力と結果が表示され、処理の途中で値がどう変わったか確認できます。', boundary: '接続は現在のタブ内だけで実行します。レシピのエクスポートにスキーマや応答の入力値は含まれません。' },
        { title: '5. 最小の再現例を共有する', toolSlug: 'openapi-explorer', action: 'OpenAPI 文書で操作と応答スキーマを確認し、機密値を除いた小さなペイロード、期待型、観測したエラーを記録します。', reading: 'パス、ステータスコード、スキーマのバージョンがあると API 提供者が同じ条件を試しやすくなります。', boundary: 'エクスプローラーは操作一覧を表示するだけで API を呼び出しません。サーバー環境のログと統合テストで確認してください。' },
      ],
      checklistTitle: '共有前の確認', checklist: ['スキーマの Draft 2020-12 宣言を確認しましたか？', '必須項目と JSON 型を契約と照合しましたか？', '個人データなしでパスとキーワードを共有できますか？', '外部参照と `format` の対応範囲を考慮しましたか？', '統合テストでサーバー上の問題を確認しましたか？'],
      referencesTitle: '標準と参考資料', references: [
        { label: 'JSON Schema Draft 2020-12 仕様', href: 'https://json-schema.org/specification' },
        { label: 'OpenAPI 3.2.1 仕様', href: 'https://spec.openapis.org/oas/v3.2' },
        { label: 'IETF RFC 8259 — JSON データ交換', href: 'https://www.rfc-editor.org/rfc/rfc8259.html' },
      ],
    },
    'release-config-preflight': {
      title: 'リリース前に環境変数と ignore ルールを確認する',
      summary: '値を露出せずに環境間のキー差分と Git 除外パスを検査します。',
      introduction: '設定不足でリリースに失敗したり、ローカル認証情報を含むファイルを追跡したりすることがあります。キー名と空値の状態を比較し、ルート `.gitignore` パターンに候補パスが一致するか確認します。',
      privacyTitle: '.env の値をレポートや問い合わせにコピーしないでください',
      privacyNote: '結果にはキーの有無と空かどうかだけが表示され、値は含まれません。入力は現在のタブ内に保持し、サーバーへ送信しません。トークンや URL パスワード、証明書も課題文へ貼り付けないでください。',
      scenarioTitle: 'ステージングにキーがなく、ローカル .env がコミットされる恐れがあります',
      scenarioNote: '架空の例ではステージングに `LOG_LEVEL` がなく、`CACHE_TTL` は空です。`.env.example` は共有できても `.env` は除外する必要があります。',
      expectedLabel: '期待するリリース設定', receivedLabel: '確認する候補パス',
      expectedPayload: 'APP_MODE: set\nDATABASE_URL: set\nLOG_LEVEL: set\nCACHE_TTL: set',
      receivedPayload: '.env\n.env.example\nconfig/private.pem\nsrc/app.ts',
      stepsTitle: '設定の有無とファイル追跡を別々に確認します',
      steps: [
        { title: '1. 両環境のキー名を準備する', toolSlug: 'env-diff', action: '基準と比較用の `.env` で機密値を例示文字列に置き換え、変数名と空値かどうかだけを比較します。', reading: '値を公開せず `missing`、`empty`、`set` の状態を確認できます。', boundary: '値の有効性や接続可否は検査しません。URL や証明書が存在しても誤っている場合があります。' },
        { title: '2. 重複キーと不正な行を確認する', toolSlug: 'env-diff', action: '重複キーや不正行の警告を確認し、実行環境のファイル規則に基づいて修正します。', reading: '重複定義があるとランタイムによってどの値を選ぶか曖昧になります。', boundary: '引用符、変数展開、シェル構文は実行しません。サービスと同じ解釈で `.env` を読み込む機能ではありません。' },
        { title: '3. 候補パスを ignore 規則で検査する', toolSlug: 'gitignore-tester', action: 'ルート `.gitignore` のパターンと `.env`、`.env.example`、秘密鍵の相対パスを入力します。', reading: '各候補がパターンに一致するかを見て、誤コミットの可能性を確認できます。', boundary: '下位フォルダーの `.gitignore`、グローバル除外、すでに追跡中のファイルは含みません。' },
        { title: '4. 例外パターンの順序も試す', toolSlug: 'gitignore-tester', action: '`*.env` の後に `!.env.example` を置き、2 つのパスの結果を比較します。共有するファイルだけを再度含めます。', reading: '否定ルールは順序に依存し、親ディレクトリが除外されると子の例外が適用されない場合があります。', boundary: '複雑なルールは対象リポジトリの `git check-ignore -v` と実際のインデックスで確認してください。' },
        { title: '5. 変更後のリポジトリ状態を検証する', toolSlug: 'gitignore-tester', action: '`.env.example` に安全な例だけがあることを確認し、`git status` と Git の ignore 診断で秘密ファイルが追跡されていないか確認します。', reading: 'ブラウザーの結果と Git インデックスを併用すると、パターン検査だけで見落とす追跡済みファイルに気づけます。', boundary: 'このツールはローカルリポジトリを読まず、Git コマンドも実行しません。パスは手動で準備します。' },
      ],
      checklistTitle: 'リリース承認前の確認', checklist: ['必要なキーが両環境にあり、空ではありませんか？', '例やログに値・接続情報を残していませんか？', '`.env` と秘密鍵を除外し、安全なサンプルだけ共有できますか？', '例外の順序と親ディレクトリの挙動を確認しましたか？', '機密ファイルがすでに追跡中でないことを確認しましたか？'],
      referencesTitle: '標準と参考資料', references: [
        { label: 'Git 公式ドキュメント — gitignore パターン', href: 'https://git-scm.com/docs/gitignore' },
        { label: 'Git 公式ドキュメント — git check-ignore', href: 'https://git-scm.com/docs/git-check-ignore' },
        { label: 'OWASP Secrets Management Cheat Sheet', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html' },
      ],
    },
    'har-issue-prep': {
      title: 'HAR の機密データを減らして不具合を報告する',
      summary: 'ネットワーク記録を確認し、見落とされる可能性も手作業で調べます。',
      introduction: 'HAR にはリクエスト・応答ヘッダー、Cookie、URL、本文が含まれることがあります。再現には役立ちますが、そのまま共有するとアカウント情報が漏れる場合があります。マスキング後も自分で全体を読み、必要最小限だけを残してください。',
      privacyTitle: 'マスキングは匿名化を保証しません',
      privacyNote: '既知のトークン、Cookie、個人データらしいパターンを推測して処理します。独自ヘッダー、自由文、エンコード値は見落とす可能性があります。どこかへアップロードする前に全内容を確認してください。',
      scenarioTitle: 'テストリクエストの認証トークンが記録に残っています',
      scenarioNote: '架空の記録には Authorization ヘッダーと `token` クエリ値があります。アカウント名、組織 ID、固有パス、応答本文も別途確認が必要です。',
      expectedLabel: '再現に必要な情報', receivedLabel: '確認する HAR の位置',
      expectedPayload: 'リクエストパスと HTTP ステータス\nブラウザーと再現手順\n最小限の応答例',
      receivedPayload: 'Authorization / Cookie ヘッダー\nURL クエリとフォーム値\nリクエスト・応答本文と独自フィールド',
      stepsTitle: 'マスキング後もファイル全体を確認します',
      steps: [
        { title: '1. 必要なリクエストだけを記録する', toolSlug: 'har-scrubber', action: 'ブラウザーの開発者ツールで問題に関係するリクエストだけを選び HAR として保存します。可能ならテストアカウントと架空データを使います。', reading: '記録を小さくすると確認が簡単になり、無関係な通信の漏えいを防ぎやすくなります。', boundary: 'ブラウザーごとにエクスポート設定は異なります。元ファイルを公開場所や第三者のウェブサービスにアップロードしないでください。' },
        { title: '2. 既知の機密フィールドをマスキングする', toolSlug: 'har-scrubber', action: 'HAR 1.2 JSON をスクラバーに貼り付け、Authorization、Cookie、トークンらしいクエリ、フォーム値、本文パターンをマスキングします。', reading: '結果には加工後の HAR と変更したフィールド数が表示されます。数がゼロでも安全とは限りません。', boundary: '独自フィールド、自由文、二重エンコード値は見逃す可能性があります。匿名化やコンプライアンスを保証しません。' },
        { title: '3. 全結果から識別情報を探す', toolSlug: 'json-formatter', action: '結果を JSON フォーマッターで開き、メール、セッション ID、顧客番号、内部ホスト名、固有パスを確認します。', reading: 'ヘッダー以外に応答本文、`comment` などの独自メタデータ、URL パスにも個人情報が残る場合があります。', boundary: 'フォーマッターは読みやすくするだけで匿名化しません。組織の共有ポリシーに沿って判断してください。' },
        { title: '4. 問題の説明に必要な通信だけ残す', toolSlug: 'http-header-inspector', action: '関係するパス、メソッド、ステータス、安全なヘッダーだけを課題文に移し、無関係な本文とアカウント情報を除きます。', reading: '短い再現手順と期待値・実際値があれば、全通信履歴なしでも調査を進めやすくなります。', boundary: 'ヘッダー診断は貼り付けた値だけを調べます。サーバー、TLS 接続、セキュリティポリシーは検査しません。' },
        { title: '5. 承認された経路で必要最小限を共有する', toolSlug: 'har-scrubber', action: '加工済みファイルを再度開いて最終確認し、組織が認めた課題管理またはセキュリティ窓口へ必要な分だけ送ります。', reading: '受信者、保存期間、削除方法を確認するとデバッグ資料の露出を抑えられます。', boundary: 'DevDesk はアップロードや送信を代行しません。受信サービスと組織のアクセス・保管ルールに従ってください。' },
      ],
      checklistTitle: 'ファイル全体を送信前に確認', checklist: ['テストまたは最小権限アカウントでキャプチャしましたか？', 'ヘッダー、Cookie、クエリ、本文、独自フィールドを確認しましたか？', '顧客 ID、メール、内部ホスト、固有パスを削除しましたか？', '無関係なリクエストと応答データを削除しましたか？', '承認済みの送信経路と保存期間を確認しましたか？'],
      referencesTitle: '標準と参考資料', references: [
        { label: 'HTTP Archive (HAR) 1.2 format specification', href: 'https://w3c.github.io/web-performance/specs/HAR/Overview.html' },
        { label: 'OWASP Logging Cheat Sheet — 機密データ', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html' },
        { label: 'IETF RFC 9110 — HTTP Semantics', href: 'https://www.rfc-editor.org/rfc/rfc9110.html' },
      ],
    },
  },
  zh: {
    'api-contract-triage': {
      title: '快速诊断 API 响应契约的实用步骤',
      summary: '用虚构的支付响应复现字段类型问题，从编写 Schema 到读取错误。',
      introduction: '状态码成功并不代表响应符合契约。先定义预期 JSON Schema，再在本地校验最小响应，并整理易读的诊断报告。',
      privacyTitle: '生产响应可能包含个人数据或令牌',
      privacyNote: '示例使用虚构账单数据。实际检查时只保留必要字段，不要粘贴生产令牌或身份标识。DevDesk 在浏览器中处理输入，但这不能替代敏感数据处理流程。',
      scenarioTitle: '契约要求数字，但响应返回了字符串',
      scenarioNote: '`"2300"` 和 `2300` 看起来相似，但 JSON 类型不同。执行数值运算的消费者可能因此报错或计算错误。',
      expectedLabel: '契约预期的 JSON', receivedLabel: '服务器响应复现样例',
      expectedPayload: '{\n  "invoice_id": "inv_demo_208",\n  "amount": 2300,\n  "currency": "USD"\n}',
      receivedPayload: '{\n  "invoice_id": "inv_demo_208",\n  "amount": "2300",\n  "currency": "USD"\n}',
      stepsTitle: '将诊断结果转化为可复现调查',
      steps: [
        { title: '1. 写下消费者真正要求的条件', toolSlug: 'json-schema-validator', action: '根据 API 契约确认必填字段、允许的类型和值范围。示例 Schema 声明 `invoice_id` 为字符串、`amount` 为数字。', reading: 'Schema 可将必填值和类型规则转换为可执行检查。', boundary: '当前客户端代码能接受某个值，并不代表它符合契约。应分别核实服务器保证和消费者要求。' },
        { title: '2. 校验 Schema 和实际响应', toolSlug: 'json-schema-validator', action: '将 Schema 和最小响应粘贴到检查器中运行。工作流工作室的起始配方已准备好两个输入和校验节点。', reading: '示例会指出实例路径 `/amount`，失败关键字为 `type`。', boundary: '不会获取外部 `$ref`。这里将 `format` 视为注解，不会断言电子邮件或日期格式。' },
        { title: '3. 阅读通过和失败结果的结构', toolSlug: 'json-formatter', action: '检查结果 JSON 中的 `valid` 和 `issues`，并在原始响应中定位报告的路径。', reading: '每个问题都包含实例路径和 Schema 关键字，便于向 API 提供方准确说明。', boundary: '修复一个问题后，下一次运行可能发现其他约束。不要只修复首个错误就结束调查。' },
        { title: '4. 将诊断结果连接到后续工具', toolSlug: 'json-formatter', action: '在工作室中将校验器输出端口连接到 JSON 格式化器输入端口，然后运行两个步骤。两个端口的数据类型都是 JSON。', reading: '每个节点都会显示自己的输入和结果，因此可以看到值在流程中的变化。', boundary: '连接只在当前标签页中运行。导出的配方不会包含 Schema 或响应输入。' },
        { title: '5. 提交最小复现样例', toolSlug: 'openapi-explorer', action: '在 OpenAPI 文档中查看操作和响应 Schema，然后记录脱敏的小型载荷、预期类型和观察到的错误。', reading: '包含路径、状态码和 Schema 版本有助于 API 提供方重现相同条件。', boundary: '浏览器只列出操作，不会调用 API。请通过目标环境日志和集成测试确认行为。' },
      ],
      checklistTitle: '分享前确认', checklist: ['Schema 是否声明 Draft 2020-12？', '是否对照契约检查了必填字段和 JSON 类型？', '能否在不包含个人数据的情况下分享路径和关键字？', '是否考虑了外部引用和 `format` 支持范围？', '集成测试是否在服务器上确认了问题？'],
      referencesTitle: '标准与参考资料', references: [
        { label: 'JSON Schema Draft 2020-12 规范', href: 'https://json-schema.org/specification' },
        { label: 'OpenAPI 3.2.1 规范', href: 'https://spec.openapis.org/oas/v3.2' },
        { label: 'IETF RFC 8259 — JSON 数据交换', href: 'https://www.rfc-editor.org/rfc/rfc8259.html' },
      ],
    },
    'release-config-preflight': {
      title: '发布前检查环境变量和忽略规则',
      summary: '不暴露变量值，比较环境之间的键差异并测试 Git 忽略路径。',
      introduction: '发布可能因缺少配置而失败，也可能因本地凭证文件被跟踪而泄露。本检查只比较键名和空值状态，并验证候选路径是否匹配根目录 `.gitignore` 模式。',
      privacyTitle: '不要把 .env 值复制到报告或支持请求中',
      privacyNote: '报告只显示键是否存在以及值是否为空，不包含值本身。输入只留在当前标签页内存中，不会发送到服务器。也不要在问题文本中粘贴令牌、URL 密码或证书内容。',
      scenarioTitle: '暂存环境缺少键，本地 .env 可能被提交',
      scenarioNote: '虚构示例中暂存环境缺少 `LOG_LEVEL`，`CACHE_TTL` 为空。`.env.example` 可以共享，而 `.env` 应该被忽略。',
      expectedLabel: '预期的发布配置', receivedLabel: '需要检查的候选路径',
      expectedPayload: 'APP_MODE: set\nDATABASE_URL: set\nLOG_LEVEL: set\nCACHE_TTL: set',
      receivedPayload: '.env\n.env.example\nconfig/private.pem\nsrc/app.ts',
      stepsTitle: '分别检查配置是否存在和文件是否被跟踪',
      steps: [
        { title: '1. 准备两个环境的键名', toolSlug: 'env-diff', action: '将基准环境和对比环境 `.env` 中的敏感值替换为示例文本，只比较变量名和是否为空。', reading: '报告以 `missing`、`empty` 或 `set` 显示状态，不会暴露值。', boundary: '不会验证值是否有效或测试连接。URL 或证书即使存在，也可能不正确。' },
        { title: '2. 检查重复键和格式错误行', toolSlug: 'env-diff', action: '查看重复键或格式错误行提示，并按运行时文件规则处理。', reading: '重复定义可能导致不同运行时选择不同值，造成歧义。', boundary: '不会执行引号、变量展开或 Shell 语法；它不会像服务运行时一样解析 `.env`。' },
        { title: '3. 用忽略规则测试候选路径', toolSlug: 'gitignore-tester', action: '输入根目录 `.gitignore` 模式以及 `.env`、`.env.example` 和私钥的仓库相对路径。', reading: '结果显示每个候选路径是否匹配规则，可用于排查误提交风险。', boundary: '不包含子目录 `.gitignore`、全局排除项和已被 Git 跟踪的文件。' },
        { title: '4. 明确测试例外规则顺序', toolSlug: 'gitignore-tester', action: '将 `*.env` 放在 `!.env.example` 之前，比较两个路径结果。只重新包含需要共享的文件。', reading: '否定规则受顺序影响；如果父目录已被忽略，子文件例外可能不会生效。', boundary: '复杂规则应在目标仓库中使用 `git check-ignore -v` 和实际索引复核。' },
        { title: '5. 验证修改后的仓库状态', toolSlug: 'gitignore-tester', action: '确认 `.env.example` 只包含安全样例，再用 `git status` 和 Git 忽略诊断检查敏感文件是否已被跟踪。', reading: '结合浏览器结果和 Git 索引状态，可以发现仅测试模式时漏掉的已跟踪文件。', boundary: '浏览器工具不会读取本地仓库，也不会执行 Git 命令。路径需要手动提供。' },
      ],
      checklistTitle: '批准发布前确认', checklist: ['两个环境中必需的键是否存在且非空？', '示例和日志中是否完全没有敏感值或连接信息？', '`.env` 和私钥是否被忽略，安全样例是否可以共享？', '是否确认了例外顺序和父目录行为？', '是否检查敏感文件没有已经被跟踪？'],
      referencesTitle: '标准与参考资料', references: [
        { label: 'Git 官方文档 — gitignore 模式', href: 'https://git-scm.com/docs/gitignore' },
        { label: 'Git 官方文档 — git check-ignore', href: 'https://git-scm.com/docs/git-check-ignore' },
        { label: 'OWASP Secrets Management Cheat Sheet', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html' },
      ],
    },
    'har-issue-prep': {
      title: '减少 HAR 敏感信息后再报告问题',
      summary: '检查浏览器网络记录，遮盖可能的密钥，并手动检查启发式规则可能遗漏的内容。',
      introduction: 'HAR 可能包含请求和响应标头、Cookie、URL 以及正文。它有助于重现问题，但原样分享可能暴露账户数据。遮盖后仍需自行检查，并只保留最少的复现信息。',
      privacyTitle: '遮盖处理不保证匿名化',
      privacyNote: '工具会按启发式规则处理已知令牌、Cookie 和个人数据模式。自定义标头、自由文本和编码值可能被漏掉。上传之前请完整检查文件。',
      scenarioTitle: '测试请求的授权令牌留在了记录中',
      scenarioNote: '虚构记录包含 Authorization 标头和 `token` 查询值。账户名、组织 ID、唯一 URL 路径和响应正文也需要单独检查。',
      expectedLabel: '复现问题所需的信息', receivedLabel: '需要检查的 HAR 位置',
      expectedPayload: '请求路径和 HTTP 状态\n浏览器与复现步骤\n最小响应示例',
      receivedPayload: 'Authorization / Cookie 标头\nURL 查询和表单参数\n请求、响应正文和自定义字段',
      stepsTitle: '遮盖后仍要检查完整文件',
      steps: [
        { title: '1. 只捕获必要请求', toolSlug: 'har-scrubber', action: '在浏览器开发者工具中选择与问题有关的请求并保存为 HAR。尽可能使用测试账户和虚构数据。', reading: '较小的记录更容易复核，也能降低无关网络请求意外暴露的风险。', boundary: '不同浏览器的导出选项不同。不要将原始文件上传到公开位置或第三方网站。' },
        { title: '2. 遮盖已知敏感字段', toolSlug: 'har-scrubber', action: '将 HAR 1.2 JSON 粘贴到遮盖工具中，处理 Authorization、Cookie、可能的令牌查询值、表单值和匹配的正文模式。', reading: '结果会显示已处理的 HAR 和字段数量。数量为零不代表文件安全。', boundary: '自定义字段、自由文本和二次编码值可能被漏掉。工具不保证匿名化或合规。' },
        { title: '3. 搜索完整结果中的身份信息', toolSlug: 'json-formatter', action: '用 JSON 格式化工具打开结果，检查电子邮件、会话标识、客户编号、内部主机名和唯一路径。', reading: '个人数据可能残留在响应正文、自定义元数据（如 `comment`）或 URL 路径中。', boundary: '格式化只让文本更易读，不会将其匿名化。请遵循组织的数据共享规则。' },
        { title: '4. 只保留解释故障所需的请求', toolSlug: 'http-header-inspector', action: '只将相关路径、方法、状态和安全标头写入问题报告，删除无关正文和账户详情。', reading: '简短的复现步骤以及预期和实际结果，通常足以帮助排查而不必提供完整网络历史。', boundary: '标头诊断只检查粘贴的值，不会测试服务器、TLS 连接或安全策略。' },
        { title: '5. 通过获批渠道分享最少文件', toolSlug: 'har-scrubber', action: '重新打开遮盖后的副本做最终检查，再通过组织批准的问题跟踪器或安全渠道分享必要文件。', reading: '确认接收人、保留期限和删除流程可以减少调试资料的暴露。', boundary: 'DevDesk 不会上传或提交文件。请遵循接收服务和组织的访问、保留规则。' },
      ],
      checklistTitle: '从头到尾检查后再发送', checklist: ['是否使用测试或最低权限账户捕获记录？', '是否检查了标头、Cookie、查询值、正文和自定义字段？', '是否删除客户编号、邮箱、内部主机和唯一路径？', '是否删除无关请求和响应数据？', '是否确认了获批的传输渠道和保留期限？'],
      referencesTitle: '标准与参考资料', references: [
        { label: 'HTTP Archive (HAR) 1.2 format specification', href: 'https://w3c.github.io/web-performance/specs/HAR/Overview.html' },
        { label: 'OWASP Logging Cheat Sheet — 敏感数据', href: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html' },
        { label: 'IETF RFC 9110 — HTTP Semantics', href: 'https://www.rfc-editor.org/rfc/rfc9110.html' },
      ],
    },
  },
};

export function workflowRecipeGuideBySlug(locale: Locale, slug: string): WorkflowRecipeGuideContent | undefined {
  return workflowRecipeGuideSlugs.includes(slug as WorkflowRecipeSlug) ? workflowRecipeGuides[locale][slug as WorkflowRecipeSlug] : undefined;
}
