import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { absoluteUrl } from '@/lib/env';
import { breadcrumb, type Crumb } from '@/lib/seo/schema';

type BreadcrumbsProps = {
  /** 홈을 제외한 경로. 마지막 항목이 현재 페이지다. */
  items: Crumb[];
};

/** Breadcrumb UI + BreadcrumbList 스키마 (PRD C-07) */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const crumbs: Crumb[] = [{ name: '홈', path: '/' }, ...items];

  return (
    <>
      <nav aria-label="현재 위치" className="text-muted-foreground text-sm">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {isLast ? (
                  <span aria-current="page" className="text-foreground font-medium">
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.path}
                    className="hover:text-foreground underline-offset-2 hover:underline"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumb(crumbs, absoluteUrl)} />
    </>
  );
}
