'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { refresh } from 'next/cache';
import { serverEnv } from '@/lib/env';
import { checkCredentials, isAdminConfigured, requireAdmin } from '@/lib/admin/auth';
import { deleteLead, isLeadStatus, updateLead } from '@/lib/admin/leads';
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/admin/session';
import { checkRateLimit } from '@/lib/inquiry/rate-limit';

// 어드민 Server Action. 모두 세션을 직접 확인한다. 로그에 개인정보를 남기지 않는다.

export type LoginState = { error?: string; username?: string };

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAdminConfigured()) {
    return { error: '관리자 계정이 아직 설정되지 않았습니다.' };
  }

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!(await checkRateLimit(ip, 'adminLogin'))) {
    return {
      error: '로그인 시도가 너무 많습니다. 15분 뒤에 다시 시도해 주세요.',
      username: String(formData.get('username') ?? ''),
    };
  }

  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const admin = username && password ? await checkCredentials(username, password) : null;
  if (!admin) {
    console.warn('[admin] 로그인 실패');
    return { error: '아이디 또는 비밀번호가 올바르지 않습니다.', username };
  }

  (await cookies()).set(
    SESSION_COOKIE,
    createSessionToken(admin, serverEnv('admin').ADMIN_SESSION_SECRET),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/admin',
      maxAge: SESSION_MAX_AGE_SECONDS,
    },
  );
  redirect('/admin');
}

export async function logout() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: '/admin' });
  redirect('/admin/login');
}

export type SaveState = { ok?: boolean; error?: string };

export async function saveLead(_: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const status = formData.get('status');
  const memo = String(formData.get('memo') ?? '').slice(0, 5000);
  if (!isLeadStatus(status)) return { error: '상태 값이 올바르지 않습니다.' };

  try {
    await updateLead(id, { status, memo });
  } catch (error) {
    console.error('[admin] 저장 실패', error instanceof Error ? error.message : '');
    return { error: '저장하지 못했습니다. 잠시 후 다시 시도해 주세요.' };
  }
  refresh();
  return { ok: true };
}

export async function removeLead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (formData.get('confirm') !== 'yes') return;
  await deleteLead(id);
  redirect('/admin');
}
