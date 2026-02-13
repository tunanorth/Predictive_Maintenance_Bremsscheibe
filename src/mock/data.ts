import type {
  Fleet,
  Vehicle,
  BrakeDisc,
  Alert,
  Event,
  TimeseriesPoint,
  Models,
  Scenario,
  WheelPosition,
  Axle,
} from '@/types';
import { generateNormalScenario } from './scenarios/normal';
import { generateThermalOverloadScenario } from './scenarios/thermal-overload';
import { generateUnevenWearScenario } from './scenarios/uneven-wear';
import { generateSensorDropoutsScenario } from './scenarios/sensor-dropouts';
import { generateModels } from './scenarios/base';

let currentScenario: Scenario = 'NORMAL';
let fleetData: Fleet | null = null;
let allVehicles: Vehicle[] = [];
let allDiscs: BrakeDisc[] = [];
let allAlerts: Alert[] = [];
let allEvents: Event[] = [];
let modelsData: Models | null = null;

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

function generateBrakeDisc(
  discId: string,
  vehicleId: string,
  position: WheelPosition,
  axle: Axle,
  baseThickness: number = 25,
  scenario: Scenario
): BrakeDisc {
  const minThickness = 20;
  let thickness = randomBetween(minThickness + 2, baseThickness);
  let wearPct = ((baseThickness - thickness) / (baseThickness - minThickness)) * 100;
  let tempPeak = randomBetween(100, 300);
  let thermalStress = randomBetween(0, 1);
  let judderIndex = randomBetween(0, 0.5);
  let healthScore = randomBetween(50, 100);

  // Apply scenario-specific modifications
  if (scenario === 'THERMAL_OVERLOAD' && axle === 'FRONT') {
    tempPeak = 350 + Math.random() * 50;
    thermalStress = 0.7 + Math.random() * 0.3;
    healthScore = 100 - thermalStress * 40;
  } else if (scenario === 'UNEVEN_WEAR' && position === 'FL') {
    thickness = minThickness + 2 + Math.random() * 3; // Very worn
    wearPct = 85 + Math.random() * 15;
    judderIndex = 0.6 + Math.random() * 0.4;
    healthScore = 30 + Math.random() * 20;
  } else if (scenario === 'SENSOR_DROPOUTS') {
    // Some discs have missing data indicators
    if (Math.random() > 0.7) {
      healthScore = randomBetween(40, 60); // Lower due to data quality
    }
  }

  const risk: BrakeDisc['risk'] =
    wearPct > 80 || thermalStress > 0.8 || judderIndex > 0.7
      ? 'CRITICAL'
      : wearPct > 60 || thermalStress > 0.6 || judderIndex > 0.5
      ? 'WARN'
      : 'OK';

  return {
    discId,
    vehicleId,
    position,
    axle,
    disc_thickness_mm: thickness,
    disc_min_thickness_mm: minThickness,
    wear_pct: Math.min(100, Math.max(0, wearPct)),
    temp_peak_C: tempPeak,
    thermal_stress_index: thermalStress,
    brake_judder_index: judderIndex,
    harsh_brakes_per_100km: randomBetween(0, 5),
    health_score: healthScore,
    risk,
    predicted_rul_km: randomInt(1000, 50000),
    predicted_rul_days: randomInt(30, 365),
    confidence: randomBetween(0.6, 0.95),
    last_service_date:
      Math.random() > 0.5
        ? new Date(
            Date.now() - randomInt(30, 365) * 24 * 60 * 60 * 1000
          ).toISOString()
        : null,
    open_alerts_count: risk === 'CRITICAL' ? randomInt(1, 3) : risk === 'WARN' ? randomInt(0, 2) : 0,
  };
}

