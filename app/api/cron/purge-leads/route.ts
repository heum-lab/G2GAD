import { timingSafeEqual } from 'node:crypto';
import { connection } from 'next/server';
import { serverEnv } from '@/lib/env';
import { purgeLeadsOlderThan } from '@/lib/inquiry/store';

// 보유기간이 지난 개인정보 파기. Vercel Cron이 매일 호출한다. (ARCHITECTURE §7.3)
// 보유기간(LEAD_RETENTION_DAYS)이 확정되기 전에는 아무것도 지우지 않는다. (PRD §10 미결)

function isAuthorized(request: Request, secret: string) {
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  // 빌드 시 프리렌더하지 않고 요청 때만 실행한다.
  await connection();
  let env;
  try {
    env = serverEnv();
  } catch {
    // 서버 환경 변수가 없는 환경(프리뷰 등)
    return Response.json({ ok: false }, { status: 503 });
  }
  if (!isAuthorized(request, env.CRON_SECRET)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  if (!env.LEAD_RETENTION_DAYS) {
    return Response.json({ ok: true, skipped: 'LEAD_RETENTION_DAYS 미설정' });
  }

  try {
    const deleted = await purgeLeadsOlderThan(env.LEAD_RETENTION_DAYS);
    return Response.json({ ok: true, deleted });
  } catch (error) {
    console.error('[cron] 리드 파기 실패', error instanceof Error ? error.message : '');
    return Response.json({ ok: false }, { status: 500 });
  }
}
