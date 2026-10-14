import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 스테이징 Basic Auth 전용. (ARCHITECTURE §10, §11)
// STAGING_BASIC_AUTH("user:pass")가 설정된 환경에서만 동작한다.
export function proxy(request: NextRequest) {
  const expected = process.env.STAGING_BASIC_AUTH;
  if (!expected) return NextResponse.next();

  const header = request.headers.get('authorization') ?? '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded && atob(encoded) === expected) {
    return NextResponse.next();
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="staging"' },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
