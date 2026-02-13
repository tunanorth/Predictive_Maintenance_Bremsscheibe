import { useQuery } from '@tanstack/react-query';
import { fetchAnalytics } from '@/api/fleet.read';

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
  });
}

