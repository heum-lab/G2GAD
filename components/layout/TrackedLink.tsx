'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';

type TrackedLinkProps = {
  href: string;
  event: 'click_call' | 'click_kakao' | 'cta_click';
  location: string;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
};

/** 클릭 이벤트를 전송하는 링크. 내부 경로는 next/link, 그 외(tel:, 외부)는 <a>로 렌더링한다. */
export function TrackedLink({
  href,
  event,
  location,
  children,
  ...props
}: TrackedLinkProps) {
  const handleClick = () => track(event, { location });

  if (href.startsWith('/')) {
    return (
      <Link href={href} onClick={handleClick} {...props}>
        {children}
      </Link>
    );
  }

  const isExternal = href.startsWith('http');
  return (
    <a
      href={href}
      onClick={handleClick}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
    </a>
  );
}
