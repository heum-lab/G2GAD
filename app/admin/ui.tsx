import Link from 'next/link';
import type { ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/Button';
import { STATUS_LABELS, type LeadStatus } from '@/lib/admin/leads';
import { getServices } from '@/lib/content/loader';
import { BUDGET_OPTIONS } from '@/lib/inquiry/schema';
import { cn } from '@/lib/utils';
import { logout } from './actions';

// 어드민 공용 UI·포맷 함수

const dateTime = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function formatDateTime(date: Date) {
  return dateTime.format(date);
}

export function serviceTitles(slugs: string[]) {
  const titles = new Map(getServices().map((service) => [service.slug, service.title]));
  return slugs.map((slug) => titles.get(slug) ?? slug);
}

export function budgetLabel(value: string | null) {
  if (!value) return '-';
  return BUDGET_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-primary text-primary-foreground',
  contacted: 'bg-primary-soft text-primary',
  won: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-muted text-muted-foreground',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function AdminShell({
  title,
  username,
  actions,
  children,
}: {
  title: string;
  username: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <header className="border-border bg-background border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/admin" className="font-bold">
            G2G 문의 관리
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden sm:inline">{username}</span>
            <form action={logout}>
              <button
                type="submit"
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-bold">{title}</h1>
          {actions}
        </div>
        {children}
      </main>
    </>
  );
}
