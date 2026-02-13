import type {
  Fleet,
  Depot,
  Vehicle,
  BrakeDisc,
  Alert,
  Event,
  TimeseriesPoint,
  Models,
  WheelPosition,
  Axle,
} from '@/types';

const WHEEL_POSITIONS: WheelPosition[] = ['FL', 'FR', 'RL', 'RR'];
const AXLES: Axle[] = ['FRONT', 'FRONT', 'REAR', 'REAR'];

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateVehicle(
  id: string,
  depotId: string,
  index: number
): Vehicle {
  const statuses: Vehicle['status'][] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'IN_SHOP', 'INACTIVE'];
  const risks: Vehicle['overall_risk'][] = ['OK', 'OK', 'OK', 'WARN', 'CRITICAL'];

  return {
    id,
    name: `VH-${String(index + 1).padStart(3, '0')}`,
    model_code: `MOD-${randomInt(100, 999)}`,
    vin_masked: `WDB${randomInt(100000, 999999)}`,
    mileage_km: randomInt(50000, 300000),
    depotId,
    last_seen: new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000).toISOString(),
    status: randomChoice(statuses),
    overall_risk: randomChoice(risks),
    overall_health_score: randomBetween(40, 100),
  };
}

export function generateBrakeDisc(
  discId: string,
  vehicleId: string,
  position: WheelPosition,
  axle: Axle,
  baseThickness: number = 25
): BrakeDisc {
  const minThickness = 20;
  const thickness = randomBetween(minThickness + 2, baseThickness);
  const wearPct = ((baseThickness - thickness) / (baseThickness - minThickness)) * 100;

  return {
    discId,
    vehicleId,
    position,
    axle,
    disc_thickness_mm: thickness,
    disc_min_thickness_mm: minThickness,
    wear_pct: Math.min(100, Math.max(0, wearPct)),
    temp_peak_C: randomBetween(100, 300),
    thermal_stress_index: randomBetween(0, 1),
    brake_judder_index: randomBetween(0, 0.5),
    harsh_brakes_per_100km: randomBetween(0, 5),
    health_score: randomBetween(50, 100),
    risk: wearPct > 80 ? 'CRITICAL' : wearPct > 60 ? 'WARN' : 'OK',
    predicted_rul_km: randomInt(1000, 50000),
    predicted_rul_days: randomInt(30, 365),
    confidence: randomBetween(0.6, 0.95),
    last_service_date: Math.random() > 0.5
      ? new Date(Date.now() - randomInt(30, 365) * 24 * 60 * 60 * 1000).toISOString()
      : null,
    open_alerts_count: randomInt(0, 3),
  };
}

function generateTimeseries(
  discId: string,
  days: number,
  baseThickness: number
): TimeseriesPoint[] {
  const points: TimeseriesPoint[] = [];
  const now = Date.now();
  const interval = (days * 24 * 60 * 60 * 1000) / 100;

  // Wir interpretieren baseThickness als aktuellen Wert (heute, rechts).
  const endThickness = baseThickness;
  const startThickness = baseThickness + 5; // Vergangenheit: immer dicker
  const totalDrop = startThickness - endThickness;

  for (let i = 0; i < 100; i++) {
    const ts = new Date(now - (100 - i) * interval).toISOString();

    // Linear fallende Kurve von links (dick) nach rechts (dünn)
    const progress = i / 99; // 0 = ältester Punkt, 1 = heute
    const thickness = startThickness - totalDrop * progress;

    const brakeEvents = randomInt(0, 10);
    points.push({
      ts,
      speed_kph: randomBetween(0, 120),
      braking_pressure_bar: randomBetween(0, 100),
      brake_events_count: brakeEvents,
      disc_temp_C: randomBetween(50, 150) + brakeEvents * 5,
      temp_peak_C_window: randomBetween(100, 200) + brakeEvents * 8,
      thickness_est_mm: thickness,
      judder_index: randomBetween(0, 0.5),
      thermal_stress_index: randomBetween(0, 1),
      anomaly_score: randomBetween(0, 0.3),
    });
  }

  return points;
}

