import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 화면 표시용 날짜. 예: `2026. 10. 13.` (CONVENTIONS §7.2) */
export function formatDate(date: Date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${y}. ${m}. ${d}.`;
}

/** 데이터용 ISO 날짜. 예: `2026-10-13` */
export function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
