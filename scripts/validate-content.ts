// 빌드 전 검증: 환경 변수, 콘텐츠 frontmatter, 참조 무결성. 실패하면 빌드도 실패한다.
import { serverEnv } from '@/lib/env';
import { getCases, getFaqs, getInsights, getServices } from '@/lib/content/loader';
import { validateContent } from '@/lib/content/validate';

try {
  serverEnv();
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
