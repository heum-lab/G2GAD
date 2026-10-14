import { expect, test } from '@playwright/test';

const pages = [
  '/',
  '/about',
  '/services',
  '/services/place',
  '/faq',
  '/contact',
  '/cases',
];

for (const path of pages) {
  test(`${path}: H1이 1개이고 제목 레벨을 건너뛰지 않는다`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);

    const levels = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((nodes) => nodes.map((node) => Number(node.tagName.slice(1))));
    let previous = 0;
    for (const level of levels) {
      expect(level - previous, `h${previous} 다음에 h${level}`).toBeLessThanOrEqual(1);
      previous = level;
    }
  });
}

test('모든 이미지에 alt 속성이 있다', async ({ page }) => {
  for (const path of pages) {
    await page.goto(path);
    await expect(page.locator('img:not([alt])')).toHaveCount(0);
  }
});

test('서비스 상세: 전용 FAQ만 FAQPage로 마크업하고 CTA가 서비스를 넘긴다', async ({
  page,
}) => {
  await page.goto('/services/place');
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const types = blocks.flatMap((text) => {
    const data = JSON.parse(text) as unknown;
    return (Array.isArray(data) ? data : [data]).map(
      (item) => (item as { '@type': string | string[] })['@type'],
    );
  });
  expect(types.filter((type) => type === 'FAQPage')).toHaveLength(1);
  expect(types).toContain('Service');
  expect(types).toContain('BreadcrumbList');

  await expect(page.getByRole('link', { name: '문의하기' }).last()).toHaveAttribute(
    'href',
    '/contact?service=place',
  );
});

test('메인에는 FAQPage 마크업이 없다', async ({ page }) => {
  await page.goto('/');
  const html = await page.content();
  expect(html).not.toContain('"@type":"FAQPage"');
  await expect(page.getByRole('heading', { name: '자주 묻는 질문' })).toBeVisible();
});

test('없는 주소는 404를 반환한다', async ({ page }) => {
  const missing = await page.goto('/services/does-not-exist');
  expect(missing?.status()).toBe(404);
  const sentinel = await page.goto('/cases/__none__');
  expect(sentinel?.status()).toBe(404);
});

test('모바일 하단 바에 전화 링크가 있다', async ({ page, isMobile }) => {
  test.skip(!isMobile, '모바일 전용');
  await page.goto('/');
  const bar = page.getByRole('navigation', { name: '빠른 상담' });
  await expect(bar).toBeVisible();
  await expect(bar.getByRole('link', { name: /전화/ })).toHaveAttribute(
    'href',
    'tel:07088317081',
  );
});
