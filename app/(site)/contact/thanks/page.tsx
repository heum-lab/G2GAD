import Link from 'next/link';
import { TrackedLink } from '@/components/layout/TrackedLink';
import { buttonVariants } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { phoneHref, site } from '@/content/site';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: '문의 접수 완료',
  description:
    '굿투그레이트(G2G)에 문의가 접수되었습니다. 담당자가 남겨 주신 내용을 확인한 뒤 연락드립니다. 급한 문의는 대표번호로 전화해 주시면 바로 상담해 드립니다.',
  path: '/contact/thanks',
  noindex: true,
});

// 전환 이벤트는 여기서 보내지 않는다. 제출 성공 응답을 받은 폼이 1회 보낸다. (ARCHITECTURE §7.1)
export default function ContactThanksPage() {
  return (
    <Container className="py-section-lg text-center">
      <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
        문의가 접수되었습니다
      </h1>
      <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg leading-8">
        남겨 주신 내용을 확인한 뒤 담당자가 연락드립니다. 급한 문의는{' '}
        <TrackedLink
          href={phoneHref}
          event="click_call"
          location="thanks"
          className="text-primary font-semibold underline underline-offset-2"
        >
          {site.phone}
        </TrackedLink>
        로 전화해 주세요.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/services" className={buttonVariants({ variant: 'outline' })}>
          서비스 둘러보기
        </Link>
        <Link href="/" className={buttonVariants()}>
          홈으로
        </Link>
      </div>
    </Container>
  );
}
