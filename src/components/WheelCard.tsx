import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { HealthGauge } from './HealthGauge';
import { formatNumber } from '@/lib/utils';
import type { BrakeDisc, WheelPosition } from '@/types';
import { cn } from '@/lib/utils';

interface WheelCardProps {
  disc: BrakeDisc | undefined;
  position: WheelPosition;
  label: string;
  onClick?: () => void;
}

export function WheelCard({ disc, position, label, onClick }: WheelCardProps) {
  if (!disc) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 dark:text-slate-200">No data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-[0_4px_12px_rgba(15,23,42,0.15)] hover:border-slate-200 active:scale-[0.99] overflow-hidden',
        disc.risk === 'CRITICAL' && 'border-rose-500/40',
        disc.risk === 'WARN' && 'border-sky-500/40'
      )}
    >
      <button
        type="button"
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-mercedes-accent focus-visible:ring-inset rounded-3xl"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick?.();
        }}
      >
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-slate-900">{label}</CardTitle>
        <StatusBadge status={disc.risk} />
      </CardHeader>
      <CardContent className="space-y-4">
        <HealthGauge score={disc.health_score} size="sm" />
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px] font-medium mb-1">Thickness</div>
            <div className="font-semibold text-slate-900">
              {formatNumber(disc.disc_thickness_mm, 1)} mm
            </div>
          </div>
          <div>
            <div className="text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px] font-medium mb-1">Wear</div>
            <div className="font-semibold text-slate-900">{formatNumber(disc.wear_pct, 1)}%</div>
          </div>
          <div>
            <div className="text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px] font-medium mb-1">RUL</div>
            <div className="font-semibold text-slate-900">
              {formatNumber(disc.predicted_rul_km)} km
            </div>
          </div>
          <div>
            <div className="text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px] font-medium mb-1">Temp Peak</div>
            <div className="font-semibold text-slate-900">
              {formatNumber(disc.temp_peak_C, 0)}°C
            </div>
          </div>
        </div>
      </CardContent>
      </button>
    </Card>
  );
}

