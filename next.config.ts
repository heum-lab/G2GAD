import type { NextConfig } from 'next';
import { redirects } from './redirects.mjs';
import { securityHeaders } from './security-headers.mjs';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  // 빌드 때 만들지 않은 slug 요청도 content 파일을 읽어 404를 판정하므로 함수 번들에 포함한다.
  outputFileTracingIncludes: {
    '/*': ['./content/**/*'],
  },
  async redirects() {
    return redirects;
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // 어드민은 검색엔진 색인·캐시 금지
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
