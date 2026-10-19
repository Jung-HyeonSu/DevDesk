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

test('SQL formatter supports the displayed dialects, formatting, copy, download, and safe parser errors in every locale', async ({ page }) => {
  const cases = [
    ['ko', 'SQL 방언', '일반 SQL', 'MariaDB', 'Oracle PL/SQL', '예제 불러오기', 'SQL 정렬', '결과 복사', '텍스트 다운로드', 'SQL 형식을 정리했습니다.', '이 방언으로 SQL을 정리하지 못했습니다.'],
    ['en', 'SQL dialect', 'Generic SQL', 'MariaDB', 'Oracle PL/SQL', 'Load sample', 'Format SQL', 'Copy result', 'Download text', 'Formatted the SQL.', 'Could not format this SQL for the selected dialect.'],
    ['ja', 'SQL 方言', '汎用 SQL', 'MariaDB', 'Oracle PL/SQL', 'サンプルを読み込む', 'SQL を整形', '結果をコピー', 'テキストをダウンロード', 'SQL を整形しました。', '選択した方言で SQL を整形できません。'],
    ['zh', 'SQL 方言', '通用 SQL', 'MariaDB', 'Oracle PL/SQL', '载入示例', '格式化 SQL', '复制结果', '下载文本', '已格式化 SQL。', '无法按所选方言格式化 SQL'],
  ];
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const [locale, dialectLabel, genericLabel, mariadbLabel, oracleLabel, sampleLabel, formatLabel, copyLabel, downloadLabel, formattedMessage, errorMessage] of cases) {
    await page.goto(`/${locale}/tools/sql-formatter/`);
    const workbench = page.locator('.sql-workbench');
    const dialect = workbench.locator('#sql-dialect');
    const editors = workbench.locator('.editor-panel');
    await expect(dialect).toHaveAccessibleName(dialectLabel);
    await expect(workbench.locator('.workbench-note')).toBeVisible();
    await page.getByRole('button', { name: sampleLabel, exact: true }).click();
    await dialect.selectOption({ label: mariadbLabel });
    await page.getByRole('button', { name: formatLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(formattedMessage);
    const result = editors.nth(1).locator('.cm-content');
    await expect(result).toContainText('WITH');
    await expect(result).toContainText('LEFT JOIN payments');
    await expect(result).toContainText("u.name = 'DevDesk'");
    const copiedText = await result.innerText();
    await page.getByRole('button', { name: copyLabel, exact: true }).click();
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toBe(copiedText);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: downloadLabel, exact: true }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('formatted.sql');

    await dialect.selectOption({ label: oracleLabel });
    await page.getByRole('button', { name: formatLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(formattedMessage);
    await dialect.selectOption({ label: genericLabel });
    await editors.nth(0).locator('.cm-content').fill("SELECT 'unfinished");
    await page.getByRole('button', { name: formatLabel, exact: true }).click();
    await expect(workbench.getByRole('alert')).toContainText(errorMessage);
  }
});

test('JWT decoder shows UTF-8 claims, time status, and the unverified-signature warning in every locale', async ({ page }) => {
  const cases = [
    ['ko', '예제 불러오기', 'JWT 디코딩', '초기화', '결과 복사', '텍스트 다운로드', 'JWT 내용을 디코딩했습니다. 서명은 검증되지 않았습니다.', '브라우저 시간 기준 상태: 만료되지 않았고 아직 유효 시작 전이 아닙니다', 'JWT 형식이 올바르지 않습니다.', 'Header JSON', 'Payload JSON', 'UTC', '브라우저 현지 시간', 'header.payload.signature 형식의 JWT를 붙여넣으세요.'],
    ['en', 'Load sample', 'Decode JWT', 'Clear', 'Copy result', 'Download text', 'Decoded the JWT content. The signature was not verified.', 'Status by browser clock: Not expired and past its not-before time', 'The JWT format is invalid.', 'Header JSON', 'Payload JSON', 'UTC', 'Browser local time', 'Paste a JWT in header.payload.signature format.'],
    ['ja', 'サンプルを読み込む', 'JWT をデコード', 'クリア', '結果をコピー', 'テキストをダウンロード', 'JWT の内容をデコードしました。署名は検証されていません。', 'ブラウザー時刻による状態: 期限内で有効開始時刻を過ぎています', 'JWT の形式が正しくありません。', 'Header JSON', 'Payload JSON', 'UTC', 'ブラウザーのローカル時刻', 'header.payload.signature 形式の JWT を貼り付けます。'],
    ['zh', '载入示例', '解码 JWT', '清空', '复制结果', '下载文本', '已解码 JWT 内容。签名未经验证。', '按浏览器时间判断的状态: 未过期且已达到生效时间', 'JWT 格式无效。', 'Header JSON', 'Payload JSON', 'UTC', '浏览器本地时间', '粘贴 header.payload.signature 格式的 JWT。'],
  ];
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const [locale, sampleLabel, decodeLabel, clearLabel, copyLabel, downloadLabel, decodedMessage, activeMessage, invalidMessage, headerLabel, payloadLabel, utcLabel, localLabel, inputPlaceholder] of cases) {
    await page.goto('/' + locale + '/tools/jwt-decoder/');
    const workbench = page.locator('.jwt-workbench');
    const editors = workbench.locator('.editor-panel');
    await expect(workbench.locator('.workbench-note')).toBeVisible();
    await page.getByRole('button', { name: sampleLabel, exact: true }).click();
    await page.getByRole('button', { name: decodeLabel, exact: true }).click();
    await expect(workbench.getByRole('status').first()).toContainText(decodedMessage);
    await expect(workbench.getByRole('status').nth(1)).toContainText(activeMessage);
    await expect(editors.nth(1)).toContainText(headerLabel);
    await expect(editors.nth(1).locator('.cm-content')).toContainText('HS256');
    await expect(editors.nth(2)).toContainText(payloadLabel);
    await expect(editors.nth(2).locator('.cm-content')).toContainText('Developer');
    await expect(editors.nth(2).locator('.cm-content')).toContainText('👋');
    await expect(workbench.locator('.jwt-claims')).toContainText(utcLabel);
    await expect(workbench.locator('.jwt-claims')).toContainText(localLabel);
    await expect(workbench.locator('.jwt-claims')).toContainText('2023-11-14T22:13:20.000Z');

    const payload = await editors.nth(2).locator('.cm-content').innerText();
    await page.getByRole('button', { name: copyLabel, exact: true }).click();
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toBe(payload);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: downloadLabel, exact: true }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('jwt-payload.json');

    await editors.nth(0).locator('.cm-content').fill('a.b.c');
    await page.getByRole('button', { name: decodeLabel, exact: true }).click();
    await expect(workbench.getByRole('alert')).toContainText(invalidMessage);
    await page.getByRole('button', { name: clearLabel, exact: true }).click();
    await expect(editors.nth(0).locator('.cm-content')).toHaveText(inputPlaceholder);
  }
});

