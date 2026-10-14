import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/utils';

type SectionProps = {
  /** aria-labelledby로 연결할 제목 id */
  id: string;
  title: string;
  lead?: string;
  tone?: 'default' | 'muted';
  children: ReactNode;
};

/** 제목(H2)이 있는 페이지 섹션. (CONVENTIONS §6) */
export function Section({ id, title, lead, tone = 'default', children }: SectionProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn('py-section md:py-section-lg', tone === 'muted' && 'bg-muted')}
    >
      <Container>
        <h2 id={id} className="text-2xl font-bold tracking-tight md:text-4xl">
          {title}
        </h2>
        {lead ? (
          <p className="text-muted-foreground mt-3 max-w-prose text-lg leading-8">
            {lead}
          </p>
        ) : null}
        <div className="mt-8 md:mt-10">{children}</div>
      </Container>
    </section>
  );
}
