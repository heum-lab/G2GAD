import { defineConfig, devices } from '@playwright/test';

// PLAYWRIGHT_BASE_URL이 있으면 그 주소(프리뷰 배포 등)를 대상으로, 없으면 로컬 프로덕션 서버를 띄워 테스트한다.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    extraHTTPHeaders: bypassSecret ? { 'x-vercel-protection-bypass': bypassSecret } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'pnpm start',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
