import { simulateFetch } from './client';
import {
  getFleet,
  getVehicles,
  getVehicle,
  getDiscs,
  getDisc,
  getAlerts as getBaseAlerts,
  getEvents,
  getModels,
  generateTimeseries,
  getCurrentScenario,
  setScenario,
} from '@/mock/data';
import type {
  Fleet,
  Vehicle,
  BrakeDisc,
  Alert,
  Event,
  TimeseriesPoint,
  Models,
  FleetOverview,
  AnalyticsData,
  Scenario,
} from '@/types';
import { getAlertOverrides } from '@/lib/persist';

function applyAlertOverrides(alerts: Alert[]): Alert[] {
  const overrides = getAlertOverrides();
  return alerts.map((alert) => {
    const o = overrides[alert.id];
    if (!o) return alert;
    return {
      ...alert,
      status: (o.status as Alert['status']) || alert.status,
    };
  });
}

export async function fetchFleet(scenario?: Scenario): Promise<Fleet> {
  if (scenario) {
    setScenario(scenario);
  }
  return simulateFetch(getFleet(getCurrentScenario()));
}

export async function fetchFleetOverview(): Promise<FleetOverview> {
  const fleet = getFleet();
  const vehicles = getVehicles();
  const discs = getDiscs();
  const alerts = applyAlertOverrides(getBaseAlerts());

  const criticalDiscs = discs.filter((d) => d.risk === 'CRITICAL');
  const openAlerts = alerts.filter((a) => a.status === 'OPEN');
  const avgHealth =
    discs.reduce((sum, d) => sum + d.health_score, 0) / discs.length;
  const inShop = vehicles.filter((v) => v.status === 'IN_SHOP').length;
  const serviceDue = discs.filter(
    (d) => d.predicted_rul_days <= 14 && d.predicted_rul_days > 0
  ).length;

  return simulateFetch({
    critical_discs_count: criticalDiscs.length,
    open_alerts_count: openAlerts.length,
    avg_health_score: Math.round(avgHealth * 10) / 10,
    vehicles_in_shop: inShop,
    service_due_14d: serviceDue,
  });
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  return simulateFetch(getVehicles());
}

export async function fetchVehicle(id: string): Promise<Vehicle> {
  const vehicle = getVehicle(id);
  if (!vehicle) {
    throw new Error('Vehicle not found. It may have been removed or the link is outdated.');
  }
  return simulateFetch(vehicle, { delayMs: 0 });
}

export async function fetchDiscs(vehicleId?: string): Promise<BrakeDisc[]> {
  return simulateFetch(getDiscs(vehicleId));
}

export async function fetchDisc(discId: string): Promise<BrakeDisc> {
  const disc = getDisc(discId);
  if (!disc) {
    throw new Error(`Disc ${discId} not found`);
  }
  return simulateFetch(disc);
}

export async function fetchDiscTimeseries(
  discId: string,
  days: number = 30
): Promise<TimeseriesPoint[]> {
  try {
    const disc = getDisc(discId);
    if (!disc) {
      return simulateFetch([], { delayMs: 0 });
    }
    const thickness = Number(disc.disc_thickness_mm);
    const safeThickness = Number.isFinite(thickness) && thickness >= 10 ? thickness : 25;
    const points = generateTimeseries(discId, days, safeThickness);
    return simulateFetch(points, { delayMs: 0 });
  } catch {
    return simulateFetch([], { delayMs: 0 });
  }
}

export async function fetchAlerts(filters?: {
  severity?: Alert['severity'];
  status?: Alert['status'];
  category?: Alert['category'];
  depotId?: string;
}): Promise<Alert[]> {
  const base = getBaseAlerts(filters);
  return simulateFetch(applyAlertOverrides(base));
}

export async function fetchEvents(vehicleId?: string): Promise<Event[]> {
  return simulateFetch(getEvents(vehicleId));
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const fleet = getFleet();
  const discs = getDiscs();
  const alerts = applyAlertOverrides(getBaseAlerts());
  const vehicles = getVehicles();

  const criticalDiscs = discs.filter((d) => d.risk === 'CRITICAL');
  const criticalOverTime: AnalyticsData['critical_discs_over_time'] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    criticalOverTime.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(criticalDiscs.length * (0.8 + Math.random() * 0.4)),
    });
  }

  const alertsByCategory: AnalyticsData['alerts_by_category'] = [
    'WEAR',
    'THERMAL',
    'WARP_RISK',
    'JUDDER',
    'DATA_QUALITY',
  ].map((cat) => ({
    category: cat as any,
    count: alerts.filter((a) => a.category === cat).length,
  }));

  const thermalByDepot: AnalyticsData['avg_thermal_stress_by_depot'] =
    fleet.depots.map((depot) => {
      const depotVehicles = vehicles.filter((v) => v.depotId === depot.id);
      const depotDiscs = discs.filter((d) =>
        depotVehicles.some((v) => v.id === d.vehicleId)
      );
      const avgStress =
        depotDiscs.reduce((sum, d) => sum + d.thermal_stress_index, 0) /
        depotDiscs.length;
      return {
        depot: depot.name,
        value: Math.round(avgStress * 100) / 100,
      };
    });

  const maintenanceLoad: AnalyticsData['maintenance_load_forecast'] = {
    under_500km: discs.filter((d) => d.predicted_rul_km < 500).length,
    under_2000km: discs.filter((d) => d.predicted_rul_km < 2000).length,
    under_5000km: discs.filter((d) => d.predicted_rul_km < 5000).length,
  };

  const models = getModels();

  return simulateFetch({
    critical_discs_over_time: criticalOverTime,
    alerts_by_category: alertsByCategory,
    avg_thermal_stress_by_depot: thermalByDepot,
    maintenance_load_forecast: maintenanceLoad,
    data_quality_summary: models.data_quality,
  });
}

export async function fetchModels(): Promise<Models> {
  return simulateFetch(getModels());
}

