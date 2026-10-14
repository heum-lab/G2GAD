import { TrackedLink } from '@/components/layout/TrackedLink';
import { buttonVariants } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { phoneHref, site } from '@/content/site';

type CtaBannerProps = {
  title?: string;
  /** 문의 폼에서 미리 선택할 서비스 slug (PRD F-02) */
  service?: string;
  location: string;
};

/** 하단 CTA: 문의 폼 바로가기 + 전화번호 (PRD H-10) */
export function CtaBanner({
  title = '우리 브랜드에 맞는 전략이 궁금하신가요?',
  service,
  location,
}: CtaBannerProps) {
  const href = service ? `/contact?service=${service}` : '/contact';

  return (
    <section
      aria-labelledby="cta-banner-title"
      className="bg-primary text-primary-foreground"
    >
      <Container className="py-section flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2
            id="cta-banner-title"
            className="text-2xl font-bold tracking-tight md:text-3xl"
          >
            {title}
          </h2>
          <p className="mt-2 text-lg">
            현재 상황을 알려 주시면 진단 후 맞춤 제안을 드립니다. 전화 상담{' '}
            <TrackedLink
              href={phoneHref}
              event="click_call"
              location={`${location}_cta`}
              className="font-bold underline underline-offset-2"
            >
              {site.phone}
            </TrackedLink>
          </p>
        </div>
        <TrackedLink
          href={href}
          event="cta_click"
          location={`${location}_cta`}
          className={buttonVariants({ variant: 'inverse', size: 'lg' })}
        >
          문의하기
        </TrackedLink>
      </Container>
    </section>
  );
}
