import type { Locale } from '@/i18n/config';
import type { ToolSlug } from './tools';

export type ToolExample = { input: string; output: string };
export type ToolFaq = { question: string; answer: string };
export type ToolContent = {
  description: string;
  steps: [string, string, string];
  caution: string;
  faqs: [ToolFaq, ToolFaq, ToolFaq];
  references?: { label: string; href: string }[];
};

export const toolExamples: Record<ToolSlug, [ToolExample, ToolExample]> = {
  'code-formatter': [
    { input: 'class Hello{public static void main(String[] args){System.out.println("Hello, DevDesk!");}}', output: 'class Hello {\n  public static void main(String[] args) {\n    System.out.println("Hello, DevDesk!");\n  }\n}' },
    { input: 'function greet(name){return "Hello, "+name+"!"}', output: 'function greet(name) {\n  return "Hello, " + name + "!";\n}' },
  ],
  'json-formatter': [
    { input: '{"name":"DevDesk","active":true,"count":3}', output: '{\n  "name": "DevDesk",\n  "active": true,\n  "count": 3\n}' },
    { input: '[1,true,null]', output: '[\n  1,\n  true,\n  null\n]' },
  ],
  'sql-formatter': [
    { input: 'SELECT id,name FROM users WHERE active=1 ORDER BY name;', output: 'SELECT\n  id,\n  name\nFROM users\nWHERE active = 1\nORDER BY name;' },
    { input: 'WITH recent AS (SELECT id FROM events WHERE created_at > CURRENT_DATE) SELECT id FROM recent;', output: 'WITH recent AS (\n  SELECT id\n  FROM events\n  WHERE created_at > CURRENT_DATE\n)\nSELECT id\nFROM recent;' },
  ],
  'jwt-decoder': [
    { input: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZW1vIiwiZXhwIjoxODkzNDU2MDAwfQ.', output: '{\n  "alg": "none",\n  "typ": "JWT"\n}\n\n{\n  "sub": "demo",\n  "exp": 1893456000\n}' },
    { input: 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoicmVhZGVyIn0.signature', output: '{\n  "alg": "HS256"\n}\n\n{\n  "role": "reader"\n}' },
  ],
  'cron-generator': [
    { input: '*/5 * * * *', output: 'Every 5 minutes' },
    { input: '0 9 * * 1-5', output: 'At 09:00, Monday through Friday' },
  ],
  'text-diff': [
    { input: 'before: title=Hello\nstatus=draft', output: 'after: title=Hello\nstatus=published' },
    { input: 'one\ntwo\nthree', output: 'one\ntwo changed\nthree\nfour' },
  ],
  base64: [
    { input: 'DevDesk', output: 'RGV2RGVzaw==' },
    { input: 'Hello, world!', output: 'SGVsbG8sIHdvcmxkIQ==' },
  ],
  'url-encoder': [
    { input: 'name=Dev Desk&lang=en', output: 'name%3DDev%20Desk%26lang%3Den' },
    { input: 'hello world', output: 'hello%20world' },
  ],
  'unix-timestamp': [
    { input: '0 seconds', output: '1970-01-01T00:00:00.000Z' },
    { input: '1735689600000 milliseconds', output: '2025-01-01T00:00:00.000Z' },
  ],
  'uuid-generator': [
    { input: 'Count: 2', output: 'c7c5d12e-260b-4fe5-a177-14379f3edc0a\n042b4ac5-588d-4f03-a7d4-0ef36356bf40' },
    { input: 'Count: 1', output: 'f2ce926a-51e1-4c21-91eb-30c28c26d18a' },
  ],
  'hash-generator': [
    { input: 'abc · SHA-256', output: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad' },
    { input: 'abc · SHA-384', output: 'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7' },
  ],
  'regex-tester': [
    { input: 'Pattern: \\b[A-Z]{2}\\d{2}\\b\nText: ID: AB42, CD7', output: 'AB42 · index 4' },
    { input: 'Pattern: ([a-z]+)@(example\\.com)\nText: dev@example.com', output: 'dev@example.com · group 1: dev · group 2: example.com' },
  ],
  'yaml-json': [
    { input: 'name: DevDesk\nactive: true', output: '{\n  "name": "DevDesk",\n  "active": true\n}' },
    { input: '{"retries":3,"enabled":false}', output: 'retries: 3\nenabled: false\n' },
  ],
  'json-pointer': [
    { input: '{"invoice":{"items":[{"sku":"SKU-7"}]}}\nPointer: /invoice/items/0/sku', output: '"SKU-7"' },
    { input: '{"a/b":{"~key":true}}\nPointer: /a~1b/~0key', output: 'true' },
  ],
  'csv-json': [
    { input: 'id,name,active\n1,Ada Lovelace,true\n2,"Grace, Hopper",false', output: '[\n  {\n    "id": "1",\n    "name": "Ada Lovelace",\n    "active": "true"\n  },\n  {\n    "id": "2",\n    "name": "Grace, Hopper",\n    "active": "false"\n  }\n]' },
    { input: '[{"id":1,"name":"Ada"},{"id":2,"name":"Grace, Hopper"}]', output: 'id,name\r\n1,Ada\r\n2,"Grace, Hopper"' },
  ],
  'url-inspector': [
    { input: 'https://demo:secret@example.test:8443/orders/42?tag=blue&tag=green#payment', output: '{\n  "protocol": "https:",\n  "host": "example.test:8443",\n  "pathname": "/orders/42",\n  "searchParams": [{ "name": "tag", "value": "blue" }, { "name": "tag", "value": "green" }],\n  "hash": "#payment",\n  "hasUsername": true,\n  "hasPassword": true\n}' },
    { input: 'https://example.test/search?q=hello%20world', output: '{\n  "protocol": "https:",\n  "hostname": "example.test",\n  "pathname": "/search",\n  "searchParams": [{ "name": "q", "value": "hello world" }]\n}' },
  ],
  'html-entities': [
    { input: '<div title="A & B">"Hi"</div>', output: '&lt;div title=&quot;A &amp; B&quot;&gt;&quot;Hi&quot;&lt;/div&gt;' },
    { input: '&lt;tag&gt; &amp; &#x1F600;', output: '<tag> & 😀' },
  ],
};

export const toolContent: Record<Locale, Record<ToolSlug, ToolContent>> = {
  ko: {
    'code-formatter': {
      description: 'C, C#, C++, CSS, Go, HTML, Java, JavaScript, Perl, PHP, Python, Ruby, SQL, TypeScript 코드를 구문 강조와 테마 색상으로 보여주고 포맷합니다. 입력·포맷·이미지 저장은 브라우저에서 처리합니다.',
      steps: ['언어와 색상 테마, 2칸 또는 4칸 들여쓰기를 선택합니다.', '코드를 붙여넣거나 예제를 불러온 뒤 정렬을 실행합니다.', '결과를 복사하거나 구문 강조가 적용된 PNG 이미지로 저장합니다.'],
      caution: 'Perl은 문법 구조에 따라 문장 줄바꿈과 블록 들여쓰기를 정리합니다. 문법 분석에 실패하면 원문을 보존합니다. PHP와 HTML 혼합 파일은 포맷 결과를 확인하세요. Go는 gofmt 표준 들여쓰기를 사용합니다.',
      faqs: [
        { question: '코드가 서버로 전송되나요?', answer: '아니요. 편집과 포맷은 브라우저에서 실행하며 입력 코드를 서버로 전송하지 않습니다.' },
        { question: '모든 언어를 자동 포맷할 수 있나요?', answer: '네, 목록의 14개 언어에서 포맷을 지원합니다. Perl은 문법 구조에 따라 줄바꿈과 들여쓰기를 정리하고, Go는 gofmt 표준 들여쓰기를 따릅니다.' },
        { question: '결과를 이미지로 저장할 수 있나요?', answer: '네. 선택한 색상 테마와 구문 강조가 적용된 결과를 PNG로 저장할 수 있습니다.' },
      ],
    },
    'json-formatter': {
      description: '무료 온라인 JSON 포맷터로 JSON 문법을 검사하고 들여쓰기를 정리하거나 JSON을 압축할 수 있습니다. 모든 작업은 브라우저에서 처리되며 입력은 서버로 전송되지 않습니다.',
      steps: ['JSON 텍스트를 붙여넣거나 예제를 불러옵니다.', '2칸 또는 4칸 들여쓰기를 고릅니다.', '정렬·압축·검증을 실행한 뒤 복사하거나 JSON 파일로 내려받습니다.'],
      caution: 'JSON은 주석과 마지막 쉼표를 허용하지 않습니다. 같은 객체에 중복 키가 있으면 브라우저 파서가 마지막 값을 사용합니다.',
      faqs: [
        { question: 'JSON에 주석을 넣을 수 있나요?', answer: '표준 JSON에는 주석이 없습니다. 주석이나 trailing comma가 있으면 검증 오류가 표시됩니다.' },
        { question: '오류 줄과 열은 정확한가요?', answer: '브라우저가 제공하는 파서 메시지에서 위치를 읽습니다. 브라우저별 문구 차이 때문에 일부 오류는 일반 메시지로 표시될 수 있습니다.' },
        { question: '입력한 JSON이 서버로 전송되나요?', answer: '아니요. 변환은 브라우저에서 실행하며 DevDesk 변환 서버로 입력을 보내지 않습니다.' },
      ],
    },
    'sql-formatter': {
      description: 'SQL 키워드와 절을 줄바꿈해 읽기 쉽게 정리합니다. 포맷터는 쿼리를 실행하거나 데이터베이스에 연결하지 않습니다.',
      steps: ['SQL을 입력하거나 예제를 불러옵니다.', 'Generic, MySQL, PostgreSQL, Oracle 방언을 선택합니다.', '들여쓰기를 지정하고 포맷한 SQL을 검토해 복사합니다.'],
      caution: '포맷 결과는 문법 검증이나 실행 결과가 아닙니다. 운영 쿼리는 대상 데이터베이스에서 직접 검증하세요.',
      faqs: [
        { question: 'SQL이 유효한지 검사하나요?', answer: '아니요. 이 도구는 텍스트 서식만 정리하며 SQL을 실행하거나 데이터베이스 문법을 검증하지 않습니다.' },
        { question: 'MariaDB와 Oracle을 지원하나요?', answer: 'MySQL 계열은 MySQL 방언을, Oracle은 PL/SQL 방언을 선택해 포맷할 수 있습니다. 방언별 차이는 라이브러리 지원 범위에 따릅니다.' },
        { question: '주석과 문자열을 바꾸나요?', answer: '포맷터는 문자열 리터럴과 주석을 토큰으로 처리합니다. 결과를 적용하기 전에 중요한 쿼리 구간을 확인하세요.' },
      ],
    },
    'jwt-decoder': {
      description: 'JWT의 Base64URL 헤더와 페이로드를 UTF-8 JSON으로 디코딩합니다. 서명 검증은 수행하지 않습니다.',
      steps: ['점으로 구분된 JWT 전체를 붙여넣습니다.', '헤더와 페이로드를 확인하고 시간 claim을 살펴봅니다.', '표시된 UTC·로컬 시간과 만료 상태를 참고합니다.'],
      caution: '디코딩은 서명 검증이 아닙니다. 화면의 claim은 위조될 수 있으며 이 도구는 토큰의 진위를 보장하지 않습니다.',
      faqs: [
        { question: '토큰 서명이 검증되나요?', answer: '아니요. 헤더와 페이로드를 읽기만 하며 서명 검증이나 서버 인증을 수행하지 않습니다.' },
        { question: 'exp와 nbf는 어떻게 표시되나요?', answer: '초 단위 Unix 시간으로 해석해 UTC와 브라우저 로컬 시간을 함께 보여줍니다. 만료 상태는 현재 브라우저 시계를 기준으로 합니다.' },
        { question: '실제 서비스 토큰을 넣어도 되나요?', answer: '입력은 외부로 전송하지 않지만 민감한 운영 토큰은 붙여넣지 않는 편이 안전합니다. 결과를 로그나 URL에 저장하지 마세요.' },
      ],
    },
    'cron-generator': {
      description: 'Linux 표준 5필드 Cron 표현식을 만들고 선택한 시간대에서 다음 실행 시각을 계산합니다.',
      steps: ['분·시·일·월·요일을 선택하거나 5필드 표현식을 입력합니다.', '표준 Linux Cron 시간대를 선택합니다.', '표현식 설명과 다음 실행 시각 5개를 확인합니다.'],
      caution: 'Quartz의 초·연도 필드는 지원하지 않습니다. 일광 절약 시간 전환과 월말 동작은 실제 스케줄러 정책도 확인하세요.',
      faqs: [
        { question: 'Quartz의 6필드 Cron도 되나요?', answer: '아니요. 이 생성기는 분부터 요일까지의 Linux 5필드 표현식만 지원합니다.' },
        { question: '다음 실행 시각은 어떤 시간대인가요?', answer: '선택한 IANA 시간대를 기준으로 계산하고 화면에 시간대 이름을 표시합니다.' },
        { question: '서머타임 전환 때도 항상 같은 결과인가요?', answer: '시간대 규칙에 따라 존재하지 않는 로컬 시각은 건너뛰고 반복 시각은 두 번 나타날 수 있습니다. 운영 스케줄러의 동작도 확인하세요.' },
      ],
    },
    'text-diff': {
      description: '두 텍스트를 줄 단위로 비교해 추가·삭제된 줄을 표시합니다. 비교 과정은 브라우저 안에서 실행됩니다.',
      steps: ['원본과 변경 텍스트를 각각 입력합니다.', '비교를 실행하고 추가·삭제 요약을 확인합니다.', '차이를 검토한 뒤 결과를 복사합니다.'],
      caution: '큰 입력은 브라우저 메모리를 사용할 수 있습니다. 기본 입력 한도는 1 MB이며 HTML 문자열로 해석하지 않습니다.',
      faqs: [
        { question: '단어 단위 차이도 표시하나요?', answer: '초기 버전은 줄 단위 비교를 제공합니다. 단어 단위 결과가 필요하면 줄별 내용을 직접 확인하세요.' },
        { question: '공백과 줄바꿈은 비교에 포함되나요?', answer: '네. CRLF와 LF는 비교 전에 정규화하지만 각 줄의 공백은 의미가 달라질 수 있어 유지합니다.' },
        { question: '비교 텍스트가 HTML로 실행되나요?', answer: '아니요. 입력과 결과는 텍스트로 렌더링하므로 붙여넣은 태그나 스크립트를 실행하지 않습니다.' },
      ],
    },
    base64: {
      description: 'UTF-8 텍스트를 Base64로 인코딩하거나 디코딩합니다. 한글·일본어·이모지도 바이트 기준으로 처리합니다.',
      steps: ['변환할 텍스트 또는 Base64 문자열을 입력합니다.', '인코딩 또는 디코딩을 선택합니다.', '결과를 복사하거나 입력과 출력을 서로 바꿉니다.'],
      caution: 'Base64는 인코딩일 뿐 암호화가 아닙니다. 누구나 원문으로 되돌릴 수 있으므로 비밀값 보호에 사용하지 마세요.',
      faqs: [
        { question: 'Base64로 암호화할 수 있나요?', answer: '아니요. Base64는 데이터를 문자로 표현하는 인코딩이며 키나 기밀성을 제공하지 않습니다.' },
        { question: '한글과 이모지도 깨지지 않나요?', answer: 'UTF-8 바이트와 TextEncoder/TextDecoder를 사용해 멀티바이트 문자를 처리합니다.' },
        { question: 'URL-safe Base64는 다른가요?', answer: 'URL-safe 형식은 +와 / 대신 -와 _를 쓰고 패딩을 생략할 수 있습니다. 일반 Base64와 구분해 사용하세요.' },
      ],
    },
    'url-encoder': {
      description: 'URL의 한 구성 요소를 percent-encoding하거나 디코딩합니다. 전체 주소를 보존하는 도구가 아니라 문자열 변환기입니다.',
      steps: ['인코딩하거나 디코딩할 구성 요소 문자열을 입력합니다.', '방향을 선택합니다.', '변환 결과를 복사해 URL의 알맞은 위치에 사용합니다.'],
      caution: '기본 기능은 encodeURIComponent 방식입니다. 전체 URL이나 application/x-www-form-urlencoded의 공백 규칙과는 다릅니다.',
      faqs: [
        { question: '전체 URL도 한 번에 인코딩하나요?', answer: '아니요. 경로 조각이나 쿼리 값 같은 구성 요소를 변환합니다. 전체 URL을 그대로 입력하면 구분자도 인코딩됩니다.' },
        { question: '공백은 +로 바뀌나요?', answer: '기본 component 인코딩은 공백을 %20으로 표시합니다. 폼 인코딩의 + 규칙과 다릅니다.' },
        { question: '잘못된 % 이스케이프를 넣으면 어떻게 되나요?', answer: '디코딩 오류를 표시하고 원문 입력은 유지합니다.' },
      ],
    },
    'unix-timestamp': {
      description: '초 또는 밀리초 단위를 직접 선택해 Unix timestamp와 ISO 날짜를 변환합니다. 시간대 표시도 함께 확인할 수 있습니다.',
      steps: ['입력 숫자가 초인지 밀리초인지 명시적으로 선택합니다.', 'timestamp를 날짜로 바꾸거나 날짜를 입력합니다.', 'UTC·선택 시간대 결과를 확인하고 필요한 값을 복사합니다.'],
      caution: '단위를 자동 추측하지 않습니다. 초와 밀리초를 혼동하면 날짜가 크게 달라지므로 입력 단위를 먼저 확인하세요.',
      faqs: [
        { question: '13자리 숫자는 자동으로 밀리초로 보나요?', answer: '아니요. 단위는 사용자가 선택합니다. 13자리 숫자도 초로 선택하면 그 기준으로 해석됩니다.' },
        { question: '0은 올바른 timestamp인가요?', answer: '네. 0초는 1970-01-01T00:00:00Z를 뜻합니다.' },
        { question: '시간대는 변환에 영향을 주나요?', answer: 'UTC instant는 같고 화면의 현지 날짜·시각 표현만 선택한 시간대에 따라 달라집니다.' },
      ],
    },
    'uuid-generator': {
      description: 'Web Crypto의 randomUUID로 UUID v4를 생성합니다. 개수를 지정해 여러 ID를 한 번에 복사하거나 내려받을 수 있습니다.',
      steps: ['생성 개수를 1~100 사이에서 정합니다.', 'UUID 생성을 실행합니다.', '한 줄씩 분리된 결과를 복사하거나 텍스트 파일로 저장합니다.'],
      caution: '보안 컨텍스트의 Web Crypto API가 필요합니다. HTTPS 또는 localhost가 아닌 브라우저에서 지원되지 않을 수 있습니다.',
      faqs: [
        { question: 'UUID는 어떤 방식으로 만들나요?', answer: '지원되는 브라우저의 crypto.randomUUID()로 UUID v4를 생성합니다. Math.random 기반 폴백은 사용하지 않습니다.' },
        { question: 'UUID가 중복되지 않는다고 보장하나요?', answer: '충돌 가능성은 매우 낮지만 수학적으로 0은 아닙니다. 시스템의 고유성 요구에 따라 중복 검사를 추가하세요.' },
        { question: 'HTTP 사이트에서도 사용할 수 있나요?', answer: '브라우저의 Web Crypto 지원에 따라 HTTPS 또는 localhost가 필요합니다.' },
      ],
    },
    'hash-generator': {
      description: 'Web Crypto로 입력 텍스트의 SHA-256, SHA-384, SHA-512 digest를 계산해 16진수로 표시합니다.',
      steps: ['해시할 일반 텍스트를 입력합니다.', 'SHA-256, SHA-384 또는 SHA-512를 선택합니다.', '계산된 digest를 확인하고 복사합니다.'],
      caution: '해시는 일방향 digest이지 암호화가 아닙니다. 빠른 SHA 해시를 비밀번호 저장용으로 사용하지 마세요.',
      faqs: [
        { question: '해시에서 원문을 복구할 수 있나요?', answer: '해시 함수는 일방향 digest를 계산합니다. 암호화처럼 복호화할 수 없습니다.' },
        { question: '비밀번호 해시로 사용해도 되나요?', answer: '아니요. 비밀번호 저장에는 salt와 반복 비용을 갖춘 Argon2id, scrypt, bcrypt 같은 전용 KDF를 사용해야 합니다.' },
        { question: '입력 데이터가 전송되나요?', answer: '아니요. Web Crypto가 브라우저에서 계산하며 DevDesk 서버로 원문을 보내지 않습니다.' },
      ],
    },
    'regex-tester': {
      description: 'JavaScript 정규식 패턴과 플래그를 입력해 매치, 캡처 그룹, 문자열 위치를 확인합니다.',
      steps: ['JavaScript 패턴과 허용 플래그를 입력합니다.', '테스트 문자열을 붙여넣습니다.', '매치 영역·캡처·인덱스를 검토합니다.'],
      caution: '정규식은 별도 브라우저 Web Worker에서 제한 시간 동안 실행합니다. 시간 초과 시 작업자를 종료하며 입력은 브라우저에 남습니다.',
      faqs: [
        { question: 'PCRE나 Python 문법도 지원하나요?', answer: '아니요. 브라우저 JavaScript RegExp 문법과 지원되는 JavaScript 플래그를 사용합니다.' },
        { question: '복잡한 패턴 때문에 탭이 멈추지 않나요?', answer: '패턴 계산을 Web Worker에서 실행하고 시간 제한을 넘으면 Worker를 종료해 화면을 복구합니다.' },
        { question: '빈 문자열 매치가 반복되나요?', answer: '전역 검색은 zero-length 매치 뒤 인덱스를 안전하게 이동해 무한 루프를 방지합니다.' },
      ],
    },
    'yaml-json': {
      description: '안전한 YAML 파서로 YAML과 JSON을 양방향 변환하고 문법 오류를 표시합니다.',
      steps: ['YAML 또는 JSON 입력 형식을 선택합니다.', '내용을 입력하거나 예제를 불러옵니다.', '반대 형식으로 변환하고 결과를 검토해 복사합니다.'],
      caution: 'YAML의 날짜·숫자·별칭은 파서 설정에 따라 JSON 값으로 해석될 수 있습니다. 큰 입력과 깊은 중첩은 제한됩니다.',
      faqs: [
        { question: 'YAML 날짜는 JSON에서 어떤 값이 되나요?', answer: '날짜처럼 보이는 스칼라도 파서 옵션과 YAML 스키마에 따라 문자열 또는 다른 타입이 될 수 있으니 결과를 확인하세요.' },
        { question: 'YAML alias와 깊은 중첩을 무제한 지원하나요?', answer: '아니요. 과도한 계산이나 메모리 사용을 막기 위해 입력 크기와 중첩을 제한합니다.' },
        { question: 'YAML에서 코드를 실행하나요?', answer: '아니요. 안전한 파싱과 직렬화만 수행하며 eval이나 사용자 코드 실행은 사용하지 않습니다.' },
      ],
    },
    'json-pointer': {
      description: 'RFC 6901 JSON Pointer로 API 응답의 중첩 키나 배열 인덱스를 따라가 원하는 값을 확인합니다. 전체 문서를 다시 훑지 않고 경로의 실제 값을 출력합니다.',
      steps: ['JSON 응답 본문을 붙여넣습니다.', '루트는 빈 문자열, 중첩 경로는 /로 시작하는 포인터를 입력합니다.', '값과 JSON 타입을 확인하고 필요한 결과를 복사합니다.'],
      caution: 'JSON Pointer는 JSONPath가 아니므로 필터, 와일드카드, 여러 결과 선택을 지원하지 않습니다. 키 이름의 /는 ~1, ~는 ~0으로 씁니다. JSON 파서는 중복 키를 마지막 값으로 처리하므로 중복 키 검증기로 사용하지 마세요.',
      faqs: [
        { question: '배열 원소는 어떻게 지정하나요?', answer: '배열 인덱스를 경로 토큰으로 사용합니다. 예를 들어 /items/0은 첫 번째 원소입니다.' },
        { question: '키 이름에 슬래시나 물결표가 있으면 어떻게 하나요?', answer: 'RFC 6901 규칙에 따라 슬래시는 ~1, 물결표는 ~0으로 이스케이프합니다. 변환 순서는 결과에 영향을 줍니다.' },
        { question: '값을 찾지 못하면 입력 JSON이 잘못된 건가요?', answer: '아닙니다. JSON 문법 오류와 존재하지 않는 경로를 구분해 안내합니다. 키 대소문자와 배열 범위를 확인하세요.' },
      ],
      references: [{ label: 'RFC 6901 — JSON Pointer', href: 'https://www.rfc-editor.org/rfc/rfc6901.html' }],
    },
    'csv-json': {
      description: '쉼표·탭·세미콜론 구분 텍스트를 JSON 객체 배열로 바꾸거나 객체 배열을 CSV로 내보냅니다. 따옴표로 감싼 구분자와 줄바꿈을 처리합니다.',
      steps: ['CSV → JSON 또는 JSON → CSV 방향을 선택합니다.', '쉼표·탭·세미콜론 중 입력과 맞는 구분자를 고릅니다.', '표 데이터를 붙여넣어 변환한 뒤 셀 값을 검토합니다.'],
      caution: 'CSV에서 가져온 값은 모두 문자열입니다. 내보낼 JSON은 객체들의 배열이어야 하며, 중첩 값은 셀 안에 JSON 텍스트로 기록됩니다. CSV를 스프레드시트에서 열면 =, +, - 또는 @로 시작하는 값이 수식으로 해석될 수 있으므로 신뢰할 수 없는 셀을 확인하세요.',
      faqs: [
        { question: 'CSV의 숫자와 true/false는 자동으로 타입 변환되나요?', answer: '아니요. CSV에는 표준 데이터 타입 정보가 없어 모든 셀을 문자열로 보존합니다.' },
        { question: '값 안에 쉼표나 줄바꿈이 있으면 어떻게 하나요?', answer: 'CSV 따옴표 규칙을 사용합니다. 필드 안의 따옴표는 두 번 써서 이스케이프합니다.' },
        { question: 'JSON 행마다 열 구성이 달라도 되나요?', answer: 'JSON → CSV는 모든 객체의 키를 처음 나온 순서대로 모읍니다. 없는 속성은 빈 셀로 기록합니다.' },
      ],
      references: [{ label: 'RFC 4180 — CSV 파일의 일반 형식과 MIME 유형', href: 'https://www.rfc-editor.org/rfc/rfc4180.html' }],
    },
    'url-inspector': {
      description: '절대 HTTP(S) URL을 구성 요소로 나누고 반복된 쿼리 매개변수를 순서대로 확인합니다. 주소 파싱만 수행하며 대상 서버에 연결하지 않습니다.',
      steps: ['http:// 또는 https://로 시작하는 전체 URL을 붙여넣습니다.', '분석을 실행해 호스트·경로·쿼리·fragment를 살펴봅니다.', '반복된 쿼리 키와 디코딩된 값이 필요한지 확인합니다.'],
      caution: '사용자 이름과 비밀번호 값은 결과에서 제외하지만 쿼리 문자열에는 토큰이나 개인정보가 있을 수 있습니다. 민감한 주소는 외부에 공유하지 마세요.',
      faqs: [
        { question: '상대 경로나 mailto 링크를 분석할 수 있나요?', answer: '아니요. 혼동을 줄이기 위해 절대 HTTP 및 HTTPS URL만 받습니다.' },
        { question: '같은 쿼리 키가 여러 번 나오면 덮어쓰나요?', answer: '아니요. URLSearchParams의 항목 순서대로 각각 표시하므로 중복 매개변수를 확인할 수 있습니다.' },
        { question: '입력한 주소로 요청을 보내나요?', answer: '아니요. 브라우저의 URL 파서만 사용하며 페이지를 열거나 네트워크 요청을 전송하지 않습니다.' },
      ],
      references: [{ label: 'WHATWG URL Standard — URL 및 URLSearchParams API', href: 'https://url.spec.whatwg.org/' }],
    },
    'html-entities': {
      description: '텍스트의 HTML 특수 문자를 엔티티로 이스케이프하거나 지원되는 문자 참조를 다시 문자로 변환합니다. HTML 파싱이나 실행은 하지 않습니다.',
      steps: ['인코딩 또는 디코딩 방향을 선택합니다.', 'HTML 조각이나 문자 참조가 포함된 텍스트를 붙여넣습니다.', '변환 결과를 검토한 뒤 복사합니다.'],
      caution: '디코더는 amp, apos, gt, lt, nbsp, quot와 세미콜론으로 끝나는 숫자 문자 참조를 처리합니다. 이 기능은 HTML sanitizer가 아니므로 신뢰할 수 없는 마크업을 안전하게 만들지 않습니다.',
      faqs: [
        { question: 'HTML을 실행하거나 미리 보나요?', answer: '아니요. 문자열만 변환하며 DOM에 마크업을 삽입하거나 코드를 실행하지 않습니다.' },
        { question: '모든 HTML5 이름 엔티티를 디코딩하나요?', answer: '아니요. 흔히 쓰는 amp, apos, gt, lt, nbsp, quot 이름과 숫자 참조를 지원합니다. 다른 이름은 원문으로 남습니다.' },
        { question: '이 결과로 HTML XSS를 방지할 수 있나요?', answer: '단독으로는 불가능합니다. 출력 문맥에 맞는 검증된 HTML sanitizer를 사용해야 하며, 이 변환기는 보안 필터가 아닙니다.' },
      ],
      references: [{ label: 'WHATWG HTML Standard — Character references', href: 'https://html.spec.whatwg.org/multipage/syntax.html#character-references' }],
    },
  },
  en: {
    'code-formatter': {
      description: 'View and format C, C#, C++, CSS, Go, HTML, Java, JavaScript, Perl, PHP, Python, Ruby, SQL, and TypeScript with syntax highlighting and selectable themes. Editing, formatting, and image export run in your browser.',
      steps: ['Choose a language, color theme, and 2- or 4-space indentation.', 'Paste code or load an example, then format it.', 'Copy the result or save a syntax-highlighted PNG image.'],
      caution: 'Perl formatting uses syntax structure to organize statement line breaks and block indentation. If parsing fails, the original code is preserved. Review mixed PHP and HTML files. Go uses gofmt’s standard indentation.',
      faqs: [
        { question: 'Is my code sent to a server?', answer: 'No. Editing and formatting run in your browser, and input code is not sent to a server.' },
        { question: 'Can every language be formatted automatically?', answer: 'Formatting is available for all 14 listed languages. Perl uses syntax structure for line breaks and indentation, while Go follows gofmt indentation.' },
        { question: 'Can I save the result as an image?', answer: 'Yes. Save the formatted result as a PNG with the selected color theme and syntax highlighting.' },
      ],
    },
    'json-formatter': {
      description: 'Use this free online JSON formatter to validate JSON syntax, format indentation, or minify JSON. Processing runs in your browser, so your input is not sent to a server.',
      steps: ['Paste JSON or load a sample.', 'Choose two or four spaces for indentation.', 'Beautify, minify, or validate, then copy or download the result.'],
      caution: 'Standard JSON has no comments or trailing commas. If an object repeats a key, the browser parser keeps the last value.',
      faqs: [
        { question: 'Can JSON contain comments?', answer: 'No. Standard JSON does not define comments, so comments and trailing commas produce validation errors.' },
        { question: 'Are error line and column numbers exact?', answer: 'The tool extracts a location when the browser parser provides one. Browser message differences mean some errors use a general message.' },
        { question: 'Is my JSON sent to a server?', answer: 'No. Conversion runs in your browser and the input is not sent to a DevDesk conversion server.' },
      ],
    },
    'sql-formatter': {
      description: 'Break SQL clauses onto readable lines. The formatter does not execute queries or connect to a database.',
      steps: ['Paste SQL or load an example.', 'Choose Generic, MySQL, PostgreSQL, or Oracle formatting.', 'Set indentation, format the text, and review it before copying.'],
      caution: 'Formatted output is not a syntax check or execution result. Validate production queries against their target database.',
      faqs: [
        { question: 'Does this validate SQL?', answer: 'No. It formats text only; it neither runs SQL nor verifies database-specific syntax.' },
        { question: 'Can I format MariaDB and Oracle SQL?', answer: 'Choose the MySQL dialect for MySQL-family syntax and PL/SQL for Oracle. Coverage follows the formatter library.' },
        { question: 'Are comments and string literals preserved?', answer: 'The formatter tokenizes comments and literals. Review important query sections before using the formatted result.' },
      ],
    },
    'jwt-decoder': {
      description: 'Decode the Base64URL header and payload of a JWT as UTF-8 JSON. This tool does not verify signatures.',
      steps: ['Paste the complete dot-separated JWT.', 'Inspect its header, payload, and time claims.', 'Review UTC and local timestamps and the browser-clock expiry status.'],
      caution: 'Decoding is not signature verification. Claims displayed here can be forged, and the tool cannot establish a token’s authenticity.',
      faqs: [
        { question: 'Does it verify the token signature?', answer: 'No. It only reads the header and payload; it performs no signature verification or server authentication.' },
        { question: 'How are exp and nbf displayed?', answer: 'They are interpreted as Unix seconds and shown in UTC and browser-local time. Expiry is evaluated using the browser clock.' },
        { question: 'Should I paste a production token?', answer: 'Inputs are not sent externally, but avoid pasting sensitive production tokens. Do not save token contents in logs or URLs.' },
      ],
    },
    'cron-generator': {
      description: 'Build standard Linux five-field Cron expressions and calculate upcoming run times in a selected time zone.',
      steps: ['Choose minute, hour, day, month, and weekday values or enter five fields.', 'Select a standard Linux Cron time zone.', 'Read the plain-language summary and inspect the next five run times.'],
      caution: 'Quartz seconds and year fields are not supported. Check your scheduler’s DST and month-end behavior before deploying a schedule.',
      faqs: [
        { question: 'Does it support six-field Quartz Cron?', answer: 'No. This generator supports Linux Cron’s five fields, from minute through weekday.' },
        { question: 'Which time zone is used for upcoming runs?', answer: 'The selected IANA time zone is used and shown with each displayed run time.' },
        { question: 'Are DST changes identical in every scheduler?', answer: 'No. A local time that does not exist may be skipped, while a repeated local time may occur twice. Check your scheduler’s rules.' },
      ],
    },
    'text-diff': {
      description: 'Compare two text blocks line by line and highlight additions and removals. The comparison runs in your browser.',
      steps: ['Enter the original and changed text.', 'Run the comparison and review the change summary.', 'Inspect the marked lines and copy the result.'],
      caution: 'Large inputs use browser memory. The default input limit is 1 MB, and input is rendered as text rather than HTML.',
      faqs: [
        { question: 'Does it show word-level differences?', answer: 'The initial version shows line-level changes. Inspect the affected lines directly for word-level details.' },
        { question: 'Are spaces and line endings compared?', answer: 'Yes. CRLF and LF endings are normalized, while spaces within each line are preserved.' },
        { question: 'Can pasted HTML execute?', answer: 'No. Input and output are rendered as text, so pasted tags and scripts are not executed.' },
      ],
    },
    base64: {
      description: 'Encode UTF-8 text as Base64 or decode Base64 back to text. Multibyte characters and emoji are handled as bytes.',
      steps: ['Enter text or a Base64 string.', 'Choose encode or decode.', 'Copy the result or swap the input and output.'],
      caution: 'Base64 is encoding, not encryption. Anyone can reverse it, so it does not protect secrets.',
      faqs: [
        { question: 'Does Base64 encrypt data?', answer: 'No. Base64 is a text representation of bytes and provides neither a key nor confidentiality.' },
        { question: 'Will Korean, Japanese, and emoji survive?', answer: 'The tool encodes UTF-8 bytes with TextEncoder and decodes them with TextDecoder.' },
        { question: 'How does URL-safe Base64 differ?', answer: 'URL-safe Base64 uses - and _ instead of + and / and may omit padding. Keep it distinct from standard Base64.' },
      ],
    },
    'url-encoder': {
      description: 'Percent-encode or decode one URL component. This converts text; it does not preserve or normalize a complete URL.',
      steps: ['Enter the component to encode or decode.', 'Choose the conversion direction.', 'Copy the result into the appropriate part of your URL.'],
      caution: 'The default behavior follows encodeURIComponent. It differs from encoding a complete URL and from form encoding’s space rules.',
      faqs: [
        { question: 'Does it encode a complete URL?', answer: 'No. It converts a component such as a path fragment or query value. Separators are encoded if you enter a whole URL.' },
        { question: 'Are spaces converted to plus signs?', answer: 'Component encoding represents spaces as %20. Form encoding uses a different plus-sign convention.' },
        { question: 'What happens to malformed percent escapes?', answer: 'The decoder reports an error and keeps the original input intact.' },
      ],
    },
    'unix-timestamp': {
      description: 'Convert Unix timestamps and ISO dates with seconds or milliseconds selected explicitly. Display results in UTC and a chosen time zone.',
      steps: ['Explicitly choose seconds or milliseconds.', 'Convert a timestamp to a date or enter a date to create a timestamp.', 'Review UTC and selected-zone values, then copy what you need.'],
      caution: 'The unit is never guessed. Seconds and milliseconds produce very different dates, so confirm the source unit first.',
      faqs: [
        { question: 'Are 13-digit numbers automatically milliseconds?', answer: 'No. You select the unit. A 13-digit number is interpreted as seconds if you choose seconds.' },
        { question: 'Is zero a valid timestamp?', answer: 'Yes. Zero seconds is 1970-01-01T00:00:00Z.' },
        { question: 'Does the selected time zone change the timestamp?', answer: 'The UTC instant stays the same; only the displayed local date and time change with the selected zone.' },
      ],
    },
    'uuid-generator': {
      description: 'Generate UUID v4 identifiers with Web Crypto randomUUID. Choose a count and copy or download one ID per line.',
      steps: ['Choose a count from 1 to 100.', 'Generate the UUIDs.', 'Copy the newline-separated values or save them as a text file.'],
      caution: 'The browser’s Web Crypto API requires a secure context. Use HTTPS or localhost when the API is unavailable.',
      faqs: [
        { question: 'How are UUIDs generated?', answer: 'Supported browsers use crypto.randomUUID() for UUID v4. There is no Math.random fallback.' },
        { question: 'Are duplicates impossible?', answer: 'Collision probability is extremely low but not mathematically zero. Add a uniqueness check if your system requires one.' },
        { question: 'Does it work over plain HTTP?', answer: 'Web Crypto availability depends on browser security rules; HTTPS or localhost is required in browsers that restrict it.' },
      ],
    },
    'hash-generator': {
      description: 'Use Web Crypto to calculate SHA-256, SHA-384, or SHA-512 digests of text and display them in hexadecimal.',
      steps: ['Enter ordinary text to hash.', 'Choose SHA-256, SHA-384, or SHA-512.', 'Review and copy the resulting digest.'],
      caution: 'A hash is a one-way digest, not encryption. Do not use fast SHA hashes to store passwords.',
      faqs: [
        { question: 'Can I recover the original text from a hash?', answer: 'No. A hash function computes a one-way digest and does not provide decryption.' },
        { question: 'Can I use this for password storage?', answer: 'No. Password storage needs a dedicated KDF such as Argon2id, scrypt, or bcrypt with salts and work factors.' },
        { question: 'Is the text uploaded?', answer: 'No. Web Crypto computes the digest in the browser; the original text is not sent to a DevDesk server.' },
      ],
    },
    'regex-tester': {
      description: 'Test JavaScript regular-expression patterns and flags, then inspect matches, capture groups, and string positions.',
      steps: ['Enter a JavaScript pattern and supported flags.', 'Paste a test string.', 'Review matched spans, captures, and indexes.'],
      caution: 'Patterns run in a browser Web Worker with a time limit. A timed-out worker is terminated; your input stays in the browser.',
      faqs: [
        { question: 'Does it support PCRE or Python syntax?', answer: 'No. It uses browser JavaScript RegExp syntax and the supported JavaScript flags.' },
        { question: 'Can a complex pattern freeze the tab?', answer: 'Matching runs in a Web Worker. If it exceeds the time limit, the worker is terminated so the interface can recover.' },
        { question: 'Can global zero-length matches loop forever?', answer: 'No. The global matcher advances its index after a zero-length match to prevent an infinite loop.' },
      ],
    },
    'yaml-json': {
      description: 'Convert YAML and JSON in either direction with a maintained YAML parser and clear syntax errors.',
      steps: ['Choose YAML or JSON as the input format.', 'Enter content or load a sample.', 'Convert to the other format, review, and copy the result.'],
      caution: 'YAML dates, numbers, and aliases may map to JSON types according to parser settings. Large and deeply nested input is limited.',
      faqs: [
        { question: 'How do YAML dates map to JSON?', answer: 'Date-looking scalars can become strings or other values depending on the parser and schema. Review the converted value.' },
        { question: 'Are YAML aliases and deep nesting unlimited?', answer: 'No. Input size and nesting are bounded to limit excessive computation and memory use.' },
        { question: 'Can YAML execute code here?', answer: 'No. The tool parses and serializes data only; it does not use eval or execute user code.' },
      ],
    },
    'json-pointer': {
      description: 'Follow nested keys and array indexes in an API response with RFC 6901 JSON Pointer. Inspect the value at one exact path without scanning the document manually.',
      steps: ['Paste a JSON response body.', 'Enter an empty string for the root or a pointer path beginning with /.', 'Review the selected value and its JSON type, then copy it if needed.'],
      caution: 'JSON Pointer is not JSONPath: filters, wildcards, and multi-value selection are not supported. Escape / in a key as ~1 and ~ as ~0. JSON.parse keeps the last duplicate object key, so this is not a duplicate-key validator.',
      faqs: [
        { question: 'How do I select an array item?', answer: 'Use its zero-based index as a path token. For example, /items/0 selects the first item.' },
        { question: 'What if a key contains a slash or tilde?', answer: 'RFC 6901 encodes slash as ~1 and tilde as ~0. The order of these escapes matters.' },
        { question: 'Does a missing value mean my JSON is invalid?', answer: 'No. The tool distinguishes JSON syntax errors from paths that do not exist. Check key spelling, case, and array bounds.' },
      ],
      references: [{ label: 'RFC 6901 — JSON Pointer', href: 'https://www.rfc-editor.org/rfc/rfc6901.html' }],
    },
    'csv-json': {
      description: 'Convert comma-, tab-, or semicolon-delimited text to an array of JSON objects, or export an array of objects as CSV. Quoted delimiters and line breaks are supported.',
      steps: ['Choose CSV → JSON or JSON → CSV.', 'Select the delimiter used by the input.', 'Paste the table data, convert it, and review the cell values.'],
      caution: 'Imported CSV values are strings because CSV has no standard type metadata. JSON input must be an array of objects; nested values are written as JSON text inside a cell. Spreadsheet apps may interpret cells starting with =, +, -, or @ as formulas, so review untrusted values before opening an export.',
      faqs: [
        { question: 'Are numbers and true/false values typed automatically?', answer: 'No. CSV does not define data types, so every imported cell is preserved as a string.' },
        { question: 'How are commas and newlines inside a value handled?', answer: 'Use CSV quoting. A quote inside a quoted field is escaped by doubling it.' },
        { question: 'Can JSON rows have different keys?', answer: 'Yes. JSON → CSV collects keys in first-seen order and writes a blank cell when a row lacks a key.' },
      ],
      references: [{ label: 'RFC 4180 — Common Format and MIME Type for CSV Files', href: 'https://www.rfc-editor.org/rfc/rfc4180.html' }],
    },
    'url-inspector': {
      description: 'Break an absolute HTTP(S) URL into components and inspect repeated query parameters in order. It parses the address without contacting the target server.',
      steps: ['Paste a full URL starting with http:// or https://.', 'Inspect its host, path, query, and fragment.', 'Check repeated query keys and decoded parameter values.'],
      caution: 'Username and password values are omitted, but query strings can still contain tokens or personal data. Do not share sensitive URLs or results.',
      faqs: [
        { question: 'Can I inspect a relative path or a mailto link?', answer: 'No. The tool accepts absolute HTTP and HTTPS URLs to keep parsing unambiguous.' },
        { question: 'Are repeated query keys overwritten?', answer: 'No. Each URLSearchParams entry is listed in order, so duplicate parameters remain visible.' },
        { question: 'Does the tool request the URL?', answer: 'No. It uses the browser URL parser only; it does not open the address or make a network request.' },
      ],
      references: [{ label: 'WHATWG URL Standard — URL and URLSearchParams API', href: 'https://url.spec.whatwg.org/' }],
    },
    'html-entities': {
      description: 'Escape HTML special characters in text or decode supported character references. The tool transforms strings without parsing or executing HTML.',
      steps: ['Choose encode or decode.', 'Paste an HTML fragment or text containing character references.', 'Review the converted text and copy it.'],
      caution: 'The decoder handles amp, apos, gt, lt, nbsp, quot, and semicolon-terminated numeric references. This is not an HTML sanitizer and does not make untrusted markup safe.',
      faqs: [
        { question: 'Does the tool render or execute HTML?', answer: 'No. It transforms text only and never inserts the markup into a DOM or runs code.' },
        { question: 'Does it decode every named HTML5 entity?', answer: 'No. It supports the common names amp, apos, gt, lt, nbsp, and quot, plus numeric references. Other names are left unchanged.' },
        { question: 'Will this prevent HTML XSS?', answer: 'Not by itself. Use a vetted sanitizer appropriate to the output context; this converter is not a security filter.' },
      ],
      references: [{ label: 'WHATWG HTML Standard — Character references', href: 'https://html.spec.whatwg.org/multipage/syntax.html#character-references' }],
    },
  },
  ja: {
    'code-formatter': {
      description: 'C、C#、C++、CSS、Go、HTML、Java、JavaScript、Perl、PHP、Python、Ruby、SQL、TypeScript のコードを、構文強調表示と選択可能なテーマで整形します。編集・整形・画像保存はブラウザー内で処理します。',
      steps: ['言語、カラーテーマ、2 または 4 スペースのインデントを選びます。', 'コードを貼り付けるかサンプルを読み込み、整形します。', '結果をコピーするか、構文強調付き PNG として保存します。'],
      caution: 'Perl は構文構造に基づいて文の改行とブロックのインデントを整えます。解析に失敗した場合は元のコードを保持します。PHP と HTML の混在ファイルは結果を確認してください。Go は gofmt 標準のインデントを使用します。',
      faqs: [
        { question: 'コードはサーバーに送信されますか？', answer: 'いいえ。編集と整形はブラウザー内で行い、入力コードをサーバーに送信しません。' },
        { question: 'すべての言語を自動整形できますか？', answer: '一覧の 14 言語すべてに対応しています。Perl は構文構造に基づいて改行とインデントを整え、Go は gofmt のインデント規則に従います。' },
        { question: '結果を画像として保存できますか？', answer: 'はい。選択したテーマと構文強調を適用した結果を PNG として保存できます。' },
      ],
    },
    'json-formatter': {
      description: 'JSON の構文を検証し、インデントを整えます。整形と圧縮はブラウザー内で処理します。',
      steps: ['JSON を貼り付けるか、サンプルを読み込みます。', 'インデントを 2 または 4 スペースから選びます。', '整形・圧縮・検証を行い、コピーまたは JSON ファイルとして保存します。'],
      caution: '標準 JSON ではコメントと末尾のカンマを使えません。同じオブジェクトに重複キーがある場合、ブラウザーのパーサーは最後の値を採用します。',
      faqs: [
        { question: 'JSON にコメントを書けますか？', answer: 'いいえ。標準 JSON にコメントはありません。コメントや末尾のカンマは検証エラーになります。' },
        { question: 'エラーの行・列は正確ですか？', answer: 'ブラウザーのパーサーが位置を返す場合に表示します。ブラウザーごとの違いにより、一般的なエラー表示になることもあります。' },
        { question: '入力した JSON はサーバーに送信されますか？', answer: 'いいえ。変換はブラウザー内で行い、DevDesk の変換サーバーには送信しません。' },
      ],
    },
    'sql-formatter': {
      description: 'SQL の句を改行して読みやすく整えます。クエリの実行やデータベース接続は行いません。',
      steps: ['SQL を貼り付けるか、サンプルを読み込みます。', 'Generic、MySQL、PostgreSQL、Oracle の形式を選びます。', 'インデントを指定して整形し、コピー前に結果を確認します。'],
      caution: '整形結果は構文検証や実行結果ではありません。本番クエリは対象データベースで検証してください。',
      faqs: [
        { question: 'SQL の有効性を検証しますか？', answer: 'いいえ。テキストの整形だけを行い、SQL の実行やデータベース固有の構文検証はしません。' },
        { question: 'MariaDB と Oracle に対応していますか？', answer: 'MariaDB 系には MySQL 形式、Oracle には PL/SQL 形式を選べます。対応範囲はフォーマッターライブラリに依存します。' },
        { question: 'コメントや文字列リテラルは保持されますか？', answer: 'フォーマッターはコメントとリテラルをトークンとして扱います。重要な SQL は使用前に確認してください。' },
      ],
    },
    'jwt-decoder': {
      description: 'JWT の Base64URL ヘッダーとペイロードを UTF-8 JSON にデコードします。署名検証は行いません。',
      steps: ['ドット区切りの JWT 全体を貼り付けます。', 'ヘッダー、ペイロード、時刻 claim を確認します。', 'UTC・ローカル時刻とブラウザー時刻による有効期限を確認します。'],
      caution: 'デコードは署名検証ではありません。表示された claim は偽造でき、トークンの正当性を保証しません。',
      faqs: [
        { question: 'JWT の署名を検証しますか？', answer: 'いいえ。ヘッダーとペイロードを読むだけで、署名検証やサーバー認証は行いません。' },
        { question: 'exp と nbf はどう表示されますか？', answer: 'Unix 秒として解釈し、UTC とブラウザーのローカル時刻を表示します。有効期限はブラウザーの時計で判定します。' },
        { question: '本番トークンを貼り付けてもよいですか？', answer: '外部には送信しませんが、機密性の高い本番トークンは入力しないでください。URL やログにも保存しないでください。' },
      ],
    },
    'cron-generator': {
      description: 'Linux 標準の 5 フィールド Cron を作成し、選択したタイムゾーンで次回実行時刻を計算します。',
      steps: ['分・時・日・月・曜日を選ぶか、5 フィールドを入力します。', 'Linux Cron のタイムゾーンを選択します。', '式の説明と次の 5 回の実行時刻を確認します。'],
      caution: 'Quartz の秒・年フィールドには対応しません。夏時間と月末の動作は、利用するスケジューラーでも確認してください。',
      faqs: [
        { question: '6 フィールドの Quartz Cron に対応しますか？', answer: 'いいえ。分から曜日までの Linux Cron 5 フィールドのみ対応します。' },
        { question: '次回時刻はどのタイムゾーンで計算しますか？', answer: '選択した IANA タイムゾーンを使用し、各時刻にもタイムゾーン名を表示します。' },
        { question: '夏時間の動作はすべてのスケジューラーで同じですか？', answer: 'いいえ。存在しないローカル時刻は省略され、重複する時刻は 2 回実行されることがあります。実環境の規則を確認してください。' },
      ],
    },
    'text-diff': {
      description: '2 つのテキストを行単位で比較し、追加・削除を表示します。比較はブラウザー内で行います。',
      steps: ['元のテキストと変更後のテキストを入力します。', '比較を実行し、変更の概要を確認します。', '差分を確認して結果をコピーします。'],
      caution: '大きな入力はブラウザーのメモリーを使用します。標準の入力上限は 1 MB で、入力を HTML として解釈しません。',
      faqs: [
        { question: '単語単位の差分も表示しますか？', answer: '初期版は行単位の差分を表示します。単語単位の確認は該当する行を見てください。' },
        { question: '空白と改行コードも比較しますか？', answer: 'はい。CRLF と LF は比較前に正規化しますが、各行内の空白は保持します。' },
        { question: '貼り付けた HTML が実行されますか？', answer: 'いいえ。入力と結果はテキストとして表示するため、タグやスクリプトは実行されません。' },
      ],
    },
    base64: {
      description: 'UTF-8 テキストを Base64 に変換し、Base64 をテキストに戻します。複数バイト文字と絵文字も扱えます。',
      steps: ['テキストまたは Base64 文字列を入力します。', 'エンコードまたはデコードを選択します。', '結果をコピーするか、入力と出力を入れ替えます。'],
      caution: 'Base64 は暗号化ではなくエンコードです。誰でも元に戻せるため、秘密情報の保護には使えません。',
      faqs: [
        { question: 'Base64 はデータを暗号化しますか？', answer: 'いいえ。Base64 はバイト列を文字で表す方式で、鍵や機密性は提供しません。' },
        { question: '日本語や絵文字が文字化けしませんか？', answer: 'TextEncoder と TextDecoder で UTF-8 バイトを扱い、複数バイト文字を保ちます。' },
        { question: 'URL-safe Base64 は何が違いますか？', answer: '+ と / の代わりに - と _ を使い、パディングを省略する場合があります。標準 Base64 と区別してください。' },
      ],
    },
    'url-encoder': {
      description: 'URL の一つの構成要素をパーセントエンコードまたはデコードします。URL 全体を整形するツールではありません。',
      steps: ['変換する構成要素を入力します。', 'エンコードまたはデコードを選びます。', '結果を URL の適切な位置にコピーします。'],
      caution: '標準動作は encodeURIComponent に従います。URL 全体の変換やフォーム形式の空白規則とは異なります。',
      faqs: [
        { question: 'URL 全体をエンコードしますか？', answer: 'いいえ。パスの一部やクエリ値などを変換します。URL 全体を入力すると区切り文字もエンコードされます。' },
        { question: '空白は + になりますか？', answer: 'コンポーネントのエンコードでは %20 になります。フォームエンコードの + とは異なります。' },
        { question: '不正な % エスケープはどうなりますか？', answer: 'デコードエラーを表示し、元の入力は保持します。' },
      ],
    },
    'unix-timestamp': {
      description: '秒またはミリ秒を明示して Unix timestamp と ISO 日時を変換します。UTC と選択したタイムゾーンを表示します。',
      steps: ['秒またはミリ秒を明示的に選択します。', 'timestamp を日時に変換するか、日時から timestamp を作ります。', 'UTC と選択した地域の値を確認してコピーします。'],
      caution: '単位は自動推定しません。秒とミリ秒を取り違えると結果が大きく変わるため、入力元の単位を確認してください。',
      faqs: [
        { question: '13 桁の数値は自動でミリ秒になりますか？', answer: 'いいえ。単位はユーザーが選びます。秒を選択すれば 13 桁でも秒として解釈します。' },
        { question: '0 は有効な timestamp ですか？', answer: 'はい。0 秒は 1970-01-01T00:00:00Z です。' },
        { question: 'タイムゾーンで timestamp は変わりますか？', answer: 'UTC の時点は変わりません。画面に表示する現地の日付と時刻だけが変わります。' },
      ],
    },
    'uuid-generator': {
      description: 'Web Crypto の randomUUID で UUID v4 を生成します。個数を指定してコピーまたはダウンロードできます。',
      steps: ['1〜100 個の範囲で生成数を決めます。', 'UUID の生成を実行します。', '改行区切りの結果をコピーするか、テキストファイルに保存します。'],
      caution: 'ブラウザーの Web Crypto API に安全なコンテキストが必要です。利用できない場合は HTTPS または localhost を使ってください。',
      faqs: [
        { question: 'UUID はどのように生成されますか？', answer: '対応ブラウザーの crypto.randomUUID() で UUID v4 を生成します。Math.random による代替はありません。' },
        { question: '重複は絶対に起こりませんか？', answer: '衝突確率は非常に低いものの、数学的にゼロではありません。厳密な一意性が必要なら重複検査を追加してください。' },
        { question: '通常の HTTP でも利用できますか？', answer: 'Web Crypto の可否はブラウザーの安全性ルールによります。HTTPS または localhost が必要な場合があります。' },
      ],
    },
    'hash-generator': {
      description: 'Web Crypto でテキストの SHA-256、SHA-384、SHA-512 digest を計算し、16 進数で表示します。',
      steps: ['ハッシュ化する通常のテキストを入力します。', 'SHA-256、SHA-384、SHA-512 を選択します。', '計算された digest を確認してコピーします。'],
      caution: 'ハッシュは一方向 digest であり暗号化ではありません。高速な SHA ハッシュをパスワード保存に使わないでください。',
      faqs: [
        { question: 'ハッシュから元のテキストを戻せますか？', answer: 'いいえ。一方向の digest を計算するため、復号機能はありません。' },
        { question: 'パスワード保存に使えますか？', answer: '使えません。salt と計算コストを備えた Argon2id、scrypt、bcrypt などの専用 KDF を使ってください。' },
        { question: '入力はアップロードされますか？', answer: 'いいえ。Web Crypto がブラウザーで計算し、DevDesk サーバーには原文を送信しません。' },
      ],
    },
    'regex-tester': {
      description: 'JavaScript 正規表現とフラグを試し、マッチ・キャプチャグループ・文字列内の位置を確認します。',
      steps: ['JavaScript のパターンと対応フラグを入力します。', 'テスト文字列を貼り付けます。', '一致範囲、キャプチャ、インデックスを確認します。'],
      caution: 'パターンは時間制限付きのブラウザー Web Worker で実行します。時間切れの Worker は終了し、入力はブラウザー内に残ります。',
      faqs: [
        { question: 'PCRE や Python の構文も使えますか？', answer: 'いいえ。ブラウザーの JavaScript RegExp 構文と対応する JavaScript フラグを使います。' },
        { question: '複雑なパターンでタブが固まりませんか？', answer: 'マッチ処理は Web Worker 内で行います。時間制限を超えると Worker を終了して画面を復旧します。' },
        { question: 'グローバル検索で空文字一致が無限ループしませんか？', answer: '空文字に一致した後は検索位置を進め、無限ループを防止します。' },
      ],
    },
    'yaml-json': {
      description: '保守されている YAML パーサーで YAML と JSON を相互変換し、構文エラーを表示します。',
      steps: ['入力形式として YAML または JSON を選択します。', '内容を入力するかサンプルを読み込みます。', '反対の形式に変換し、結果を確認してコピーします。'],
      caution: 'YAML の日付・数値・alias はパーサー設定に応じて JSON の型に変換されます。大きな入力や深い階層には制限があります。',
      faqs: [
        { question: 'YAML の日付は JSON で何になりますか？', answer: '日付に見える値もスキーマやパーサー設定により文字列などに解釈されます。変換結果を確認してください。' },
        { question: 'alias や深いネストは無制限ですか？', answer: 'いいえ。過度な処理やメモリー使用を防ぐため、入力サイズと階層に上限を設けます。' },
        { question: 'YAML からコードを実行しますか？', answer: 'いいえ。安全な解析とシリアライズのみを行い、eval やユーザーコード実行は使いません。' },
      ],
    },
    'json-pointer': {
      description: 'RFC 6901 JSON Pointer を使い、API レスポンス内のネストしたキーや配列インデックスをたどって値を確認します。文書全体を手作業で探す必要はありません。',
      steps: ['JSON レスポンス本文を貼り付けます。', 'ルートには空文字列、それ以外は / で始まるポインターを入力します。', '値と JSON 型を確認し、必要に応じてコピーします。'],
      caution: 'JSON Pointer は JSONPath ではありません。フィルター、ワイルドカード、複数値の選択には対応しません。キー内の / は ~1、~ は ~0 として記述します。JSON.parse は重複キーの最後の値を採用するため、重複キーの検証には使えません。',
      faqs: [
        { question: '配列の要素はどう指定しますか？', answer: '0 から始まるインデックスをパスのトークンとして使います。たとえば /items/0 は先頭の要素です。' },
        { question: 'キーにスラッシュやチルダが含まれる場合は？', answer: 'RFC 6901 に従ってスラッシュは ~1、チルダは ~0 にエスケープします。置換順にも注意してください。' },
        { question: '値が見つからない場合、JSON が不正ですか？', answer: 'いいえ。JSON 構文エラーと存在しないパスを区別して表示します。キーの綴りや大文字小文字、配列の範囲を確認してください。' },
      ],
      references: [{ label: 'RFC 6901 — JSON Pointer', href: 'https://www.rfc-editor.org/rfc/rfc6901.html' }],
    },
    'csv-json': {
      description: 'カンマ・タブ・セミコロン区切りのテキストを JSON オブジェクト配列に変換し、逆方向の CSV 出力も行います。引用符内の区切り文字や改行に対応します。',
      steps: ['CSV → JSON または JSON → CSV を選びます。', '入力に使われている区切り文字を指定します。', '表データを貼り付けて変換し、セルの内容を確認します。'],
      caution: 'CSV から読み込む値はすべて文字列です。CSV には標準の型情報がありません。JSON のネストした値はセル内に JSON テキストとして出力します。表計算ソフトでは =、+、-、@ で始まるセルが数式として解釈される場合があるため、信頼できない値を開く前に確認してください。',
      faqs: [
        { question: '数字や true/false を自動で型変換しますか？', answer: 'いいえ。CSV はデータ型を標準化していないため、読み込んだセルはすべて文字列として扱います。' },
        { question: '値の中にカンマや改行がある場合は？', answer: 'CSV の引用符ルールを使います。引用符内の引用符は 2 つ続けて記述します。' },
        { question: 'JSON の各行でキーが違っても変換できますか？', answer: 'できます。JSON → CSV では最初に現れた順に列を集め、存在しないプロパティは空欄にします。' },
      ],
      references: [{ label: 'RFC 4180 — CSV ファイルの共通形式と MIME タイプ', href: 'https://www.rfc-editor.org/rfc/rfc4180.html' }],
    },
    'url-inspector': {
      description: '絶対 HTTP(S) URL を構成要素に分け、重複したクエリパラメーターを順番どおりに確認します。URL を解析するだけで接続は行いません。',
      steps: ['http:// または https:// で始まる URL 全体を貼り付けます。', 'ホスト、パス、クエリ、フラグメントを確認します。', '重複したキーとデコード後の値を調べます。'],
      caution: 'ユーザー名とパスワードは結果に含めませんが、クエリにトークンや個人情報が含まれることがあります。機密 URL や結果は共有しないでください。',
      faqs: [
        { question: '相対パスや mailto リンクも解析できますか？', answer: 'いいえ。曖昧さを避けるため、絶対 HTTP と HTTPS URL のみを受け付けます。' },
        { question: '同じクエリキーがあると上書きされますか？', answer: 'いいえ。URLSearchParams の順に項目を列挙するため、重複パラメーターも確認できます。' },
        { question: '入力した URL にリクエストを送信しますか？', answer: 'いいえ。ブラウザーの URL パーサーだけを使い、ページ表示やネットワークリクエストは行いません。' },
      ],
      references: [{ label: 'WHATWG URL Standard — URL と URLSearchParams API', href: 'https://url.spec.whatwg.org/' }],
    },
    'html-entities': {
      description: 'HTML の特殊文字をエンティティにエスケープするか、対応する文字参照を文字に戻します。HTML の解析や実行は行いません。',
      steps: ['エンコードまたはデコードを選びます。', 'HTML 断片、または文字参照を含むテキストを貼り付けます。', '変換結果を確認してコピーします。'],
      caution: 'amp、apos、gt、lt、nbsp、quot とセミコロン付きの数値文字参照を扱います。HTML サニタイザーではないため、信頼できないマークアップを安全化するものではありません。',
      faqs: [
        { question: 'HTML を表示したり実行したりしますか？', answer: 'いいえ。文字列のみを変換し、マークアップを DOM に挿入したりコードを実行したりしません。' },
        { question: 'HTML5 の名前付きエンティティをすべてデコードしますか？', answer: 'いいえ。amp、apos、gt、lt、nbsp、quot と数値参照に対応します。それ以外の名前はそのまま残します。' },
        { question: 'この変換で HTML XSS を防げますか？', answer: '単独では防げません。出力先の文脈に適した検証済みサニタイザーを使用してください。このツールはセキュリティフィルターではありません。' },
      ],
      references: [{ label: 'WHATWG HTML Standard — Character references', href: 'https://html.spec.whatwg.org/multipage/syntax.html#character-references' }],
    },
  },
  zh: {
    'code-formatter': {
      description: '通过语法高亮和可选主题显示并格式化 C、C#、C++、CSS、Go、HTML、Java、JavaScript、Perl、PHP、Python、Ruby、SQL 和 TypeScript。编辑、格式化和图片导出都在浏览器中完成。',
      steps: ['选择语言、颜色主题以及 2 或 4 个空格的缩进。', '粘贴代码或载入示例，然后格式化。', '复制结果，或将带语法高亮的 PNG 图片保存到本地。'],
      caution: 'Perl 根据语法结构整理语句换行和代码块缩进。如果解析失败，会保留原始代码。请检查混合 HTML 的 PHP 文件。Go 使用 gofmt 标准缩进。',
      faqs: [
        { question: '代码会发送到服务器吗？', answer: '不会。编辑和格式化都在浏览器中运行，输入代码不会发送到服务器。' },
        { question: '所有语言都能自动格式化吗？', answer: '列表中的 14 种语言都支持格式化。Perl 根据语法结构整理换行和缩进，Go 遵循 gofmt 缩进。' },
        { question: '可以将结果保存为图片吗？', answer: '可以。结果会以所选主题和语法高亮生成 PNG 图片。' },
      ],
    },
    'json-formatter': {
      description: '校验 JSON 语法并统一缩进。格式化和压缩都在当前浏览器中完成。',
      steps: ['粘贴 JSON，或载入示例。', '选择两个或四个空格缩进。', '执行美化、压缩或校验，然后复制或下载结果。'],
      caution: '标准 JSON 不支持注释和末尾逗号。同一对象中出现重复键时，浏览器解析器会保留最后一个值。',
      faqs: [
        { question: 'JSON 可以写注释吗？', answer: '不可以。标准 JSON 没有注释语法，注释和末尾逗号都会导致校验错误。' },
        { question: '错误行号和列号准确吗？', answer: '浏览器解析器提供位置时会显示。不同浏览器的错误信息不同，部分情况会显示通用提示。' },
        { question: '输入的 JSON 会发送到服务器吗？', answer: '不会。转换在浏览器中进行，不会发送到 DevDesk 转换服务器。' },
      ],
    },
    'sql-formatter': {
      description: '将 SQL 子句分行排版，便于阅读。格式化器不会执行查询，也不会连接数据库。',
      steps: ['粘贴 SQL 或载入示例。', '选择通用、MySQL、PostgreSQL 或 Oracle 格式。', '设置缩进并格式化，复制前检查结果。'],
      caution: '格式化结果不代表语法校验或执行结果。生产查询请在目标数据库中验证。',
      faqs: [
        { question: '这个工具会校验 SQL 吗？', answer: '不会。它只整理文本，不会执行 SQL，也不会检查数据库专属语法。' },
        { question: '支持 MariaDB 和 Oracle 吗？', answer: 'MariaDB 系列可选 MySQL 方言，Oracle 可选 PL/SQL。具体覆盖范围取决于格式化库。' },
        { question: '注释和字符串内容会保留吗？', answer: '格式化器会将注释和字符串作为词元处理。使用结果前请检查重要语句。' },
      ],
    },
    'jwt-decoder': {
      description: '将 JWT 的 Base64URL 头部和载荷解码为 UTF-8 JSON。本工具不会验证签名。',
      steps: ['粘贴完整的点分隔 JWT。', '查看头部、载荷和时间声明。', '检查 UTC、本地时间以及依据浏览器时钟计算的过期状态。'],
      caution: '解码不等于签名验证。显示的声明可能被伪造，本工具不能证明令牌真实有效。',
      faqs: [
        { question: '会验证 JWT 签名吗？', answer: '不会。工具只读取头部和载荷，不会验证签名或执行服务器认证。' },
        { question: 'exp 和 nbf 如何显示？', answer: '它们按 Unix 秒解析，同时显示 UTC 和浏览器本地时间。过期状态依据浏览器时钟判断。' },
        { question: '可以粘贴生产环境令牌吗？', answer: '输入不会发送到外部，但仍建议不要粘贴敏感的生产令牌，也不要将内容写入日志或 URL。' },
      ],
    },
    'cron-generator': {
      description: '创建标准 Linux 五字段 Cron 表达式，并按所选时区计算即将执行的时间。',
      steps: ['选择分钟、小时、日期、月份和星期，或输入五个字段。', '选择标准 Linux Cron 时区。', '查看通俗说明和接下来的五次执行时间。'],
      caution: '不支持 Quartz 的秒和年份字段。部署前还应检查调度器对夏令时和月末的处理方式。',
      faqs: [
        { question: '支持六字段 Quartz Cron 吗？', answer: '不支持。本工具只处理 Linux Cron 的五个字段，从分钟到星期。' },
        { question: '后续执行时间使用什么时区？', answer: '按所选 IANA 时区计算，并在每个结果旁标注时区名称。' },
        { question: '夏令时切换在所有调度器中都一样吗？', answer: '不一样。不存在的本地时间可能被跳过，重复的本地时间可能执行两次。请确认实际调度器规则。' },
      ],
    },
    'text-diff': {
      description: '逐行比较两段文本并标出新增和删除内容。比较过程只在浏览器中运行。',
      steps: ['分别输入原始文本和修改后的文本。', '运行比较并查看改动摘要。', '检查标记行并复制结果。'],
      caution: '较大输入会占用浏览器内存。默认输入上限为 1 MB，内容会作为文本显示而不会解析为 HTML。',
      faqs: [
        { question: '可以比较单词级别的差异吗？', answer: '初始版本提供行级差异。需要单词级别信息时，请直接检查变更行。' },
        { question: '空格和换行符会参与比较吗？', answer: '会。比较前会统一 CRLF 和 LF，但每行内部的空格会保留。' },
        { question: '粘贴的 HTML 会执行吗？', answer: '不会。输入和结果都按文本渲染，标签和脚本不会执行。' },
      ],
    },
    base64: {
      description: '将 UTF-8 文本编码为 Base64，或将 Base64 解码回文本。多字节字符和 emoji 均按字节正确处理。',
      steps: ['输入文本或 Base64 字符串。', '选择编码或解码。', '复制结果，或交换输入与输出。'],
      caution: 'Base64 是编码而非加密，任何人都能还原原文，因此不能用于保护机密。',
      faqs: [
        { question: 'Base64 会加密数据吗？', answer: '不会。Base64 只是字节的文本表示形式，不提供密钥或机密性。' },
        { question: '中文和 emoji 会乱码吗？', answer: '工具使用 TextEncoder 和 TextDecoder 处理 UTF-8 字节，可保留多字节字符。' },
        { question: 'URL-safe Base64 有什么区别？', answer: '它用 - 和 _ 替代 + 和 /，有时会省略填充。请与标准 Base64 区分使用。' },
      ],
    },
    'url-encoder': {
      description: '对单个 URL 组件执行百分号编码或解码。它转换文本，不负责保留或规范化完整 URL。',
      steps: ['输入需要编码或解码的组件。', '选择转换方向。', '将结果复制到 URL 的相应位置。'],
      caution: '默认行为遵循 encodeURIComponent。它不同于完整 URL 编码，也不同于表单编码的空格规则。',
      faqs: [
        { question: '可以编码完整 URL 吗？', answer: '不可以。它用于路径片段或查询值等组件。输入完整 URL 时，分隔符也会被编码。' },
        { question: '空格会变成加号吗？', answer: '组件编码会将空格表示为 %20。表单编码使用不同的加号规则。' },
        { question: '遇到错误的百分号转义会怎样？', answer: '解码器会显示错误并保留原始输入。' },
      ],
    },
    'unix-timestamp': {
      description: '明确选择秒或毫秒，在 Unix 时间戳和 ISO 日期之间转换，并查看 UTC 与指定时区的时间。',
      steps: ['明确选择秒或毫秒。', '将时间戳转为日期，或输入日期生成时间戳。', '查看 UTC 和所选时区结果并复制。'],
      caution: '工具不会自动猜测单位。秒和毫秒会产生完全不同的日期，请先确认输入单位。',
      faqs: [
        { question: '13 位数字会自动视为毫秒吗？', answer: '不会。单位由用户选择。即使是 13 位数字，选择秒后也会按秒解释。' },
        { question: '0 是有效的时间戳吗？', answer: '是。0 秒表示 1970-01-01T00:00:00Z。' },
        { question: '所选时区会改变时间戳吗？', answer: 'UTC 时间点不变，只有显示的本地日期和时间会随时区改变。' },
      ],
    },
    'uuid-generator': {
      description: '通过 Web Crypto randomUUID 生成 UUID v4。可指定数量，并复制或下载逐行结果。',
      steps: ['设置 1 到 100 之间的生成数量。', '生成 UUID。', '复制换行分隔的结果，或保存为文本文件。'],
      caution: '浏览器 Web Crypto API 需要安全上下文。如果不可用，请使用 HTTPS 或 localhost。',
      faqs: [
        { question: 'UUID 如何生成？', answer: '支持的浏览器会使用 crypto.randomUUID() 生成 UUID v4，不会使用 Math.random 降级。' },
        { question: '能保证绝不重复吗？', answer: '冲突概率极低，但数学上并非绝对为零。系统有严格唯一性要求时请增加重复检查。' },
        { question: '普通 HTTP 网站可以使用吗？', answer: '是否可用取决于浏览器的安全策略；某些浏览器要求 HTTPS 或 localhost。' },
      ],
    },
    'hash-generator': {
      description: '使用 Web Crypto 计算文本的 SHA-256、SHA-384 或 SHA-512 摘要，并以十六进制显示。',
      steps: ['输入普通文本。', '选择 SHA-256、SHA-384 或 SHA-512。', '查看并复制摘要。'],
      caution: '哈希是单向摘要，不是加密。不要使用快速 SHA 哈希存储密码。',
      faqs: [
        { question: '可以从哈希还原原文吗？', answer: '不可以。哈希函数计算单向摘要，不提供解密能力。' },
        { question: '可以用于保存密码吗？', answer: '不可以。密码保存应使用带盐和计算成本的 Argon2id、scrypt 或 bcrypt 等专用 KDF。' },
        { question: '输入会上传吗？', answer: '不会。Web Crypto 在浏览器中计算，原文不会发送到 DevDesk 服务器。' },
      ],
    },
    'regex-tester': {
      description: '测试 JavaScript 正则表达式和标志，并查看匹配项、捕获组和字符串位置。',
      steps: ['输入 JavaScript 模式和支持的标志。', '粘贴测试字符串。', '检查匹配范围、捕获内容和索引。'],
      caution: '模式在有时间限制的浏览器 Web Worker 中执行。超时后会终止 Worker，输入仍保留在浏览器中。',
      faqs: [
        { question: '支持 PCRE 或 Python 语法吗？', answer: '不支持。工具使用浏览器 JavaScript RegExp 语法和相应标志。' },
        { question: '复杂模式会卡住标签页吗？', answer: '匹配在 Web Worker 中运行。超过时间限制后会终止 Worker，让界面恢复响应。' },
        { question: '全局匹配遇到空字符串会无限循环吗？', answer: '不会。匹配空字符串后会推进搜索位置，避免无限循环。' },
      ],
    },
    'yaml-json': {
      description: '使用维护中的 YAML 解析器双向转换 YAML 与 JSON，并显示语法错误。',
      steps: ['选择 YAML 或 JSON 输入格式。', '输入内容或载入示例。', '转换为另一种格式，检查并复制结果。'],
      caution: 'YAML 日期、数字和别名可能根据解析器设置映射为不同 JSON 类型。较大输入和深层嵌套会受到限制。',
      faqs: [
        { question: 'YAML 日期会转换成什么 JSON 值？', answer: '看起来像日期的标量会根据解析器和模式变成字符串或其他值，请检查转换结果。' },
        { question: 'YAML 别名和深层嵌套没有限制吗？', answer: '不是。为了限制过多计算和内存使用，输入大小和嵌套层级都有上限。' },
        { question: 'YAML 可以在这里执行代码吗？', answer: '不可以。工具只解析和序列化数据，不使用 eval，也不运行用户代码。' },
      ],
    },
    'json-pointer': {
      description: '使用 RFC 6901 JSON Pointer 沿着 API 响应中的嵌套键和数组索引查找值，无需手动遍历整个文档。',
      steps: ['粘贴 JSON 响应正文。', '根路径使用空字符串，其他路径以 / 开头。', '查看选中值及其 JSON 类型，需要时复制结果。'],
      caution: 'JSON Pointer 不等同于 JSONPath，不支持筛选器、通配符或多值选择。键名中的 / 写作 ~1，~ 写作 ~0。JSON.parse 会保留重复键的最后一个值，因此本工具不能检查重复键。',
      faqs: [
        { question: '如何选择数组中的元素？', answer: '使用从 0 开始的索引作为路径片段。例如 /items/0 表示第一个元素。' },
        { question: '键名包含斜杠或波浪号怎么办？', answer: '按照 RFC 6901 将斜杠转义为 ~1、波浪号转义为 ~0。替换顺序也会影响结果。' },
        { question: '找不到值是否表示 JSON 无效？', answer: '不表示。工具会区分 JSON 语法错误和不存在的路径。请检查键名、大小写和数组范围。' },
      ],
      references: [{ label: 'RFC 6901 — JSON Pointer', href: 'https://www.rfc-editor.org/rfc/rfc6901.html' }],
    },
    'csv-json': {
      description: '将逗号、制表符或分号分隔文本转换为 JSON 对象数组，也可反向导出为 CSV。支持带引号的分隔符和换行。',
      steps: ['选择 CSV → JSON 或 JSON → CSV。', '选择输入所用的分隔符。', '粘贴表格数据，转换后检查单元格内容。'],
      caution: '从 CSV 导入的值全部是字符串，因为 CSV 没有标准类型元数据。JSON 输入必须是对象数组；嵌套值会作为 JSON 文本写入单元格。在电子表格应用中，以 =、+、- 或 @ 开头的单元格可能被当作公式执行，打开不可信导出内容前请先检查。',
      faqs: [
        { question: '数字和 true/false 会自动转换成类型吗？', answer: '不会。CSV 没有标准数据类型定义，因此每个导入单元格都会保留为字符串。' },
        { question: '值中含有逗号或换行怎么办？', answer: '使用 CSV 引号规则。带引号字段中的引号需要写成两个连续的引号。' },
        { question: 'JSON 每行的键可以不同吗？', answer: '可以。JSON → CSV 会按首次出现顺序收集键；缺少的属性会输出为空单元格。' },
      ],
      references: [{ label: 'RFC 4180 — CSV 文件的通用格式与 MIME 类型', href: 'https://www.rfc-editor.org/rfc/rfc4180.html' }],
    },
    'url-inspector': {
      description: '将绝对 HTTP(S) URL 拆分为组成部分，并按顺序检查重复查询参数。此工具只解析地址，不会连接目标服务器。',
      steps: ['粘贴以 http:// 或 https:// 开头的完整 URL。', '检查主机、路径、查询字符串和片段。', '查看重复查询键及解码后的参数值。'],
      caution: '结果不会包含用户名和密码，但查询字符串仍可能包含令牌或个人信息。请勿分享敏感 URL 或分析结果。',
      faqs: [
        { question: '可以分析相对路径或 mailto 链接吗？', answer: '不可以。为避免歧义，此工具只接受绝对 HTTP 和 HTTPS URL。' },
        { question: '重复查询键会互相覆盖吗？', answer: '不会。结果会按 URLSearchParams 的顺序列出每个参数，因此可以看到重复项。' },
        { question: '工具会请求输入的 URL 吗？', answer: '不会。它只使用浏览器 URL 解析器，不会打开地址或发送网络请求。' },
      ],
      references: [{ label: 'WHATWG URL Standard — URL 与 URLSearchParams API', href: 'https://url.spec.whatwg.org/' }],
    },
    'html-entities': {
      description: '将文本中的 HTML 特殊字符转义为实体，或将支持的字符引用解码回文本。工具只转换字符串，不解析或执行 HTML。',
      steps: ['选择编码或解码。', '粘贴 HTML 片段或包含字符引用的文本。', '检查转换结果并复制。'],
      caution: '解码器处理 amp、apos、gt、lt、nbsp、quot，以及以分号结尾的数字引用。本工具不是 HTML 清理器，不能保证不可信标记安全。',
      faqs: [
        { question: '工具会渲染或执行 HTML 吗？', answer: '不会。工具只转换文本，不会将标记插入 DOM，也不会运行代码。' },
        { question: '可以解码所有 HTML5 命名实体吗？', answer: '不可以。仅支持常用的 amp、apos、gt、lt、nbsp、quot 和数字引用，其他名称会保持原样。' },
        { question: '这样能防止 HTML XSS 吗？', answer: '仅靠此工具不能。应使用适合输出上下文的可信清理器；此转换器不是安全过滤器。' },
      ],
      references: [{ label: 'WHATWG HTML Standard — Character references', href: 'https://html.spec.whatwg.org/multipage/syntax.html#character-references' }],
    },
  },
};
