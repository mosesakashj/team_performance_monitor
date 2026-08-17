import { useQuery } from '@tanstack/react-query';
import * as hierarchyApi from '../api/hierarchy.js';

export function useOrgHierarchy() {
  return useQuery({
    queryKey: ['hierarchy'],
    queryFn: () => hierarchyApi.getOrgHierarchy(),
  });
}

export function useEndorsements(skillId) {
  return useQuery({
    queryKey: ['endorsements', skillId || null],
    queryFn: () => hierarchyApi.getEndorsements(skillId),
  });
}
