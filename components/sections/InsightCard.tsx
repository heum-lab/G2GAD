import Link from 'next/link';
import type { Insight } from '@/lib/content/schemas';
import { formatDate, isoDate } from '@/lib/utils';

type InsightCardProps = {
  item: Pick<Insight, 'slug' | 'title' | 'summary' | 'category' | 'publishedAt'>;
  headingLevel?: 'h2' | 'h3';
};

export function InsightCard({ item, headingLevel: Heading = 'h3' }: InsightCardProps) {
  return (
    <Link
      href={`/insights/${item.slug}`}
      className="rounded-card border-border bg-background hover:border-primary flex h-full flex-col border p-6 transition-colors"
    >
      <p className="text-primary text-sm font-semibold">{item.category}</p>
      <Heading className="mt-2 text-xl font-bold">{item.title}</Heading>
      <p className="text-muted-foreground mt-2 flex-1 leading-7">{item.summary}</p>
      <time
        dateTime={isoDate(item.publishedAt)}
        className="text-muted-foreground mt-5 text-sm"
      >
        {formatDate(item.publishedAt)}
      </time>
    </Link>
  );
}
