import { useModels } from '@/hooks/use-models';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDate, formatNumber } from '@/lib/utils';
import { MetricCard } from '@/components/MetricCard';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Zap,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

export function ModelsPage() {
  const { data: models, isLoading, error } = useModels();

  if (error) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  if (isLoading || !models) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const hasHighDrift = models.data_quality.drift_score > 0.7;
  const needsRetraining = models.data_quality.drift_score > 0.5;

  // Model performance over time (simulated)
  const performanceData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      precision: models.metrics.alert_precision + (Math.random() - 0.5) * 0.05,
      recall: models.metrics.alert_recall + (Math.random() - 0.5) * 0.05,
      f1: (models.metrics.alert_precision + models.metrics.alert_recall) / 2 + (Math.random() - 0.5) * 0.05,
    };
  });

  // A/B Testing results (simulated)
  const abTestResults = [
    { model: 'v2.1 (Current)', precision: models.metrics.alert_precision, recall: models.metrics.alert_recall, users: 100 },
    { model: 'v2.2 (Candidate)', precision: models.metrics.alert_precision + 0.02, recall: models.metrics.alert_recall + 0.01, users: 50 },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Kopfbereich */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-4xl font-light text-[#0F172A] dark:text-[#E5E7EB] tracking-tight">
            ML‑Modellüberwachung
          </h1>
          <Button variant="outline" size="sm" className="gap-2 rounded-full">
            <RefreshCw className="h-4 w-4" />
            Modell neu trainieren
          </Button>
        </div>
        <p className="text-base text-[#4B5563] dark:text-[#CBD5F5] leading-relaxed">
          Modellgüte, Drift-Erkennung und Retraining-Empfehlungen für das Predictive-Maintenance-Modell.
        </p>
      </div>

      {/* Hinweisbanner */}
      {hasHighDrift && (
        <Card className="rounded-3xl border-0 bg-rose-500/10 dark:bg-rose-500/15">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-300" />
              <div>
                <div className="font-medium text-sm text-[#0F172A] dark:text-[#E5E7EB]">
                  Strong data drift detected
                </div>
                <div className="text-xs text-[#4B5563] dark:text-[#CBD5F5] mt-0.5">
                  Drift score: {formatNumber(models.data_quality.drift_score, 2)}. Model should be retrained as soon as possible.
                </div>
              </div>
            </div>
            <Button variant="destructive" size="sm" className="rounded-full">
              Schedule retraining
            </Button>
          </CardContent>
        </Card>
      )}

      {needsRetraining && !hasHighDrift && (
        <Card className="rounded-3xl border-0 bg-sky-500/5 dark:bg-sky-500/15">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <Activity className="h-5 w-5 text-sky-700 dark:text-sky-300" />
              <div>
                <div className="font-medium text-sm text-[#0F172A] dark:text-[#E5E7EB]">
                  Moderate drift detected
                </div>
                <div className="text-xs text-[#4B5563] dark:text-[#CBD5F5] mt-0.5">
                  Plan retraining for the next scheduled maintenance window.
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              Plan retraining
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Key metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Alert precision"
          value={formatNumber(models.metrics.alert_precision, 3)}
          icon={<Target className="h-5 w-5" />}
          variant={models.metrics.alert_precision > 0.9 ? 'success' : models.metrics.alert_precision > 0.8 ? 'warning' : 'danger'}
          trend={{
            value: 0.02,
            label: 'vs last week',
            isPositive: true,
          }}
        />
        <MetricCard
          title="Alert‑Recall"
          value={formatNumber(models.metrics.alert_recall, 3)}
          icon={<Zap className="h-5 w-5" />}
          variant={models.metrics.alert_recall > 0.9 ? 'success' : models.metrics.alert_recall > 0.8 ? 'warning' : 'danger'}
          trend={{
            value: 0.01,
            label: 'vs last week',
            isPositive: true,
          }}
        />
        <MetricCard
          title="RUL MAE"
          value={`${formatNumber(models.metrics.rul_mae_km)} km`}
          icon={<Activity className="h-5 w-5" />}
          variant={models.metrics.rul_mae_km < 500 ? 'success' : models.metrics.rul_mae_km < 1000 ? 'warning' : 'danger'}
          trend={{
            value: -50,
            label: 'km improvement',
            isPositive: true,
          }}
        />
        <MetricCard
          title="Avg. lead distance"
          value={`${formatNumber(models.metrics.avg_lead_time_km)} km`}
          icon={<Target className="h-5 w-5" />}
          variant="default"
          subtitle="prediction window"
        />
      </div>

      {/* Modellperformance über die Zeit */}
      <Card className="rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-medium">
                Modell‑Trends
              </CardTitle>
              <CardDescription className="mt-1">
                30‑Tage‑Verlauf von Präzision, Recall und F1‑Score
              </CardDescription>
            </div>
              <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
              <TrendingUp className="h-3.5 w-3.5" />
                Tendenz steigend
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorPrecision" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRecall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                domain={[0, 1]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="precision" 
                stroke="#3b82f6" 
                fill="url(#colorPrecision)"
                strokeWidth={2}
                name="Precision"
              />
              <Area 
                type="monotone" 
                dataKey="recall" 
                stroke="#10b981" 
                fill="url(#colorRecall)"
                strokeWidth={2}
                name="Recall"
              />
              <Line 
                type="monotone" 
                dataKey="f1" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="F1 Score"
                dot={{ fill: '#8b5cf6', r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* A/B Testing & Model Versions */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* A/B Testing Results */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-medium">A/B Testing Results</CardTitle>
            <CardDescription className="mt-1">Comparing current vs candidate model versions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={abTestResults}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis 
                  dataKey="model" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  domain={[0, 1]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
                <Bar dataKey="precision" fill="#3b82f6" name="Precision" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recall" fill="#10b981" name="Recall" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Versions */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Model Versions</CardTitle>
            <CardDescription className="mt-1">Deployment history and version management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {models.versions.map((version, idx) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-4 rounded-2xl border-0 bg-[#FEFBFF] dark:bg-[#1C1B1F] hover:bg-[#F5F5F5] dark:hover:bg-[#2D2C30] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#6750A4] dark:bg-[#D0BCFF] text-white dark:text-slate-900 flex items-center justify-center text-sm font-medium">
                      v{idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{version.name}</span>
                        {idx === 0 && (
                          <Badge variant="default" className="text-xs rounded-full px-2 py-0.5">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 mt-1">
                        {version.notes}
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">
                        Deployed: {formatDate(version.deployedAt)}
                      </p>
                    </div>
                  </div>
                  {idx === 0 && (
                    <CheckCircle2 className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Metrics */}
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Datenqualität & Modellgesundheit</CardTitle>
          <CardDescription className="mt-1">
            Kennzahlen zur Datenqualität und Indikatoren für die Zuverlässigkeit des Modells.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Missingness</span>
                <span className="font-semibold">
                  {formatNumber(models.data_quality.missingness_pct, 1)}%
                </span>
              </div>
              <Progress 
                value={100 - models.data_quality.missingness_pct} 
                className="h-3"
              />
              <div className="flex items-center gap-2 text-xs">
                {models.data_quality.missingness_pct < 5 ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Exzellent</span>
                  </>
                ) : models.data_quality.missingness_pct < 10 ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 text-sky-500" />
                    <span className="text-sky-600 dark:text-sky-300">Gut</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-rose-600 dark:text-rose-400">Handlungsbedarf</span>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Drift Score</span>
                <span className="font-semibold">
                  {formatNumber(models.data_quality.drift_score, 2)}
                </span>
              </div>
              <Progress 
                value={(1 - models.data_quality.drift_score) * 100} 
                className="h-3"
              />
              <div className="flex items-center gap-2 text-xs">
                {models.data_quality.drift_score < 0.3 ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Stabil</span>
                  </>
                ) : models.data_quality.drift_score < 0.7 ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 text-sky-500" />
                    <span className="text-sky-600 dark:text-sky-300">Moderater Drift</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-rose-600 dark:text-rose-400">Starker Drift – Retraining nötig</span>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Last Data Ingest</span>
                <span className="font-semibold">
                  {formatDate(models.data_quality.last_ingest)}
                </span>
              </div>
              <div className="h-3 bg-[#E5E5E5] dark:bg-[#1F1F1F] rounded-full" />
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Real-time Streaming Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
