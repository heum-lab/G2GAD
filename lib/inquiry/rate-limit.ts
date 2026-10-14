import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { serverEnv } from '@/lib/env';

// IP당 5회/10분. 인스턴스 메모리로 구현하지 않는다. (ARCHITECTURE §7.1, CONVENTIONS §9)

let limiter: Ratelimit | undefined;

function getLimiter() {
  const env = serverEnv();
  limiter ??= new Ratelimit({
    redis: new Redis({
      url: env.RATE_LIMIT_REDIS_URL,
      token: env.RATE_LIMIT_REDIS_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    prefix: 'g2g:inquiry',
    timeout: 3000,
  });
  return limiter;
}

/**
 * 제한에 걸리면 false. Redis 장애 시에는 문의를 잃지 않도록 통과시키고 로그만 남긴다.
 */
export async function checkRateLimit(key: string): Promise<boolean> {
  try {
    const { success } = await getLimiter().limit(key);
    return success;
  } catch (error) {
    console.error(
      '[inquiry] rate limit 확인 실패',
      error instanceof Error ? error.message : '',
    );
    return true;
  }
}
