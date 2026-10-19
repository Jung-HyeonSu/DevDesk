import { expect, test } from '@playwright/test';

test('JSON formatting, validation, and minification celebrate successful results only', async ({ page }) => {
  await page.goto('/en/tools/json-formatter/');
  const workbench = page.locator('.json-workbench');
  const input = workbench.locator('.editor-panel').first().locator('.cm-content');
  const confetti = page.locator('.success-confetti');

  for (const action of ['Beautify', 'Validate', 'Minify']) {
    await input.fill('{"ready":true}');
    await page.getByRole('button', { name: action, exact: true }).click();
    await expect(workbench.getByRole('status')).toBeVisible();
    await expect(confetti.locator('.success-confetti-piece')).toHaveCount(48);
    await expect(confetti).toHaveCount(0);
  }

  await input.fill('{invalid');
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(workbench.getByRole('alert')).toBeVisible();
  await expect(confetti).toHaveCount(0);
});
