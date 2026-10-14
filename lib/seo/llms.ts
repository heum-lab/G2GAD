import { offices, serviceCategories, site } from '@/content/site';
import type { Case, Service } from '@/lib/content/schemas';

type LlmsInput = {
  services: Pick<Service, 'slug' | 'title' | 'description' | 'category'>[];
  cases: Pick<Case, 'slug' | 'title' | 'description'>[];
  url: (path?: string) => string;
};

/** `/llms.txt` 본문. 회사 개요 → 서비스별 한 줄 요약과 URL → FAQ·사례 링크 (PRD A-03) */
export function buildLlmsTxt({ services, cases, url }: LlmsInput) {
  const lines = [
    `# ${site.name} (${site.alternateNames.join(', ')})`,
    '',
    `> ${site.legalName}는 ${site.tagline}입니다. 대표번호: ${site.phone}.`,
    '',
    ...offices.map((office) => `- ${office.name}: ${office.address}`),
    '',
    '## 서비스',
    '',
    ...services.map(
      (item) =>
        `- [${item.title}](${url(`/services/${item.slug}`)}): [${serviceCategories[item.category]}] ${item.description}`,
    ),
    '',
    '## 주요 페이지',
    '',
    `- [회사소개](${url('/about')})`,
    `- [서비스 전체](${url('/services')})`,
    `- [자주 묻는 질문](${url('/faq')})`,
    `- [성공사례](${url('/cases')})`,
    `- [인사이트](${url('/insights')})`,
    `- [문의하기](${url('/contact')})`,
  ];

  if (cases.length > 0) {
    lines.push(
      '',
      '## 성공사례',
      '',
      ...cases.map(
        (item) => `- [${item.title}](${url(`/cases/${item.slug}`)}): ${item.description}`,
      ),
    );
  }

  return `${lines.join('\n')}\n`;
}
