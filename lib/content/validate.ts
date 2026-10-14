import {
  getCases,
  getFaqs,
  getInsights,
  getLegal,
  getServices,
} from './loader';

// 참조 무결성·중복 검사. frontmatter 검증은 로더가 수행한다. (ARCHITECTURE §4.5)

function duplicates(values: string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

export function validateContent(): string[] {
  const errors: string[] = [];

  const services = getServices();
  const cases = getCases();
  const insights = getInsights();
  const faqs = getFaqs();

  const serviceSlugs = new Set(services.map((service) => service.slug));
  const faqIds = new Set(faqs.map((faq) => faq.id));

  for (const id of duplicates(faqs.map((faq) => faq.id))) {
    errors.push(`FAQ id 중복: ${id}`);
  }

  for (const service of services) {
    for (const id of service.faqIds) {
      if (!faqIds.has(id)) {
        errors.push(`services/${service.slug}: faqIds의 "${id}"가 FAQ에 없습니다`);
      }
    }
    for (const related of service.relatedServices) {
      if (!serviceSlugs.has(related)) {
        errors.push(`services/${service.slug}: relatedServices의 "${related}"가 없습니다`);
      }
      if (related === service.slug) {
        errors.push(`services/${service.slug}: relatedServices에 자기 자신이 있습니다`);
      }
    }
  }

  for (const faq of faqs) {
    for (const slug of faq.services) {
      if (!serviceSlugs.has(slug)) {
        errors.push(`faq/${faq.id}: services의 "${slug}"가 없습니다`);
      }
    }
    // 서비스 전용 질문은 그 서비스 상세에 노출되어야 마크업과 화면이 일치한다.
    const owner = faq.services[0];
    if (owner) {
      const ownerService = services.find((service) => service.slug === owner);
      if (ownerService && !ownerService.faqIds.includes(faq.id)) {
        errors.push(`faq/${faq.id}: services/${owner}의 faqIds에 포함되어야 합니다`);
      }
    }
  }

  for (const item of cases) {
    for (const slug of item.services) {
      if (!serviceSlugs.has(slug)) {
        errors.push(`cases/${item.slug}: services의 "${slug}"가 없습니다`);
      }
    }
  }

  // 로더가 slug를 파일명과 대조하므로 종류 안에서는 중복될 수 없다. 누락만 확인한다.
  for (const slug of ['privacy', 'cookies']) {
    if (!getLegal(slug)) errors.push(`legal/${slug}.mdx가 없습니다`);
  }

  void insights;
  return errors;
}
