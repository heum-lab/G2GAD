// 문의 처리 상태. 클라이언트 컴포넌트에서도 쓰므로 서버 전용 모듈과 분리한다.

export const LEAD_STATUSES = ['new', 'contacted', 'won', 'lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: '신규',
  contacted: '상담중',
  won: '계약',
  lost: '종료',
};

export function isLeadStatus(value: unknown): value is LeadStatus {
  return (
    typeof value === 'string' && (LEAD_STATUSES as readonly string[]).includes(value)
  );
}
