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
