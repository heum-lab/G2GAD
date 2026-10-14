// 회사 정보 단일 출처(SSOT). 푸터, 스키마, 연락처 링크는 모두 여기서 파생한다.
// 이 파일의 값은 임의로 만들지 않는다. 모르면 TODO로 남긴다. (CONVENTIONS §13)

export type PostalAddress = {
  street: string;
  locality: string;
  region: string;
  country: 'KR';
};

export type SiteStat = {
  label: string;
  value: string;
  /** 기준일. 예: "2026년 9월 기준" */
  asOf: string;
};

export const site = {
  name: '굿투그레이트',
  legalName: '㈜굿투그레이트',
  alternateNames: ['GOOD TO GREAT', 'G2G', 'GTOG'],
  tagline: 'AEO·GEO·AI 기반 종합광고대행사',
  url: 'https://gtog2024.com',
  phone: '070-8831-7081',
  // 본사
  address: {
    street: '두텁바위로 59-1, 지층 에프-12호',
    locality: '용산구',
    region: '서울특별시',
    country: 'KR',
  } satisfies PostalAddress,
  branches: [
    {
      name: '인천지사',
      address: {
        street: '남동대로 353 JK루체스타 328호',
        locality: '남동구',
        region: '인천광역시',
        country: 'KR',
      },
    },
    {
      name: '부산지사',
      address: {
        street: '센텀동로 71 벽산이센텀클래스워2차 1009호',
        locality: '해운대구',
        region: '부산광역시',
        country: 'KR',
      },
    },
  ] satisfies { name: string; address: PostalAddress }[],
  bizRegNo: '134-88-03195',
  ecommerceRegNo: '2024-서울용산-1282',
  ceo: '심재찬',
  privacyOfficer: '심재찬',
  // TODO: 직원 수·매출의 기준 연도(예: "2025년 기준")를 확인해 asOf에 넣는다. (PRD A-07)
  employees: { count: 20, asOf: '' },
  annualRevenue: { value: '140억 원', asOf: '' },
  sameAs: [] as string[], // TODO: 블로그·인스타·유튜브 등 (PRD §10)
  kakaoChannel: '', // TODO: 카카오톡 채널 URL (PRD §10)
  // TODO: 메인 실적 수치 4개와 기준일 (PRD H-02, §10). 비어 있으면 섹션을 숨긴다.
  stats: [] as SiteStat[],
} as const;

/** `tel:` 링크용. 숫자만 남긴다. */
export const phoneHref = `tel:${site.phone.replace(/\D/g, '')}`;

export function formatAddress(address: PostalAddress) {
  return `${address.region} ${address.locality} ${address.street}`;
}

/** 본사 주소 */
export const fullAddress = formatAddress(site.address);

/** 본사와 지사 주소. 화면에 나열할 때 쓴다. */
export const offices = [
  { name: '본사', address: fullAddress },
  ...site.branches.map((branch) => ({
    name: branch.name,
    address: formatAddress(branch.address),
  })),
];

export const mainNav = [
  { href: '/about', label: '회사소개' },
  { href: '/services', label: '서비스' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: '문의' },
] as const;

export const serviceCategories = {
  ai: 'AI 검색',
  search: '검색',
  viral: '바이럴',
  influencer: '인플루언서',
  ads: '광고',
} as const;

export type ServiceCategory = keyof typeof serviceCategories;
