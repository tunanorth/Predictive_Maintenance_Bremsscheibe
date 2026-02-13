import { useFleetOverview, useFleet } from '@/hooks/use-fleet';
import { useVehicles } from '@/hooks/use-vehicles';
import { useDiscs } from '@/hooks/use-discs';
import { useAlerts } from '@/hooks/use-alerts';
import { MetricCard } from '@/components/MetricCard';
import { DataTable, Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import type { Vehicle, BrakeDisc } from '@/types';
import { 
  AlertTriangle, 
  Activity, 
  Wrench, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getVitoImageForId, getVitoImageForIndex } from '@/lib/vito-images';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export function FleetPage() {
  const navigate = useNavigate();
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useFleetOverview();
  const { data: fleet } = useFleet();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { data: allDiscs, isLoading: discsLoading } = useDiscs();
  const { data: alerts } = useAlerts();

  if (overviewError) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  const criticalDiscs = allDiscs?.filter((d) => d.risk === 'CRITICAL') || [];
  const warningDiscs = allDiscs?.filter((d) => d.risk === 'WARN') || [];
  const topAtRisk = [...(allDiscs || [])]
    .sort((a, b) => a.predicted_rul_km - b.predicted_rul_km)
    .slice(0, 10);

  // Predictive Maintenance Insights
  const maintenanceSchedule = vehicles?.map(v => {
    const vehicleDiscs = allDiscs?.filter(d => d.vehicleId === v.id) || [];
    const minRUL = Math.min(...vehicleDiscs.map(d => d.predicted_rul_km), Infinity);
    const avgHealth = vehicleDiscs.reduce((sum, d) => sum + d.health_score, 0) / (vehicleDiscs.length || 1);
    const criticalCount = vehicleDiscs.filter(d => d.risk === 'CRITICAL').length;
    
    return {
      vehicle: v,
      nextMaintenanceKm: minRUL,
      daysUntilMaintenance: Math.floor(minRUL / 200), // Assuming 200km/day average
      avgHealth,
      criticalCount,
      priority: criticalCount > 0 ? 'HIGH' : minRUL < 2000 ? 'MEDIUM' : 'LOW',
    };
  }).sort((a, b) => a.nextMaintenanceKm - b.nextMaintenanceKm) || [];

  // Health trend data (last 7 days simulation)
  const healthTrendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avgHealth: overview ? overview.avg_health_score + (Math.random() - 0.5) * 5 : 0,
      criticalCount: criticalDiscs.length + Math.floor((Math.random() - 0.5) * 3),
    };
  });

  // Depot performance (resolve depot names from fleet)
  const depotNameById = new Map(fleet?.depots?.map((d) => [d.id, d.name]) ?? []);
  const depotPerformance = vehicles?.reduce((acc, v) => {
    const depotId = v.depotId;
    if (!acc[depotId]) {
      acc[depotId] = { name: depotNameById.get(depotId) ?? depotId, vehicles: 0, avgHealth: 0, critical: 0 };
    }
    acc[depotId].vehicles++;
    acc[depotId].avgHealth += v.overall_health_score;
    if (v.overall_risk === 'CRITICAL') acc[depotId].critical++;
    return acc;
  }, {} as Record<string, { name: string; vehicles: number; avgHealth: number; critical: number }>) || {};

  const depotData = Object.values(depotPerformance).map(d => ({
    depot: d.name,
    avgHealth: d.avgHealth / d.vehicles,
    critical: d.critical,
    vehicles: d.vehicles,
  }));

  const vehicleColumns: Column<Vehicle>[] = [
    {
      header: 'Vehicle',
      accessor: (v) => (
        <div className="flex items-center gap-3">
          <img
            src={getVitoImageForId(v.id)}
            alt=""
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-slate-100 dark:bg-slate-800"
          />
          <div className={cn("w-2 h-2 rounded-full flex-shrink-0", getStatusColor(v.overall_risk))} />
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 dark:text-white truncate">{v.name}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">VIN {v.vin_masked} • {v.model_code}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Health Score',
      accessor: (v) => (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Progress 
              value={v.overall_health_score} 
              className="h-2"
            />
          </div>
          <span className="text-sm font-medium w-12 text-right">
            {formatNumber(v.overall_health_score, 1)}%
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (v) => <StatusBadge status={v.overall_risk} />,
    },
    {
      header: 'Next Service',
      accessor: (v) => {
        const vehicleDiscs = allDiscs?.filter(d => d.vehicleId === v.id) || [];
        const minRUL = Math.min(...vehicleDiscs.map(d => d.predicted_rul_km), Infinity);
        if (minRUL === Infinity) return '-';
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate-700 dark:text-slate-200" />
            <span className="text-sm">{formatNumber(minRUL)} km</span>
          </div>
        );
      },
    },
    {
      header: 'Mileage',
      accessor: (v) => (
        <span className="text-sm font-medium">{formatNumber(v.mileage_km)} km</span>
      ),
    },
  ];

  const discColumns: Column<BrakeDisc & { id: string; vehicleName: string; urgency: number }>[] = [
    {
      header: 'Vehicle',
      accessor: 'vehicleName',
    },
    {
      header: 'Position',
      accessor: (d) => (
        <Badge variant="outline" className="font-mono">{d.position}</Badge>
      ),
    },
    {
      header: 'Risk',
      accessor: (d) => <StatusBadge status={d.risk} />,
    },
    {
      header: 'RUL',
      accessor: (d) => (
        <div>
          <div className="font-semibold text-[#1A1A1A] dark:text-white">
            {formatNumber(d.predicted_rul_km)} km
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-200">
            ~{formatNumber(d.predicted_rul_days)} days
          </div>
        </div>
      ),
    },
    {
      header: 'Health',
      accessor: (d) => (
        <div className="flex items-center gap-2">
          <Progress value={d.health_score} className="h-2 flex-1" />
          <span className="text-sm w-12 text-right">{formatNumber(d.health_score, 1)}%</span>
        </div>
      ),
    },
    {
      header: 'Dringlichkeit',
      accessor: (d) => {
        const urgency = d.urgency || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Progress 
                value={urgency} 
                className={cn(
                  "h-2",
                  urgency > 80 ? "bg-rose-500" : urgency > 50 ? "bg-sky-500" : "bg-emerald-500"
                )}
              />
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-200">{urgency}%</span>
          </div>
        );
      },
    },
  ];

  // Helper function for conditional classes
  const getStatusColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-500 animate-pulse';
      case 'WARN':
        return 'bg-sky-500';
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-4xl font-light text-[#0F172A] dark:text-[#E5E7EB] tracking-tight">
            Fleet overview
          </h1>
          <Button onClick={() => navigate('/analytics')} variant="outline" size="sm" className="gap-2 rounded-full">
            <BarChart3 className="h-4 w-4" />
            Analytics anzeigen
          </Button>
        </div>
        <p className="text-base text-[#4B5563] dark:text-[#CBD5F5] leading-relaxed">
          Fleet health overview incl. critical brake discs, open alerts and upcoming maintenance needs.
        </p>
      </div>

      {/* Key metrics */}
      {overviewLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-36 rounded-3xl" />
          ))}
        </div>
      ) : (
        overview && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              title="Critical brake discs"
              value={overview.critical_discs_count}
              icon={<AlertTriangle className="h-5 w-5" />}
              variant="danger"
              trend={{
                value: -2,
                label: 'ggü. Vorwoche',
                isPositive: false,
              }}
            />
            <MetricCard
              title="Open alerts"
              value={overview.open_alerts_count}
              icon={<Shield className="h-5 w-5" />}
              variant="warning"
              subtitle={`${alerts?.filter(a => a.severity === 'CRITICAL').length || 0} kritisch`}
            />
            <MetricCard
              title="Avg. health score"
              value={`${formatNumber(overview.avg_health_score, 1)}%`}
              icon={<Activity className="h-5 w-5" />}
              variant={overview.avg_health_score > 80 ? 'success' : overview.avg_health_score > 60 ? 'warning' : 'danger'}
              trend={{
                value: 2.3,
                label: 'ggü. Vorwoche',
                isPositive: true,
              }}
            />
            <MetricCard
              title="Vehicles in workshop"
              value={overview.vehicles_in_shop}
              icon={<Wrench className="h-5 w-5" />}
              variant="default"
            />
            <MetricCard
              title="Service due ≤ 14 days"
              value={overview.service_due_14d}
              icon={<Calendar className="h-5 w-5" />}
              variant="warning"
              subtitle="geplanter Werkstattaufenthalt"
            />
          </div>
        )
      )}

      {/* Health trend */}
      <Card className="rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-medium">Fleet health trend</CardTitle>
              <CardDescription className="mt-1">
                7‑day evolution of average health score and number of critical components.
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Tendenz steigend
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={healthTrendData}>
              <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="avgHealth" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorHealth)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Maintenance priorities & depot performance */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Maintenance priorities */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Maintenance priorities</CardTitle>
            <CardDescription className="mt-1">
              Next vehicles due based on predicted remaining useful life (RUL).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {maintenanceSchedule.slice(0, 5).map((item, idx) => (
                <button
                  key={item.vehicle.id}
                  type="button"
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#020817] hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-mercedes-accent"
                  onClick={() => navigate(`/vehicles/${item.vehicle.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={getVitoImageForIndex(idx)}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-slate-100 dark:bg-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                        {item.vehicle.name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        VIN {item.vehicle.vin_masked} • {formatNumber(item.nextMaintenanceKm)} km •{' '}
                        {item.daysUntilMaintenance} days
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.criticalCount > 0 && (
                      <Badge variant="destructive" className="text-xs rounded-full px-2.5 py-0.5">
                        {item.criticalCount} critical
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-slate-500 dark:text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 rounded-full"
              onClick={() => navigate('/alerts')}
            >
              View all maintenance items
            </Button>
          </CardContent>
        </Card>

        {/* Depot performance */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Depot performance</CardTitle>
            <CardDescription className="mt-1">
              Average health score by depot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={depotData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis 
                  dataKey="depot" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar dataKey="avgHealth" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data tables */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-medium">
                  Top 10 at-risk brake discs
                </CardTitle>
                <CardDescription className="mt-1">
                  Components with prioritized maintenance need.
                </CardDescription>
              </div>
              <Badge variant="destructive" className="rounded-full px-3 py-1">{topAtRisk.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {discsLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <DataTable
                columns={discColumns}
                data={topAtRisk.map((d) => ({
                  ...d,
                  id: d.discId,
                  vehicleName: vehicles?.find((v) => v.id === d.vehicleId)?.name || 'Unknown',
                  urgency: d.predicted_rul_km < 1000 ? 100 : 
                          d.predicted_rul_km < 2000 ? 75 :
                          d.predicted_rul_km < 5000 ? 50 : 25,
                }))}
                onRowClick={(row) => navigate(`/vehicles/${row.vehicleId}`)}
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-medium">Fleet Vehicles</CardTitle>
                <CardDescription className="mt-1">Complete vehicle inventory and status</CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full px-3 py-1">{vehicles?.length || 0} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {vehiclesLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <DataTable
                columns={vehicleColumns}
                data={vehicles || []}
                onRowClick={(row) => navigate(`/vehicles/${row.id}`)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
