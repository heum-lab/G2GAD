import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { MdxContent } from '@/components/sections/MdxContent';
import { PageHeader } from '@/components/sections/PageHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { Container } from '@/components/ui/Container';
import { getInsight, getInsights, staticSlugs } from '@/lib/content/loader';
import { absoluteUrl } from '@/lib/env';
import { buildMetadata } from '@/lib/seo/metadata';
import { insightArticle } from '@/lib/seo/schema';
import { formatDate, isoDate } from '@/lib/utils';

export function generateStaticParams() {
  return staticSlugs(getInsights());
}

export async function generateMetadata({
  params,
}: PageProps<'/insights/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const item = getInsight(slug);
  if (!item) return {};
  return buildMetadata({
    title: item.title,
    description: item.description,
    path: `/insights/${item.slug}`,
    image: item.cover,
    type: 'article',
  });
}

// 인사이트 상세: 저자·작성일·수정일 표기 + Article 스키마 (PRD I-02)
export default async function InsightPage({ params }: PageProps<'/insights/[slug]'>) {
  const { slug } = await params;
  const item = getInsight(slug);
  if (!item) notFound();

  return (
    <>
      <PageHeader
        title={item.title}
        crumbs={[
          { name: '인사이트', path: '/insights' },
          { name: item.title, path: `/insights/${item.slug}` },
        ]}
      >
        <div className="border-primary bg-background rounded-card mt-6 max-w-prose border-l-4 p-5">
          <p className="text-primary text-sm font-bold">요약</p>
          <p className="mt-1.5 text-lg leading-8">{item.summary}</p>
        </div>
        <p className="text-muted-foreground mt-4 text-sm">
          {item.author} · 작성일{' '}
          <time dateTime={isoDate(item.publishedAt)}>{formatDate(item.publishedAt)}</time>{' '}
          · 수정일{' '}
          <time dateTime={isoDate(item.updatedAt)}>{formatDate(item.updatedAt)}</time>
        </p>
      </PageHeader>

      <Container className="py-section md:py-section-lg">
        <article>
          <MdxContent source={item.body} />
        </article>
        {item.tags.length > 0 ? (
          <ul aria-label="태그" className="mt-10 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <li key={tag} className="bg-muted rounded-full px-3 py-1 text-sm">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </Container>

      <CtaBanner location="insight" />
      <JsonLd data={insightArticle(item, absoluteUrl)} />
    </>
  );
}
