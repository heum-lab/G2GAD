// GA4와 네이버 애널리틱스에 동시에 전송하는 래퍼. (ARCHITECTURE §8)
// 동의 전에는 스크립트가 로드되지 않으므로 아무 일도 하지 않는다.
// 이벤트 파라미터에 개인정보를 넣지 않는다. (CONVENTIONS §9)

type EventParams = {
  generate_lead: { services: string };
  click_call: { location: string };
  click_kakao: { location: string };
  download_brochure: { type: string };
  cta_click: { location: string };
};

export type AnalyticsEvent = keyof EventParams;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    wcs?: { trans?: (conversion: { type: string }) => void };
  }
}

export function track<E extends AnalyticsEvent>(event: E, params: EventParams[E]) {
  if (typeof window === 'undefined') return;

  window.gtag?.('event', event, params);

  // 네이버는 전환 유형만 받는다. 문의 완료만 전환으로 보낸다.
  if (event === 'generate_lead') {
    window.wcs?.trans?.({ type: 'lead' });
  }
}
