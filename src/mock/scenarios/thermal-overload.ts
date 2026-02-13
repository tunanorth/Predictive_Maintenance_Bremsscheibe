import { generateBaseFleet, generateBrakeDisc } from './base';
import type { Fleet, BrakeDisc } from '@/types';

export function generateThermalOverloadScenario(): Fleet {
  const fleet = generateBaseFleet();
  
  // THERMAL OVERLOAD: Front-Bremsscheiben mit hohen temp peaks, steigendem thermal_stress_index, warp_risk hoch
  fleet.depots.forEach((depot) => {
    depot.vehicles.forEach((vehicle) => {
      const frontDiscs = vehicle.id; // Will be replaced with actual disc updates
    });
  });

  // Update discs with thermal stress
  const allDiscs: BrakeDisc[] = [];
  fleet.depots.forEach((depot) => {
    depot.vehicles.forEach((vehicle) => {
      ['FL', 'FR'].forEach((pos, idx) => {
        const discId = `disc_${vehicle.id}_${pos}`;
        const disc = generateBrakeDisc(discId, vehicle.id, pos as any, 'FRONT', 25);
        disc.temp_peak_C = 350 + Math.random() * 50;
        disc.thermal_stress_index = 0.7 + Math.random() * 0.3;
        disc.risk = disc.thermal_stress_index > 0.8 ? 'CRITICAL' : 'WARN';
        disc.health_score = 100 - disc.thermal_stress_index * 40;
        allDiscs.push(disc);
      });
      ['RL', 'RR'].forEach((pos) => {
        const discId = `disc_${vehicle.id}_${pos}`;
        const disc = generateBrakeDisc(discId, vehicle.id, pos as any, 'REAR', 25);
        allDiscs.push(disc);
      });
    });
  });

  return fleet;
}

