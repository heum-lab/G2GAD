import Link from 'next/link';
import { CaseCard } from '@/components/sections/CaseCard';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { FaqList } from '@/components/sections/FaqList';
import { Hero } from '@/components/sections/Hero';
import { InsightCard } from '@/components/sections/InsightCard';
import { ProcessSteps } from '@/components/sections/ProcessSteps';
import { Section } from '@/components/sections/Section';
import { ServiceCard } from '@/components/sections/ServiceCard';
import { ServiceCategoryList } from '@/components/sections/ServiceCategoryList';
import { StatsCounter } from '@/components/sections/StatsCounter';
import { site } from '@/content/site';
import { getCases, getFaqs, getInsights, getServices } from '@/lib/content/loader';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: `${site.name}(G2G) | ${site.tagline}`,
  description:
    '굿투그레이트(G2G)는 AEO·GEO 기반 AI 검색 최적화와 플레이스, 리뷰, 인플루언서 마케팅을 진단부터 집행, 리포트까지 수행하는 종합광고대행사입니다.',
  path: '/',
  absoluteTitle: true,
});

// 진행 프로세스 5단계 (PRD H-07)
const processSteps = [
  { step: '상담', desc: '현재 상황과 목표, 예산 범위를 듣습니다.' },
  { step: '진단', desc: '검색 노출과 채널 현황을 점검해 과제를 정리합니다.' },
  { step: '제안', desc: '우선순위에 맞춘 채널 구성과 견적을 제안합니다.' },
  { step: '집행', desc: '합의한 계획에 따라 캠페인을 운영합니다.' },
  { step: '리포트', desc: '성과를 정리해 공유하고 다음 계획에 반영합니다.' },
] as const;

const linkClass =
  'text-primary mt-8 inline-block font-semibold underline underline-offset-4';

export default function HomePage() {
  const services = getServices();
  const featuredServices = services.filter((service) => service.featured);
  const cases = getCases()
    .filter((item) => item.featured)
    .slice(0, 3);
  const faqs = getFaqs()
    .filter((faq) => faq.featured)
    .slice(0, 5);
  const insights = getInsights().slice(0, 3);

  return (
    <>
      <Hero />

      {/* 실적 수치는 G2G가 제공하기 전까지 숨긴다. (PRD §9) */}
      {site.stats.length > 0 ? <StatsCounter stats={site.stats} /> : null}

      <Section
        id="featured-services"
        title="주력 서비스"
        lead="검색 결과와 AI 답변에서 브랜드가 선택되도록 만드는 핵심 서비스입니다."
      >
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredServices.map((service) => (
            <li key={service.slug}>
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="all-services"
        title="전체 서비스"
        lead="목표와 업종에 맞춰 필요한 채널만 조합할 수 있습니다."
        tone="muted"
      >
        <ServiceCategoryList services={services} />
      </Section>

      {cases.length > 0 ? (
        <Section id="case-highlights" title="성공사례">
          <ul className="grid gap-5 md:grid-cols-3">
            {cases.map((item) => (
              <li key={item.slug}>
                <CaseCard item={item} />
              </li>
            ))}
          </ul>
          <Link href="/cases" className={linkClass}>
            성공사례 전체 보기
          </Link>
        </Section>
      ) : null}

      <Section
        id="process"
        title="진행 프로세스"
        lead="상담부터 리포트까지 다섯 단계로 진행합니다."
      >
        <ProcessSteps steps={processSteps} />
      </Section>

      {faqs.length > 0 ? (
        <Section id="home-faq" title="자주 묻는 질문" tone="muted">
          <FaqList faqs={faqs} />
          <Link href="/faq" className={linkClass}>
            자주 묻는 질문 전체 보기
          </Link>
        </Section>
      ) : null}

      {insights.length > 0 ? (
        <Section id="latest-insights" title="인사이트">
          <ul className="grid gap-5 md:grid-cols-3">
            {insights.map((item) => (
              <li key={item.slug}>
                <InsightCard item={item} />
              </li>
            ))}
          </ul>
          <Link href="/insights" className={linkClass}>
            인사이트 전체 보기
          </Link>
        </Section>
      ) : null}

      <CtaBanner location="home" />
    </>
  );
}
