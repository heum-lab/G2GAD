import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { site } from '@/content/site';
import { isIndexable, publicEnv } from '@/lib/env';
import { TITLE_SUFFIX } from '@/lib/seo/metadata';
import './globals.css';

// Pretendard를 두 파일로 나눴다 (scripts/subset-font.py로 생성).
// main: 사이트에 쓰인 글자만, 미리 불러온다. ext: 나머지 KS X 1001 한글, 필요한 페이지에서만 받는다.
// main은 display: optional — 늦게 오면 그 페이지는 시스템 폰트로 두고 다시 그리지 않는다.
// swap이면 느린 모바일 회선에서 폰트 교체 시점이 LCP가 되어 예산(2.5s)을 넘는다.
const pretendard = localFont({
  src: './fonts/PretendardVariable.main.woff2',
  variable: '--font-pretendard',
  display: 'optional',
  weight: '400 800',
});

const pretendardExt = localFont({
  src: './fonts/PretendardVariable.ext.woff2',
  variable: '--font-pretendard-ext',
  display: 'swap',
  weight: '400 800',
  preload: false,
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: `${site.name}(G2G) | ${site.tagline}`,
    template: `%s | ${TITLE_SUFFIX}`,
  },
  description: site.tagline,
  applicationName: site.name,
  formatDetection: { telephone: false },
  robots: isIndexable ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0b1220',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${pretendardExt.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
