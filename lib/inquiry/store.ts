import 'server-only';
import postgres from 'postgres';
import { serverEnv } from '@/lib/env';
import type { InquiryInput } from './schema';

// leads 테이블 저장. 스키마는 db/schema.sql. (ARCHITECTURE §7.3)

let client: postgres.Sql | undefined;

function sql() {
  client ??= postgres(serverEnv().DATABASE_URL, {
    max: 1,
    connect_timeout: 5,
    idle_timeout: 20,
    prepare: false,
  });
  return client;
}

const emptyToNull = (value: string) => (value === '' ? null : value);

export async function storeLead(id: string, input: InquiryInput) {
  await sql()`
    insert into leads (
      id, name, company, phone, email, services, budget, message,
      utm_source, utm_medium, utm_campaign, landing_path, referrer, consent_at
    ) values (
      ${id}, ${input.name}, ${input.company}, ${input.phone}, ${emptyToNull(input.email)},
      ${input.services}, ${emptyToNull(input.budget)}, ${emptyToNull(input.message)},
      ${emptyToNull(input.utmSource)}, ${emptyToNull(input.utmMedium)},
      ${emptyToNull(input.utmCampaign)}, ${emptyToNull(input.landingPath)},
      ${emptyToNull(input.referrer)}, now()
    )
  `;
}

/** 보유기간이 지난 리드를 파기하고 삭제 건수를 반환한다. */
export async function purgeLeadsOlderThan(days: number) {
  const rows = await sql()`
    delete from leads
    where created_at < now() - make_interval(days => ${days})
    returning id
  `;
  return rows.length;
}
