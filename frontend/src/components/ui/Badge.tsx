import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'primary';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  primary: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-400',
  primary: 'bg-current',
};

export function Badge({ children, variant = 'neutral', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        variantClasses[variant],
        className,
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

export function AvailabilityBadge({ status }: { status: string }) {
  const variant =
    status === 'AVAILABLE'
      ? 'success'
      : status === 'UNAVAILABLE'
        ? 'danger'
        : status === 'MAYBE'
          ? 'warning'
          : 'neutral';

  const label =
    status === 'AVAILABLE'
      ? 'Available'
      : status === 'UNAVAILABLE'
        ? 'Not Available'
        : status === 'MAYBE'
          ? 'Maybe'
          : 'Pending';

  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}