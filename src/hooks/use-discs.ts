import { useQuery } from '@tanstack/react-query';
import {
  fetchDiscs,
  fetchDisc,
  fetchDiscTimeseries,
} from '@/api/fleet.read';

export function useDiscs(vehicleId?: string) {
  return useQuery({
    queryKey: ['discs', vehicleId],
    queryFn: () => fetchDiscs(vehicleId),
  });
}

export function useDisc(discId: string) {
  return useQuery({
    queryKey: ['disc', discId],
    queryFn: () => fetchDisc(discId),
    enabled: !!discId,
  });
}

export function useDiscTimeseries(discId: string, days: number = 30) {
  return useQuery({
    queryKey: ['disc-timeseries', discId, days],
    queryFn: () => fetchDiscTimeseries(discId, days),
    enabled: !!discId,
    retry: false,
    staleTime: 60_000,
  });
}

