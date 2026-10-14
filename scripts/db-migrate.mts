// db/schema.sql을 DATABASE_URL의 DB에 적용한다. 멱등이므로 여러 번 실행해도 된다.
// 사용법: pnpm db:migrate  (DATABASE_URL은 .env.local 또는 환경 변수에서 읽는다)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postgres from 'postgres';

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL이 없습니다.');
  process.exit(1);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  await sql.unsafe(readFileSync(join(process.cwd(), 'db/schema.sql'), 'utf8'));
  const [row] = await sql`select count(*)::int as count from leads`;
  console.log(`스키마 적용 완료. leads ${row?.count ?? 0}건`);
} catch (error) {
  console.error('스키마 적용 실패:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await sql.end();
}
