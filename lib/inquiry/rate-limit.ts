import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { serverEnv } from '@/lib/env';

// 인스턴스 메모리로 구현하지 않는다. (ARCHITECTURE §7.1, CONVENTIONS §9)
// - inquiry: 문의 제출, IP당 5회/10분
// - adminLogin: 어드민 로그인, IP당 10회/15분

const policies = {
  inquiry: { limit: 5, window: '10 m' },
  adminLogin: { limit: 10, window: '15 m' },
} as const;

type Policy = keyof typeof policies;

const limiters = new Map<Policy, Ratelimit>();
let redis: Redis | undefined;

function getLimiter(policy: Policy) {
  const existing = limiters.get(policy);
  if (existing) return existing;
  const env = serverEnv('rateLimit');
  redis ??= new Redis({
    url: env.RATE_LIMIT_REDIS_URL,
    token: env.RATE_LIMIT_REDIS_TOKEN,
  });
  const { limit, window } = policies[policy];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `g2g:${policy}`,
    timeout: 3000,
  });
  limiters.set(policy, limiter);
  return limiter;
}

/**
 * 제한에 걸리면 false. Redis 미설정·장애 시에는 문의를 잃지 않도록 통과시키고 로그만 남긴다.
 */
export async function checkRateLimit(
  key: string,
  policy: Policy = 'inquiry',
): Promise<boolean> {
  try {
    const { success } = await getLimiter(policy).limit(key);
    return success;
  } catch (error) {
    console.error(
      `[rate-limit:${policy}] 확인 실패`,
      error instanceof Error ? error.message.split('\n')[0] : '',
    );
    return true;
  }
}
