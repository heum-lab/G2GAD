import Image from 'next/image';
import Link from 'next/link';
import { mainNav, offices, phoneHref, site } from '@/content/site';
import { Container } from '@/components/ui/Container';
import { TrackedLink } from './TrackedLink';
import logoWhite from '@/public/brand/logo-white.png';

const policyLinks = [
  { href: '/privacy', label: '개인정보처리방침' },
  { href: '/cookies', label: '쿠키 정책' },
  { href: '/partners', label: '대행사 제휴' },
  { href: '/careers', label: '채용정보' },
] as const;

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground pb-cta-bar md:pb-0">
      <Container className="grid gap-10 py-12 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Image src={logoWhite} alt="" className="mb-6 h-14 w-auto" sizes="100px" />
          <p className="text-lg font-bold">{site.legalName}</p>
          <p className="text-ink-muted mt-1 text-sm">{site.tagline}</p>
          <dl className="text-ink-muted mt-5 space-y-1.5 text-sm">
            {offices.map((office) => (
              <div key={office.name} className="flex gap-2">
                <dt className="shrink-0">{office.name}</dt>
                <dd>
                  <address className="not-italic">{office.address}</address>
                </dd>
              </div>
            ))}
            <div className="flex gap-2">
              <dt className="shrink-0">대표번호</dt>
              <dd>
                <TrackedLink
                  href={phoneHref}
                  event="click_call"
                  location="footer"
                  className="underline underline-offset-2"
                >
                  {site.phone}
                </TrackedLink>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">사업자등록번호</dt>
              <dd>{site.bizRegNo}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">통신판매업신고</dt>
              <dd>{site.ecommerceRegNo}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">개인정보보호책임자</dt>
              <dd>{site.privacyOfficer}</dd>
            </div>
          </dl>
        </div>

        <nav aria-label="푸터 메뉴">
          <p className="text-sm font-semibold">메뉴</p>
          <ul className="text-ink-muted mt-3 space-y-2 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-ink-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="정책 및 안내">
          <p className="text-sm font-semibold">안내</p>
          <ul className="text-ink-muted mt-3 space-y-2 text-sm">
            {policyLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-ink-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <Container className="border-ink-muted/20 text-ink-muted border-t py-5 text-sm">
        © {site.legalName}. All rights reserved.
      </Container>
    </footer>
  );
}
