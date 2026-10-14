import 'server-only';
import { sql } from '@/lib/db';
import { requireAdmin } from './auth';
import type { LeadStatus } from './lead-status';

// 문의(리드) 조회·수정. 내보내는 함수는 모두 관리자 세션을 먼저 확인한다(Data Access Layer).
// 개인정보이므로 캐시하지 않는다.

export { isLeadStatus, LEAD_STATUSES, STATUS_LABELS } from './lead-status';
export type { LeadStatus } from './lead-status';

export type Lead = {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;
  name: string;
  company: string;
  phone: string;
  email: string | null;
  services: string[];
  budget: string | null;
  message: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  landingPath: string | null;
  referrer: string | null;
  consentAt: Date;
  status: LeadStatus;
  memo: string | null;
};

export type LeadFilter = { q?: string; status?: LeadStatus };

export const PAGE_SIZE = 20;

const COLUMNS = `
  id, created_at as "createdAt", updated_at as "updatedAt", name, company, phone, email,
  services, budget, message, utm_source as "utmSource", utm_medium as "utmMedium",
  utm_campaign as "utmCampaign", landing_path as "landingPath", referrer,
  consent_at as "consentAt", status, memo
`;

function where({ q, status }: LeadFilter) {
  const db = sql();
  const conditions = [];
  if (status) conditions.push(db`status = ${status}`);
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    conditions.push(
      db`(name ilike ${like} or company ilike ${like} or phone ilike ${like} or email ilike ${like} or message ilike ${like})`,
    );
  }
  if (conditions.length === 0) return db``;
  return db`where ${conditions.reduce((acc, condition) => db`${acc} and ${condition}`)}`;
}

export async function listLeads(filter: LeadFilter, page: number) {
  await requireAdmin();
  const db = sql();
  const offset = (Math.max(page, 1) - 1) * PAGE_SIZE;
  const [rows, [count], statusCounts] = await Promise.all([
    db<Lead[]>`
      select ${db.unsafe(COLUMNS)} from leads ${where(filter)}
      order by created_at desc limit ${PAGE_SIZE} offset ${offset}
    `,
    db<{ total: number }[]>`select count(*)::int as total from leads ${where(filter)}`,
    db<{ status: LeadStatus; count: number }[]>`
      select status, count(*)::int as count from leads group by status
    `,
  ]);
  return {
    leads: [...rows],
    total: count?.total ?? 0,
    statusCounts: Object.fromEntries(
      statusCounts.map((row) => [row.status, row.count]),
    ) as Partial<Record<LeadStatus, number>>,
  };
}

/** CSV 내보내기용. 최대 5,000건. */
export async function exportLeads(filter: LeadFilter) {
  await requireAdmin();
  const db = sql();
  return [
    ...(await db<Lead[]>`
      select ${db.unsafe(COLUMNS)} from leads ${where(filter)}
      order by created_at desc limit 5000
    `),
  ];
}

export async function getLead(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const db = sql();
  const [lead] = await db<
    Lead[]
  >`select ${db.unsafe(COLUMNS)} from leads where id = ${id}`;
  return lead ?? null;
}

export async function updateLead(
  id: string,
  input: { status: LeadStatus; memo: string },
) {
  await requireAdmin();
  await sql()`
    update leads
    set status = ${input.status}, memo = ${input.memo || null}, updated_at = now()
    where id = ${id}
  `;
}

/** 개인정보 삭제 요청 처리용. 되돌릴 수 없다. */
export async function deleteLead(id: string) {
  await requireAdmin();
  await sql()`delete from leads where id = ${id}`;
}
