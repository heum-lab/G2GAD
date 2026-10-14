import { CtaBanner } from '@/components/sections/CtaBanner';
import { InsightCard } from '@/components/sections/InsightCard';
import { PageHeader } from '@/components/sections/PageHeader';
import { Container } from '@/components/ui/Container';
import { getInsights } from '@/lib/content/loader';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: '인사이트',
  description:
    '굿투그레이트(G2G)가 정리한 마케팅 이야기입니다. AI 검색 최적화(AEO·GEO), 플레이스, 검색광고 등 실무에서 바로 참고할 수 있는 내용을 질문과 답변 중심으로 전합니다.',
  path: '/insights',
});

export default function InsightsPage() {
  const insights = getInsights();

  return (
    <>
      <PageHeader
        title="인사이트"
        lead="실무에서 자주 받는 질문을 중심으로 마케팅 이야기를 정리합니다."
        crumbs={[{ name: '인사이트', path: '/insights' }]}
      />
      <Container className="py-section md:py-section-lg">
        {insights.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((item) => (
              <li key={item.slug}>
                <InsightCard item={item} headingLevel="h2" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-lg leading-8">
            글을 준비하고 있습니다. 궁금한 주제가 있으면 문의로 알려 주세요.
          </p>
        )}
      </Container>
      <CtaBanner location="insights" />
    </>
  );
}
