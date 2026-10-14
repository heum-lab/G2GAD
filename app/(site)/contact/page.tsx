import { InquiryForm } from '@/components/forms/InquiryForm';
import { TrackedLink } from '@/components/layout/TrackedLink';
import { PageHeader } from '@/components/sections/PageHeader';
import { Container } from '@/components/ui/Container';
import { offices, phoneHref, site } from '@/content/site';
import { getServices } from '@/lib/content/loader';
import { buildMetadata } from '@/lib/seo/metadata';
import { submitInquiry } from './actions';

export const metadata = buildMetadata({
  title: '문의하기',
  description:
    '굿투그레이트(G2G)에 마케팅 상담을 신청하세요. 관심 서비스와 현재 상황을 남겨 주시면 담당자가 확인 후 진단과 맞춤 제안을 안내해 드립니다. 전화 상담도 가능합니다.',
  path: '/contact',
});

export default function ContactPage() {
  const services = getServices().map(({ slug, title }) => ({ slug, title }));

  return (
    <>
      <PageHeader
        title="문의하기"
        lead="관심 서비스와 현재 상황을 남겨 주시면 담당자가 확인 후 연락드립니다."
        crumbs={[{ name: '문의', path: '/contact' }]}
      />
      <Container className="py-section grid gap-12 lg:grid-cols-[2fr_1fr]">
        <section aria-labelledby="inquiry-form-title">
          <h2 id="inquiry-form-title" className="text-2xl font-bold">
            상담 신청
          </h2>
          <p className="text-muted-foreground mt-2 mb-8">
            <span className="text-danger" aria-hidden="true">
              *
            </span>{' '}
            표시는 필수 입력 항목입니다.
          </p>
          <InquiryForm services={services} action={submitInquiry} />
        </section>

        <aside aria-labelledby="contact-direct-title" className="lg:pt-2">
          <h2 id="contact-direct-title" className="text-xl font-bold">
            바로 상담
          </h2>
          <dl className="mt-5 space-y-5">
            <div>
              <dt className="text-muted-foreground text-sm">전화</dt>
              <dd className="mt-1">
                <TrackedLink
                  href={phoneHref}
                  event="click_call"
                  location="contact"
                  className="text-primary text-2xl font-bold underline underline-offset-4"
                >
                  {site.phone}
                </TrackedLink>
              </dd>
            </div>
            {site.kakaoChannel ? (
              <div>
                <dt className="text-muted-foreground text-sm">카카오톡</dt>
                <dd className="mt-1">
                  <TrackedLink
                    href={site.kakaoChannel}
                    event="click_kakao"
                    location="contact"
                    className="text-primary font-semibold underline underline-offset-4"
                  >
                    카카오톡 채널로 상담하기
                  </TrackedLink>
                </dd>
              </div>
            ) : null}
            {offices.map((office) => (
              <div key={office.name}>
                <dt className="text-muted-foreground text-sm">{office.name}</dt>
                <dd className="mt-1">
                  <address className="not-italic">{office.address}</address>
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </Container>
    </>
  );
}
