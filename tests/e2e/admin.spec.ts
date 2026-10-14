import { expect, test } from '@playwright/test';

// 어드민 접근 제어. 로그인 이후 흐름은 실제 DB가 필요해 여기서는 다루지 않는다.

test('로그인하지 않으면 어드민 페이지는 로그인으로 보낸다', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('heading', { name: 'G2G 문의 관리' })).toBeVisible();
  await expect(page.getByLabel('아이디')).toBeVisible();
  await expect(page.getByLabel('비밀번호')).toBeVisible();

  await page.goto('/admin/leads/00000000-0000-0000-0000-000000000000');
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('로그인하지 않으면 CSV를 내려받을 수 없다', async ({ request }) => {
  const response = await request.get('/admin/export');
  expect(response.status()).toBe(401);
});

test('어드민은 검색엔진 색인을 막고 사이트 추적 요소를 싣지 않는다', async ({ page }) => {
  const response = await page.goto('/admin/login');
  expect(response?.headers()['x-robots-tag']).toContain('noindex');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  await expect(page.getByText('방문 통계 분석을 위해 쿠키를 사용합니다')).toHaveCount(0);
});
