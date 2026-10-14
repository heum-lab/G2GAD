import Image from 'next/image';
import Link from 'next/link';
import { mainNav, site } from '@/content/site';
import { Container } from '@/components/ui/Container';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { MobileMenu } from './MobileMenu';
import { TrackedLink } from './TrackedLink';
import logo from '@/public/brand/logo.png';

export function Header() {
  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <Container className="relative flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src={logo}
            alt={`${site.name} 홈`}
            priority
            className="h-12 w-auto"
            sizes="84px"
          />
        </Link>

        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-control hover:bg-muted px-3 py-2 text-base font-medium"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <TrackedLink
            href="/contact"
            event="cta_click"
            location="header"
            className={cn(buttonVariants({ size: 'sm' }), 'md:h-11 md:px-5 md:text-base')}
          >
            무료 진단 받기
          </TrackedLink>
          <MobileMenu items={mainNav} />
        </div>
      </Container>
    </header>
  );
}
