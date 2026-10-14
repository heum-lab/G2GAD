'use client';

import { useState } from 'react';
import { CaseCard } from '@/components/sections/CaseCard';
import type { Case } from '@/lib/content/schemas';
import { cn } from '@/lib/utils';

type CaseItem = Pick<
  Case,
  'slug' | 'title' | 'client' | 'industry' | 'metrics' | 'period' | 'services'
>;

type CaseFilterProps = {
  cases: CaseItem[];
  /** slug → 서비스명 */
  serviceNames: Record<string, string>;
};

const ALL = '';

/**
 * 성공사례 목록의 업종·서비스 필터 (PRD CS-01).
 * 페이지는 정적이므로 필터는 클라이언트에서만 동작하고, 초기 HTML에는 모든 사례가 들어간다.
 */
export function CaseFilter({ cases, serviceNames }: CaseFilterProps) {
  const [industry, setIndustry] = useState(ALL);
  const [service, setService] = useState(ALL);

  const industries = unique(cases.map((item) => item.industry));
  const services = unique(cases.flatMap((item) => item.services)).filter(
    (slug) => slug in serviceNames,
  );

  const visible = cases.filter(
    (item) =>
      (industry === ALL || item.industry === industry) &&
      (service === ALL || item.services.includes(service)),
  );

  return (
    <>
      {industries.length > 1 || services.length > 1 ? (
        <div className="mb-8 space-y-4">
          {industries.length > 1 ? (
            <FilterGroup
              label="업종"
              options={industries.map((value) => ({ value, label: value }))}
              selected={industry}
              onSelect={setIndustry}
            />
          ) : null}
          {services.length > 1 ? (
            <FilterGroup
              label="서비스"
              options={services.map((value) => ({ value, label: serviceNames[value]! }))}
              selected={service}
              onSelect={setService}
            />
          ) : null}
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        사례 {visible.length}건
      </p>

      {visible.length > 0 ? (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <li key={item.slug}>
              <CaseCard item={item} headingLevel="h2" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-lg leading-8">
          조건에 맞는 사례가 없습니다. 필터를 바꿔 보세요.
        </p>
      )}
    </>
  );
}

type FilterGroupProps = {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
};

function FilterGroup({ label, options, selected, onSelect }: FilterGroupProps) {
  return (
    <div role="group" aria-label={`${label} 필터`} className="flex flex-wrap gap-2">
      <span className="text-muted-foreground mr-1 self-center text-sm font-medium">
        {label}
      </span>
      {[{ value: ALL, label: '전체' }, ...options].map((option) => (
        <button
          key={option.value || 'all'}
          type="button"
          aria-pressed={selected === option.value}
          onClick={() => onSelect(option.value)}
          className={cn(
            'min-h-11 rounded-full border px-4 text-sm transition-colors',
            selected === option.value
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border hover:border-primary',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function unique(values: string[]) {
  return [...new Set(values)];
}
