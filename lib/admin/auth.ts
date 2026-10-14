import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { serverEnv } from '@/lib/env';
import { verifyPassword } from './password';
import { SESSION_COOKIE, verifySessionToken } from './session';

// 어드민 인증. 페이지·Server Action·Route Handler 모두 데이터에 접근하기 전에 여기서 확인한다.

// 없는 아이디에도 같은 시간을 쓰도록 비교용 해시 (비밀번호 "x")
const DUMMY_HASH =
  'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$8vJ3bV8h3m8b2bq3k9q1fXyHq3b0bq3k9q1fXyHq3bA';

function parseAccounts(raw: string) {
  const accounts = new Map<string, string>();
  for (const entry of raw.split(',')) {
    const index = entry.indexOf(':');
    if (index > 0)
      accounts.set(entry.slice(0, index).trim(), entry.slice(index + 1).trim());
  }
  return accounts;
}

export function isAdminConfigured() {
  try {
    serverEnv('admin');
    return true;
  } catch {
    return false;
  }
}

/** 아이디·비밀번호 확인. 성공하면 아이디를 반환한다. */
export async function checkCredentials(username: string, password: string) {
  const accounts = parseAccounts(serverEnv('admin').ADMIN_ACCOUNTS);
  const stored = accounts.get(username);
  const ok = await verifyPassword(password, stored ?? DUMMY_HASH);
  return ok && stored ? username : null;
}

/** 현재 로그인한 관리자 아이디. 없으면 null. */
export async function getAdmin() {
  // 쿠키를 가장 먼저 읽는다. 설정 확인으로 먼저 반환하면 요청 데이터를 읽지 않은 것으로 보고
  // 빌드 때 페이지가 '로그인으로 리디렉트'로 고정(프리렌더)된다.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  // 만료 확인에 현재 시각을 쓰므로 요청 시점에만 실행한다(프리렌더 금지).
  await connection();
  if (!token || !isAdminConfigured()) return null;
  const username = verifySessionToken(token, serverEnv('admin').ADMIN_SESSION_SECRET);
  if (!username) return null;
  // 계정이 삭제되면 기존 세션도 무효로 한다.
  return parseAccounts(serverEnv('admin').ADMIN_ACCOUNTS).has(username) ? username : null;
}

/** 로그인하지 않았으면 로그인 페이지로 보낸다. */
export async function requireAdmin() {
  const username = await getAdmin();
  if (!username) redirect('/admin/login');
  return username;
}
