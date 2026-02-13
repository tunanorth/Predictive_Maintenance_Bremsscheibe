import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface HealthGaugeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function HealthGauge({
  score,
  label = 'Health score',
  size = 'md',
}: HealthGaugeProps) {
  const percentage = Math.min(100, Math.max(0, score));
  const color =
    percentage >= 80
      ? 'text-emerald-500'
      : percentage >= 60
      ? 'text-sky-500'
      : 'text-rose-500';

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className={cn('font-semibold tracking-tight', sizeClasses[size], color)}>
          {formatNumber(percentage, 1)}
        </div>
        <div className="text-xs uppercase tracking-wider text-slate-500 mt-2 font-medium">
          {label}
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-4">
          <div
            className={cn(
              'h-1.5 rounded-full transition-all',
              percentage >= 80
                ? 'bg-emerald-500'
                : percentage >= 60
                ? 'bg-sky-500'
                : 'bg-rose-500'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

