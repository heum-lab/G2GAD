import { getCases, getServices } from '@/lib/content/loader';
import { absoluteUrl } from '@/lib/env';
import { buildLlmsTxt } from '@/lib/seo/llms';

// site.ts와 서비스 목록에서 자동 생성한다. (ARCHITECTURE §6.3)
export async function GET() {
  const body = buildLlmsTxt({
    services: getServices(),
    cases: getCases(),
    url: absoluteUrl,
  });
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
