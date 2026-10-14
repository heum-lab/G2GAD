import type { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import type { Crumb } from '@/lib/seo/schema';

type PageHeaderProps = {
  title: string;
  lead?: string;
  crumbs: Crumb[];
  children?: ReactNode;
};

/** 하위 페이지 공통 머리 영역. 페이지의 유일한 H1을 담는다. */
export function PageHeader({ title, lead, crumbs, children }: PageHeaderProps) {
  return (
    <div className="bg-muted border-border border-b">
      <Container className="py-10 md:py-14">
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight md:text-5xl">
          {title}
        </h1>
        {lead ? (
          <p className="text-muted-foreground mt-4 max-w-prose text-lg leading-8">
            {lead}
          </p>
        ) : null}
        {children}
      </Container>
    </div>
  );
}