function generateAlerts(vehicles: Vehicle[], discs: BrakeDisc[]): Alert[] {
  const alerts: Alert[] = [];
  const criticalDiscs = discs.filter((d) => d.risk === 'CRITICAL' || d.risk === 'WARN');

  criticalDiscs.forEach((disc) => {
    if (Math.random() > 0.7) {
      const categories: Alert['category'][] = ['WEAR', 'THERMAL', 'WARP_RISK', 'JUDDER'];
      const severities: Alert['severity'][] = ['WARN', 'CRITICAL'];
      const statuses: Alert['status'][] = ['OPEN', 'ACK', 'RESOLVED'];

      alerts.push({
        id: generateId('alert'),
        createdAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
        severity: randomChoice(severities),
        category: randomChoice(categories),
        status: randomChoice(statuses),
        vehicleId: disc.vehicleId,
        discId: disc.discId,
        position: disc.position,
        recommended_action: 'Inspection empfohlen',
        predicted_lead_time_km: randomInt(500, 5000),
        false_positive_risk: randomBetween(0, 0.3),
        commentThread: [],
      });
    }
  });

  return alerts;
}

function generateEvents(vehicles: Vehicle[], discs: BrakeDisc[]): Event[] {
  const events: Event[] = [];

  vehicles.forEach((vehicle) => {
    const vehicleDiscs = discs.filter((d) => d.vehicleId === vehicle.id);
    vehicleDiscs.forEach((disc) => {
      if (Math.random() > 0.8) {
        events.push({
          id: generateId('event'),
          ts: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
          type: randomChoice(['INSPECTION', 'MAINTENANCE', 'NOTE']),
          severity: null,
          vehicleId: vehicle.id,
          discId: disc.discId,
          position: disc.position,
          title: 'Wartung durchgeführt',
          description: 'Routine-Inspektion',
          related_metric_keys: ['thickness', 'wear'],
        });
      }
    });
  });

  return events;
}

export function generateBaseFleet(): Fleet {
  const depots: Depot[] = [];
  const vehicles: Vehicle[] = [];
  const discs: BrakeDisc[] = [];

  const depotLocations = [
    { city: 'Berlin', lat: 52.52, lng: 13.405 },
    { city: 'Munich', lat: 48.135, lng: 11.582 },
    { city: 'Hamburg', lat: 53.551, lng: 9.994 },
    { city: 'Cologne', lat: 50.938, lng: 6.96 },
  ];
  for (let d = 0; d < 4; d++) {
    const depotId = generateId('depot');
    const loc = depotLocations[d];
    const depot: Depot = {
      id: depotId,
      name: loc.city,
      city: loc.city,
      vehicles: [],
      location: {
        lat: loc.lat + randomBetween(-0.05, 0.05),
        lng: loc.lng + randomBetween(-0.05, 0.05),
      },
    };

    for (let v = 0; v < 10; v++) {
      const vehicleId = generateId('vehicle');
      const vehicle = generateVehicle(vehicleId, depotId, d * 10 + v);
      vehicles.push(vehicle);
      depot.vehicles.push(vehicle);

      WHEEL_POSITIONS.forEach((pos, idx) => {
        const discId = generateId('disc');
        const disc = generateBrakeDisc(discId, vehicleId, pos, AXLES[idx]);
        discs.push(disc);
      });
    }

    depots.push(depot);
  }

  const alerts = generateAlerts(vehicles, discs);
  const events = generateEvents(vehicles, discs);

  return {
    id: generateId('fleet'),
    name: 'Fleet Alpha',
    region: 'Deutschland',
    depots,
  };
}

export function generateModels(): Models {
  return {
    versions: [
      {
        id: 'v1',
        name: 'v1.2.0',
        deployedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Initial deployment',
      },
      {
        id: 'v2',
        name: 'v1.3.0',
        deployedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Improved thermal stress model',
      },
    ],
    metrics: {
      alert_precision: 0.87,
      alert_recall: 0.92,
      rul_mae_km: 850,
      avg_lead_time_km: 2100,
    },
    data_quality: {
      missingness_pct: 2.3,
      drift_score: 0.15,
      last_ingest: new Date().toISOString(),
    },
  };
}

