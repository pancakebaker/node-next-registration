// src/components/ui/ErrorText.tsx
import * as React from 'react';
import { cn } from '@/lib/cn';

export type ErrorTextProps = React.HTMLAttributes<HTMLParagraphElement>;

export function ErrorText({ className, ...props }: ErrorTextProps) {
  return (
    <p
      role="alert"
      className={cn('mt-1 text-xs text-red-600', className)}
      {...props}
    />
  );
}
