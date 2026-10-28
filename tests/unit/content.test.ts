import { describe, expect, it } from 'vitest';
import {
  getFaqs,
  getFaqsForService,
  getServices,
  selectFaqPageMarkupFaqs,
  selectServiceMarkupFaqs,
  staticSlugs,
  EMPTY_SLUG,
} from '@/lib/content/loader';
import { validateContent } from '@/lib/content/validate';
import { buildLlmsTxt } from '@/lib/seo/llms';

// 금지 표현 (CONVENTIONS §7.3)
const BANNED = [
  '1위 보장',
  '100% 상위노출',
  '상위노출',
  '상위 노출',
  '상위에 노출',
  '노출보장',
  '노출 보장',
  '리워드트래픽',
  '리워드 트래픽',
  '무조건',
  '업계 최고',
  '국내 유일',
  '컨텐츠',
  '비젼',
];

describe('콘텐츠', () => {
  it('참조 무결성 검사를 통과한다', () => {
    expect(validateContent()).toEqual([]);
  });

  it('주력 서비스는 4개다', () => {
    expect(getServices().filter((service) => service.featured)).toHaveLength(4);
  });

  it('모든 FAQ는 정확히 한 페이지에서만 FAQPage로 마크업된다', () => {
    const faqs = getFaqs();
    const counts = new Map(faqs.map((faq) => [faq.id, 0]));
    const add = (id: string) => counts.set(id, (counts.get(id) ?? 0) + 1);

    for (const faq of selectFaqPageMarkupFaqs(faqs)) add(faq.id);
    for (const service of getServices()) {
      const visible = getFaqsForService(service);
      for (const faq of selectServiceMarkupFaqs(visible, service.slug)) add(faq.id);
    }

    const wrong = [...counts].filter(([, count]) => count !== 1);
    expect(wrong).toEqual([]);
  });

  it('메인에 노출할 FAQ는 5개다', () => {
    expect(getFaqs().filter((faq) => faq.featured)).toHaveLength(5);
  });

  it('금지 표현을 쓰지 않는다', () => {
    const texts = [
      ...getServices().map(
        (service) =>
          `${service.title} ${service.summary} ${service.description} ${service.body} ${service.forWhom.join(' ')} ${service.process.map((p) => `${p.step} ${p.desc}`).join(' ')}`,
      ),
      ...getFaqs().map((faq) => `${faq.question} ${faq.answer}`),
    ].join('\n');
    const found = BANNED.filter((word) => texts.includes(word));
    expect(found).toEqual([]);
  });

  it('콘텐츠가 0건이면 존재하지 않는 slug 하나를 반환한다', () => {
    expect(staticSlugs([])).toEqual([{ slug: EMPTY_SLUG }]);
    expect(staticSlugs([{ slug: 'a' }])).toEqual([{ slug: 'a' }]);
  });

  it('llms.txt에 모든 서비스가 절대 URL로 들어간다', () => {
    const services = getServices();
    const text = buildLlmsTxt({
      services,
      cases: [],
      url: (path = '/') => new URL(path, 'https://example.test').toString(),
    });
    for (const service of services) {
      expect(text).toContain(`(https://example.test/services/${service.slug})`);
    }
    expect(text).not.toContain('## 성공사례');
  });
});
