import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAlerts } from '@/hooks/use-alerts';
import { useFleet } from '@/hooks/use-fleet';
import { useVehicles } from '@/hooks/use-vehicles';
import { updateAlertStatus } from '@/api/fleet.write';
import { DataTable, Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatNumber } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import type { Alert } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExportCsvButton } from '@/components/ExportCsvButton';
import { AlertDetailPanel } from '@/components/AlertDetailPanel';
import { MetricCard } from '@/components/MetricCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function AlertsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [severity, setSeverity] = useState<Alert['severity'] | 'ALL'>('ALL');
  const [status, setStatus] = useState<Alert['status'] | 'ALL'>('ALL');
  const [category, setCategory] = useState<Alert['category'] | 'ALL'>('ALL');
  const [depotId, setDepotId] = useState<string>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { data: fleet } = useFleet();
  const { data: vehicles } = useVehicles();
  const { data: alerts, isLoading, error } = useAlerts({
    severity: severity !== 'ALL' ? severity : undefined,
    status: status !== 'ALL' ? status : undefined,
    category: category !== 'ALL' ? category : undefined,
    depotId: depotId !== 'ALL' ? depotId : undefined,
  });

  if (error) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  // Smart prioritization
  const prioritizedAlerts = useMemo(() => {
    if (!alerts) return [];
    return [...alerts].sort((a, b) => {
      // Priority: CRITICAL > WARN > INFO
      const severityOrder = { CRITICAL: 3, WARN: 2, INFO: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      // Then by lead time (shorter = higher priority)
      return a.predicted_lead_time_km - b.predicted_lead_time_km;
    });
  }, [alerts]);

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsPanelOpen(true);
  };

  const handleAcknowledge = async (alert: Alert) => {
    await updateAlertStatus(alert, 'ACK');
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    queryClient.invalidateQueries({ queryKey: ['fleet-overview'] });
  };

  const handleResolve = async (alert: Alert) => {
    await updateAlertStatus(alert, 'RESOLVED');
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    queryClient.invalidateQueries({ queryKey: ['fleet-overview'] });
  };

  // Alert statistics
  const stats = useMemo(() => {
    if (!alerts) return null;
    const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
    const open = alerts.filter(a => a.status === 'OPEN').length;
    const resolved = alerts.filter(a => a.status === 'RESOLVED').length;
    const avgLeadTime = alerts.reduce((sum, a) => sum + a.predicted_lead_time_km, 0) / alerts.length;
    const falsePositiveRate = alerts.reduce((sum, a) => sum + a.false_positive_risk, 0) / alerts.length;
    
    return { critical, open, resolved, avgLeadTime, falsePositiveRate };
  }, [alerts]);

  const columns: Column<Alert>[] = [
    {
      header: 'Priority',
      accessor: (a) => {
        const priority = a.severity === 'CRITICAL' ? 'HIGH' : a.severity === 'WARN' ? 'MEDIUM' : 'LOW';
        const color = priority === 'HIGH' ? 'destructive' : priority === 'MEDIUM' ? 'default' : 'outline';
        return <Badge variant={color as any}>{priority}</Badge>;
      },
    },
    {
      header: 'Severity',
      accessor: (a) => <StatusBadge status={a.severity} />,
    },
    {
      header: 'Category',
      accessor: (a) => (
        <div className="flex items-center gap-2">
          <span>{a.category}</span>
          {a.false_positive_risk > 0.3 && (
            <Badge variant="outline" className="text-xs">FP Risk</Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Vehicle',
      accessor: (a) => {
        const vehicle = vehicles?.find(v => v.id === a.vehicleId);
        return vehicle ? (
          <div>
            <div className="font-medium">{vehicle.name}</div>
            <div className="text-xs text-slate-700 dark:text-slate-200">{a.position}</div>
          </div>
        ) : 'Unknown';
      },
    },
    {
      header: 'Lead Time',
      accessor: (a) => (
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-700 dark:text-slate-200" />
          <span className="font-medium">{formatNumber(a.predicted_lead_time_km)} km</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (a) => (
        <Badge 
          variant={a.status === 'RESOLVED' ? 'default' : a.status === 'ACK' ? 'secondary' : 'outline'}
        >
          {a.status}
        </Badge>
      ),
    },
    {
      header: 'Created',
      accessor: (a) => (
        <span className="text-sm text-slate-700 dark:text-slate-200">{formatDate(a.createdAt)}</span>
      ),
    },
  ];

  const exportData =
    alerts?.map((a) => ({
      createdAt: a.createdAt,
      severity: a.severity,
      category: a.category,
      status: a.status,
      position: a.position,
      predicted_lead_time_km: a.predicted_lead_time_km,
      recommended_action: a.recommended_action,
      false_positive_risk: a.false_positive_risk,
    })) || [];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-4xl font-light text-[#0F172A] dark:text-[#E5E7EB] tracking-tight">
            Predictive alerts
          </h1>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2 rounded-full">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <ExportCsvButton
              data={exportData}
              filename="alerts"
            />
          </div>
        </div>
        <p className="text-base text-[#4B5563] dark:text-[#CBD5F5] leading-relaxed">
          Intelligent alert prioritisation and maintenance recommendations.
        </p>
      </div>

      {/* Alert KPIs */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="Critical alerts"
            value={stats.critical}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="danger"
          />
          <MetricCard
            title="Open alerts"
            value={stats.open}
            icon={<AlertCircle className="h-5 w-5" />}
            variant="warning"
          />
          <MetricCard
            title="Resolved"
            value={stats.resolved}
            icon={<CheckCircle2 className="h-5 w-5" />}
            variant="success"
            subtitle={`${alerts ? Math.round((stats.resolved / alerts.length) * 100) : 0}% resolution rate`}
          />
          <MetricCard
            title="Avg. lead distance"
            value={`${formatNumber(stats.avgLeadTime)} km`}
            icon={<Clock className="h-5 w-5" />}
            variant="default"
          />
          <MetricCard
            title="False positive risk"
            value={`${formatNumber(stats.falsePositiveRate * 100, 1)}%`}
            icon={<Zap className="h-5 w-5" />}
            variant={stats.falsePositiveRate > 0.3 ? 'warning' : 'default'}
          />
        </div>
      )}

      {/* Filters */}
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-[#4B5563] dark:text-[#CBD5F5]">
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-700 dark:text-slate-200 mb-2 block">Severity</label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARN">Warning</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-700 dark:text-slate-200 mb-2 block">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="ACK">Acknowledged</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-700 dark:text-slate-200 mb-2 block">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="WEAR">Wear</SelectItem>
                  <SelectItem value="THERMAL">Thermal</SelectItem>
                  <SelectItem value="WARP_RISK">Warp risk</SelectItem>
                  <SelectItem value="JUDDER">Judder</SelectItem>
                  <SelectItem value="DATA_QUALITY">Data quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-700 dark:text-slate-200 mb-2 block">Depot</label>
              <Select value={depotId} onValueChange={setDepotId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  {fleet?.depots.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts table */}
      {isLoading ? (
        <Skeleton className="h-64 rounded-3xl" />
      ) : (
        <Card className="rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-medium">Alerts</CardTitle>
                <CardDescription className="mt-1">
                  {prioritizedAlerts.length} alerts • prioritised by severity and remaining lead distance
                </CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {prioritizedAlerts.length} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={prioritizedAlerts}
              onRowClick={handleAlertClick}
            />
          </CardContent>
        </Card>
      )}

      {selectedAlert && (
        <AlertDetailPanel
          alert={selectedAlert}
          open={isPanelOpen}
          onOpenChange={setIsPanelOpen}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
}