test('Cron generator builds and validates Linux five-field schedules in every locale', async ({ page }) => {
  const cases = [
    ['ko', '예제 불러오기', '필드로 표현식 만들고 계산', '검증 및 다음 5회 계산', '시간대', '결과 복사', '텍스트 다운로드', '5필드 표현식을 확인하고 다음 실행 시각 5개를 계산했습니다.', '5분마다 실행합니다.', '이 MVP에서 지원하지 않는 Cron 확장 문법입니다.', '초기화', '입력과 결과를 초기화했습니다.', '분 (0–59)', '시 (0–23)', '일 (1–31)', '월 (1–12 또는 JAN–DEC)', '요일 (0–7 또는 SUN–SAT)', '예: */5 * * * *'],
    ['en', 'Load sample', 'Build and calculate from fields', 'Validate and calculate next 5', 'Time zone', 'Copy result', 'Download text', 'Validated the five-field expression and calculated its next five runs.', 'Runs every 5 minutes.', 'This cron extension is not supported in the MVP.', 'Clear', 'Input and output cleared.', 'Minute (0–59)', 'Hour (0–23)', 'Day of month (1–31)', 'Month (1–12 or JAN–DEC)', 'Day of week (0–7 or SUN–SAT)', 'Example: */5 * * * *'],
    ['ja', 'サンプルを読み込む', 'フィールドから作成して計算', '検証して次の 5 回を計算', 'タイムゾーン', '結果をコピー', 'テキストをダウンロード', '5 フィールド式を検証し、次の実行時刻を 5 件計算しました。', '5 分ごとに実行します。', 'この MVP では対応していない Cron 拡張構文です。', 'クリア', '入力と結果をクリアしました。', '分 (0–59)', '時 (0–23)', '日 (1–31)', '月 (1–12 または JAN–DEC)', '曜日 (0–7 または SUN–SAT)', '例: */5 * * * *'],
    ['zh', '载入示例', '按字段生成并计算', '校验并计算后续 5 次', '时区', '复制结果', '下载文本', '已校验五字段表达式并计算出后续 5 次运行时间。', '每 5 分钟运行。', 'MVP 不支持此 Cron 扩展语法。', '清空', '已清空输入和结果。', '分钟 (0–59)', '小时 (0–23)', '日期 (1–31)', '月份 (1–12 或 JAN–DEC)', '星期 (0–7 或 SUN–SAT)', '例如: */5 * * * *'],
  ];
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const [locale, sampleLabel, buildLabel, generateLabel, timeZoneLabel, copyLabel, downloadLabel, computedMessage, explanation, unsupportedMessage, clearLabel, clearedMessage, minuteLabel, hourLabel, dayLabel, monthLabel, weekdayLabel, expressionHint] of cases) {
    await page.goto('/' + locale + '/tools/cron-generator/');
    const workbench = page.locator('.cron-workbench');
    const expression = workbench.locator('.editor-panel .cm-content');
    await expect(workbench.locator('.workbench-note').first()).toBeVisible();
    await expect(workbench.locator('#cron-time-zone')).toHaveAccessibleName(timeZoneLabel);
    await expect(workbench.locator('#cron-minute')).toHaveAccessibleName(minuteLabel);
    await expect(workbench.locator('#cron-hour')).toHaveAccessibleName(hourLabel);
    await expect(workbench.locator('#cron-dayOfMonth')).toHaveAccessibleName(dayLabel);
    await expect(workbench.locator('#cron-month')).toHaveAccessibleName(monthLabel);
    await expect(workbench.locator('#cron-dayOfWeek')).toHaveAccessibleName(weekdayLabel);
    await page.getByRole('button', { name: sampleLabel, exact: true }).click();
    await expect(expression).toContainText('*/5 * * * *');
    await page.getByRole('button', { name: generateLabel, exact: true }).click();
    await expect(workbench.getByRole('status')).toContainText(computedMessage);
    await expect(workbench.locator('.cron-results')).toContainText(explanation);
    await expect(workbench.locator('.cron-next-times li')).toHaveCount(5);
    await page.getByRole('button', { name: copyLabel, exact: true }).click();
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toContain('*/5 * * * *');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: downloadLabel, exact: true }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('cron-schedule.txt');
    await workbench.locator('#cron-minute').fill('0');
    await workbench.locator('#cron-hour').fill('9');
    await workbench.locator('#cron-dayOfMonth').fill('*');
    await workbench.locator('#cron-month').fill('*');
    await workbench.locator('#cron-dayOfWeek').fill('1-5');
    await page.getByRole('button', { name: buildLabel, exact: true }).click();
    await expect(expression).toContainText('0 9 * * 1-5');
    await expect(workbench.locator('.cron-next-times li')).toHaveCount(5);

    await expression.fill('0 0 * * ?');
    await page.getByRole('button', { name: generateLabel, exact: true }).click();
    await expect(workbench.getByRole('alert')).toContainText(unsupportedMessage);
    await page.getByRole('button', { name: clearLabel, exact: true }).click();
    await expect(workbench.getByRole('status')).toContainText(clearedMessage);
    await expect(expression).toHaveText(expressionHint);
  }
});

