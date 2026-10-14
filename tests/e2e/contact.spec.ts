import { expect, test } from '@playwright/test';

test('필수 필드 누락 시 에러를 표시한다', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: '문의 보내기' }).click();

  await expect(page.getByText('이름을 입력해 주세요.')).toBeVisible();
  await expect(page.getByText('연락처 형식을 확인해 주세요.')).toBeVisible();
  await expect(page.getByText('관심 서비스를 1개 이상 선택해 주세요.')).toBeVisible();
  await expect(page.getByText('개인정보 수집·이용에 동의해 주세요.')).toBeVisible();
  await expect(page.getByRole('textbox', { name: '이름' })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(page).toHaveURL(/\/contact$/);
});

test('?service= 로 관심 서비스가 미리 선택된다', async ({ page }) => {
  await page.goto('/contact?service=place');
  await expect(page.getByRole('checkbox', { name: '플레이스 마케팅' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: '검색광고' })).not.toBeChecked();
});

test('없는 서비스 값은 무시한다', async ({ page }) => {
  await page.goto('/contact?service=unknown');
  await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(0);
});

// 실제 리드를 만들지 않도록 honeypot 경로로 제출 흐름을 확인한다.
// 봇으로 판정되면 저장·알림 없이 성공으로 응답하고, 전환 이벤트는 발생하지 않는다.
test('honeypot이 채워진 제출은 저장 없이 완료 페이지로 이동하고 전환을 보내지 않는다', async ({
  page,
}) => {
  await page.goto('/contact');
  await page.evaluate(() => {
    (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (...args) => {
      (window as unknown as { dataLayer: unknown[] }).dataLayer.push(args);
    };
  });

  await page.getByRole('textbox', { name: '이름' }).fill('테스트');
  await page.getByRole('textbox', { name: '회사 / 상호' }).fill('테스트 상호');
  await page.getByRole('textbox', { name: '연락처' }).fill('010-0000-0000');
  await page.getByRole('checkbox', { name: '플레이스 마케팅' }).check();
  await page.getByRole('checkbox', { name: /개인정보 수집·이용에 동의합니다/ }).check();
  await page.locator('#website').evaluate((node) => {
    const input = node as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set;
    setter?.call(input, 'https://spam.example');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await page.getByRole('button', { name: '문의 보내기' }).click();
  await expect(page).toHaveURL(/\/contact\/thanks$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '문의가 접수되었습니다',
  );

  const events = await page.evaluate(
    () => (window as unknown as { dataLayer: unknown[][] }).dataLayer,
  );
  expect(events.filter((args) => args[1] === 'generate_lead')).toHaveLength(0);
});

test('완료 페이지는 색인되지 않는다', async ({ page }) => {
  await page.goto('/contact/thanks');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
