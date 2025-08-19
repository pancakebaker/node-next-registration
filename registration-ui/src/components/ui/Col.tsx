// src/components/ui/Col.tsx
import * as React from 'react';
import { cn } from '@/lib/cn';

export type ColProps = React.HTMLAttributes<HTMLDivElement>;

export function Col({ className, ...props }: ColProps) {
  return <div className={cn('sm:col-span-1', className)} {...props} />;
}