test('Text diff shows line changes safely in side-by-side and unified views in every locale', async ({ page }) => {
  const cases = [
    ['ko', '예제 불러오기', '원본', '변경 후', '비교', '변경 요약', '추가된 줄', '삭제된 줄', '변경된 줄', '통합 보기', '나란히 보기', '결과 복사', '텍스트 다운로드', '초기화', '텍스트 비교를 완료했습니다.', '줄 앞뒤 공백 차이 무시', '두 텍스트에 차이가 없습니다.', '입력과 결과를 초기화했습니다.', '비교할 원본 텍스트를 입력하세요.'],
    ['en', 'Load sample', 'Original', 'Modified', 'Compare text', 'Change summary', 'Added lines', 'Removed lines', 'Changed lines', 'Unified', 'Side by side', 'Copy result', 'Download text', 'Clear', 'Finished comparing the text.', 'Ignore leading and trailing whitespace changes', 'The texts are identical.', 'Input and output cleared.', 'Enter the original text to compare.'],
    ['ja', 'サンプルを読み込む', '変更前', '変更後', 'テキストを比較', '変更の概要', '追加行', '削除行', '変更行', '統合表示', '左右に並べる', '結果をコピー', 'テキストをダウンロード', 'クリア', 'テキストを比較しました。', '行頭と行末の空白の違いを無視', '2 つのテキストに差分はありません。', '入力と結果をクリアしました。', '比較する元のテキストを入力します。'],
    ['zh', '载入示例', '原文', '修改后', '比较文本', '变更摘要', '新增行', '删除行', '修改行', '统一显示', '并排显示', '复制结果', '下载文本', '清空', '文本比较完成。', '忽略行首和行尾空格差异', '两个文本没有差异。', '已清空输入和结果。', '输入原始文本。'],
  ];
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const [locale, sampleLabel, beforeLabel, afterLabel, compareLabel, summaryLabel, addedLabel, removedLabel, changedLabel, unifiedLabel, sideBySideLabel, copyLabel, downloadLabel, clearLabel, comparedMessage, ignoreLabel, noChangesMessage, clearedMessage, beforeHint] of cases) {
    await page.goto('/' + locale + '/tools/text-diff/');
    const workbench = page.locator('.diff-workbench');
    const editors = workbench.locator('.editor-panel');
    const replaceEditorText = async (index: number, value: string) => {
      const content = editors.nth(index).locator('.cm-content');
      await content.click();
      await content.press('ControlOrMeta+A');
      await content.pressSequentially(value);
    };
    await expect(workbench.locator('.workbench-note')).toBeVisible();
    await expect(editors.nth(0)).toContainText(beforeLabel);
    await expect(editors.nth(1)).toContainText(afterLabel);
    await page.getByRole('button', { name: sampleLabel, exact: true }).click();
    await page.getByRole('button', { name: compareLabel, exact: true }).click();
    await expect(workbench.getByRole('status')).toContainText(comparedMessage);
    const summary = workbench.locator('.diff-summary');
    await expect(workbench.locator('.diff-results').getByRole('heading', { name: summaryLabel })).toBeVisible();
    await expect(summary).toContainText(addedLabel);
    await expect(summary).toContainText(removedLabel);
    await expect(summary).toContainText(changedLabel);
    await expect(summary.locator('dd').nth(0)).toHaveText('1');
    await expect(summary.locator('dd').nth(1)).toHaveText('0');
    await expect(summary.locator('dd').nth(2)).toHaveText('1');
    await expect(workbench.locator('.diff-row-added')).toContainText('🌏');
    await expect(workbench.locator('.diff-row-changed')).toContainText('draft');
    await expect(workbench.locator('.diff-table tr')).toHaveCount(5);

    await page.getByRole('tab', { name: unifiedLabel, exact: true }).click();
    await expect(page.getByRole('tab', { name: unifiedLabel, exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(workbench.locator('.diff-unified-row')).toHaveCount(5);
    await page.getByRole('button', { name: copyLabel, exact: true }).click();
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toContain('+ 🌏');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: downloadLabel, exact: true }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('text-diff.txt');

    await replaceEditorText(0, '  spaced  ');
    await replaceEditorText(1, 'spaced');
    await expect(editors.nth(0).locator('.cm-content')).toContainText('  spaced  ');
    await expect(editors.nth(1).locator('.cm-content')).toContainText('spaced');
    await expect(editors.nth(0).locator('.editor-footer span').first()).toContainText('10');
    await expect(editors.nth(1).locator('.editor-footer span').first()).toContainText('6');
    const ignoreWhitespace = page.getByLabel(ignoreLabel);
    await ignoreWhitespace.check();
    await expect(ignoreWhitespace).toBeChecked();
    await page.getByRole('button', { name: compareLabel, exact: true }).click();
    await expect(summary.locator('dd').nth(2)).toHaveText('0');
    await expect(workbench.getByRole('status')).toContainText(noChangesMessage);

    await page.getByRole('tab', { name: sideBySideLabel, exact: true }).click();
    await replaceEditorText(0, '<script>alert(1)</script>');
    await replaceEditorText(1, '<img src=x onerror=alert(1)>');
    await page.getByRole('button', { name: compareLabel, exact: true }).click();
    await expect(workbench.locator('.diff-table')).toContainText('<script>');
    await expect(workbench.locator('.diff-table img')).toHaveCount(0);

    await page.getByRole('button', { name: clearLabel, exact: true }).click();
    await expect(workbench.getByRole('status')).toContainText(clearedMessage);
    await expect(editors.nth(0).locator('.cm-content')).toHaveText(beforeHint);
  }
});

test('Regex tester highlights matches and recovers from a terminated Worker in every locale', async ({ page }) => {
  const cases = [
    ['ko', '예제 불러오기', '정규식 패턴', '플래그', '테스트 문자열', '정규식 실행', '정규식 결과', '일치 횟수', '캡처 그룹', '결과 복사', '텍스트 다운로드', '정규식 검사를 완료했습니다.', '정규식 패턴이 올바르지 않습니다.', '정규식 플래그가 올바르지 않습니다.'],
    ['en', 'Load sample', 'Regular expression', 'Flags', 'Test string', 'Run regex', 'Regex results', 'Match count', 'Capture groups', 'Copy result', 'Download text', 'Regex check complete.', 'The regular expression is invalid.', 'The regex flags are invalid.'],
    ['ja', 'サンプルを読み込む', '正規表現パターン', 'フラグ', 'テスト文字列', '正規表現を実行', '正規表現の結果', '一致数', 'キャプチャグループ', '結果をコピー', 'テキストをダウンロード', '正規表現の確認が完了しました。', '正規表現パターンが無効です。', '正規表現のフラグが無効です。'],
    ['zh', '载入示例', '正则表达式模式', '标志', '测试文本', '运行正则表达式', '正则表达式结果', '匹配次数', '捕获组', '复制结果', '下载文本', '正则表达式检查完成。', '正则表达式模式无效。', '正则表达式标志无效。'],
  ];
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const [locale, sampleLabel, patternLabel, flagsLabel, inputLabel, runLabel, resultsLabel, countLabel, capturesLabel, copyLabel, downloadLabel, completedMessage, invalidPatternMessage, invalidFlagsMessage] of cases) {
    await page.goto('/' + locale + '/tools/regex-tester/');
    const workbench = page.locator('.regex-workbench');
    await expect(workbench.locator('.workbench-note')).toBeVisible();
    await expect(workbench.getByRole('textbox', { name: inputLabel })).toBeVisible();
    await page.getByRole('button', { name: sampleLabel, exact: true }).click();
    await page.getByRole('button', { name: runLabel, exact: true }).click();
    await expect(workbench.getByRole('status')).toContainText(completedMessage);
    const results = workbench.locator('.regex-results');
    await expect(results.getByRole('heading', { name: resultsLabel })).toBeVisible();
    await expect(results).toContainText(countLabel);
    await expect(results.locator('.regex-match-count strong')).toHaveText('2');
    await expect(results.locator('.regex-highlight mark')).toHaveCount(2);
    const rows = results.locator('.regex-match-table tbody tr');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText('alpha-12');
    await expect(rows.nth(0)).toContainText('0–8');
    await expect(results.locator('thead')).toContainText(capturesLabel);
    await expect(rows.nth(0)).toContainText('alpha');
    await expect(rows.nth(0)).toContainText('12');
    await page.getByRole('button', { name: copyLabel, exact: true }).click();
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toContain('alpha-12');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: downloadLabel, exact: true }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('regex-matches.txt');

    await page.getByLabel(patternLabel).fill('(');
    await page.getByRole('button', { name: runLabel, exact: true }).click();
    await expect(workbench.getByRole('alert')).toContainText(invalidPatternMessage);
    await page.getByLabel(patternLabel).fill('a');
    await page.getByLabel(flagsLabel).fill('gg');
    await page.getByRole('button', { name: runLabel, exact: true }).click();
    await expect(workbench.getByRole('alert')).toContainText(invalidFlagsMessage);
  }

  await page.goto('/ko/tools/regex-tester/');
  const workbench = page.locator('.regex-workbench');
  await page.getByLabel('정규식 패턴').fill('(a+)+$');
  await page.getByLabel('플래그').fill('');
  const editor = workbench.locator('.editor-panel .cm-content');
  await editor.click();
  await editor.press('ControlOrMeta+A');
  await page.keyboard.insertText('a'.repeat(20_000) + '!');
  await page.getByRole('button', { name: '정규식 실행', exact: true }).click();
  await expect(workbench.getByRole('alert')).toContainText('정규식 계산이 1초를 넘어서 중단했습니다.', { timeout: 10_000 });
  await page.getByLabel('정규식 패턴').fill('a');
  await page.getByLabel('플래그').fill('g');
  await editor.click();
  await editor.press('ControlOrMeta+A');
  await page.keyboard.insertText('a');
  await page.getByRole('button', { name: '정규식 실행', exact: true }).click();
  await expect(workbench.getByRole('status')).toContainText('정규식 검사를 완료했습니다.');
  await expect(workbench.locator('.regex-match-table tbody tr')).toHaveCount(1);
});

