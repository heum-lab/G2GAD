import { describe, expect, it } from 'vitest';
import { InquirySchema, inquiryDefaults } from '@/lib/inquiry/schema';

const valid = {
  ...inquiryDefaults,
  name: '홍길동',
  company: '테스트 상호',
  phone: '010-1234-5678',
  services: ['place'],
  consent: true,
};

describe('문의 스키마', () => {
  it('필수 항목만 채워도 통과한다', () => {
    expect(InquirySchema.safeParse(valid).success).toBe(true);
  });

  it('필수 필드 누락 시 에러를 표시한다', () => {
    const result = InquirySchema.safeParse(inquiryDefaults);
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(
      expect.arrayContaining(['name', 'company', 'phone', 'services', 'consent']),
    );
  });

  it.each(['010-1234-5678', '01012345678', '02-123-4567', '070-8831-7081'])(
    '연락처 %s 를 허용한다',
    (phone) => {
      expect(InquirySchema.safeParse({ ...valid, phone }).success).toBe(true);
    },
  );

  it.each(['1234', '010-12-5678', 'abc', '+82-10-1234-5678'])(
    '연락처 %s 를 거부한다',
    (phone) => {
      expect(InquirySchema.safeParse({ ...valid, phone }).success).toBe(false);
    },
  );

  it('이메일은 비워 둘 수 있지만 입력하면 형식을 검사한다', () => {
    expect(InquirySchema.safeParse({ ...valid, email: '' }).success).toBe(true);
    expect(InquirySchema.safeParse({ ...valid, email: 'a@b.co' }).success).toBe(true);
    expect(InquirySchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(
      false,
    );
  });

  it('동의하지 않으면 거부한다', () => {
    expect(InquirySchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });

  it('정의되지 않은 예산 값은 거부한다', () => {
    expect(InquirySchema.safeParse({ ...valid, budget: 'free' }).success).toBe(false);
  });
});
