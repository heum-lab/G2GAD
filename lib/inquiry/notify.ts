import 'server-only';
import { Resend } from 'resend';
import { site } from '@/content/site';
import { serverEnv } from '@/lib/env';
import { budgetLabel, type InquiryInput } from './schema';

// 문의 알림: 담당자 메일(Resend) + Slack. (ARCHITECTURE §7.1)

type NotifyContext = {
  leadRef: string;
  input: InquiryInput;
  /** 서비스 slug → 표시 이름 */
  serviceTitles: string[];
  /** DB 저장 성공 여부. 실패 시 메일이 유일한 기록이 된다. */
  stored: boolean;
};

function buildText({ leadRef, input, serviceTitles, stored }: NotifyContext) {
  const lines = [
    stored
      ? '홈페이지 문의가 접수되었습니다.'
      : '[주의] DB 저장에 실패했습니다. 이 메일이 유일한 기록입니다.',
    '',
    `접수 번호: ${leadRef}`,
    `이름: ${input.name}`,
    `회사/상호: ${input.company}`,
    `연락처: ${input.phone}`,
    `이메일: ${input.email || '-'}`,
    `관심 서비스: ${serviceTitles.join(', ')}`,
    `월 예산: ${budgetLabel(input.budget)}`,
    '',
    '문의 내용:',
    input.message || '-',
    '',
    `유입 페이지: ${input.landingPath || '-'}`,
    `리퍼러: ${input.referrer || '-'}`,
    `UTM: ${[input.utmSource, input.utmMedium, input.utmCampaign].filter(Boolean).join(' / ') || '-'}`,
  ];
  return lines.join('\n');
}

/** 본문은 텍스트로만 보낸다(HTML 미사용이므로 이스케이프가 필요 없다). */
export async function sendInquiryEmail(context: NotifyContext) {
  const env = serverEnv();
  const resend = new Resend(env.RESEND_API_KEY);
  const prefix = context.stored ? '' : '[DB 저장 실패] ';
  const { error } = await resend.emails.send({
    from: `${site.name} 홈페이지 <${env.INQUIRY_FROM_EMAIL}>`,
    to: env.INQUIRY_NOTIFY_EMAILS,
    replyTo: context.input.email || undefined,
    subject: `${prefix}[홈페이지 문의] ${context.input.company} / ${context.serviceTitles.join(', ')}`,
    text: buildText(context),
  });
  if (error) throw new Error(`Resend: ${error.name}`);
}

export async function sendInquirySlack(context: NotifyContext) {
  const response = await fetch(serverEnv().SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: buildText(context) }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Slack: HTTP ${response.status}`);
}
