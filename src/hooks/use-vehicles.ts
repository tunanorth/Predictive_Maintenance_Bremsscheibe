import { useQuery } from '@tanstack/react-query';
import { fetchVehicles, fetchVehicle } from '@/api/fleet.read';

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => fetchVehicle(id),
    enabled: !!id,
  });
}

