import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { StatusBadge } from './StatusBadge';
import { HealthGauge } from './HealthGauge';
import { TimeseriesChart } from './TimeseriesChart';
import { useDiscTimeseries } from '@/hooks/use-discs';
import { formatNumber, formatDate } from '@/lib/utils';
import type { BrakeDisc } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface DiscDetailSheetProps {
  disc: BrakeDisc;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiscDetailSheet({
  disc,
  open,
  onOpenChange,
}: DiscDetailSheetProps) {
  const { data: timeseries, isLoading: timeseriesLoading, error: timeseriesError } =
    useDiscTimeseries(disc.discId, 30);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white text-slate-900 dark:bg-[#020817] dark:text-slate-100">
        <SheetHeader>
          <SheetTitle>
            Brake disc {disc.position} - details
          </SheetTitle>
          <SheetDescription className="text-sm text-slate-500 dark:text-slate-300">
            Detailed metrics and trends for this brake disc.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <HealthGauge score={disc.health_score} size="md" />
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusBadge status={disc.risk} />
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-300">
                      Dicke:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatNumber(disc.disc_thickness_mm, 1)} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-300">
                      Verschleiß:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatNumber(disc.wear_pct, 1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-300">
                      RUL:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatNumber(disc.predicted_rul_km)} km
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  THERMAL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-300">
                    Peak-Temp.:
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {formatNumber(disc.temp_peak_C, 0)}°C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-300">
                    Stress-Index:
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {formatNumber(disc.thermal_stress_index, 2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  JUDDER
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-300">
                    Judder-Index:
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {formatNumber(disc.brake_judder_index, 2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-300">
                    Harte Bremsungen:
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {formatNumber(disc.harsh_brakes_per_100km, 1)} / 100 km
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {timeseriesLoading ? (
            <Skeleton className="h-64" />
          ) : timeseriesError || !timeseries || timeseries.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300 py-4">
              Chart data is not available for this disc.
            </p>
          ) : (
            <>
              <TimeseriesChart
                data={timeseries}
                title="Belag-/Scheibendicke"
                metrics={[
                  {
                    key: 'thickness_est_mm',
                    label: 'Dicke (mm)',
                    color: '#0ea5e9',
                    type: 'line',
                  },
                ]}
              />
              <TimeseriesChart
                data={timeseries}
                title="Temperaturverlauf"
                metrics={[
                  {
                    key: 'disc_temp_C',
                    label: 'Scheibentemperatur (°C)',
                    color: '#ef4444',
                    type: 'line',
                  },
                  {
                    key: 'temp_peak_C_window',
                    label: 'Temperaturspitzen (°C)',
                    color: '#38bdf8',
                    type: 'line',
                  },
                ]}
              />
              <TimeseriesChart
                data={timeseries}
                title="Judder Index"
                metrics={[
                  {
                    key: 'judder_index',
                    label: 'Judder Index',
                    color: '#8b5cf6',
                    type: 'line',
                  },
                ]}
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

