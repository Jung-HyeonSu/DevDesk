import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.describe('workflow studio', () => {
  test('matches the home header and fills the content column in every locale', async ({ page }) => {
    const readHeader = () => page.locator('.topbar-inner').evaluate((element) => {
      const rect = (selector: string) => {
        const target = element.querySelector<HTMLElement>(selector);
        if (!target) return null;
        const box = target.getBoundingClientRect();
        return [box.x, box.y, box.width, box.height];
      };
      return { brand: rect('.brand'), nav: rect('.top-nav'), search: rect('.search-trigger'), actions: rect('.top-actions') };
    });

    for (const locale of ['ko', 'en', 'ja', 'zh']) {
      await page.goto(`/${locale}/`);
      const homeHeader = await readHeader();
      await page.goto(`/${locale}/workflows/`);
      await expect(page.locator('.top-nav a[aria-current="page"]')).toHaveAttribute('href', `/${locale}/workflows/`);
      await expect(page.locator('.search-trigger')).toHaveClass(/home-search-trigger/);
      await expect(page.locator('.workflow-studio-controls > .primary-button')).toHaveCSS('border-radius', '10px');
      expect(await readHeader()).toEqual(homeHeader);
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        editorWidth: document.querySelector('.workflow-studio-page')?.getBoundingClientRect().width ?? 0,
      }));
      expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
      expect(dimensions.editorWidth).toBeGreaterThan(dimensions.viewport * 0.75);
    }
  });

  test('runs all three recipes and exports only recipe structure', async ({ page }) => {
    await page.addInitScript(() => {
      const trackedWindow = window as Window & { __devdeskToolSuccessCount?: number };
      trackedWindow.__devdeskToolSuccessCount = 0;
      window.addEventListener('devdesk:tool-success', () => {
        trackedWindow.__devdeskToolSuccessCount = (trackedWindow.__devdeskToolSuccessCount ?? 0) + 1;
      });
    });
    await page.goto('/ko/workflows/');
    const recipeSelect = page.getByRole('combobox', { name: '시작 레시피' });
    const expectSuccessBurst = async (count: number) => {
      await expect.poll(() => page.evaluate(() => (window as Window & { __devdeskToolSuccessCount?: number }).__devdeskToolSuccessCount ?? 0)).toBe(count);
      await expect(page.locator('.success-confetti-piece')).toHaveCount(48);
    };
    const cases = [
      { id: 'api-contract-triage', steps: 2 },
      { id: 'release-config-preflight', steps: 3 },
      { id: 'har-issue-prep', steps: 2 },
    ];

    for (const recipe of cases) {
      await recipeSelect.selectOption(recipe.id);
      await page.getByRole('button', { name: '안전한 예제 입력 채우기' }).click();
      await page.getByRole('button', { name: '전체 실행' }).click();
      await expect(page.locator('.workflow-node-result.is-complete')).toHaveCount(recipe.steps);
      await expect(page.locator('.workflow-node-result.is-error')).toHaveCount(0);
      await expectSuccessBurst(cases.indexOf(recipe) + 1);
    }

    await recipeSelect.selectOption('api-contract-triage');
    await page.getByRole('button', { name: '안전한 예제 입력 채우기' }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: '레시피 내보내기' }).click();
    const download = await downloadPromise;
    const exported = await readFile((await download.path())!, 'utf8');
    expect(exported).toContain('devdesk-workflow');
    expect(exported).not.toContain('invoice-demo-208');
    expect(exported).not.toContain('"$schema"');
    expect(exported).not.toContain('"valid": true');

    await page.locator('input[type="file"]').setInputFiles((await download.path())!);
    await expect(page.getByText('레시피를 가져왔습니다. 입력 값은 포함되지 않습니다.')).toBeVisible();
    await page.getByRole('button', { name: '안전한 예제 입력 채우기' }).click();
    await page.getByRole('button', { name: '전체 실행' }).click();
    await expect(page.locator('.workflow-node-result.is-complete')).toHaveCount(2);
    await expectSuccessBurst(6);
  });

  test('recovers from step errors', async ({ page }) => {
    await page.goto('/ko/workflows/');
    await page.getByLabel('JSON Schema 검사기: JSON Schema').fill('{ broken');
    await page.getByRole('button', { name: '전체 실행' }).click();
    await expect(page.locator('.workflow-node-result.is-error')).toHaveCount(1);
    await expect(page.locator('.workflow-node-result.is-skipped')).toHaveCount(1);

    await page.getByRole('button', { name: '안전한 예제 입력 채우기' }).click();
    await page.getByRole('button', { name: '전체 실행' }).click();
    await expect(page.locator('.workflow-node-result.is-complete')).toHaveCount(2);

  });

  test('rejects a keyboard-created cycle on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'The native mobile connection-menu keyboard behavior is covered by the mobile browser project.');
    await page.goto('/ko/workflows/');
    await page.getByRole('combobox', { name: '시작 레시피' }).selectOption('custom');
    await page.getByLabel('도구 추가').selectOption('json-formatter');
    await page.getByRole('button', { name: '노드 추가' }).click();
    await page.getByRole('button', { name: '노드 추가' }).click();
    const menus = page.locator('.workflow-connect-field select');
    await expect(menus).toHaveCount(2);
    const firstNodeId = (await menus.nth(1).locator('option').nth(1).getAttribute('value'))!;
    const secondNodeId = (await menus.nth(0).locator('option').nth(1).getAttribute('value'))!;
    const forwardMenu = menus.nth(1);
    await forwardMenu.focus();
    await forwardMenu.press('ArrowDown');
    await forwardMenu.press('Enter');
    await expect(forwardMenu).toHaveValue(firstNodeId);

    const cycleMenu = page.locator(`.workflow-node-item[data-node-id="${firstNodeId}"] .workflow-connect-field select`);
    await expect(cycleMenu).toHaveCount(1);
    await expect(cycleMenu.locator(`option[value="${secondNodeId}"]`)).toHaveCount(1);
    await cycleMenu.selectOption(secondNodeId);
    await expect(page.getByRole('alert').filter({ hasText: '순환 연결은 허용되지 않습니다.' })).toBeVisible();
    await expect(page.locator('.workflow-node-item')).toHaveCount(2);
    await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);
    expect(firstNodeId).not.toBe(secondNodeId);
  });

  test('keeps primary tool actions visible and celebrates every new tool result and copy', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The same workbench actions are checked on desktop; mobile overflow is verified with a dedicated viewport test.');
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.addInitScript(() => {
      const trackedWindow = window as Window & { __devdeskToolSuccessCount?: number };
      trackedWindow.__devdeskToolSuccessCount = 0;
      window.addEventListener('devdesk:tool-success', () => {
        trackedWindow.__devdeskToolSuccessCount = (trackedWindow.__devdeskToolSuccessCount ?? 0) + 1;
      });
    });

    const existingTools = [
      'json-formatter', 'sql-formatter', 'jwt-decoder', 'cron-generator', 'text-diff', 'base64',
      'url-encoder', 'unix-timestamp', 'uuid-generator', 'hash-generator', 'regex-tester', 'yaml-json',
      'code-formatter', 'json-pointer', 'csv-json', 'url-inspector', 'html-entities',
    ];
    for (const slug of existingTools) {
      await page.goto(`/ko/tools/${slug}/`);
      const actions = page.locator('.action-toolbar-sticky');
      await expect(actions, `${slug} primary action bar`).toHaveCount(1);
      await expect(actions).toHaveCSS('position', 'sticky');
      await expect(actions).toHaveCSS('order', '-1');
    }

    await page.goto('/ko/tools/json-formatter/');
    const jsonActions = page.locator('.action-toolbar-sticky');
    await expect(jsonActions).toHaveCount(1);
    await expect(jsonActions).toHaveCSS('position', 'sticky');
    await expect(jsonActions).toHaveCSS('order', '-1');
    await page.locator('.json-workbench .editor-panel').first().locator('.cm-content').fill(JSON.stringify({ items: Array.from({ length: 1000 }, (_, id) => ({ id })) }));
    await page.evaluate(() => window.scrollTo(0, 480));
    await expect.poll(() => jsonActions.evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(72);
    await expect.poll(() => jsonActions.evaluate((element) => element.getBoundingClientRect().top)).toBeLessThan(100);

    const slugs = [
      'json-schema-validator', 'openapi-explorer', 'curl-fetch-converter', 'http-header-inspector',
      'env-diff', 'gitignore-tester', 'har-scrubber', 'markdown-link-checker',
    ];
    for (const slug of slugs) {
      await page.goto(`/ko/tools/${slug}/`);
      const workbench = page.locator('.expanded-workbench');
      await expect(workbench.locator('.expanded-workbench-actions')).toHaveCSS('position', 'sticky');
      await expect(workbench.locator('.expanded-workbench-actions')).toHaveCSS('order', '-1');
      await page.getByRole('button', { name: '예제 불러오기' }).click();
      await expect.poll(() => page.evaluate(() => (window as Window & { __devdeskToolSuccessCount?: number }).__devdeskToolSuccessCount ?? 0)).toBe(0);
      await page.getByRole('button', { name: '실행', exact: true }).click();
      await expect(workbench.locator('.expanded-workbench-output')).toBeVisible();
      await expect.poll(() => page.evaluate(() => (window as Window & { __devdeskToolSuccessCount?: number }).__devdeskToolSuccessCount ?? 0)).toBe(1);
      await expect(page.locator('.success-confetti-piece')).toHaveCount(48);
      await page.getByRole('button', { name: '결과 복사' }).click();
      await expect.poll(() => page.evaluate(() => (window as Window & { __devdeskToolSuccessCount?: number }).__devdeskToolSuccessCount ?? 0)).toBe(2);
      await expect(page.locator('.success-confetti-piece')).toHaveCount(48);
    }
  });
});
