import { TrackedLink } from '@/components/layout/TrackedLink';
import { buttonVariants } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { site } from '@/content/site';

/** 메인 Hero (PRD H-01). 소개서 기능(C-04) 출시 전에는 두 번째 CTA가 "서비스 보기"다. */
export function Hero() {
  return (
    <div className="bg-ink text-ink-foreground">
      <Container className="py-20 md:py-32">
        <p className="text-ink-muted text-base font-semibold">{site.tagline}</p>
        <h1 className="mt-4 max-w-4xl text-4xl leading-tight font-extrabold tracking-tight md:text-6xl md:leading-tight">
          AI가 답할 때,
          <br />
          우리 브랜드가 인용되도록
        </h1>
        <p className="text-ink-muted mt-6 max-w-2xl text-lg leading-8 md:text-xl">
          {site.name}(G2G)는 AI 검색 최적화(AEO·GEO)부터 플레이스, 리뷰 마케팅,
          인플루언서까지 검색과 구매로 이어지는 마케팅을 설계하고 집행합니다.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <TrackedLink
            href="/contact"
            event="cta_click"
            location="hero_primary"
            className={buttonVariants({ variant: 'inverse', size: 'lg' })}
          >
            무료 진단 받기
          </TrackedLink>
          <TrackedLink
            href="/services"
            event="cta_click"
            location="hero_secondary"
            className={buttonVariants({
              variant: 'ghost',
              size: 'lg',
              className: 'text-ink-foreground hover:text-ink border-ink-muted border',
            })}
          >
            서비스 보기
          </TrackedLink>
        </div>
      </Container>
    </div>
  );
}
