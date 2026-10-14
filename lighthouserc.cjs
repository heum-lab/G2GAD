// Lighthouse CI 설정 (PRD G4, CONVENTIONS §9, ARCHITECTURE §12)
// 대상: 메인, 서비스 1개, 문의. 모바일 기준.
// 로컬 실행: LHCI_BASE_URL=http://localhost:3000 npx @lhci/cli autorun --config=lighthouserc.cjs

const baseUrl = (process.env.LHCI_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

module.exports = {
  ci: {
    collect: {
      url: ['/', '/services/place', '/contact'].map((path) => `${baseUrl}${path}`),
      numberOfRuns: 3,
      settings: {
        // 시뮬레이션(기본값)은 font-display: optional이어도 텍스트가 폰트를 기다린다고 계산해
        // LCP를 실제보다 1초가량 길게 잡는다. 실제로 회선을 제한해 측정한다.
        throttlingMethod: 'devtools',
        // 프리뷰·스테이징은 noindex라 크롤링 가능 여부 감사는 의미가 없다.
        skipAudits: ['is-crawlable'],
        ...(bypass
          ? { extraHeaders: JSON.stringify({ 'x-vercel-protection-bypass': bypass }) }
          : {}),
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 1 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    // 리포트를 외부 공개 저장소에 올리지 않고 파일로 남긴다 (워크플로가 아티팩트로 보관).
    upload: { target: 'filesystem', outputDir: '.lighthouseci/reports' },
  },
};
