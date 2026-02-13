import { generateBaseFleet, generateBrakeDisc } from './base';
import type { Fleet, BrakeDisc } from '@/types';

export function generateNormalScenario(): Fleet {
  const fleet = generateBaseFleet();
  // Normal: gleichmäßiger Verschleiß, wenig Alerts
  return fleet;
}

