import { createHmac, timingSafeEqual } from 'node:crypto';

// 어드민 세션 토큰: base64url(JSON{u, exp}).서명(HMAC-SHA256)
// 서버에 상태를 두지 않는다. 모든 세션을 끊으려면 ADMIN_SESSION_SECRET을 바꾼다.

export const SESSION_COOKIE = 'g2g_admin';
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

type Payload = { u: string; exp: number };

function sign(data: string, secret: string) {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function createSessionToken(username: string, secret: string, now = Date.now()) {
  const payload: Payload = { u: username, exp: now + SESSION_MAX_AGE_SECONDS * 1000 };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${data}.${sign(data, secret)}`;
}

/** 서명과 만료를 확인하고 사용자명을 반환한다. 유효하지 않으면 null. */
export function verifySessionToken(token: string, secret: string, now = Date.now()) {
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;
  const expected = Buffer.from(sign(data, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as Payload;
    if (typeof payload.u !== 'string' || typeof payload.exp !== 'number') return null;
    return payload.exp > now ? payload.u : null;
  } catch {
    return null;
  }
}
