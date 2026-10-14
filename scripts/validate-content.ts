// 빌드 전 검증: 환경 변수, 콘텐츠 frontmatter, 참조 무결성. 실패하면 빌드도 실패한다.
// 서버 환경 변수는 STRICT_ENV=1일 때만 필수다. 없으면 경고만 하고 빌드를 계속하며,
// 그 상태에서는 문의 제출이 오류 안내(대표번호)로 끝난다.
// TODO: 서버 키를 모두 등록하면 Vercel Production에 STRICT_ENV=1을 설정한다.
import { serverEnvStatus } from '@/lib/env';
import { getCases, getFaqs, getInsights, getServices } from '@/lib/content/loader';
import { validateContent } from '@/lib/content/validate';

const requireServerEnv = process.env.STRICT_ENV === '1';

try {
  const missing = Object.entries(serverEnvStatus()).filter(([, status]) => !status.ok);
  if (missing.length > 0) {
    const detail = missing
      .map(
        ([feature, status]) =>
          `  - ${feature}: ${status.ok ? '' : status.issues.join(', ')}`,
      )
      .join('\n');
    if (requireServerEnv) throw new Error(`서버 환경 변수 누락:\n${detail}`);
    console.warn(
      `[경고] 설정되지 않은 기능이 있습니다. 해당 기능은 동작하지 않습니다.\n${detail}`,
    );
  }
  const errors = validateContent();
  if (errors.length > 0) {
    console.error(`콘텐츠 참조 검증 실패 (${errors.length}건):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log(
    `콘텐츠 검증 통과: 서비스 ${getServices().length}, 사례 ${getCases().length}, 인사이트 ${getInsights().length}, FAQ ${getFaqs().length}`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
