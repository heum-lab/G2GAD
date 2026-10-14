import { getAdmin } from '@/lib/admin/auth';
import { exportLeads, isLeadStatus, STATUS_LABELS } from '@/lib/admin/leads';
import { getServices } from '@/lib/content/loader';
import { BUDGET_OPTIONS } from '@/lib/inquiry/schema';

// 문의 CSV 내보내기. 목록과 같은 필터(q, status)를 쓴다. 엑셀에서 한글이 깨지지 않도록 BOM을 붙인다.

const dateTime = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

/** CSV 셀 이스케이프. 수식으로 해석될 수 있는 값은 앞에 '를 붙인다(CSV 인젝션 방지). */
function cell(value: string | null | undefined) {
  let text = value ?? '';
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(request: Request) {
  if (!(await getAdmin())) {
    return new Response('Unauthorized', { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const status = params.get('status');
  const leads = await exportLeads({
    q: params.get('q')?.trim().slice(0, 100) || undefined,
    status: isLeadStatus(status) ? status : undefined,
  });

  const titles = new Map(getServices().map((service) => [service.slug, service.title]));
  const budgets = new Map<string, string>(BUDGET_OPTIONS.map((o) => [o.value, o.label]));
  const header = [
    '접수일시',
    '상태',
    '회사',
    '이름',
    '연락처',
    '이메일',
    '관심 서비스',
    '월 예산',
    '문의 내용',
    '내부 메모',
    '유입 페이지',
    '리퍼러',
    'UTM source',
    'UTM medium',
    'UTM campaign',
  ];
  const lines = leads.map((lead) =>
    [
      dateTime.format(lead.createdAt),
      STATUS_LABELS[lead.status],
      lead.company,
      lead.name,
      lead.phone,
      lead.email,
      lead.services.map((slug) => titles.get(slug) ?? slug).join(', '),
      lead.budget ? (budgets.get(lead.budget) ?? lead.budget) : '',
      lead.message,
      lead.memo,
      lead.landingPath,
      lead.referrer,
      lead.utmSource,
      lead.utmMedium,
      lead.utmCampaign,
    ]
      .map(cell)
      .join(','),
  );

  const today = dateTime.format(new Date()).slice(0, 10).replaceAll('-', '');
  return new Response(`﻿${[header.join(','), ...lines].join('\r\n')}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="g2g-leads-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
