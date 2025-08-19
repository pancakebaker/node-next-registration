// src/components/ui/Alert.tsx
import * as React from 'react';
import { cn } from '@/lib/cn';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export function Alert({ variant = 'info', className, children, ...props }: AlertProps) {
  const base =
    'mt-4 rounded-lg border-l-4 p-4 text-sm';

  const variants: Record<AlertVariant, string> = {
    error: 'border-red-500 bg-red-50 text-red-700',
    success: 'border-green-500 bg-green-50 text-green-700',
    info: 'border-blue-500 bg-blue-50 text-blue-700',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-700',
  };

  return (
    <div
      role={variant === 'error' ? 'alert' : undefined}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
