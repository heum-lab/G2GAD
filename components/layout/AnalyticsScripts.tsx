'use client';

import Script from 'next/script';
import { useSyncExternalStore } from 'react';
import { readConsent, serverConsent, subscribeConsent } from '@/lib/consent';

type AnalyticsScriptsProps = {
  gaId: string;
  naverId: string;
};

/**
 * 쿠키 동의 후에만 분석 스크립트를 로드한다. (ARCHITECTURE §8, §12)
 * ID는 서버에서 props로 받는다. lib/env를 import하면 Zod가 모든 페이지 번들에 들어간다.
 */
export function AnalyticsScripts({ gaId, naverId }: AnalyticsScriptsProps) {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, serverConsent);
  if (consent !== 'granted') return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaId)});`}
      </Script>
      <Script
        src="https://wcs.naver.net/wcslog.js"
        strategy="afterInteractive"
        onLoad={() => {
          const win = window as unknown as {
            wcs_add?: Record<string, string>;
            wcs_do?: () => void;
          };
          win.wcs_add = { ...(win.wcs_add ?? {}), wa: naverId };
          win.wcs_do?.();
        }}
      />
    </>
  );
}
