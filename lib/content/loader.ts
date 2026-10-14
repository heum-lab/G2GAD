import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import {
  CaseSchema,
  FaqSchema,
  InsightSchema,
  LegalSchema,
  ServiceSchema,
  type Case,
  type Faq,
  type Insight,
  type Legal,
  type Service,
  type WithBody,
} from './schemas';

// 콘텐츠 로더. `/content`의 MDX·YAML을 읽어 Zod로 검증한다. 검증 실패는 빌드 실패다.

const CONTENT_DIR = path.join(process.cwd(), 'content');

function listFiles(dir: string, ext: string) {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((file) => file.endsWith(ext))
    .sort()
    .map((file) => ({ file: `${dir}/${file}`, full: path.join(full, file) }));
}

function parseWith<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`콘텐츠 검증 실패: content/${file}\n${issues}`);
  }
  return result.data;
}

function loadMdxDir<T extends { slug: string }>(dir: string, schema: z.ZodType<T>) {
  return listFiles(dir, '.mdx').map(({ file, full }) => {
    const { data, content } = matter(fs.readFileSync(full, 'utf8'));
    const parsed = parseWith(schema, data, file);
    const expected = path.basename(file, '.mdx');
    if (parsed.slug !== expected) {
      throw new Error(
        `콘텐츠 검증 실패: content/${file}\n  - slug "${parsed.slug}"가 파일명 "${expected}"와 다릅니다`,
      );
    }
    return { ...parsed, body: content.trim() } as WithBody<T>;
  });
}

const cache = new Map<string, unknown>();

function memo<T>(key: string, load: () => T): T {
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as T;
}

export function getServices(): WithBody<Service>[] {
  return memo('services', () =>
    loadMdxDir('services', ServiceSchema).sort((a, b) => a.order - b.order),
  );
}

export function getService(slug: string) {
  return getServices().find((service) => service.slug === slug);
}

export function getCases(): WithBody<Case>[] {
  return memo('cases', () =>
    loadMdxDir('cases', CaseSchema).sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
    ),
  );
}

export function getCase(slug: string) {
  return getCases().find((item) => item.slug === slug);
}

export function getInsights(): WithBody<Insight>[] {
  return memo('insights', () =>
    loadMdxDir('insights', InsightSchema).sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
    ),
  );
}

export function getInsight(slug: string) {
  return getInsights().find((item) => item.slug === slug);
}

export function getLegal(slug: string): WithBody<Legal> | undefined {
  return memo('legal', () => loadMdxDir('legal', LegalSchema)).find(
    (item) => item.slug === slug,
  );
}

export function getFaqs(): Faq[] {
  return memo('faqs', () =>
    listFiles('faq', '.yaml').flatMap(({ file, full }) => {
      const raw = parseYaml(fs.readFileSync(full, 'utf8')) ?? [];
      return parseWith(z.array(FaqSchema), raw, file).map((faq) => ({
        ...faq,
        answer: faq.answer.trim(),
      }));
    }),
  );
}

/** 서비스 상세에 보여 줄 FAQ. `faqIds` 순서를 따른다. */
export function getFaqsForService(service: Pick<Service, 'faqIds'>): Faq[] {
  const byId = new Map(getFaqs().map((faq) => [faq.id, faq]));
  return service.faqIds.flatMap((id) => byId.get(id) ?? []);
}

// FAQPage 마크업은 질문당 한 페이지에서만 한다. (ARCHITECTURE §6.2)
/** 이 서비스 상세 페이지에서 마크업할 FAQ: `services`의 첫 번째가 이 서비스인 질문 */
export function selectServiceMarkupFaqs(faqs: Faq[], slug: string) {
  return faqs.filter((faq) => faq.services[0] === slug);
}

/** `/faq`에서 마크업할 FAQ: 서비스 전용이 아닌 질문 */
export function selectFaqPageMarkupFaqs(faqs: Faq[]) {
  return faqs.filter((faq) => faq.services.length === 0);
}

/**
 * Cache Components에서는 generateStaticParams가 빈 배열을 반환할 수 없다.
 * 콘텐츠가 0건이면 존재하지 않는 slug 하나를 반환하고, 페이지는 notFound()로 처리한다.
 */
export const EMPTY_SLUG = '__none__';

export function staticSlugs(items: { slug: string }[]) {
  return items.length > 0
    ? items.map(({ slug }) => ({ slug }))
    : [{ slug: EMPTY_SLUG }];
}
