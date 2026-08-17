import { useQuery } from '@tanstack/react-query';
import * as skillsApi from '../api/skills.js';

export function useSkillsList(filters) {
  return useQuery({
    queryKey: ['skills', filters],
    queryFn: () => skillsApi.listSkills(filters),
  });
}

export function useSkillAdjacent(id) {
  return useQuery({
    queryKey: ['skill-adjacent', id],
    queryFn: () => skillsApi.getSkillAdjacent(id),
    enabled: !!id,
  });
}
