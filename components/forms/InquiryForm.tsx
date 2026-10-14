'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { FieldError, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { track } from '@/lib/analytics';
import {
  BUDGET_OPTIONS,
  InquirySchema,
  MAX_MESSAGE_LENGTH,
  inquiryDefaults,
  type InquiryInput,
  type InquiryResult,
} from '@/lib/inquiry/schema';
import { readLanding } from '@/lib/landing';

type InquiryFormProps = {
  services: { slug: string; title: string }[];
  action: (input: InquiryInput) => Promise<InquiryResult>;
};

const TRACKED_KEY = 'g2g-lead-tracked';

/** 전환 이벤트를 접수 번호당 1회만 보낸다. (PRD F-05) */
function trackLeadOnce(leadRef: string, services: string[]) {
  try {
    if (window.sessionStorage.getItem(TRACKED_KEY) === leadRef) return;
    window.sessionStorage.setItem(TRACKED_KEY, leadRef);
  } catch {
    // 저장이 막혀도 이번 제출의 전환은 보낸다.
  }
  track('generate_lead', { services: services.join(',') });
}

export function InquiryForm({ services, action }: InquiryFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput>({
    resolver: zodResolver(InquirySchema),
    defaultValues: inquiryDefaults,
  });

  // `?service=`로 관심 서비스를 미리 선택한다. 페이지를 정적으로 유지하려고 클라이언트에서 읽는다. (PRD F-02)
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('service');
    if (requested && services.some((service) => service.slug === requested)) {
      setValue('services', [requested]);
    }
  }, [services, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError('');
    let result: InquiryResult;
    try {
      result = await action({ ...values, ...readLanding() });
    } catch {
      setFormError(
        '네트워크 오류로 전송하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.',
      );
      return;
    }

    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (message) setError(field as keyof InquiryInput, { message });
      }
      setFormError(result.message);
      return;
    }

    if (result.leadRef) trackLeadOnce(result.leadRef, values.services);
    router.push('/contact/thanks');
  });

  const describedBy = (field: keyof InquiryInput) =>
    errors[field] ? `${field}-error` : undefined;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="name" required>
            이름
          </Label>
          <Input
            id="name"
            autoComplete="name"
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name')}
            {...register('name')}
          />
          <FieldError id="name-error" message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="company" required>
            회사 / 상호
          </Label>
          <Input
            id="company"
            autoComplete="organization"
            aria-required="true"
            aria-invalid={Boolean(errors.company)}
            aria-describedby={describedBy('company')}
            {...register('company')}
          />
          <FieldError id="company-error" message={errors.company?.message} />
        </div>
        <div>
          <Label htmlFor="phone" required>
            연락처
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="010-1234-5678"
            aria-required="true"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy('phone')}
            {...register('phone')}
          />
          <FieldError id="phone-error" message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email')}
            {...register('email')}
          />
          <FieldError id="email-error" message={errors.email?.message} />
        </div>
      </div>

      <fieldset aria-describedby={describedBy('services')}>
        <legend className="mb-2 text-sm font-semibold">
          관심 서비스 (여러 개 선택 가능)
          <span className="text-danger ml-0.5" aria-hidden="true">
            *
          </span>
        </legend>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.slug}>
              <label className="rounded-control border-border has-checked:border-primary has-checked:bg-primary-soft flex min-h-11 items-center gap-2.5 border px-3 py-2">
                <input
                  type="checkbox"
                  value={service.slug}
                  className="accent-primary size-4 shrink-0"
                  {...register('services')}
                />
                <span>{service.title}</span>
              </label>
            </li>
          ))}
        </ul>
        <FieldError id="services-error" message={errors.services?.message} />
      </fieldset>

      <div>
        <Label htmlFor="budget">월 예산</Label>
        <Select
          id="budget"
          aria-invalid={Boolean(errors.budget)}
          aria-describedby={describedBy('budget')}
          {...register('budget')}
        >
          <option value="">선택해 주세요</option>
          {BUDGET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <FieldError id="budget-error" message={errors.budget?.message} />
      </div>

      <div>
        <Label htmlFor="message">문의 내용</Label>
        <Textarea
          id="message"
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="현재 상황과 목표를 알려 주시면 더 정확하게 안내해 드립니다."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy('message')}
          {...register('message')}
        />
        <FieldError id="message-error" message={errors.message?.message} />
      </div>

      {/* honeypot: 사람에게는 보이지 않는다. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">웹사이트 (입력하지 마세요)</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <div>
        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            className="accent-primary mt-1 size-4 shrink-0"
            aria-required="true"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={describedBy('consent')}
            {...register('consent')}
          />
          <span>
            개인정보 수집·이용에 동의합니다.
            <span className="text-danger ml-0.5" aria-hidden="true">
              *
            </span>{' '}
            <span className="text-muted-foreground block text-sm">
              수집 항목: 이름, 회사/상호, 연락처, 이메일(선택) · 목적: 문의 상담 및 견적
              안내 · 자세한 내용은{' '}
              <Link href="/privacy" className="underline underline-offset-2">
                개인정보처리방침
              </Link>
              을 확인해 주세요.
            </span>
          </span>
        </label>
        <FieldError id="consent-error" message={errors.consent?.message} />
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-control border-danger text-danger border px-4 py-3"
        >
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full md:w-auto"
      >
        {isSubmitting ? '전송 중…' : '문의 보내기'}
      </Button>
    </form>
  );
}
