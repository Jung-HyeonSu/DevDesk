import { expect, test } from '@playwright/test';

test('JSON formatting, validation, and minification celebrate successful results only', async ({ page }) => {
  await page.goto('/en/tools/json-formatter/');
  const workbench = page.locator('.json-workbench');
  const input = workbench.locator('.editor-panel').first().locator('.cm-content');
  const confetti = page.locator('.success-confetti');
  const replaceInput = async (value: string) => {
    await input.click();
    await input.press('ControlOrMeta+A');
    await input.pressSequentially(value);
    await expect(input).toContainText(value);
  };

  for (const action of ['Beautify', 'Validate', 'Minify']) {
    await replaceInput('{"ready":true}');
    await page.getByRole('button', { name: action, exact: true }).click();
    await expect(workbench.getByRole('status')).toBeVisible();
    await expect(confetti.locator('.success-confetti-piece')).toHaveCount(48);
    await expect(confetti).toHaveCount(0);
  }

  await replaceInput('{invalid');
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(workbench.getByRole('alert')).toBeVisible();
  await expect(confetti).toHaveCount(0);
});
