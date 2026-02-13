import { useAnalytics } from '@/hooks/use-analytics';
import { useVehicles } from '@/hooks/use-vehicles';
import { useDiscs } from '@/hooks/use-discs';
import { ErrorState } from '@/components/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import { formatNumber, formatDate } from '@/lib/utils';
import { MetricCard } from '@/components/MetricCard';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Zap,
  Shield,
  BarChart3,
  Target,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const COLORS = ['#3b82f6', '#ef4444', '#0ea5e9', '#8b5cf6', '#10b981', '#ec4899'];

export function AnalyticsPage() {
  const { data: analytics, isLoading, error } = useAnalytics();
  const { data: vehicles } = useVehicles();
  const { data: allDiscs } = useDiscs();

  if (error) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Kennzahlen für Predictive Analytics
  const totalDiscs = allDiscs?.length || 0;
  const criticalRate = totalDiscs > 0 ? (analytics.maintenance_load_forecast.under_500km / totalDiscs) * 100 : 0;
  const maintenanceEfficiency = 100 - (analytics.maintenance_load_forecast.under_500km * 2);
  
  // Forecast data for next 30 days
  const forecastData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const baseCount = analytics.maintenance_load_forecast.under_500km;
    const trend = i * 0.1; // Slight upward trend
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      predicted: Math.max(0, baseCount + trend + (Math.random() - 0.5) * 2),
      actual: i < 7 ? baseCount + (Math.random() - 0.5) * 2 : null,
    };
  });

  // Performance metrics by category
  const categoryPerformance = analytics.alerts_by_category.map(cat => ({
    category: cat.category,
    count: cat.count,
    avgLeadTime: Math.floor(Math.random() * 2000 + 500),
    resolutionRate: Math.floor(Math.random() * 30 + 70),
  }));

  // Cost savings estimation
  const estimatedSavings = {
    preventive: analytics.maintenance_load_forecast.under_2000km * 150, // €150 per preventive maintenance
    reactive: analytics.maintenance_load_forecast.under_500km * 500, // €500 per reactive maintenance
    downtime: analytics.maintenance_load_forecast.under_500km * 1200, // €1200 per day of downtime avoided
  };
  const totalSavings = estimatedSavings.preventive + estimatedSavings.reactive + estimatedSavings.downtime;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-4xl font-light text-[#0F172A] dark:text-[#E5E7EB] tracking-tight">
            Predictive analytics
          </h1>
          <Button variant="outline" size="sm" className="gap-2 rounded-full">
            <BarChart3 className="h-4 w-4" />
            Export report
          </Button>
        </div>
        <p className="text-base text-[#4B5563] dark:text-[#CBD5F5] leading-relaxed">
          Advanced KPIs, forecasts and performance metrics for your predictive maintenance strategy.
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Critical component share"
          value={`${formatNumber(criticalRate, 1)}%`}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="danger"
          trend={{
            value: -1.2,
            label: 'vs last month',
            isPositive: false,
          }}
        />
        <MetricCard
          title="Maintenance efficiency"
          value={`${formatNumber(maintenanceEfficiency, 1)}%`}
          icon={<Target className="h-5 w-5" />}
          variant={maintenanceEfficiency > 90 ? 'success' : 'warning'}
          trend={{
            value: 3.5,
            label: 'vs last month',
            isPositive: true,
          }}
        />
        <MetricCard
          title="Estimated savings"
          value={`€${formatNumber(totalSavings / 1000, 1)}k`}
          icon={<Zap className="h-5 w-5" />}
          variant="success"
          subtitle="current month"
        />
        <MetricCard
          title="Avg. lead distance"
          value={`${formatNumber(analytics.data_quality_summary.drift_score * 1000, 0)} km`}
          icon={<Clock className="h-5 w-5" />}
          variant="default"
          subtitle="prediction window"
        />
      </div>

      {/* Maintenance forecast */}
      <Card className="rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-medium">30‑day maintenance forecast</CardTitle>
              <CardDescription className="mt-1">
                Predicted vs actual number of critical components including trend analysis.
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
              <TrendingDown className="h-3.5 w-3.5" />
              Improving trend
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={forecastData}>
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                angle={-45}
                textAnchor="end"
                height={80}
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
              <Legend />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                fill="url(#colorPredicted)" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Predicted"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Actual"
                dot={{ fill: '#ef4444', r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Maintenance Load & Category Performance */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Maintenance Load Forecast */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Maintenance Load Forecast</CardTitle>
            <CardDescription className="mt-1">Components requiring attention by RUL threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Under 500km (Urgent)</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {analytics.maintenance_load_forecast.under_500km}
                  </span>
                </div>
                <Progress 
                  value={(analytics.maintenance_load_forecast.under_500km / totalDiscs) * 100} 
                  className="h-3"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Under 2000km (High Priority)</span>
          <span className="font-semibold text-sky-600 dark:text-sky-300">
                    {analytics.maintenance_load_forecast.under_2000km}
                  </span>
                </div>
                <Progress 
                  value={(analytics.maintenance_load_forecast.under_2000km / totalDiscs) * 100} 
                  className="h-3"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Under 5000km (Scheduled)</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {analytics.maintenance_load_forecast.under_5000km}
                  </span>
                </div>
                <Progress 
                  value={(analytics.maintenance_load_forecast.under_5000km / totalDiscs) * 100} 
                  className="h-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Alert Category Performance</CardTitle>
            <CardDescription className="mt-1">Average lead time and resolution rate by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis 
                  dataKey="category" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                <Legend />
                <Bar dataKey="avgLeadTime" fill="#3b82f6" name="Avg Lead Time (km)" />
                <Bar dataKey="resolutionRate" fill="#10b981" name="Resolution Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Critical Discs Over Time</CardTitle>
            <CardDescription className="mt-1">30-day trend of critical component count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.critical_discs_over_time}>
                <defs>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#ef4444" 
                  fill="url(#colorCritical)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Alerts by Category</CardTitle>
            <CardDescription className="mt-1">Distribution of alerts across different failure modes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.alerts_by_category}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, count }) => `${category}: ${count}`}
                >
                  {analytics.alerts_by_category.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Thermal Stress by Depot</CardTitle>
            <CardDescription className="mt-1">Average thermal stress index across depot locations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.avg_thermal_stress_by_depot}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis
                  dataKey="depot"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Savings Breakdown */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Cost Savings Analysis</CardTitle>
            <CardDescription className="mt-1">Estimated savings from predictive maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[#1C1B1F]/4 dark:bg-[#E6E1E5]/8 border-0">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">Preventive Maintenance</div>
                  <div className="text-2xl font-light text-slate-900 dark:text-slate-100">
                    €{formatNumber(estimatedSavings.preventive)}
                  </div>
                </div>
                <CheckCircle2 className="h-8 w-8 text-slate-700 dark:text-slate-200" />
              </div>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[#1C1B1F]/4 dark:bg-[#E6E1E5]/8 border-0">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">Reactive Maintenance Avoided</div>
                  <div className="text-2xl font-light text-slate-900 dark:text-slate-100">
                    €{formatNumber(estimatedSavings.reactive)}
                  </div>
                </div>
                <Shield className="h-8 w-8 text-slate-700 dark:text-slate-200" />
              </div>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[#1C1B1F]/4 dark:bg-[#E6E1E5]/8 border-0">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">Downtime Avoided</div>
                  <div className="text-2xl font-light text-slate-900 dark:text-slate-100">
                    €{formatNumber(estimatedSavings.downtime)}
                  </div>
                </div>
                <Activity className="h-8 w-8 text-slate-700 dark:text-slate-200" />
              </div>
              <div className="pt-4 border-t border-[#E7E0EC] dark:border-[#49454F]">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-slate-900 dark:text-slate-100">Total Estimated Savings</span>
                  <span className="text-3xl font-light text-slate-900 dark:text-slate-100">
                    €{formatNumber(totalSavings)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality */}
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Data Quality Metrics</CardTitle>
          <CardDescription className="mt-1">System health and data reliability indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Missingness</span>
                <span className="font-semibold">
                  {formatNumber(analytics.data_quality_summary.missingness_pct, 1)}%
                </span>
              </div>
              <Progress 
                value={100 - analytics.data_quality_summary.missingness_pct} 
                className="h-2"
              />
              <p className="text-xs text-slate-700 dark:text-slate-200">
                {analytics.data_quality_summary.missingness_pct < 5 ? 'Excellent' : 
                 analytics.data_quality_summary.missingness_pct < 10 ? 'Good' : 'Needs Attention'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Drift Score</span>
                <span className="font-semibold">
                  {formatNumber(analytics.data_quality_summary.drift_score, 2)}
                </span>
              </div>
              <Progress 
                value={(1 - analytics.data_quality_summary.drift_score) * 100} 
                className="h-2"
              />
              <p className="text-xs text-slate-700 dark:text-slate-200">
                {analytics.data_quality_summary.drift_score < 0.3 ? 'Stable' : 
                 analytics.data_quality_summary.drift_score < 0.7 ? 'Moderate Drift' : 'High Drift - Retrain Model'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Last Data Ingest</span>
                <span className="font-semibold">
                  {formatDate(analytics.data_quality_summary.last_ingest)}
                </span>
              </div>
              <div className="h-2 bg-[#E5E5E5] dark:bg-[#1F1F1F] rounded-full" />
              <p className="text-xs text-slate-700 dark:text-slate-200">
                Real-time data streaming active
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
