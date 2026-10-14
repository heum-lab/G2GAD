import Link from 'next/link';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { FaqList } from '@/components/sections/FaqList';
import { PageHeader } from '@/components/sections/PageHeader';
import { Section } from '@/components/sections/Section';
import { JsonLd } from '@/components/seo/JsonLd';
import { getFaqs, getServices, selectFaqPageMarkupFaqs } from '@/lib/content/loader';
import { faqCategories } from '@/lib/content/schemas';
import { buildMetadata } from '@/lib/seo/metadata';
import { faqPage } from '@/lib/seo/schema';

export const metadata = buildMetadata({
  title: '자주 묻는 질문',
  description:
    '굿투그레이트(G2G) 마케팅 서비스의 비용, 계약과 진행 기간, 서비스별 진행 방식에 대해 자주 묻는 질문과 답변을 모았습니다. 원하는 답이 없으면 문의로 알려 주세요.',
  path: '/faq',
});

const generalCategories = ['common', 'cost', 'contract'] as const;

export default function FaqPage() {
  const faqs = getFaqs();
  const services = getServices();
  const markupFaqs = selectFaqPageMarkupFaqs(faqs);

  return (
    <>
      <PageHeader
        title="자주 묻는 질문"
        lead="비용, 계약, 서비스별 진행 방식에 대한 질문을 모았습니다."
        crumbs={[{ name: 'FAQ', path: '/faq' }]}
      />

      {generalCategories.map((category, index) => {
        const items = faqs.filter(
          (faq) => faq.category === category && faq.services.length === 0,
        );
        if (items.length === 0) return null;
        return (
          <Section
            key={category}
            id={`faq-${category}`}
            title={faqCategories[category]}
            tone={index % 2 === 1 ? 'muted' : 'default'}
          >
            <FaqList faqs={items} />
          </Section>
        );
      })}

      <Section id="faq-service" title={faqCategories.service} tone="muted">
        <div className="space-y-12">
          {services.map((service) => {
            const items = faqs.filter((faq) => faq.services[0] === service.slug);
            if (items.length === 0) return null;
            return (
              <div key={service.slug}>
                <h3 className="text-xl font-bold">
                  <Link
                    href={`/services/${service.slug}`}
                    className="hover:text-primary underline-offset-4 hover:underline"
                  >
                    {service.title}
                  </Link>
                </h3>
                <div className="mt-3">
                  <FaqList faqs={items} headingLevel="h4" />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <CtaBanner title="원하는 답을 찾지 못하셨나요?" location="faq" />

      {/* 서비스 전용 질문은 각 서비스 상세에서 마크업한다. (ARCHITECTURE §6.2) */}
      {markupFaqs.length > 0 ? <JsonLd data={faqPage(markupFaqs)} /> : null}
    </>
  );
}
