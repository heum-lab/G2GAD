import 'server-only';
import postgres from 'postgres';
import { serverEnv } from '@/lib/env';

// Postgres(Neon) 클라이언트. 서버리스 인스턴스당 연결 1개. (ARCHITECTURE §7.3)

let client: postgres.Sql | undefined;

export function sql() {
  client ??= postgres(serverEnv('database').DATABASE_URL, {
    max: 1,
    connect_timeout: 5,
    idle_timeout: 20,
    prepare: false,
  });
  return client;
}