function generateVehicle(
  id: string,
  depotId: string,
  index: number,
  depotLocation?: { lat: number; lng: number }
): Vehicle {
  const statuses: Vehicle['status'][] = [
    'ACTIVE',
    'ACTIVE',
    'ACTIVE',
    'IN_SHOP',
    'INACTIVE',
  ];
  const risks: Vehicle['overall_risk'][] = ['OK', 'OK', 'OK', 'WARN', 'CRITICAL'];

  // Generate live location data (simulated GPS for Mercedes Vito)
  let location: Vehicle['location'] | undefined;
  if (depotLocation && Math.random() > 0.2) {
    // Most vehicles are on the road, some at depot
    const isAtDepot = Math.random() > 0.7;
    if (isAtDepot) {
      location = {
        lat: depotLocation.lat + randomBetween(-0.01, 0.01),
        lng: depotLocation.lng + randomBetween(-0.01, 0.01),
        heading: randomInt(0, 360),
        speed: randomBetween(0, 5), // Slow at depot
        lastUpdate: new Date().toISOString(),
      };
    } else {
      // Vehicle is on the road
      const distance = randomBetween(5, 50); // km from depot
      const angle = randomBetween(0, 2 * Math.PI);
      const latOffset = (distance / 111) * Math.cos(angle);
      const lngOffset = (distance / 111) * Math.sin(angle) / Math.cos(depotLocation.lat * Math.PI / 180);
      
      location = {
        lat: depotLocation.lat + latOffset,
        lng: depotLocation.lng + lngOffset,
        heading: randomInt(0, 360),
        speed: randomBetween(30, 120), // km/h
        lastUpdate: new Date(Date.now() - randomInt(0, 300) * 1000).toISOString(), // Last 5 min
      };
    }
  }

  return {
    id,
    name: `VH-${String(index + 1).padStart(3, '0')}`,
    model_code: `VITO-${randomInt(100, 999)}`,
    vin_masked: `WDB${randomInt(100000, 999999)}`,
    mileage_km: randomInt(50000, 300000),
    depotId,
    last_seen: new Date(
      Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: randomChoice(statuses),
    overall_risk: randomChoice(risks),
    overall_health_score: randomBetween(40, 100),
    location,
  };
}

function initializeData(scenario: Scenario) {
  const depots: Fleet['depots'] = [];
  const vehicles: Vehicle[] = [];
  const discs: BrakeDisc[] = [];

  // Depot locations in Germany (Mercedes Vito fleet locations)
  const depotLocations = [
    { city: 'Berlin', lat: 52.52, lng: 13.405 },
    { city: 'Munich', lat: 48.135, lng: 11.582 },
    { city: 'Hamburg', lat: 53.551, lng: 9.994 },
    { city: 'Cologne', lat: 50.938, lng: 6.96 },
  ];

  for (let d = 0; d < 4; d++) {
    const depotId = generateId('depot');
    const depotLocation = depotLocations[d];
    const depot: Fleet['depots'][0] = {
      id: depotId,
      name: depotLocation.city,
      city: depotLocation.city,
      location: {
        lat: depotLocation.lat + randomBetween(-0.05, 0.05),
        lng: depotLocation.lng + randomBetween(-0.05, 0.05),
      },
      vehicles: [],
    };

    for (let v = 0; v < 10; v++) {
      const vehicleId = generateId('vehicle');
      const vehicle = generateVehicle(vehicleId, depotId, d * 10 + v, depot.location);
      vehicles.push(vehicle);
      depot.vehicles.push(vehicle);

      WHEEL_POSITIONS.forEach((pos, idx) => {
        const discId = generateId('disc');
        const disc = generateBrakeDisc(
          discId,
          vehicleId,
          pos,
          AXLES[idx],
          25,
          scenario
        );
        discs.push(disc);
      });
    }

    depots.push(depot);
  }

  const alerts: Alert[] = [];
  discs.forEach((disc) => {
    if (disc.risk === 'CRITICAL' || (disc.risk === 'WARN' && Math.random() > 0.5)) {
      const categories: Alert['category'][] = [
        'WEAR',
        'THERMAL',
        'WARP_RISK',
        'JUDDER',
      ];
      const severities: Alert['severity'][] = ['WARN', 'CRITICAL'];
      const statuses: Alert['status'][] = ['OPEN', 'ACK', 'RESOLVED'];

      alerts.push({
        id: generateId('alert'),
        createdAt: new Date(
          Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        severity: disc.risk === 'CRITICAL' ? 'CRITICAL' : randomChoice(severities),
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

  if (scenario === 'SENSOR_DROPOUTS') {
    // Add data quality alerts
    for (let i = 0; i < 5; i++) {
      const vehicle = randomChoice(vehicles);
      const disc = discs.find((d) => d.vehicleId === vehicle.id);
      if (disc) {
        alerts.push({
          id: generateId('alert'),
          createdAt: new Date(
            Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000
          ).toISOString(),
          severity: 'WARN',
          category: 'DATA_QUALITY',
          status: 'OPEN',
          vehicleId: vehicle.id,
          discId: disc.discId,
          position: disc.position,
          recommended_action: 'Sensor-Daten prüfen',
          predicted_lead_time_km: 0,
          false_positive_risk: 0.1,
          commentThread: [],
        });
      }
    }
  }

  const events: Event[] = [];
  vehicles.forEach((vehicle) => {
    const vehicleDiscs = discs.filter((d) => d.vehicleId === vehicle.id);
    vehicleDiscs.forEach((disc) => {
      if (Math.random() > 0.8) {
        events.push({
          id: generateId('event'),
          ts: new Date(
            Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000
          ).toISOString(),
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

  fleetData = {
    id: generateId('fleet'),
    name: 'Fleet Alpha',
    region: 'Deutschland',
    depots,
  };

  allVehicles = vehicles;
  allDiscs = discs;
  allAlerts = alerts;
  allEvents = events;
  modelsData = generateModels();

  if (scenario === 'SENSOR_DROPOUTS') {
    modelsData.data_quality.drift_score = 0.75;
    modelsData.data_quality.missingness_pct = 12.5;
  }
}

export function getFleet(scenario: Scenario = currentScenario): Fleet {
  if (!fleetData || currentScenario !== scenario) {
    currentScenario = scenario;
    initializeData(scenario);
  }
  return fleetData!;
}

// Initialize on first import
initializeData('NORMAL');

export function getVehicles(): Vehicle[] {
  return allVehicles;
}

export function getVehicle(id: string): Vehicle | undefined {
  return allVehicles.find((v) => v.id === id);
}

export function getDiscs(vehicleId?: string): BrakeDisc[] {
  if (vehicleId) {
    return allDiscs.filter((d) => d.vehicleId === vehicleId);
  }
  return allDiscs;
}

export function getDisc(discId: string): BrakeDisc | undefined {
  return allDiscs.find((d) => d.discId === discId);
}

export function getAlerts(filters?: {
  severity?: Alert['severity'];
  status?: Alert['status'];
  category?: Alert['category'];
  depotId?: string;
}): Alert[] {
  let filtered = [...allAlerts];

  if (filters?.severity) {
    filtered = filtered.filter((a) => a.severity === filters.severity);
  }
  if (filters?.status) {
    filtered = filtered.filter((a) => a.status === filters.status);
  }
  if (filters?.category) {
    filtered = filtered.filter((a) => a.category === filters.category);
  }
  if (filters?.depotId) {
    const vehicleIds = allVehicles
      .filter((v) => v.depotId === filters.depotId)
      .map((v) => v.id);
    filtered = filtered.filter((a) => vehicleIds.includes(a.vehicleId));
  }

  return filtered;
}

export function getEvents(vehicleId?: string): Event[] {
  if (vehicleId) {
    return allEvents.filter((e) => e.vehicleId === vehicleId);
  }
  return allEvents;
}

export function getModels(): Models {
  if (!modelsData) {
    modelsData = generateModels();
  }
  return modelsData;
}

export function generateTimeseries(
  discId: string,
  days: number,
  baseThickness: number
): TimeseriesPoint[] {
  const points: TimeseriesPoint[] = [];
  const safe = Number.isFinite(baseThickness) && baseThickness >= 10 ? baseThickness : 25;
  const now = Date.now();
  const interval = Math.max(1, (days * 24 * 60 * 60 * 1000) / 100);

  // Interpret baseThickness as current thickness (today, right side)
  const endThickness = safe;
  const startThickness = safe + 5;
  const totalDrop = startThickness - endThickness;

  for (let i = 0; i < 100; i++) {
    const ts = new Date(now - (100 - i) * interval).toISOString();
    const progress = i / 99;
    const thickness = startThickness - totalDrop * progress;
    const brakeEvents = randomInt(0, 10);

    points.push({
      ts,
      speed_kph: randomBetween(0, 120),
      braking_pressure_bar: randomBetween(0, 100),
      brake_events_count: brakeEvents,
      disc_temp_C: randomBetween(50, 250) + brakeEvents * 5,
      temp_peak_C_window: randomBetween(100, 300) + brakeEvents * 8,
      thickness_est_mm: thickness,
      judder_index: randomBetween(0, 0.5),
      thermal_stress_index: randomBetween(0, 1),
      anomaly_score: randomBetween(0, 0.3),
    });
  }

  return points;
}

export function setScenario(scenario: Scenario) {
  currentScenario = scenario;
  initializeData(scenario);
}

export function getCurrentScenario(): Scenario {
  return currentScenario;
}

