-- 문의 리드 저장 테이블. (ARCHITECTURE §7.3)
-- Postgres(Neon 또는 Supabase)에 한 번 실행한다.

create type lead_status as enum ('new', 'contacted', 'won', 'lost');

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

create index if not exists leads_created_at_idx on leads (created_at);
