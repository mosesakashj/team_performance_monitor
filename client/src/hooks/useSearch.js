import { useQuery } from '@tanstack/react-query';
import { search } from '../api/search.js';

export function useSearch(q) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => search(q),
    enabled: q.trim().length >= 2,
  });
}
