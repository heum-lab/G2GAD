import { describe, expect, it } from 'vitest';
import {
  article,
  breadcrumb,
  faqPage,
  organization,
  service,
  webSite,
} from '@/lib/seo/schema';

const url = (path = '/') => new URL(path, 'https://example.test').toString();

describe('구조화 데이터', () => {
  it('Organization 스키마에 상호·대체 표기·주소·전화가 들어간다', () => {
    expect(organization(url)).toMatchSnapshot();
  });

  it('WebSite 스키마', () => {
    expect(webSite(url)).toMatchSnapshot();
  });

  it('Service 스키마의 provider는 Organization을 참조한다', () => {
    const result = service(
      { slug: 'place', title: '플레이스 마케팅', description: '설명' },
      url,
    );
    expect(result).toMatchSnapshot();
    expect(result.provider).toEqual({ '@id': 'https://example.test/#organization' });
  });

  it('FAQPage 스키마는 질문과 답변을 그대로 담는다', () => {
    expect(
      faqPage([{ question: '질문인가요?', answer: '답변입니다.' }]),
    ).toMatchSnapshot();
  });

  it('Article 스키마: 저자가 회사명이면 Organization, 아니면 Person', () => {
    const base = {
      path: '/insights/sample',
      title: '제목',
      description: '설명',
      publishedAt: new Date('2026-10-01'),
      updatedAt: new Date('2026-10-13'),
    };
    expect(article({ ...base, author: '굿투그레이트' }, url)).toMatchSnapshot();
    expect(article({ ...base, author: '홍길동' }, url).author).toEqual({
      '@type': 'Person',
      name: '홍길동',
    });
  });

  it('BreadcrumbList 스키마는 순서와 절대 URL을 가진다', () => {
    expect(
      breadcrumb(
        [
          { name: '홈', path: '/' },
          { name: '서비스', path: '/services' },
        ],
        url,
      ),
    ).toMatchSnapshot();
  });
});
