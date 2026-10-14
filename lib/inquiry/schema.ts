import { z } from 'zod';

// 문의 폼 스키마. 클라이언트와 서버가 같은 스키마를 쓴다. (CONVENTIONS §9)

export const MAX_MESSAGE_LENGTH = 2000;

export const BUDGET_OPTIONS = [
  { value: 'under-100', label: '월 100만원 미만' },
  { value: '100-300', label: '월 100만원 ~ 300만원' },
  { value: '300-1000', label: '월 300만원 ~ 1,000만원' },
  { value: 'over-1000', label: '월 1,000만원 이상' },
  { value: 'undecided', label: '미정 / 상담 후 결정' },
] as const;

const budgetValues = BUDGET_OPTIONS.map((option) => option.value);

const optionalText = (max: number) => z.string().trim().max(max);

export const InquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '이름을 입력해 주세요.')
    .max(50, '이름은 50자 이내로 입력해 주세요.'),
  company: z
    .string()
    .trim()
    .min(1, '회사명 또는 상호를 입력해 주세요.')
    .max(100, '회사명은 100자 이내로 입력해 주세요.'),
  phone: z
    .string()
    .trim()
    .regex(
      /^0\d{1,2}-?\d{3,4}-?\d{4}$/,
      '연락처 형식을 확인해 주세요. (예: 010-1234-5678)',
    ),
  email: z.union([
    z.literal(''),
    z.email('이메일 형식을 확인해 주세요. (예: name@company.com)'),
  ]),
  services: z.array(z.string()).min(1, '관심 서비스를 1개 이상 선택해 주세요.').max(20),
  budget: z.union([z.literal(''), z.enum(budgetValues)]),
  message: z
    .string()
    .trim()
    .max(MAX_MESSAGE_LENGTH, `문의 내용은 ${MAX_MESSAGE_LENGTH}자 이내로 입력해 주세요.`),
  consent: z.boolean().refine((value) => value, {
    message: '개인정보 수집·이용에 동의해 주세요.',
  }),
  // honeypot: 사람에게는 보이지 않는 필드. 값이 있으면 봇으로 본다.
  website: z.string().max(200),
  utmSource: optionalText(200),
  utmMedium: optionalText(200),
  utmCampaign: optionalText(200),
  landingPath: optionalText(500),
  referrer: optionalText(500),
});

export type InquiryInput = z.infer<typeof InquirySchema>;

export type InquiryFieldErrors = Partial<Record<keyof InquiryInput, string[]>>;

/** Server Action 반환 규약. (CONVENTIONS §10) */
export type InquiryResult =
  | { ok: true; leadRef: string | null }
  | { ok: false; fieldErrors?: InquiryFieldErrors; message: string };

export const inquiryDefaults: InquiryInput = {
  name: '',
  company: '',
  phone: '',
  email: '',
  services: [],
  budget: '',
  message: '',
  consent: false,
  website: '',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  landingPath: '',
  referrer: '',
};

export function budgetLabel(value: InquiryInput['budget']) {
  return BUDGET_OPTIONS.find((option) => option.value === value)?.label ?? '미선택';
}
