import { notFound } from 'next/navigation';
import { MdxContent } from '@/components/sections/MdxContent';
import { PageHeader } from '@/components/sections/PageHeader';
import { Container } from '@/components/ui/Container';
import { getLegal } from '@/lib/content/loader';
import { formatDate, isoDate } from '@/lib/utils';

type LegalPageProps = {
  slug: 'privacy' | 'cookies';
};

/** 정책 페이지 공통 템플릿. 본문은 content/legal/*.mdx에서 관리한다. */
export function LegalPage({ slug }: LegalPageProps) {
  const doc = getLegal(slug);
  if (!doc) notFound();

  return (
    <>
      <PageHeader title={doc.title} crumbs={[{ name: doc.title, path: `/${doc.slug}` }]}>
        <p className="text-muted-foreground mt-4 text-sm">
          최종 수정일{' '}
          <time dateTime={isoDate(doc.updatedAt)}>{formatDate(doc.updatedAt)}</time>
        </p>
      </PageHeader>
      <Container className="py-section">
        <MdxContent source={doc.body} />
      </Container>
    </>
  );
}
