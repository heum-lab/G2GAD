'use server';

import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { z } from 'zod';
import { site } from '@/content/site';
import { getServices } from '@/lib/content/loader';
import { sendInquiryEmail, sendInquirySlack } from '@/lib/inquiry/notify';
import { checkRateLimit } from '@/lib/inquiry/rate-limit';
import { InquirySchema, type InquiryResult } from '@/lib/inquiry/schema';
import { storeLead } from '@/lib/inquiry/store';

// 문의 제출. redirect()하지 않고 결과 객체를 반환한다. (ARCHITECTURE §7.1, CONVENTIONS §10)
// 로그에 개인정보를 남기지 않는다.

function logFailure(step: string, leadRef: string, error: unknown) {
  const reason = error instanceof Error ? error.message : 'unknown';
  console.error(`[inquiry] ${step} 실패 ref=${leadRef} reason=${reason}`);
}

function isHoneypotFilled(input: unknown) {
  if (typeof input !== 'object' || input === null) return false;
  const value = (input as Record<string, unknown>).website;
  return typeof value === 'string' && value.length > 0;
}

export async function submitInquiry(input: unknown): Promise<InquiryResult> {
  // 1. honeypot: 봇에게는 성공처럼 응답한다. leadRef가 없으므로 전환 이벤트는 발생하지 않는다.
  if (isHoneypotFilled(input)) return { ok: true, leadRef: null };

  // 2. rate limit
  const forwardedFor = (await headers()).get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  if (!(await checkRateLimit(ip))) {
    return {
      ok: false,
      message: `문의가 너무 자주 접수되었습니다. 10분 뒤에 다시 시도하시거나 ${site.phone}로 전화해 주세요.`,
    };
  }

  // 3. 서버 재검증
  const parsed = InquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      message: '입력 내용을 확인해 주세요.',
    };
  }
  const data = parsed.data;

  const titleBySlug = new Map(
    getServices().map((service) => [service.slug, service.title]),
  );
  const serviceTitles = data.services.flatMap((slug) => titleBySlug.get(slug) ?? []);
  if (serviceTitles.length !== data.services.length) {
    return {
      ok: false,
      fieldErrors: { services: ['관심 서비스를 다시 선택해 주세요.'] },
      message: '입력 내용을 확인해 주세요.',
    };
  }

  const leadRef = randomUUID();

  // 4. 저장
  let stored = true;
  try {
    await storeLead(leadRef, data);
  } catch (error) {
    stored = false;
    logFailure('DB 저장', leadRef, error);
  }

  // 5. 알림
  const context = { leadRef, input: data, serviceTitles, stored };
  const [email, slack] = await Promise.allSettled([
    sendInquiryEmail(context),
    sendInquirySlack(context),
  ]);
  if (email.status === 'rejected') logFailure('메일 알림', leadRef, email.reason);
  if (slack.status === 'rejected') logFailure('Slack 알림', leadRef, slack.reason);

  // 6. 저장과 메일이 모두 실패한 경우에만 오류로 응답한다.
  if (!stored && email.status === 'rejected') {
    return {
      ok: false,
      message: `일시적인 오류로 문의가 접수되지 않았습니다. 잠시 후 다시 시도하시거나 ${site.phone}로 전화해 주세요.`,
    };
  }

  return { ok: true, leadRef };
}
