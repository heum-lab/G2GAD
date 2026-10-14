import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// 어드민(문의 관리). 사이트 헤더·푸터 없이 단독 레이아웃을 쓴다. 검색엔진 색인 금지.
export const metadata: Metadata = {
  title: { default: '문의 관리', template: '%s | G2G 관리자' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="bg-muted min-h-dvh">{children}</div>;
}
