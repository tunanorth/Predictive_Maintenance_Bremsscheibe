import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-mercedes-accent focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-mercedes-accent text-white hover:bg-mercedes-accent-dark',
        secondary:
          'border-transparent bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700',
        destructive:
          'border-transparent bg-rose-600 dark:bg-rose-500 text-white dark:text-slate-900 hover:bg-rose-700 dark:hover:bg-rose-400',
        outline: 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
