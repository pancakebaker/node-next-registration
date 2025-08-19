// src/components/ui/Input.tsx
import * as React from 'react';
import { cn } from '@/lib/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid ? 'true' : undefined}
      className={cn(
        'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none ring-0',
        'focus:border-indigo-500',
        invalid && 'border-red-500 focus:border-red-500',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
