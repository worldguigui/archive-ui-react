import { expect, test } from '@playwright/test';

// 需要先安装浏览器: pnpm exec playwright install chromium
test('Playground 首页正常渲染 Panel 组件', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.au-panel__title').first()).toContainText('Overview');
  // 组件库样式已加载：面板带有边框与背景色。
  const panel = page.locator('.au-panel').first();
  await expect(panel).toBeVisible();
  const borderColor = await panel.evaluate((el) => getComputedStyle(el).borderColor);
  expect(borderColor).not.toBe('rgb(0, 0, 0)');
});
