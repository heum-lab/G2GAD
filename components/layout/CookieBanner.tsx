'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/Button';
import {
  readConsent,
  serverConsent,
  subscribeConsent,
  writeConsent,
} from '@/lib/consent';

/** 쿠키 동의 배너. 필수 쿠키 외에는 기본 거부다. (PRD C-08) */
export function CookieBanner() {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, serverConsent);
  // 서버 렌더링과 하이드레이션 때는 'unset'이지만, 그때는 아직 선택 여부를 알 수 없으므로 숨긴다.
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isHydrated || consent !== 'unset') return null;

  return (
    <section
      aria-label="쿠키 사용 안내"
      className="border-border bg-background bottom-cta-bar rounded-card fixed inset-x-3 z-50 border p-4 shadow-xl md:inset-x-auto md:right-6 md:bottom-6 md:max-w-md"
    >
      <p className="text-sm">
        방문 통계 분석을 위해 쿠키를 사용합니다. 동의하지 않아도 사이트를 이용할 수
        있습니다.{' '}
        <Link href="/cookies" className="underline underline-offset-2">
          쿠키 정책
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => writeConsent('denied')}>
          거부
        </Button>
        <Button size="sm" onClick={() => writeConsent('granted')}>
          동의
        </Button>
      </div>
    </section>
  );
}
