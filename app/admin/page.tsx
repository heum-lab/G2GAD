import Link from 'next/link';
import { Suspense } from 'react';
import { buttonVariants } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { requireAdmin } from '@/lib/admin/auth';
import {
  isLeadStatus,
  LEAD_STATUSES,
  listLeads,
  PAGE_SIZE,
  STATUS_LABELS,
  type LeadFilter,
} from '@/lib/admin/leads';
import { cn } from '@/lib/utils';
import {
  AdminShell,
  budgetLabel,
  formatDateTime,
  serviceTitles,
  StatusBadge,
} from './ui';

export const metadata = { title: '문의 목록' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function AdminLeadsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p className="p-8 text-center">불러오는 중…</p>}>
      <LeadsView searchParams={searchParams} />
    </Suspense>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toQuery(filter: LeadFilter, page?: number) {
  const params = new URLSearchParams();
  if (filter.q) params.set('q', filter.q);
  if (filter.status) params.set('status', filter.status);
  if (page && page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `?${query}` : '';
}

async function LeadsView({ searchParams }: { searchParams: SearchParams }) {
  const username = await requireAdmin();
  const params = await searchParams;
  const status = first(params.status);
  const filter: LeadFilter = {
    q: first(params.q)?.trim().slice(0, 100) || undefined,
    status: isLeadStatus(status) ? status : undefined,
  };
  const page = Math.max(1, Number(first(params.page)) || 1);

  let result: Awaited<ReturnType<typeof listLeads>>;
  try {
    result = await listLeads(filter, page);
  } catch (error) {
    console.error('[admin] 목록 조회 실패', error instanceof Error ? error.message : '');
    return (
      <AdminShell title="문의 목록" username={username}>
        <p role="alert" className="rounded-card bg-background border-border border p-6">
          데이터베이스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      </AdminShell>
    );
  }

  const { leads, total, statusCounts } = result;
  const totalAll = Object.values(statusCounts).reduce(
    (sum, count) => sum + (count ?? 0),
    0,
  );
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminShell
      title="문의 목록"
      username={username}
      actions={
        <a
          href={`/admin/export${toQuery(filter)}`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          CSV 내보내기
        </a>
      }
    >
      <nav aria-label="상태 필터" className="mb-4 flex flex-wrap gap-2">
        {[undefined, ...LEAD_STATUSES].map((value) => {
          const active = filter.status === value;
          const count = value ? (statusCounts[value] ?? 0) : totalAll;
          return (
            <Link
              key={value ?? 'all'}
              href={`/admin${toQuery({ q: filter.q, status: value })}`}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:border-primary',
              )}
            >
              {value ? STATUS_LABELS[value] : '전체'} {count}
            </Link>
          );
        })}
      </nav>

      <form className="mb-6 flex gap-2" role="search">
        {filter.status ? (
          <input type="hidden" name="status" value={filter.status} />
        ) : null}
        <label htmlFor="q" className="sr-only">
          검색
        </label>
        <Input
          id="q"
          name="q"
          defaultValue={filter.q}
          placeholder="이름, 회사, 연락처, 이메일, 문의 내용"
          className="bg-background max-w-md"
        />
        <button type="submit" className={buttonVariants({ size: 'md' })}>
          검색
        </button>
      </form>

      {leads.length === 0 ? (
        <p className="rounded-card bg-background border-border border p-6">
          {filter.q || filter.status
            ? '조건에 맞는 문의가 없습니다.'
            : '아직 접수된 문의가 없습니다.'}
        </p>
      ) : (
        <div className="rounded-card bg-background border-border overflow-x-auto border">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead className="border-border text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3 font-medium">접수일시</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">회사</th>
                <th className="px-4 py-3 font-medium">이름</th>
                <th className="px-4 py-3 font-medium">연락처</th>
                <th className="px-4 py-3 font-medium">관심 서비스</th>
                <th className="px-4 py-3 font-medium">예산</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="text-primary underline"
                    >
                      {formatDateTime(lead.createdAt)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 font-medium">{lead.company}</td>
                  <td className="px-4 py-3">{lead.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{lead.phone}</td>
                  <td className="px-4 py-3">{serviceTitles(lead.services).join(', ')}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {budgetLabel(lead.budget)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lastPage > 1 ? (
        <nav
          aria-label="페이지"
          className="mt-6 flex items-center justify-center gap-3 text-sm"
        >
          {page > 1 ? (
            <Link href={`/admin${toQuery(filter, page - 1)}`} className="underline">
              이전
            </Link>
          ) : null}
          <span>
            {page} / {lastPage} (총 {total}건)
          </span>
          {page < lastPage ? (
            <Link href={`/admin${toQuery(filter, page + 1)}`} className="underline">
              다음
            </Link>
          ) : null}
        </nav>
      ) : null}
    </AdminShell>
  );
}
