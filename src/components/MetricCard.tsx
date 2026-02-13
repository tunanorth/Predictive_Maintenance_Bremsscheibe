import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}: MetricCardProps) {
  const variantStyles = {
    default: '',
    success: 'bg-emerald-500/5 dark:bg-emerald-500/10',
    warning: 'bg-sky-500/10 dark:bg-sky-500/15',
    danger: 'bg-rose-500/10 dark:bg-rose-500/15',
  };

  return (
    <Card className={cn('group hover:shadow-md transition-all', variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-slate-500 dark:text-slate-300 group-hover:scale-110 transition-transform">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-light text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
          {typeof value === 'number' ? formatNumber(value) : value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-700 dark:text-slate-200 mt-1.5">{subtitle}</p>
        )}
        {trend && (
          <div className={cn(
            'flex items-center gap-1.5 mt-3 text-xs font-medium',
            trend.value > 0 
              ? 'text-slate-900 dark:text-slate-100' 
              : trend.value < 0 
              ? 'text-[#BA1A1A] dark:text-[#FFB4AB]'
              : 'text-slate-700 dark:text-slate-200'
          )}>
            {trend.value > 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : trend.value < 0 ? (
              <TrendingDown className="h-3.5 w-3.5" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
            <span>
              {trend.value > 0 ? '+' : ''}
              {formatNumber(Math.abs(trend.value))} {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
