import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { serviceCategories } from '@/content/site';
import type { Service } from '@/lib/content/schemas';

type ServiceCardProps = {
  service: Pick<Service, 'slug' | 'title' | 'summary' | 'category'>;
  headingLevel?: 'h2' | 'h3';
};

export function ServiceCard({ service, headingLevel: Heading = 'h3' }: ServiceCardProps) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group rounded-card border-border bg-background hover:border-primary flex h-full flex-col border p-6 transition-colors"
    >
      <span className="bg-primary-soft text-primary rounded-control self-start px-2.5 py-1 text-sm font-semibold">
        {serviceCategories[service.category]}
      </span>
      <Heading className="mt-4 text-xl font-bold">{service.title}</Heading>
      <p className="text-muted-foreground mt-2 flex-1 leading-7">{service.summary}</p>
      <span className="text-primary mt-5 inline-flex items-center gap-1 font-semibold">
        자세히
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}
