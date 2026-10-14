import { CtaBanner } from '@/components/sections/CtaBanner';
import { PageHeader } from '@/components/sections/PageHeader';
import { Section } from '@/components/sections/Section';
import { site } from '@/content/site';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: '대행사 제휴',
  description:
    '굿투그레이트(G2G)와 협업을 원하는 광고대행사를 위한 제휴 안내입니다. 제휴 가능한 서비스 범위와 조건은 문의를 남겨 주시면 담당자가 확인 후 상담으로 안내해 드립니다.',
  path: '/partners',
});

// TODO: 제휴 조건·대상 서비스는 G2G가 내용을 제공하면 구체화한다.
export default function PartnersPage() {
  return (
    <>
      <PageHeader
        title="대행사 제휴"
        lead={`${site.name}(G2G)와 협업을 원하는 대행사를 위한 안내입니다.`}
        crumbs={[{ name: '대행사 제휴', path: '/partners' }]}
      />
      <Section id="partners-how" title="제휴는 어떻게 진행되나요?">
        <p className="max-w-prose text-lg leading-8">
          문의 폼에 회사 정보와 협업을 원하는 서비스를 남겨 주시면 담당자가 확인 후
          연락드립니다. 제휴 범위와 조건은 상담에서 안내해 드립니다.
        </p>
      </Section>
      <CtaBanner title="제휴 문의를 남겨 주세요" location="partners" />
    </>
  );
}
