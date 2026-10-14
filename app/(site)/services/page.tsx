import { CtaBanner } from '@/components/sections/CtaBanner';
import { PageHeader } from '@/components/sections/PageHeader';
import { Section } from '@/components/sections/Section';
import { ServiceCard } from '@/components/sections/ServiceCard';
import { serviceCategories, type ServiceCategory } from '@/content/site';
import { getServices } from '@/lib/content/loader';
import { buildMetadata } from '@/lib/seo/metadata';

const crumbs = [{ name: '서비스', path: '/services' }];

export const metadata = buildMetadata({
  title: '서비스 전체',
  description:
    'AI 검색 최적화(AEO·GEO), 플레이스, 리워드 트래픽, 리뷰·카페·블로그 바이럴, 언론보도, 라이브커머스, 인플루언서, 검색광고까지 굿투그레이트(G2G)가 제공하는 마케팅 서비스를 한눈에 확인하세요.',
  path: '/services',
});

const categoryOrder = Object.keys(serviceCategories) as ServiceCategory[];

export default function ServicesPage() {
  const services = getServices();

  return (
    <>
      <PageHeader
        title="서비스"
        lead="목표와 업종에 맞춰 필요한 채널을 조합합니다. 서비스를 선택하면 진행 방식과 자주 묻는 질문을 확인할 수 있습니다."
        crumbs={crumbs}
      />
      {categoryOrder.map((category, index) => {
        const items = services.filter((service) => service.category === category);
        if (items.length === 0) return null;
        return (
          <Section
            key={category}
            id={`services-${category}`}
            title={serviceCategories[category]}
            tone={index % 2 === 1 ? 'muted' : 'default'}
          >
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((service) => (
                <li key={service.slug}>
                  <ServiceCard service={service} />
                </li>
              ))}
            </ul>
          </Section>
        );
      })}
      <CtaBanner location="services" />
    </>
  );
}
