import { useQuery } from '@tanstack/react-query';
import { fetchFleet, fetchFleetOverview } from '@/api/fleet.read';
import type { Scenario } from '@/types';

export function useFleet(scenario?: Scenario) {
  return useQuery({
    queryKey: ['fleet', scenario],
    queryFn: () => fetchFleet(scenario),
  });
}

export function useFleetOverview() {
  return useQuery({
    queryKey: ['fleet-overview'],
    queryFn: fetchFleetOverview,
  });
}

