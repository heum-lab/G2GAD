-- 문의 리드 저장 테이블. (ARCHITECTURE §7.3)
-- 여러 번 실행해도 안전하다(멱등). 적용: pnpm db:migrate

do $$
begin
  create type lead_status as enum ('new', 'contacted', 'won', 'lost');
exception
  when duplicate_object then null;
end
$$;

create table if not exists leads (
  id            uuid primary key,
  created_at    timestamptz not null default now(),
  name          text not null,
  company       text not null,
  phone         text not null,
  email         text,
  services      text[] not null,
  budget        text,
  message       text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  landing_path  text,
  referrer      text,
  consent_at    timestamptz not null,
  status        lead_status not null default 'new'
);

-- 어드민(문의 관리)용 컬럼
alter table leads add column if not exists memo text;
alter table leads add column if not exists updated_at timestamptz;

create index if not exists leads_created_at_idx on leads (created_at);
create index if not exists leads_status_idx on leads (status);
