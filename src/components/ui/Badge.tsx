import React from 'react';
import { cx } from './AppPrimitives';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'payment';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary text-on-primary ring-primary/20',
    secondary: 'bg-secondary-container text-on-secondary-container ring-secondary/20',
    outline: 'bg-transparent text-on-surface ring-outline',
    destructive: 'bg-error text-on-error ring-error/20',
    success: 'bg-emerald-100 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-700 ring-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300',
    info: 'bg-blue-100 text-blue-700 ring-blue-500/20 dark:bg-blue-950/40 dark:text-blue-300',
    payment: 'bg-amber-100 text-amber-700 ring-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300',
  };

  return (
    <div
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
