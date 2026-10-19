import { expect, test } from '@playwright/test';

test('root landing provides explicit links for all four languages', async ({ page }) => {
  await page.goto('/');
  for (const [label, href] of [['한국어', '/ko/'], ['English', '/en/'], ['日本語', '/ja/'], ['简体中文', '/zh/']]) {
    await expect(page.getByRole('link', { name: new RegExp(label) })).toHaveAttribute('href', href);
  }
});

test('each localized homepage has matching HTML language and a tool entry point', async ({ page }) => {
  for (const [locale, htmlLang] of [['ko', 'ko'], ['en', 'en'], ['ja', 'ja'], ['zh', 'zh-CN']]) {
    await page.goto(`/${locale}/`);
    await expect(page.locator('html')).toHaveAttribute('lang', htmlLang);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /도구 둘러보기|Explore tools|ツールを見る|浏览工具/ })).toHaveAttribute('href', `/${locale}/tools/`);
  }
});

test('tool search, favorites, theme, and locale switching preserve the selected route', async ({ page }) => {
  await page.goto('/ko/tools/');
  await expect(page.getByRole('article')).toHaveCount(12);

  await page.getByRole('button', { name: /도구 검색/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: '도구 검색' }).fill('JSON');
  await dialog.getByRole('link', { name: /JSON 포맷터/ }).click();
  await expect(page).toHaveURL(/\/ko\/tools\/json-formatter\/$/);
  await expect(page.getByRole('heading', { name: 'JSON 포맷터' })).toBeVisible();

  await page.getByRole('button', { name: /JSON 포맷터.*즐겨찾기 추가/ }).click();
  await expect(page.getByRole('button', { name: /즐겨찾기 해제/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /테마: 시스템/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.getByLabel('언어').selectOption('ja');
  await expect(page).toHaveURL(/\/ja\/tools\/json-formatter\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.getByRole('heading', { name: 'JSONフォーマッター' })).toBeVisible();
});

test('localized tool and guide pages render their own static SEO metadata and useful content', async ({ page }) => {
  for (const [locale, htmlLang, alternate] of [['ko', 'ko', 'ko'], ['en', 'en', 'en'], ['ja', 'ja', 'ja'], ['zh', 'zh-CN', 'zh-CN']]) {
    await page.goto(`/${locale}/tools/json-formatter/`);
    await expect(page.locator('html')).toHaveAttribute('lang', htmlLang);
    await expect(page).toHaveTitle(/JSON|JSONフォーマッター|格式化工具/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/${locale}/tools/json-formatter/$`));
    await expect(page.locator(`link[rel="alternate"][hreflang="${alternate}"]`)).toHaveAttribute('href', new RegExp(`/${locale}/tools/json-formatter/$`));
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', /\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.content-card')).toHaveCount(2);
    await expect(page.locator('.faq-item')).toHaveCount(3);
    await expect(page.locator('main a[href$="/guides/json-formatter/"]')).toBeVisible();
  }

  await page.goto('/zh/guides/jwt-decoder/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('JWT');
  await expect(page.locator('.faq-item')).toHaveCount(3);
});

test('JSON formatter beautifies, minifies, validates, and safely reports errors in every locale', async ({ page }) => {
  const cases = [
    ['ko', '예제 불러오기', '정렬', '압축', '검증', '결과 복사', 'JSON 다운로드', '초기화', '결과를 클립보드에 복사했습니다.', 'JSON 파일을 다운로드했습니다.', '입력과 결과를 초기화했습니다.', 'JSON 객체, 배열 또는 primitive 값을 붙여넣으세요.', '유효한 JSON입니다.', '올바르지 않은 JSON입니다.'],
    ['en', 'Load sample', 'Beautify', 'Minify', 'Validate', 'Copy result', 'Download JSON', 'Clear', 'Result copied to the clipboard.', 'JSON file downloaded.', 'Input and output cleared.', 'Paste a JSON object, array, or primitive value.', 'Valid JSON.', 'The JSON is invalid.'],
    ['ja', 'サンプルを読み込む', '整形', '圧縮', '検証', '結果をコピー', 'JSON をダウンロード', 'クリア', '結果をクリップボードにコピーしました。', 'JSON ファイルをダウンロードしました。', '入力と結果をクリアしました。', 'JSON オブジェクト、配列、またはプリミティブ値を貼り付けます。', '有効な JSON です。', 'JSON の形式が正しくありません。'],
    ['zh', '载入示例', '美化', '压缩', '校验', '复制结果', '下载 JSON', '清空', '已将结果复制到剪贴板。', '已下载 JSON 文件。', '已清空输入和结果。', '粘贴 JSON 对象、数组或基本值。', 'JSON 有效。', 'JSON 格式无效。'],
  ];
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const [locale, sampleLabel, beautifyLabel, minifyLabel, validateLabel, copyLabel, downloadLabel, clearLabel, copiedMessage, downloadedMessage, clearedMessage, inputPlaceholder, validMessage, errorMessage] of cases) {
    await page.goto(`/${locale}/tools/json-formatter/`);
    await page.getByRole('button', { name: sampleLabel }).click();
    await page.getByRole('button', { name: beautifyLabel }).click();
    const editors = page.locator('.json-workbench .editor-panel');
    await expect(editors.nth(1).locator('.cm-content')).toContainText('"name": "DevDesk"');
    await expect(page.getByRole('status')).toContainText(validMessage);
    await page.getByRole('button', { name: copyLabel }).click();
    await expect(page.getByRole('status')).toContainText(copiedMessage);
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toContain('"name": "DevDesk"');
    await page.getByRole('button', { name: minifyLabel }).click();
    await expect(editors.nth(1).locator('.cm-content')).toContainText('{"name":"DevDesk","active":true,"count":3}');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: downloadLabel }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('formatted.json');
    await expect(page.getByRole('status')).toContainText(downloadedMessage);
    await page.getByRole('button', { name: validateLabel }).click();
    await expect(page.getByRole('status')).toContainText(validMessage);
    const input = editors.nth(0).locator('.cm-content');
    await input.fill('{"broken":}');
    await page.getByRole('button', { name: validateLabel }).click();
    await expect(page.locator('.json-workbench [role="alert"]')).toContainText(errorMessage);
    await page.getByRole('button', { name: clearLabel }).click();
    await expect(page.getByRole('status')).toContainText(clearedMessage);
    await expect(editors.nth(0).locator('.cm-content')).toHaveText(inputPlaceholder);
  }
});

test('Base64 encodes and decodes UTF-8, supports URL-safe mode, and reports invalid input in every locale', async ({ page }) => {
  const cases = [
    ['ko', '예제 불러오기', '인코딩', '디코딩', '입력과 결과 교환', 'URL-safe Base64', '결과 복사', '텍스트 다운로드', '초기화', '입력과 결과를 초기화했습니다.', 'UTF-8 텍스트를 Base64로 인코딩했습니다.', 'Base64를 UTF-8 텍스트로 디코딩했습니다.', '올바르지 않은 Base64 문자열입니다.', '안녕하세요, DevDesk 👋'],
    ['en', 'Load sample', 'Encode', 'Decode', 'Swap input and output', 'URL-safe Base64', 'Copy result', 'Download text', 'Clear', 'Input and output cleared.', 'Encoded UTF-8 text as Base64.', 'Decoded Base64 as UTF-8 text.', 'The Base64 string is invalid.', '안녕하세요, DevDesk 👋'],
    ['ja', 'サンプルを読み込む', 'エンコード', 'デコード', '入力と結果を入れ替え', 'URL-safe Base64', '結果をコピー', 'テキストをダウンロード', 'クリア', '入力と結果をクリアしました。', 'UTF-8 テキストを Base64 にエンコードしました。', 'Base64 を UTF-8 テキストにデコードしました。', 'Base64 文字列が正しくありません。', '안녕하세요, DevDesk 👋'],
    ['zh', '载入示例', '编码', '解码', '交换输入和结果', 'URL-safe Base64', '复制结果', '下载文本', '清空', '已清空输入和结果。', '已将 UTF-8 文本编码为 Base64。', '已将 Base64 解码为 UTF-8 文本。', 'Base64 字符串无效。', '안녕하세요, DevDesk 👋'],
  ];
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const [locale, sampleLabel, encodeLabel, decodeLabel, swapLabel, urlSafeLabel, copyLabel, downloadLabel, clearLabel, clearedMessage, encodedMessage, decodedMessage, invalidMessage, sampleText] of cases) {
    await page.goto(`/${locale}/tools/base64/`);
    const workbench = page.locator('.base64-workbench');
    const editors = workbench.locator('.editor-panel');
    await page.getByRole('button', { name: sampleLabel, exact: true }).click();
    await page.getByRole('button', { name: encodeLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(encodedMessage);
    const encoded = await editors.nth(1).locator('.cm-content').innerText();
    expect(encoded.trim().length).toBeGreaterThan(0);
    await page.getByRole('button', { name: copyLabel, exact: true }).click();
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toBe(encoded);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: downloadLabel, exact: true }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('base64-result.txt');
    await page.getByRole('button', { name: swapLabel, exact: true }).click();
    await page.getByRole('button', { name: decodeLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(decodedMessage);
    await expect(editors.nth(1).locator('.cm-content')).toContainText(sampleText);

    await editors.nth(0).locator('.cm-content').fill('%%%');
    await page.getByRole('button', { name: decodeLabel, exact: true }).click();
    await expect(workbench.getByRole('alert')).toContainText(invalidMessage);

    await page.getByRole('button', { name: clearLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(clearedMessage);
    await page.getByLabel(urlSafeLabel).check();
    await page.getByRole('button', { name: sampleLabel, exact: true }).click();
    await page.getByRole('button', { name: encodeLabel, exact: true }).click();
    const urlSafeOutput = await editors.nth(1).locator('.cm-content').innerText();
    expect(urlSafeOutput.trim().length).toBeGreaterThan(0);
    expect(urlSafeOutput).not.toMatch(/[+/=]/);
    await page.getByRole('button', { name: swapLabel, exact: true }).click();
    await page.getByRole('button', { name: decodeLabel, exact: true }).click();
    await expect(editors.nth(1).locator('.cm-content')).toContainText(sampleText);
  }
});

test('URL encoder treats input as one component, round trips Unicode, and reports malformed escapes in every locale', async ({ page }) => {
  const cases = [
    ['ko', '예제 불러오기', '인코딩', '디코딩', '입력과 결과 교환', '결과 복사', '텍스트 다운로드', 'URL component를 텍스트로 디코딩했습니다.', '퍼센트 인코딩 문자열이 올바르지 않습니다.', 'name=DevDesk &tag=tools 🌏'],
    ['en', 'Load sample', 'Encode', 'Decode', 'Swap input and output', 'Copy result', 'Download text', 'Decoded the URL component as text.', 'The percent-encoded string is invalid.', 'name=DevDesk &tag=tools 🌏'],
    ['ja', 'サンプルを読み込む', 'エンコード', 'デコード', '入力と結果を入れ替え', '結果をコピー', 'テキストをダウンロード', 'URL component をテキストにデコードしました。', 'パーセントエンコード文字列が正しくありません。', 'name=DevDesk &tag=tools 🌏'],
    ['zh', '载入示例', '编码', '解码', '交换输入和结果', '复制结果', '下载文本', '已将 URL component 解码为文本。', '百分号编码字符串无效。', 'name=DevDesk &tag=tools 🌏'],
  ];
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const [locale, sampleLabel, encodeLabel, decodeLabel, swapLabel, copyLabel, downloadLabel, decodedMessage, invalidMessage, sampleText] of cases) {
    await page.goto(`/${locale}/tools/url-encoder/`);
    const workbench = page.locator('.url-workbench');
    const editors = workbench.locator('.editor-panel');
    await expect(workbench.locator('.workbench-note')).toBeVisible();
    await page.getByRole('button', { name: sampleLabel, exact: true }).click();
    await page.getByRole('button', { name: encodeLabel, exact: true }).click();
    const encoded = await editors.nth(1).locator('.cm-content').innerText();
    expect(encoded).toContain('%26');
    expect(encoded).toContain('%20');
    expect(encoded).toContain('%F0%9F%8C%8F');
    await page.getByRole('button', { name: copyLabel, exact: true }).click();
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toBe(encoded);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: downloadLabel, exact: true }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('url-component.txt');
    await page.getByRole('button', { name: swapLabel, exact: true }).click();
    await page.getByRole('button', { name: decodeLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(decodedMessage);
    await expect(editors.nth(1).locator('.cm-content')).toContainText(sampleText);

    await editors.nth(0).locator('.cm-content').fill('%');
    await page.getByRole('button', { name: decodeLabel, exact: true }).click();
    await expect(workbench.getByRole('alert')).toContainText(invalidMessage);
  }
});

test('mobile navigation opens and closes after selecting a tool', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'This scenario uses the mobile browser project.');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/ja/');
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(horizontalOverflow).toBe(false);
  const menu = page.getByRole('button', { name: 'メニューを開く' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('link', { name: /すべてのツール/ }).click();
  await expect(page).toHaveURL(/\/ja\/tools\/$/);
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});
