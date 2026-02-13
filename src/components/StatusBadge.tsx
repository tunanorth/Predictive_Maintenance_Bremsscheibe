import { Badge } from '@/components/ui/badge';
import type { RiskLevel, AlertSeverity } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: RiskLevel | AlertSeverity;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<
    RiskLevel | AlertSeverity,
    { label: string; className: string }
  > = {
    OK: { 
      label: 'OK', 
      className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-0 font-medium' 
    },
    WARN: { 
      label: 'WARNUNG', 
      className: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-0 font-medium' 
    },
    CRITICAL: {
      label: 'KRITISCH',
      className: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-0 font-medium',
    },
    INFO: { 
      label: 'INFO', 
      className: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-0 font-medium' 
    },
  };

  const variant = variants[status] || variants.OK;

  return (
    <Badge
      variant="outline"
      className={cn('rounded-full px-3 py-1', variant.className, className)}
    >
      {variant.label}
    </Badge>
  );
}
