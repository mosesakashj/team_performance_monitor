import { useQuery } from '@tanstack/react-query';
import * as whatIfApi from '../api/whatIf.js';

export function useSimulatePersonRemoval(personId) {
  return useQuery({
    queryKey: ['what-if-removal', personId],
    queryFn: () => whatIfApi.simulatePersonRemoval(personId),
    enabled: !!personId,
  });
}

export function useSimulateSkillAddition(personId, skillId) {
  return useQuery({
    queryKey: ['what-if-skill', personId, skillId],
    queryFn: () => whatIfApi.simulateSkillAddition(personId, skillId),
    enabled: !!personId && !!skillId,
  });
}
