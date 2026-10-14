import { z } from 'zod';

// 콘텐츠 모델. (ARCHITECTURE §4)
// summary: 화면 요약 박스(TL;DR), description: meta description 전용.

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, '영문 소문자 kebab-case여야 합니다');
const summary = z.string().min(1).max(200);
const description = z.string().min(80).max(120);

export const ServiceSchema = z.object({
  slug,
  title: z.string().min(1),
  category: z.enum(['ai', 'search', 'viral', 'influencer', 'ads']),
  featured: z.boolean().default(false),
  order: z.number(),
  summary,
  description,
  forWhom: z.array(z.string()).min(1),
  process: z.array(z.object({ step: z.string(), desc: z.string() })).min(1),
  pricing: z.string().optional(),
  faqIds: z.array(z.string()).default([]),
  relatedServices: z.array(z.string()).default([]),
  updatedAt: z.coerce.date(),
});

export const CaseSchema = z.object({
  slug,
  title: z.string().min(1),
  client: z.string().min(1),
  industry: z.string().min(1),
  services: z.array(z.string()).min(1),
  metrics: z
    .array(z.object({ label: z.string(), before: z.string(), after: z.string() }))
    .min(1),
  period: z.string(),
  summary,
  description,
  author: z.string().default('굿투그레이트'),
  cover: z.string(),
  featured: z.boolean().default(false),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const InsightSchema = z.object({
  slug,
  title: z.string().min(1),
  summary,
  description,
  author: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  cover: z.string().optional(),
});

export const FaqSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.enum(['common', 'cost', 'contract', 'service']),
  services: z.array(z.string()).default([]),
  /** 메인(H-08)에 노출할 질문 */
  featured: z.boolean().default(false),
  updatedAt: z.coerce.date(),
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const LegalSchema = z.object({
  slug,
  title: z.string().min(1),
  description,
  updatedAt: z.coerce.date(),
});

export type Service = z.infer<typeof ServiceSchema>;
export type Case = z.infer<typeof CaseSchema>;
export type Insight = z.infer<typeof InsightSchema>;
export type Faq = z.infer<typeof FaqSchema>;
export type Legal = z.infer<typeof LegalSchema>;

export type WithBody<T> = T & { body: string };

export const faqCategories = {
  common: '공통',
  cost: '비용',
  contract: '계약·기간',
  service: '서비스별',
} as const;
