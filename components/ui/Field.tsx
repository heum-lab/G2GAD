import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

// 폼 프리미티브. 모든 입력은 <label>과 연결하고 에러는 aria-describedby로 연결한다. (CONVENTIONS §6)

const controlClass =
  'rounded-control border-border bg-background text-foreground placeholder:text-muted-foreground aria-invalid:border-danger w-full border px-3 text-base';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean };

export function Label({ className, children, required = false, ...props }: LabelProps) {
  return (
    <label className={cn('mb-1.5 block text-sm font-semibold', className)} {...props}>
      {children}
      {required ? (
        <span className="text-danger ml-0.5" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, 'h-11', className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(controlClass, 'min-h-32 py-2.5', className)} {...props} />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClass, 'h-11', className)} {...props} />;
}

type FieldErrorProps = { id: string; message?: string };

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-danger mt-1.5 text-sm">
      {message}
    </p>
  );
}
