import { Container } from '@/components/ui/Container';
import type { SiteStat } from '@/content/site';

type StatsCounterProps = {
  stats: readonly SiteStat[];
};

/** 실적 수치 (PRD H-02). 수치는 기준일과 함께 표기한다. (CONVENTIONS §7.2) */
export function StatsCounter({ stats }: StatsCounterProps) {
  return (
    <section aria-label="주요 실적" className="border-border border-b">
      <Container>
        <dl className="grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4 md:py-14">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-1 text-center">
              <dt className="text-muted-foreground text-sm">
                {stat.label}
                <span className="block text-xs">({stat.asOf})</span>
              </dt>
              <dd className="text-primary text-3xl font-extrabold md:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