test('YAML and JSON converter formats, validates, copies, and downloads in every locale', async ({ page }) => {
  const cases = [
    ['ko', '예제 불러오기', '변환 방향', '들여쓰기', '검증', '변환', '결과 복사', '텍스트 다운로드', '초기화', 'YAML 1.2 Core', '변환을 완료했습니다.', '입력이 올바릅니다.', 'YAML 형식이 올바르지 않습니다.', 'JSON 형식이 올바르지 않습니다.'],
    ['en', 'Load sample', 'Conversion direction', 'Indentation', 'Validate', 'Convert', 'Copy result', 'Download text', 'Clear', 'YAML 1.2 Core', 'Conversion complete.', 'The input is valid.', 'The YAML is invalid.', 'The JSON is invalid.'],
    ['ja', 'サンプルを読み込む', '変換方向', 'インデント', '検証', '変換', '結果をコピー', 'テキストをダウンロード', 'クリア', 'YAML 1.2 Core', '変換が完了しました。', '入力は有効です。', 'YAML の形式が無効です。', 'JSON の形式が無効です。'],
    ['zh', '载入示例', '转换方向', '缩进', '校验', '转换', '复制结果', '下载文本', '清空', 'YAML 1.2 Core', '转换完成。', '输入有效。', 'YAML 格式无效。', 'JSON 格式无效。'],
  ];
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const [locale, sampleLabel, directionLabel, indentLabel, validateLabel, convertLabel, copyLabel, downloadLabel, clearLabel, noticeText, convertedMessage, validMessage, invalidYamlMessage, invalidJsonMessage] of cases) {
    await page.goto('/' + locale + '/tools/yaml-json/');
    const workbench = page.locator('.yaml-json-workbench');
    const editors = workbench.locator('.editor-panel');
    const direction = workbench.getByLabel(directionLabel);
    const replaceInput = async (value: string) => {
      const content = editors.nth(0).locator('.cm-content');
      await content.click();
      await content.press('ControlOrMeta+A');
      await content.pressSequentially(value);
    };
    await expect(workbench.locator('.workbench-note')).toContainText(noticeText);
    await expect(workbench.getByLabel(indentLabel)).toBeVisible();
    await expect(editors.nth(0).locator('.cm-content')).toBeVisible();
    await page.getByRole('button', { name: sampleLabel, exact: true }).click();
    await page.getByRole('button', { name: convertLabel, exact: true }).click();
    await expect(workbench.getByRole('status')).toContainText(convertedMessage);
    await expect(editors.nth(1)).toContainText('"name": "DevDesk"');
    await page.getByRole('button', { name: validateLabel, exact: true }).click();
    await expect(workbench.getByRole('status')).toContainText(validMessage);
    await page.getByRole('button', { name: copyLabel, exact: true }).click();
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toContain('"name": "DevDesk"');
    const jsonDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: downloadLabel, exact: true }).click();
    expect((await jsonDownload).suggestedFilename()).toBe('converted.json');

    await direction.selectOption('json-to-yaml');
    await page.getByRole('button', { name: sampleLabel, exact: true }).click();
    await page.getByRole('button', { name: convertLabel, exact: true }).click();
    await expect(editors.nth(1)).toContainText('name: DevDesk');
    const yamlDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: downloadLabel, exact: true }).click();
    expect((await yamlDownload).suggestedFilename()).toBe('converted.yaml');

    await direction.selectOption('yaml-to-json');
    await replaceInput('name: first\nname: second');
    await expect(editors.nth(0).locator('.cm-content')).toContainText('name: first');
    await expect(editors.nth(0).locator('.cm-content')).toContainText('name: second');
    await expect(workbench.locator('.status-message')).toHaveCount(0);
    await page.getByRole('button', { name: validateLabel, exact: true }).click();
    await expect(workbench.getByRole('alert')).toContainText(invalidYamlMessage);
    await direction.selectOption('json-to-yaml');
    await replaceInput('{broken');
    await page.getByRole('button', { name: validateLabel, exact: true }).click();
    await expect(workbench.getByRole('alert')).toContainText(invalidJsonMessage);
    await page.getByRole('button', { name: clearLabel, exact: true }).click();
    await expect(workbench.getByRole('status')).toBeVisible();
  }
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

