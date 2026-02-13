export type WheelPosition = 'FL' | 'FR' | 'RL' | 'RR';
export type Axle = 'FRONT' | 'REAR';
export type RiskLevel = 'OK' | 'WARN' | 'CRITICAL';
export type VehicleStatus = 'ACTIVE' | 'IN_SHOP' | 'INACTIVE';
export type AlertSeverity = 'INFO' | 'WARN' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'ACK' | 'RESOLVED';
export type AlertCategory =
  | 'WEAR'
  | 'THERMAL'
  | 'WARP_RISK'
  | 'JUDDER'
  | 'DATA_QUALITY';
export type EventType = 'ALERT' | 'INSPECTION' | 'MAINTENANCE' | 'NOTE';
export type Scenario = 'NORMAL' | 'THERMAL_OVERLOAD' | 'UNEVEN_WEAR' | 'SENSOR_DROPOUTS';

export interface Fleet {
  id: string;
  name: string;
  region: string;
  depots: Depot[];
}

export interface Depot {
  id: string;
  name: string;
  city: string;
  vehicles: Vehicle[];
  location: {
    lat: number;
    lng: number;
  };
}

export interface Vehicle {
  id: string;
  name: string;
  model_code: string;
  vin_masked: string;
  mileage_km: number;
  depotId: string;
  last_seen: string;
  status: VehicleStatus;
  overall_risk: RiskLevel;
  overall_health_score: number;
  location?: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    lastUpdate: string;
  };
}

export interface BrakeDisc {
  discId: string;
  vehicleId: string;
  position: WheelPosition;
  axle: Axle;
  disc_thickness_mm: number;
  disc_min_thickness_mm: number;
  wear_pct: number;
  temp_peak_C: number;
  thermal_stress_index: number;
  brake_judder_index: number;
  harsh_brakes_per_100km: number;
  health_score: number;
  risk: RiskLevel;
  predicted_rul_km: number;
  predicted_rul_days: number;
  confidence: number;
  last_service_date: string | null;
  open_alerts_count: number;
}

export interface TimeseriesPoint {
  ts: string;
  speed_kph: number;
  braking_pressure_bar: number;
  brake_events_count: number;
  disc_temp_C: number;
  temp_peak_C_window: number;
  thickness_est_mm: number;
  judder_index: number;
  thermal_stress_index: number;
  anomaly_score: number;
}

export interface Alert {
  id: string;
  createdAt: string;
  severity: AlertSeverity;
  category: AlertCategory;
  status: AlertStatus;
  vehicleId: string;
  discId: string;
  position: WheelPosition;
  recommended_action: string;
  predicted_lead_time_km: number;
  false_positive_risk: number;
  commentThread: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Event {
  id: string;
  ts: string;
  type: EventType;
  severity: AlertSeverity | null;
  vehicleId: string;
  discId: string | null;
  position: WheelPosition | null;
  title: string;
  description: string;
  related_metric_keys: string[];
}

export interface ModelVersion {
  id: string;
  name: string;
  deployedAt: string;
  notes: string;
}

export interface ModelMetrics {
  alert_precision: number;
  alert_recall: number;
  rul_mae_km: number;
  avg_lead_time_km: number;
}

export interface DataQuality {
  missingness_pct: number;
  drift_score: number;
  last_ingest: string;
}

export interface Models {
  versions: ModelVersion[];
  metrics: ModelMetrics;
  data_quality: DataQuality;
}

export interface FleetOverview {
  critical_discs_count: number;
  open_alerts_count: number;
  avg_health_score: number;
  vehicles_in_shop: number;
  service_due_14d: number;
}

export interface AnalyticsData {
  critical_discs_over_time: Array<{ date: string; count: number }>;
  alerts_by_category: Array<{ category: AlertCategory; count: number }>;
  avg_thermal_stress_by_depot: Array<{ depot: string; value: number }>;
  maintenance_load_forecast: {
    under_500km: number;
    under_2000km: number;
    under_5000km: number;
  };
  data_quality_summary: DataQuality;
}
