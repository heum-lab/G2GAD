import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileCtaBar } from '@/components/layout/MobileCtaBar';

// 이 그룹의 모든 페이지는 완전한 정적 출력이어야 한다. 요청 시점 렌더링이 섞이면 빌드가 실패한다.
// (ARCHITECTURE §5)
export const ensureStatic = 'navigation';

export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <a
        href="#main"
        className="bg-primary text-primary-foreground rounded-control sr-only z-50 px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        본문으로 건너뛰기
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileCtaBar />
    </>
  );
}
