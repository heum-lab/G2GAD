import type { Metadata } from 'next';
import { LegalPage } from '@/components/sections/LegalPage';
import { getLegal } from '@/lib/content/loader';
import { buildMetadata } from '@/lib/seo/metadata';

export function generateMetadata(): Metadata {
  const doc = getLegal('cookies');
  if (!doc) return {};
  return buildMetadata({
    title: doc.title,
    description: doc.description,
    path: '/cookies',
  });
}

export default function Page() {
  return <LegalPage slug="cookies" />;
}
