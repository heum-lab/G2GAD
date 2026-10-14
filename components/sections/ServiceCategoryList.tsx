import Link from 'next/link';
import { serviceCategories, type ServiceCategory } from '@/content/site';
import type { Service } from '@/lib/content/schemas';

type ServiceCategoryListProps = {
  services: Pick<Service, 'slug' | 'title' | 'category'>[];
};

const categoryOrder = Object.keys(serviceCategories) as ServiceCategory[];

/** 전체 서비스를 카테고리 5종으로 묶어 보여 준다. (PRD H-05) */
export function ServiceCategoryList({ services }: ServiceCategoryListProps) {
  return (
    <dl className="divide-border border-border divide-y border-y">
      {categoryOrder.map((category) => {
        const items = services.filter((service) => service.category === category);
        if (items.length === 0) return null;
        return (
          <div
            key={category}
            className="grid gap-3 py-5 md:grid-cols-[10rem_1fr] md:items-center"
          >
            <dt className="text-lg font-bold">{serviceCategories[category]}</dt>
            <dd>
              <ul className="flex flex-wrap gap-2">
                {items.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="border-border hover:border-primary hover:text-primary inline-flex h-11 items-center rounded-full border px-4 font-medium transition-colors"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
