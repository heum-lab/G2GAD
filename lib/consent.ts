// 쿠키 동의 상태. 필수 쿠키 외에는 기본 거부다. (PRD C-08)

export type Consent = 'granted' | 'denied' | 'unset';

const STORAGE_KEY = 'g2g-consent';
const EVENT = 'g2g-consent-change';

export function readConsent(): Consent {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : 'unset';
  } catch {
    return 'unset';
  }
}

export function writeConsent(value: Exclude<Consent, 'unset'>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // 저장이 막힌 환경에서는 이번 방문에만 적용된다.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeConsent(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

/** 서버 렌더링과 하이드레이션 시점의 값 */
export function serverConsent(): Consent {
  return 'unset';
}