test('Unix timestamp converter handles explicit units, IANA zones, date input, current time, and DST errors in every locale', async ({ page }) => {
  const leapTimestamp = String(Date.UTC(2024, 1, 29, 12, 30, 45));
  const cases = [
    ['ko', 'Unix 타임스탬프', '날짜와 시간', '시간대', '타임스탬프 단위', '초', '밀리초', '날짜로 변환', '타임스탬프로 변환', '현재 시간 사용', 'Epoch 예제', '초기화', '결과 복사', '입력과 결과를 초기화했습니다.', '타임스탬프를 날짜와 시간으로 변환했습니다.', '날짜와 시간을 타임스탬프로 변환했습니다.', '선택한 시간대에서 존재하지 않는 현지 시간입니다', 'ISO 8601'],
    ['en', 'Unix timestamp', 'Date and time', 'Time zone', 'Timestamp unit', 'Seconds', 'Milliseconds', 'Convert to date', 'Convert to timestamp', 'Use current time', 'Epoch sample', 'Clear', 'Copy result', 'Input and output cleared.', 'Converted the timestamp to a date and time.', 'Converted the date and time to a timestamp.', 'That local time does not exist', 'ISO 8601'],
    ['ja', 'Unix タイムスタンプ', '日付と時刻', 'タイムゾーン', 'タイムスタンプの単位', '秒', 'ミリ秒', '日付に変換', 'タイムスタンプに変換', '現在時刻を使う', 'Epoch の例', 'クリア', '結果をコピー', '入力と結果をクリアしました。', 'タイムスタンプを日付と時刻に変換しました。', '日付と時刻をタイムスタンプに変換しました。', '選択したタイムゾーンに存在しない現地時刻です', 'ISO 8601'],
    ['zh', 'Unix 时间戳', '日期和时间', '时区', '时间戳单位', '秒', '毫秒', '转换为日期', '转换为时间戳', '使用当前时间', 'Epoch 示例', '清空', '复制结果', '已清空输入和结果。', '已将时间戳转换为日期和时间。', '已将日期和时间转换为时间戳。', '该时区中不存在这个本地时间', 'ISO 8601'],
  ];
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const [locale, timestampLabel, dateTimeLabel, timeZoneLabel, unitLabel, secondsLabel, millisecondsLabel, timestampToDateLabel, dateToTimestampLabel, nowLabel, sampleLabel, clearLabel, copyLabel, clearedMessage, timestampMessage, dateMessage, dstMessage, isoLabel] of cases) {
    await page.goto(`/${locale}/tools/unix-timestamp/`);
    const workbench = page.locator('.timestamp-workbench');
    const output = workbench.locator('.editor-panel').nth(0).locator('.cm-content');
    const timestampInput = workbench.locator('#timestamp-value');
    const dateTimeInput = workbench.locator('#timestamp-date-time');
    const timeZoneInput = workbench.locator('#timestamp-time-zone');
    const unitSelect = workbench.locator('#timestamp-unit');
    await expect(timestampInput).toHaveAccessibleName(timestampLabel);
    await expect(dateTimeInput).toHaveAccessibleName(dateTimeLabel);
    await expect(timeZoneInput).toHaveAccessibleName(timeZoneLabel);
    await expect(unitSelect).toHaveAccessibleName(unitLabel);

    await unitSelect.selectOption({ label: secondsLabel });
    await timestampInput.fill('0');
    await page.getByRole('button', { name: timestampToDateLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(timestampMessage);
    await expect(output).toContainText('1970-01-01T00:00:00.000Z');

    await timeZoneInput.fill('America/Los_Angeles');
    await page.getByRole('button', { name: timestampToDateLabel, exact: true }).click();
    await expect(output).toContainText('America/Los_Angeles:');
    await unitSelect.selectOption({ label: millisecondsLabel });
    await timestampInput.fill('2147483648000');
    await page.getByRole('button', { name: timestampToDateLabel, exact: true }).click();
    await expect(output).toContainText('2038-01-19T03:14:08.000Z');

    await timeZoneInput.fill('UTC');
    await dateTimeInput.fill('2024-02-29T12:30:45');
    await page.getByRole('button', { name: dateToTimestampLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(dateMessage);
    await expect(output).toContainText(leapTimestamp);
    const copiedText = await output.innerText();
    await page.getByRole('button', { name: copyLabel, exact: true }).click();
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toBe(copiedText);

    await page.getByRole('button', { name: nowLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(timestampMessage);
    await expect(output).toContainText(`${isoLabel}:`);
    await expect(timestampInput).not.toHaveValue('');

    await timeZoneInput.fill('America/New_York');
    await dateTimeInput.fill('2024-03-10T02:30');
    await page.getByRole('button', { name: dateToTimestampLabel, exact: true }).click();
    await expect(workbench.getByRole('alert')).toContainText(dstMessage);
    await page.getByRole('button', { name: sampleLabel, exact: true }).click();
    await expect(timestampInput).toHaveValue('0');
    await page.getByRole('button', { name: clearLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(clearedMessage);
  }
});

test('UUID generator creates bounded v4 batches and supports copy, download, and clear in every locale', async ({ page }) => {
  const cases = [
    ['ko', 'UUID v4 생성기', '생성 개수 (1–100)', '개수를 3으로 설정', 'UUID 생성', '초기화', '결과 복사', '텍스트 다운로드', '보안 난수 UUID를 생성했습니다.', '1부터 100까지의 정수를 입력하세요.', '입력과 결과를 초기화했습니다.'],
    ['en', 'UUID v4 generator', 'Number to generate (1–100)', 'Set count to 3', 'Generate UUIDs', 'Clear', 'Copy result', 'Download text', 'Generated cryptographically random UUIDs.', 'Enter a whole number from 1 to 100.', 'Input and output cleared.'],
    ['ja', 'UUID v4 生成ツール', '生成数 (1–100)', '生成数を 3 に設定', 'UUID を生成', 'クリア', '結果をコピー', 'テキストをダウンロード', '暗号学的に安全な UUID を生成しました。', '1 から 100 までの整数を入力してください。', '入力と結果をクリアしました。'],
    ['zh', 'UUID v4 生成工具', '生成数量 (1–100)', '将数量设为 3', '生成 UUID', '清空', '复制结果', '下载文本', '已生成密码学安全的 UUID。', '请输入 1 到 100 之间的整数。', '已清空输入和结果。'],
  ];
  const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const [locale, toolLabel, countLabel, sampleLabel, generateLabel, clearLabel, copyLabel, downloadLabel, generatedMessage, invalidCountMessage, clearedMessage] of cases) {
    await page.goto(`/${locale}/tools/uuid-generator/`);
    const workbench = page.locator('.uuid-workbench');
    const count = workbench.locator('#uuid-count');
    const output = workbench.locator('.editor-panel').locator('.cm-content');
    await expect(workbench).toHaveAttribute('aria-label', toolLabel);
    await expect(count).toHaveAccessibleName(countLabel);
    await expect(page.evaluate(() => window.isSecureContext)).resolves.toBeTruthy();
    await page.getByRole('button', { name: sampleLabel, exact: true }).click();
    await page.getByRole('button', { name: generateLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(generatedMessage);
    const values = (await output.innerText()).trim().split('\n');
    expect(values).toHaveLength(3);
    for (const value of values) expect(value).toMatch(uuidV4Pattern);
    expect(new Set(values).size).toBe(3);

    const copiedText = await output.innerText();
    await page.getByRole('button', { name: copyLabel, exact: true }).click();
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toBe(copiedText);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: downloadLabel, exact: true }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('uuids.txt');

    await count.fill('101');
    await page.getByRole('button', { name: generateLabel, exact: true }).click();
    await expect(workbench.getByRole('alert')).toContainText(invalidCountMessage);
    await page.getByRole('button', { name: clearLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(clearedMessage);
    await expect(count).toHaveValue('1');
    await expect(output).toHaveText(await output.getAttribute('aria-placeholder') ?? '');
  }
});

test('SHA hash generator matches SHA-2 vectors, optionally shows Base64, and accepts empty input in every locale', async ({ page }) => {
  const cases = [
    ['ko', 'SHA 해시 생성기', '알고리즘', 'Base64 결과도 표시', '해시 생성', '예제 불러오기', '초기화', '결과 복사', '텍스트 다운로드', '브라우저에서 해시를 생성했습니다.', '입력과 결과를 초기화했습니다.'],
    ['en', 'SHA hash generator', 'Algorithm', 'Also show Base64 output', 'Generate hash', 'Load sample', 'Clear', 'Copy result', 'Download text', 'Generated the hash in your browser.', 'Input and output cleared.'],
    ['ja', 'SHA ハッシュ生成ツール', 'アルゴリズム', 'Base64 の結果も表示', 'ハッシュを生成', 'サンプルを読み込む', 'クリア', '結果をコピー', 'テキストをダウンロード', 'ブラウザー内でハッシュを生成しました。', '入力と結果をクリアしました。'],
    ['zh', 'SHA 哈希生成工具', '算法', '同时显示 Base64 结果', '生成哈希', '载入示例', '清空', '复制结果', '下载文本', '已在浏览器中生成哈希。', '已清空输入和结果。'],
  ];
  const sha256 = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
  const sha384 = 'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7';
  const sha512 = 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f';
  const emptySha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const [locale, toolLabel, algorithmLabel, base64Label, generateLabel, sampleLabel, clearLabel, copyLabel, downloadLabel, generatedMessage, clearedMessage] of cases) {
    await page.goto(`/${locale}/tools/hash-generator/`);
    const workbench = page.locator('.hash-workbench');
    const algorithm = workbench.locator('#hash-algorithm');
    const base64Toggle = workbench.locator('#hash-base64');
    const output = workbench.locator('.editor-panel').nth(1).locator('.cm-content');
    await expect(workbench).toHaveAttribute('aria-label', toolLabel);
    await expect(algorithm).toHaveAccessibleName(algorithmLabel);
    await expect(base64Toggle).toHaveAccessibleName(base64Label);
    await expect(workbench.locator('.workbench-note')).toBeVisible();
    await base64Toggle.check();
    await page.getByRole('button', { name: sampleLabel, exact: true }).click();

    await algorithm.selectOption('SHA-256');
    await page.getByRole('button', { name: generateLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(generatedMessage);
    await expect(output).toContainText(`SHA-256 (hex): ${sha256}`);
    await expect(output).toContainText('SHA-256 (Base64): ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=');
    const copiedText = await output.innerText();
    await page.getByRole('button', { name: copyLabel, exact: true }).click();
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toBe(copiedText);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: downloadLabel, exact: true }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('hash.txt');

    await algorithm.selectOption('SHA-384');
    await page.getByRole('button', { name: generateLabel, exact: true }).click();
    await expect(output).toContainText(`SHA-384 (hex): ${sha384}`);
    await algorithm.selectOption('SHA-512');
    await page.getByRole('button', { name: generateLabel, exact: true }).click();
    await expect(output).toContainText(`SHA-512 (hex): ${sha512}`);

    await page.getByRole('button', { name: clearLabel, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(clearedMessage);
    await expect(output).toHaveText(await output.getAttribute('aria-placeholder') ?? '');
    await algorithm.selectOption('SHA-256');
    await page.getByRole('button', { name: generateLabel, exact: true }).click();
    await expect(output).toContainText(`SHA-256 (hex): ${emptySha256}`);
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
