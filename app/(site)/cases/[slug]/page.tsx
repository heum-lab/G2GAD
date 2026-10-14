import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { MdxContent } from '@/components/sections/MdxContent';
import { PageHeader } from '@/components/sections/PageHeader';
import { Section } from '@/components/sections/Section';
import { JsonLd } from '@/components/seo/JsonLd';
import { Container } from '@/components/ui/Container';
import { getCase, getCases, getServices, staticSlugs } from '@/lib/content/loader';
import { absoluteUrl } from '@/lib/env';
import { buildMetadata } from '@/lib/seo/metadata';
import { caseArticle } from '@/lib/seo/schema';
import { formatDate, isoDate } from '@/lib/utils';

export function generateStaticParams() {
  return staticSlugs(getCases());
}

export async function generateMetadata({
  params,
}: PageProps<'/cases/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const item = getCase(slug);
  if (!item) return {};
  return buildMetadata({
    title: item.title,
    description: item.description,
    path: `/cases/${item.slug}`,
    image: item.cover,
    type: 'article',
  });
}

// 사례 상세: 고객 개요 → 과제·전략(본문) → 결과(수치) → 사용 서비스 (PRD CS-02)
export default async function CasePage({ params }: PageProps<'/cases/[slug]'>) {
  const { slug } = await params;
  const item = getCase(slug);
  if (!item) notFound();

  const services = getServices().filter((service) =>
    item.services.includes(service.slug),
  );

  return (
    <>
      <PageHeader
        title={item.title}
        lead={item.summary}
        crumbs={[
          { name: '성공사례', path: '/cases' },
          { name: item.title, path: `/cases/${item.slug}` },
        ]}
      >
        <dl className="text-muted-foreground mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div className="flex gap-1.5">
            <dt>고객</dt>
            <dd className="text-foreground font-medium">{item.client}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>업종</dt>
            <dd className="text-foreground font-medium">{item.industry}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>진행 기간</dt>
            <dd className="text-foreground font-medium">{item.period}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>작성</dt>
            <dd className="text-foreground font-medium">
              {item.author} ·{' '}
              <time dateTime={isoDate(item.publishedAt)}>
                {formatDate(item.publishedAt)}
              </time>
            </dd>
          </div>
        </dl>
      </PageHeader>

      <Section id="case-results" title="결과">
        <div className="overflow-x-auto">
          <table className="border-border w-full max-w-prose border-collapse border-y text-left text-lg">
            <thead>
              <tr className="border-border border-b">
                <th scope="col" className="py-3 pr-4 font-semibold">
                  지표
                </th>
                <th scope="col" className="py-3 pr-4 font-semibold">
                  진행 전
                </th>
                <th scope="col" className="py-3 font-semibold">
                  진행 후
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {item.metrics.map((metric) => (
                <tr key={metric.label}>
                  <th scope="row" className="py-3 pr-4 font-medium">
                    {metric.label}
                  </th>
                  <td className="py-3 pr-4">{metric.before}</td>
                  <td className="text-primary py-3 font-semibold">{metric.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="border-border border-t">
        <Container className="py-section md:py-section-lg">
          <MdxContent source={item.body} />
        </Container>
      </div>

      <Section id="case-services" title="사용 서비스" tone="muted">
        <ul className="flex flex-wrap gap-2">
          {services.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="border-border bg-background hover:border-primary inline-flex h-11 items-center rounded-full border px-4 font-medium"
              >
                {service.title}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBanner service={item.services[0]} location="case" />
      <JsonLd data={caseArticle(item, absoluteUrl)} />
    </>
  );
}
