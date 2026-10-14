import { TrackedLink } from '@/components/layout/TrackedLink';
import { PageHeader } from '@/components/sections/PageHeader';
import { Section } from '@/components/sections/Section';
import { phoneHref, site } from '@/content/site';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: '채용정보',
  description:
    '굿투그레이트(G2G) 채용 안내입니다. 현재 진행 중인 채용 공고와 지원 방법을 확인할 수 있으며, 공고가 없는 기간에는 대표번호로 채용 관련 문의를 받고 있습니다.',
  path: '/careers',
});

// TODO: 채용 공고와 지원 방법은 G2G가 내용을 제공하면 추가한다.
export default function CareersPage() {
  return (
    <>
      <PageHeader
        title="채용정보"
        lead={`${site.name}(G2G)의 채용 안내입니다.`}
        crumbs={[{ name: '채용정보', path: '/careers' }]}
      />
      <Section id="careers-open" title="현재 진행 중인 채용이 있나요?">
        <p className="max-w-prose text-lg leading-8">
          현재 이 페이지에 등록된 채용 공고가 없습니다. 채용 관련 문의는 대표번호{' '}
          <TrackedLink
            href={phoneHref}
            event="click_call"
            location="careers"
            className="text-primary font-semibold underline underline-offset-2"
          >
            {site.phone}
          </TrackedLink>
          로 연락해 주세요.
        </p>
      </Section>
    </>
  );
}
