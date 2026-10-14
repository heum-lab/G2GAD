import { Check } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CaseCard } from '@/components/sections/CaseCard';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { FaqList } from '@/components/sections/FaqList';
import { MdxContent } from '@/components/sections/MdxContent';
import { PageHeader } from '@/components/sections/PageHeader';
import { ProcessSteps } from '@/components/sections/ProcessSteps';
import { Section } from '@/components/sections/Section';
import { ServiceCard } from '@/components/sections/ServiceCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { Container } from '@/components/ui/Container';
import {
  getCases,
  getFaqsForService,
  getService,
  getServices,
  selectServiceMarkupFaqs,
  staticSlugs,
} from '@/lib/content/loader';
import { absoluteUrl } from '@/lib/env';
import { buildMetadata } from '@/lib/seo/metadata';
import { faqPage, service as serviceSchema } from '@/lib/seo/schema';
import { formatDate, isoDate } from '@/lib/utils';

export function generateStaticParams() {
  return staticSlugs(getServices());
}

export async function generateMetadata({
  params,
}: PageProps<'/services/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return buildMetadata({
    title: service.title,
    description: service.description,
    path: `/services/${service.slug}`,
  });
}

// 서비스 상세 공통 템플릿: "답변 우선" 구조 (PRD §5.3)
export default async function ServicePage({ params }: PageProps<'/services/[slug]'>) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const faqs = getFaqsForService(service);
  const markupFaqs = selectServiceMarkupFaqs(faqs, service.slug);
  const cases = getCases()
    .filter((item) => item.services.includes(service.slug))
    .slice(0, 2);
  const related = getServices().filter((item) =>
    service.relatedServices.includes(item.slug),
  );

  return (
    <>
      <PageHeader
        title={service.title}
        crumbs={[
          { name: '서비스', path: '/services' },
          { name: service.title, path: `/services/${service.slug}` },
        ]}
      >
        <div className="border-primary bg-background rounded-card mt-6 max-w-prose border-l-4 p-5">
          <p className="text-primary text-sm font-bold">요약</p>
          <p className="mt-1.5 text-lg leading-8">{service.summary}</p>
        </div>
        <p className="text-muted-foreground mt-4 text-sm">
          최종 수정일{' '}
          <time dateTime={isoDate(service.updatedAt)}>
            {formatDate(service.updatedAt)}
          </time>
        </p>
      </PageHeader>

      <Section id="for-whom" title="이런 분께 필요합니다">
        <ul className="max-w-prose space-y-3">
          {service.forWhom.map((item) => (
            <li key={item} className="flex gap-3 text-lg leading-8">
              <Check aria-hidden="true" className="text-primary mt-1.5 size-5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {service.body ? (
        <div className="border-border border-t">
          <Container className="py-section md:py-section-lg">
            <MdxContent source={service.body} />
          </Container>
        </div>
      ) : null}

      <Section id="process" title="진행 방식" tone="muted">
        <ProcessSteps steps={service.process} />
      </Section>

      {cases.length > 0 ? (
        <Section id="service-cases" title="성과 사례">
          <ul className="grid gap-5 md:grid-cols-2">
            {cases.map((item) => (
              <li key={item.slug}>
                <CaseCard item={item} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {service.pricing ? (
        <Section id="pricing" title="요금 안내">
          <p className="max-w-prose text-lg leading-8">
            <strong className="font-semibold">{service.pricing}</strong>
            <br />
            업종, 경쟁 강도, 목표, 진행 기간에 따라 범위가 달라집니다. 상담에서 현재
            상황을 확인한 뒤 견적을 안내해 드립니다.
          </p>
        </Section>
      ) : null}

      {faqs.length > 0 ? (
        <Section id="service-faq" title={`${service.title} 자주 묻는 질문`} tone="muted">
          <FaqList faqs={faqs} />
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section id="related-services" title="함께 보면 좋은 서비스">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <ServiceCard service={item} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <CtaBanner
        title={`${service.title}, 우리 상황에 맞을까요?`}
        service={service.slug}
        location="service"
      />

      <JsonLd
        data={[
          serviceSchema(service, absoluteUrl),
          ...(markupFaqs.length > 0 ? [faqPage(markupFaqs)] : []),
        ]}
      />
    </>
  );
}
