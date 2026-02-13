import { generateBaseFleet } from './base';
import type { Fleet } from '@/types';

export function generateSensorDropoutsScenario(): Fleet {
  const fleet = generateBaseFleet();
  // SENSOR DROPOUTS: missingness spikes + data_quality alerts, drift_score hoch
  // This will be handled in the data layer
  return fleet;
}

