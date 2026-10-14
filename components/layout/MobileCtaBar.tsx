import { MessageCircle, Phone, Send } from 'lucide-react';
import { phoneHref, site } from '@/content/site';
import { TrackedLink } from './TrackedLink';

const itemClass =
  'flex h-full flex-1 flex-col items-center justify-center gap-0.5 text-sm font-semibold';

/** 모바일 하단 고정 바: 전화 · 카카오톡 상담 · 문의 (PRD C-02) */
export function MobileCtaBar() {
  return (
    <nav
      aria-label="빠른 상담"
      className="border-border bg-background h-cta-bar fixed inset-x-0 bottom-0 z-40 flex border-t md:hidden"
    >
      <TrackedLink
        href={phoneHref}
        event="click_call"
        location="mobile_bar"
        className={itemClass}
        aria-label={`전화 상담 ${site.phone}`}
      >
        <Phone aria-hidden="true" className="size-5" />
        전화
      </TrackedLink>
      {site.kakaoChannel ? (
        <TrackedLink
          href={site.kakaoChannel}
          event="click_kakao"
          location="mobile_bar"
          className={itemClass}
        >
          <MessageCircle aria-hidden="true" className="size-5" />
          카카오톡
        </TrackedLink>
      ) : null}
      <TrackedLink
        href="/contact"
        event="cta_click"
        location="mobile_bar"
        className={`${itemClass} bg-primary text-primary-foreground`}
      >
        <Send aria-hidden="true" className="size-5" />
        문의
      </TrackedLink>
    </nav>
  );
}
