import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/admin/password';
import {
  createSessionToken,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
} from '@/lib/admin/session';

const SECRET = 'a'.repeat(32);

describe('어드민 비밀번호', () => {
  it('해시한 비밀번호만 통과한다', async () => {
    const hash = await hashPassword('correct horse battery');
    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('correct horse battery', hash)).toBe(true);
    expect(await verifyPassword('wrong password', hash)).toBe(false);
  });

  it('같은 비밀번호도 매번 다른 해시가 된다', async () => {
    expect(await hashPassword('same-password')).not.toBe(
      await hashPassword('same-password'),
    );
  });

  it('형식이 잘못된 해시는 거부한다', async () => {
    expect(await verifyPassword('x', 'plain-text')).toBe(false);
    expect(await verifyPassword('x', 'scrypt$1$2')).toBe(false);
  });
});

describe('어드민 세션 토큰', () => {
  it('서명이 맞고 만료 전이면 아이디를 돌려준다', () => {
    const token = createSessionToken('admin', SECRET, 1_000);
    expect(verifySessionToken(token, SECRET, 2_000)).toBe('admin');
  });

  it('만료되면 거부한다', () => {
    const token = createSessionToken('admin', SECRET, 0);
    expect(
      verifySessionToken(token, SECRET, SESSION_MAX_AGE_SECONDS * 1000 + 1),
    ).toBeNull();
  });

  it('다른 비밀키로 만든 토큰은 거부한다', () => {
    const token = createSessionToken('admin', 'b'.repeat(32));
    expect(verifySessionToken(token, SECRET)).toBeNull();
  });

  it('내용을 바꾼 토큰은 거부한다', () => {
    const [, signature] = createSessionToken('admin', SECRET).split('.');
    const forged = Buffer.from(
      JSON.stringify({ u: 'root', exp: Date.now() + 1e9 }),
    ).toString('base64url');
    expect(verifySessionToken(`${forged}.${signature}`, SECRET)).toBeNull();
    expect(verifySessionToken('garbage', SECRET)).toBeNull();
  });
});
