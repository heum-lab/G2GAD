import { CaseFilter } from '@/components/sections/CaseFilter';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { PageHeader } from '@/components/sections/PageHeader';
import { Container } from '@/components/ui/Container';
import { getCases, getServices } from '@/lib/content/loader';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: '성공사례',
  description:
    '굿투그레이트(G2G)가 진행한 마케팅 성공사례입니다. 업종별 과제와 전략, 집행 전후의 수치 변화를 사례별로 정리해 어떤 방식으로 성과를 만들었는지 확인할 수 있습니다.',
  path: '/cases',
});

export default function CasesPage() {
  const cases = getCases();
  const serviceNames = Object.fromEntries(
    getServices().map((service) => [service.slug, service.title]),
  );

  return (
    <>
      <PageHeader
        title="성공사례"
        lead="과제, 전략, 결과를 사례별로 정리했습니다."
        crumbs={[{ name: '성공사례', path: '/cases' }]}
      />
      <Container className="py-section md:py-section-lg">
        {cases.length > 0 ? (
          <CaseFilter
            cases={cases.map(
              ({ slug, title, client, industry, metrics, period, services }) => ({
                slug,
                title,
                client,
                industry,
                metrics,
                period,
                services,
              }),
            )}
            serviceNames={serviceNames}
          />
        ) : (
          <p className="text-muted-foreground text-lg leading-8">
            공개 가능한 사례를 정리하고 있습니다. 업종과 목표가 비슷한 사례가 궁금하시면
            문의해 주세요. 상담에서 안내해 드립니다.
          </p>
        )}
      </Container>
      <CtaBanner location="cases" />
    </>
  );
}
