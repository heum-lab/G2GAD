import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('max-w-page mx-auto w-full px-5 md:px-8', className)} {...props} />
  );
}
