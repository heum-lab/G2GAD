import type { Metadata } from 'next';
import { site } from '@/content/site';
import { absoluteUrl } from '@/lib/env';

export const TITLE_SUFFIX = `${site.name} G2G`;

type BuildMetadataInput = {
  /** 30자 이내. 브랜드는 템플릿이 붙인다. */
  title: string;
  /** 80~120자 */
  description: string;
  /** 사이트 루트 기준 경로. canonical 생성에 쓴다. */
  path: string;
  image?: string;
  /** 브랜드 접미사를 붙이지 않는다(메인 전용). */
  absoluteTitle?: boolean;
  noindex?: boolean;
  type?: 'website' | 'article';
};

export function buildMetadata({
  title,
  description,
  path,
  image,
  absoluteTitle = false,
  noindex = false,
  type = 'website',
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle ? title : `${title} | ${TITLE_SUFFIX}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      url,
      title: fullTitle,
      description,
      siteName: site.name,
      locale: 'ko_KR',
      ...(image ? { images: [{ url: absoluteUrl(image) }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}
