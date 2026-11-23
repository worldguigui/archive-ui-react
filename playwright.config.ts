import { defineConfig, devices } from '@playwright/test';

// E2E 测试针对 Playground 运行，用于验证组件库在真实浏览器中的表现。
// 首次运行前需执行: pnpm exec playwright install chromium
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
