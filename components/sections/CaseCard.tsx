import Link from 'next/link';
import type { Case } from '@/lib/content/schemas';

type CaseCardProps = {
  item: Pick<Case, 'slug' | 'title' | 'client' | 'industry' | 'metrics' | 'period'>;
  headingLevel?: 'h2' | 'h3';
};

/** 성공사례 카드. Before → After 수치를 보여 준다. (PRD H-06) */
export function CaseCard({ item, headingLevel: Heading = 'h3' }: CaseCardProps) {
  return (
    <Link
      href={`/cases/${item.slug}`}
      className="rounded-card border-border bg-background hover:border-primary flex h-full flex-col border p-6 transition-colors"
    >
      <p className="text-muted-foreground text-sm">
        {item.industry} · {item.client}
      </p>
      <Heading className="mt-2 text-xl font-bold">{item.title}</Heading>
      <dl className="mt-5 space-y-3">
        {item.metrics.slice(0, 3).map((metric) => (
          <div key={metric.label}>
            <dt className="text-muted-foreground text-sm">{metric.label}</dt>
            <dd className="text-lg font-semibold">
              {metric.before} <span aria-hidden="true">→</span>
              <span className="sr-only">에서</span>{' '}
              <span className="text-primary">{metric.after}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-muted-foreground mt-auto pt-5 text-sm">
        진행 기간 {item.period}
      </p>
    </Link>
  );
}
