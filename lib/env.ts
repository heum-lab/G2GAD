import { z } from 'zod';

// 환경 변수 검증. (ARCHITECTURE §9)

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  // 분석 ID는 선택. 없으면 해당 스크립트를 싣지 않는다 (둘 다 없으면 쿠키 배너도 숨긴다).
  NEXT_PUBLIC_GA_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_NAVER_ANALYTICS_ID: z.string().min(1).optional(),
});

// 서버 환경 변수는 기능별로 나눠 검증한다. 한 기능의 키가 없어도 다른 기능은 동작한다.
// 예: DB만 연결되어 있으면 문의는 저장되고, 메일·Slack 알림만 실패한다.
const emailList = z
  .string()
  .min(1)
  .transform((value) =>
    value
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.email()).min(1));

const serverSchemas = {
  database: z.object({ DATABASE_URL: z.string().min(1) }),
  mail: z.object({
    RESEND_API_KEY: z.string().min(1),
    INQUIRY_FROM_EMAIL: z.email(),
    INQUIRY_NOTIFY_EMAILS: emailList,
  }),
  slack: z.object({ SLACK_WEBHOOK_URL: z.url() }),
  // Upstash 마켓플레이스 연동은 KV_REST_API_* 이름으로 주입한다.
  rateLimit: z.object({
    RATE_LIMIT_REDIS_URL: z.url(),
    RATE_LIMIT_REDIS_TOKEN: z.string().min(1),
  }),
  cron: z.object({
    CRON_SECRET: z.string().min(1),
    LEAD_RETENTION_DAYS: z.coerce.number().int().positive().optional(),
  }),
  admin: z.object({
    // "아이디:scrypt해시" 콤마 구분. 해시는 pnpm admin:hash로 만든다.
    ADMIN_ACCOUNTS: z.string().min(1),
    ADMIN_SESSION_SECRET: z.string().min(32, '32자 이상이어야 합니다'),
  }),
} as const;

type ServerSchemas = typeof serverSchemas;
export type ServerFeature = keyof ServerSchemas;

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
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || undefined,
  NEXT_PUBLIC_NAVER_ANALYTICS_ID: process.env.NEXT_PUBLIC_NAVER_ANALYTICS_ID || undefined,
});

/** 분석 도구가 하나라도 설정되어 있는지. 쿠키 동의 배너 노출 여부에 쓴다. */
export const hasAnalytics = Boolean(
  publicEnv.NEXT_PUBLIC_GA_ID || publicEnv.NEXT_PUBLIC_NAVER_ANALYTICS_ID,
);

function serverValues() {
  // 빈 문자열은 미설정으로 취급한다.
  const values: Record<string, string | undefined> = Object.fromEntries(
    Object.entries(process.env).filter(([, value]) => value !== ''),
  );
  values.RATE_LIMIT_REDIS_URL ??= values.KV_REST_API_URL;
  values.RATE_LIMIT_REDIS_TOKEN ??= values.KV_REST_API_TOKEN;
  return values;
}

/** 기능별 서버 환경 변수. 서버 코드에서만 호출한다. 키가 없으면 throw한다. */
export function serverEnv<F extends ServerFeature>(
  feature: F,
): z.infer<ServerSchemas[F]> {
  const schema: z.ZodType = serverSchemas[feature];
  return parseEnv(schema, serverValues()) as z.infer<ServerSchemas[F]>;
}

/** 기능별 설정 여부. 빌드 전 검증과 어드민 안내에 쓴다. */
export function serverEnvStatus() {
  const values = serverValues();
  return Object.fromEntries(
    Object.entries(serverSchemas).map(([feature, schema]) => {
      const result = schema.safeParse(values);
      return [
        feature,
        result.success
          ? { ok: true as const }
          : {
              ok: false as const,
              issues: result.error.issues.map(
                (issue) => `${issue.path.join('.')}: ${issue.message}`,
              ),
            },
      ];
    }),
  ) as Record<ServerFeature, { ok: true } | { ok: false; issues: string[] }>;
}

/** 검색엔진 색인 허용 여부. Vercel에서는 Production 환경만 허용한다. */
export const isIndexable =
  process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === 'production';

export function absoluteUrl(path = '/') {
  return new URL(path, publicEnv.NEXT_PUBLIC_SITE_URL).toString();
}
