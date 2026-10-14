import type { MetadataRoute } from 'next';
import {
  getCases,
  getFaqs,
  getInsights,
  getLegal,
  getServices,
} from '@/lib/content/loader';
import { absoluteUrl } from '@/lib/env';

// lastModified는 각 콘텐츠의 updatedAt을 쓴다. (PRD A-08)
// 콘텐츠 날짜가 없는 정적 페이지는 lastModified를 넣지 않는다(부정확한 값보다 생략이 낫다).

function latest(dates: Date[]) {
  return dates.length > 0
    ? new Date(Math.max(...dates.map((date) => date.getTime())))
    : undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const services = getServices();
  const cases = getCases();
  const insights = getInsights();
  const faqs = getFaqs();

  const entry = (path: string, lastModified?: Date) => ({
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
  });

  const allDates = [
    ...services.map((item) => item.updatedAt),
    ...cases.map((item) => item.updatedAt),
    ...insights.map((item) => item.updatedAt),
    ...faqs.map((item) => item.updatedAt),
  ];

  return [
    entry('/', latest(allDates)),
    entry('/about'),
    entry('/services', latest(services.map((item) => item.updatedAt))),
    ...services.map((item) => entry(`/services/${item.slug}`, item.updatedAt)),
    entry('/cases', latest(cases.map((item) => item.updatedAt))),
    ...cases.map((item) => entry(`/cases/${item.slug}`, item.updatedAt)),
    entry('/insights', latest(insights.map((item) => item.updatedAt))),
    ...insights.map((item) => entry(`/insights/${item.slug}`, item.updatedAt)),
    entry('/faq', latest(faqs.map((item) => item.updatedAt))),
    entry('/partners'),
    entry('/contact'),
    entry('/careers'),
    entry('/privacy', getLegal('privacy')?.updatedAt),
    entry('/cookies', getLegal('cookies')?.updatedAt),
  ];
}
