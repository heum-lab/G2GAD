import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { requireAdmin } from '@/lib/admin/auth';
import { getLead } from '@/lib/admin/leads';
import {
  AdminShell,
  budgetLabel,
  formatDateTime,
  serviceTitles,
  StatusBadge,
} from '../../ui';
import { DeleteLeadForm, LeadEditForm } from './forms';

export const metadata = { title: '문의 상세' };

type Params = Promise<{ id: string }>;

export default function AdminLeadPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<p className="p-8 text-center">불러오는 중…</p>}>
      <LeadView params={params} />
    </Suspense>
  );
}

async function LeadView({ params }: { params: Params }) {
  const username = await requireAdmin();
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const rows: [string, React.ReactNode][] = [
    ['접수일시', formatDateTime(lead.createdAt)],
    ['상태', <StatusBadge key="status" status={lead.status} />],
    ['회사', lead.company],
    ['이름', lead.name],
    [
      '연락처',
      <a
        key="phone"
        href={`tel:${lead.phone.replace(/\D/g, '')}`}
        className="text-primary underline"
      >
        {lead.phone}
      </a>,
    ],
    [
      '이메일',
      lead.email ? (
        <a key="email" href={`mailto:${lead.email}`} className="text-primary underline">
          {lead.email}
        </a>
      ) : (
        '-'
      ),
    ],
    ['관심 서비스', serviceTitles(lead.services).join(', ')],
    ['월 예산', budgetLabel(lead.budget)],
    ['유입 페이지', lead.landingPath ?? '-'],
    ['리퍼러', lead.referrer ?? '-'],
    [
      'UTM',
      [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ') ||
        '-',
    ],
    ['개인정보 동의', formatDateTime(lead.consentAt)],
    ['최근 수정', lead.updatedAt ? formatDateTime(lead.updatedAt) : '-'],
  ];

  return (
    <AdminShell
      title={`${lead.company} · ${lead.name}`}
      username={username}
      actions={
        <Link href="/admin" className="text-sm underline">
          목록으로
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="rounded-card bg-background border-border border p-6">
          <h2 className="text-lg font-bold">문의 정보</h2>
          <dl className="divide-border mt-4 divide-y text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr]">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="break-all">{value}</dd>
              </div>
            ))}
          </dl>
          <h3 className="mt-6 font-semibold">문의 내용</h3>
          <p className="bg-muted mt-2 rounded-md p-4 text-sm leading-6 whitespace-pre-wrap">
            {lead.message || '(내용 없음)'}
          </p>
        </section>

        <div className="space-y-6">
          <section className="rounded-card bg-background border-border border p-6">
            <h2 className="text-lg font-bold">처리</h2>
            <LeadEditForm id={lead.id} status={lead.status} memo={lead.memo ?? ''} />
          </section>
          <section className="rounded-card bg-background border-border border p-6">
            <h2 className="text-lg font-bold">삭제</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              개인정보 삭제 요청을 받았을 때 사용합니다. 되돌릴 수 없습니다.
            </p>
            <DeleteLeadForm id={lead.id} />
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
