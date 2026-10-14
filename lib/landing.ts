// 첫 유입 정보(랜딩 경로·리퍼러·UTM). 문의 제출 시 함께 저장한다. (PRD F-06)
// 개인정보를 담지 않으며 탭을 닫으면 사라진다(sessionStorage).

export type LandingInfo = {
  landingPath: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

const STORAGE_KEY = 'g2g-landing';

const emptyLanding: LandingInfo = {
  landingPath: '',
  referrer: '',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
};

export function recordLanding() {
  try {
    if (window.sessionStorage.getItem(STORAGE_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const info: LandingInfo = {
      landingPath: window.location.pathname.slice(0, 500),
      referrer: document.referrer.slice(0, 500),
      utmSource: (params.get('utm_source') ?? '').slice(0, 200),
      utmMedium: (params.get('utm_medium') ?? '').slice(0, 200),
      utmCampaign: (params.get('utm_campaign') ?? '').slice(0, 200),
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch {
    // 저장이 막힌 환경에서는 유입 정보 없이 진행한다.
  }
}

export function readLanding(): LandingInfo {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw
      ? { ...emptyLanding, ...(JSON.parse(raw) as Partial<LandingInfo>) }
      : emptyLanding;
  } catch {
    return emptyLanding;
  }
}
