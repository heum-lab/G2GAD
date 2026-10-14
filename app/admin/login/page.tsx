import { LoginForm } from './LoginForm';

export const metadata = { title: '로그인' };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="rounded-card border-border bg-background w-full max-w-sm border p-8">
        <h1 className="text-2xl font-bold">G2G 문의 관리</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          관리자 계정으로 로그인하세요.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
