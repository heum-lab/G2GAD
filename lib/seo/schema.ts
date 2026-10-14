import { site, type PostalAddress } from '@/content/site';
import type { Case, Faq, Insight, Service } from '@/lib/content/schemas';

// JSON-LD 생성 함수. 순수 함수이며 페이지에서 객체를 직접 작성하지 않는다. (CONVENTIONS §8)
// 값은 화면에 보이는 내용과 일치해야 한다.

export type JsonLdObject = Record<string, unknown>;

type UrlResolver = (path?: string) => string;

const CONTEXT = 'https://schema.org';

function organizationId(url: UrlResolver) {
  return `${url('/')}#organization`;
}

function postalAddress(address: PostalAddress) {
  return {
    '@type': 'PostalAddress',
    streetAddress: address.street,
    addressLocality: address.locality,
    addressRegion: address.region,
    addressCountry: address.country,
  };
}

export function organization(url: UrlResolver): JsonLdObject {
  return {
    '@context': CONTEXT,
    '@type': ['Organization', 'ProfessionalService'],
    '@id': organizationId(url),
    name: site.name,
    legalName: site.legalName,
    alternateName: [...site.alternateNames],
    description: site.tagline,
    url: url('/'),
    logo: url('/brand/logo-square.png'),
    telephone: site.phone,
    taxID: site.bizRegNo,
    numberOfEmployees: { '@type': 'QuantitativeValue', value: site.employees.count },
    address: postalAddress(site.address),
    department: site.branches.map((branch) => ({
      '@type': 'Organization',
      name: `${site.name} ${branch.name}`,
      address: postalAddress(branch.address),
    })),
    ...(site.sameAs.length > 0 ? { sameAs: [...site.sameAs] } : {}),
  };
}

export function webSite(url: UrlResolver): JsonLdObject {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    '@id': `${url('/')}#website`,
    name: site.name,
    alternateName: [...site.alternateNames],
    url: url('/'),
    inLanguage: 'ko-KR',
    publisher: { '@id': organizationId(url) },
  };
}

export function service(
  item: Pick<Service, 'slug' | 'title' | 'description'>,
  url: UrlResolver,
): JsonLdObject {
  return {
    '@context': CONTEXT,
    '@type': 'Service',
    name: item.title,
    serviceType: item.title,
    description: item.description,
    url: url(`/services/${item.slug}`),
    areaServed: { '@type': 'Country', name: 'KR' },
    provider: { '@id': organizationId(url) },
  };
}

export function faqPage(faqs: Pick<Faq, 'question' | 'answer'>[]): JsonLdObject {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

type ArticleInput = {
  type?: 'Article' | 'BlogPosting';
  path: string;
  title: string;
  description: string;
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  image?: string;
};

export function article(input: ArticleInput, url: UrlResolver): JsonLdObject {
  const isOrganization = input.author === site.name;
  return {
    '@context': CONTEXT,
    '@type': input.type ?? 'Article',
    headline: input.title,
    description: input.description,
    url: url(input.path),
    mainEntityOfPage: url(input.path),
    datePublished: input.publishedAt.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    inLanguage: 'ko-KR',
    author: isOrganization
      ? { '@id': organizationId(url) }
      : { '@type': 'Person', name: input.author },
    publisher: { '@id': organizationId(url) },
    ...(input.image ? { image: url(input.image) } : {}),
  };
}

export function caseArticle(item: Case, url: UrlResolver): JsonLdObject {
  return article(
    {
      path: `/cases/${item.slug}`,
      title: item.title,
      description: item.description,
      author: item.author,
      publishedAt: item.publishedAt,
      updatedAt: item.updatedAt,
      image: item.cover,
    },
    url,
  );
}

export function insightArticle(item: Insight, url: UrlResolver): JsonLdObject {
  return article(
    {
      type: 'BlogPosting',
      path: `/insights/${item.slug}`,
      title: item.title,
      description: item.description,
      author: item.author,
      publishedAt: item.publishedAt,
      updatedAt: item.updatedAt,
      image: item.cover,
    },
    url,
  );
}

export type Crumb = { name: string; path: string };

export function breadcrumb(items: Crumb[], url: UrlResolver): JsonLdObject {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: url(item.path),
    })),
  };
}
