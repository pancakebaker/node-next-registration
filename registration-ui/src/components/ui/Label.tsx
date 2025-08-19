// src/components/ui/Label.tsx
import * as React from 'react';
import { cn } from '@/lib/cn';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('mb-1 block text-sm font-medium text-gray-700', className)}
      {...props}
    />
  )
);
Label.displayName = 'Label';
