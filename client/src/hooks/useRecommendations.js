import { useQuery } from '@tanstack/react-query';
import * as recommendationsApi from '../api/recommendations.js';

export function useSkillRecommendations(id, params) {
  return useQuery({
    queryKey: ['skill-recommendations', id, params],
    queryFn: () => recommendationsApi.getSkillRecommendations(id, params),
    enabled: !!id,
  });
}

export function useProjectRecommendations(id, params) {
  return useQuery({
    queryKey: ['project-recommendations', id, params],
    queryFn: () => recommendationsApi.getProjectRecommendations(id, params),
    enabled: !!id,
  });
}

export function useTeamCompatibility(personIds) {
  return useQuery({
    queryKey: ['team-compatibility', personIds],
    queryFn: () => recommendationsApi.getTeamCompatibility(personIds),
    enabled: Array.isArray(personIds) && personIds.length >= 2,
  });
}

export function useKnowledgeTransferAlerts() {
  return useQuery({
    queryKey: ['knowledge-transfer-alerts'],
    queryFn: recommendationsApi.getKnowledgeTransferAlerts,
  });
}
