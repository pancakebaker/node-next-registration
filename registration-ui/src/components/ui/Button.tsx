// src/components/ui/Button.tsx
import * as React from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading, className, disabled, children, ...props }, ref) => {
    const base =
      'rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 inline-flex items-center justify-center';

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
      secondary:
        'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? 'Loading…' : children}
      </button>
    );
  }
);
Button.displayName = 'Button';
