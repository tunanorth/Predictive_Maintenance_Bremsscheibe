import { useQuery } from '@tanstack/react-query';
import { fetchAlerts } from '@/api/fleet.read';
import type { Alert } from '@/types';

export function useAlerts(filters?: {
  severity?: Alert['severity'];
  status?: Alert['status'];
  category?: Alert['category'];
  depotId?: string;
}) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => fetchAlerts(filters),
  });
}

