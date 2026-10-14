import { z } from 'zod';

// 환경 변수 검증. (ARCHITECTURE §9)

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_GA_ID: z.string().min(1),
  NEXT_PUBLIC_NAVER_ANALYTICS_ID: z.string().min(1),
});

const ServerEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  INQUIRY_FROM_EMAIL: z.email(),
  INQUIRY_NOTIFY_EMAILS: z
    .string()
    .min(1)
    .transform((value) =>
      value
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.email()).min(1)),
  SLACK_WEBHOOK_URL: z.url(),
  RATE_LIMIT_REDIS_URL: z.url(),
  RATE_LIMIT_REDIS_TOKEN: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  LEAD_RETENTION_DAYS: z.coerce.number().int().positive().optional(),
  BROCHURE_TOKEN_SECRET: z.string().min(1).optional(),
  STAGING_BASIC_AUTH: z.string().min(1).optional(),
});

function parseEnv<T>(schema: z.ZodType<T>, values: unknown): T {
  const result = schema.safeParse(values);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `환경 변수 검증 실패:\n${issues}\n.env.example을 참고해 값을 등록하세요.`,
    );
  }
  return result.data;
}

// NEXT_PUBLIC_* 값은 클라이언트 번들에 인라인되도록 정적으로 참조한다.
export const publicEnv = parseEnv(PublicEnvSchema, {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_NAVER_ANALYTICS_ID: process.env.NEXT_PUBLIC_NAVER_ANALYTICS_ID,
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

let cachedServerEnv: ServerEnv | undefined;

/** 서버 전용 환경 변수. 서버 코드에서만 호출한다. */
export function serverEnv(): ServerEnv {
  // 빈 문자열은 미설정으로 취급한다.
  const values = Object.fromEntries(
    Object.entries(process.env).filter(([, value]) => value !== ''),
  );
  cachedServerEnv ??= parseEnv(ServerEnvSchema, values);
  return cachedServerEnv;
}

/** 검색엔진 색인 허용 여부. Vercel에서는 Production 환경만 허용한다. */
export const isIndexable =
  process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === 'production';

export function absoluteUrl(path = '/') {
  return new URL(path, publicEnv.NEXT_PUBLIC_SITE_URL).toString();
}
