import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { buttonVariants } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <Container className="py-section-lg text-center">
          <p className="text-primary text-lg font-bold">404</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-5xl">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg leading-8">
            주소가 바뀌었거나 삭제된 페이지입니다. 아래에서 원하는 정보를 찾아보세요.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/services" className={buttonVariants({ variant: 'outline' })}>
              서비스 보기
            </Link>
            <Link href="/" className={buttonVariants()}>
              홈으로
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
