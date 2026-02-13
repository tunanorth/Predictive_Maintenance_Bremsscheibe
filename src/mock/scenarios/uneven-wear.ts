import { generateBaseFleet, generateBrakeDisc } from './base';
import type { Fleet, BrakeDisc } from '@/types';

export function generateUnevenWearScenario(): Fleet {
  const fleet = generateBaseFleet();
  
  // UNEVEN WEAR: FL schneller Verschleiß + judder steigt (Caliper sticking proxy)
  fleet.depots.forEach((depot) => {
    depot.vehicles.forEach((vehicle, vIdx) => {
      if (vIdx % 2 === 0) {
        // Every other vehicle has uneven wear on FL
        const flDiscId = `disc_${vehicle.id}_FL`;
        // Will be updated in data layer
      }
    });
  });

  return fleet;
}

