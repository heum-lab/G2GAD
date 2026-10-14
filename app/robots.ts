import type { MetadataRoute } from 'next';
import { absoluteUrl, isIndexable } from '@/lib/env';

// 주요 AI 크롤러 허용을 명시한다. (PRD A-04, ARCHITECTURE §6.3)
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'ClaudeBot',
  'Google-Extended',
  'Yeti',
];

const DISALLOW = ['/contact/thanks', '/api/', '/admin'];

export default function robots(): MetadataRoute.Robots {
  // Preview·Staging은 전체 차단한다.
  if (!isIndexable) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: DISALLOW },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
