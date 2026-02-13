import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '@/api/fleet.read';

export function useEvents(vehicleId?: string) {
  return useQuery({
    queryKey: ['events', vehicleId],
    queryFn: () => fetchEvents(vehicleId),
  });
}

