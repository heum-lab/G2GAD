import { TrackedLink } from '@/components/layout/TrackedLink';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { PageHeader } from '@/components/sections/PageHeader';
import { Section } from '@/components/sections/Section';
import { ServiceCategoryList } from '@/components/sections/ServiceCategoryList';
import { offices, phoneHref, site } from '@/content/site';
import { getServices } from '@/lib/content/loader';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: '회사소개',
  description:
    '굿투그레이트(G2G)는 AEO·GEO·AI 기반 종합광고대행사입니다. 회사 정보와 제공 서비스, 서울 용산구 사무실 오시는 길, 대표번호와 사업자 정보를 안내합니다.',
  path: '/about',
});

// TODO: 미션·가치·연혁은 G2G가 내용을 제공하면 섹션으로 추가한다. (PRD §4.1)
export default function AboutPage() {
  const companyInfo = [
    { label: '상호', value: site.legalName },
    { label: '대표이사', value: site.ceo },
    { label: '다른 표기', value: site.alternateNames.join(', ') },
    { label: '사업자등록번호', value: site.bizRegNo },
    { label: '통신판매업신고', value: site.ecommerceRegNo },
    {
      label: '직원 수',
      value: withAsOf(`${site.employees.count}명`, site.employees.asOf),
    },
    {
      label: '연간 매출',
      value: withAsOf(site.annualRevenue.value, site.annualRevenue.asOf),
    },
  ];

  return (
    <>
      <PageHeader
        title="회사소개"
        lead={`${site.name}(G2G)는 ${site.tagline}입니다.`}
        crumbs={[{ name: '회사소개', path: '/about' }]}
      />

      <Section id="about-services" title="굿투그레이트는 어떤 일을 하나요?">
        <p className="max-w-prose text-lg leading-8">
          {site.name}(G2G)는 AI 검색 최적화(AEO·GEO)를 중심으로 검색, 바이럴, 인플루언서,
          광고 영역의 마케팅을 수행합니다. 아래에서 서비스를 선택하면 진행 방식을 확인할
          수 있습니다.
        </p>
        <div className="mt-8">
          <ServiceCategoryList services={getServices()} />
        </div>
      </Section>

      <Section id="about-company" title="회사 정보" tone="muted">
        <dl className="divide-border border-border max-w-prose divide-y border-y">
          {companyInfo.map((item) => (
            <div key={item.label} className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr]">
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="about-location" title="오시는 길">
        <dl className="max-w-prose space-y-4 text-lg leading-8">
          {offices.map((office) => (
            <div key={office.name}>
              <dt className="font-semibold">{office.name}</dt>
              <dd>
                <address className="not-italic">{office.address}</address>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 max-w-prose text-lg leading-8">
          대표번호{' '}
          <TrackedLink
            href={phoneHref}
            event="click_call"
            location="about"
            className="text-primary font-semibold underline underline-offset-2"
          >
            {site.phone}
          </TrackedLink>
        </p>
      </Section>

      <CtaBanner location="about" />
    </>
  );
}

function withAsOf(value: string, asOf: string) {
  return asOf ? `${value} (${asOf})` : value;
}
