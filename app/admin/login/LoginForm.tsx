'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Field';
import { login, type LoginState } from '../actions';

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="username">아이디</Label>
        {/* 실패 후 폼이 초기화되어도 아이디는 남긴다 */}
        <Input
          id="username"
          name="username"
          autoComplete="username"
          defaultValue={state.username}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? '확인 중…' : '로그인'}
      </Button>
    </form>
  );
}
