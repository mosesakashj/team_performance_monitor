import { useQuery } from '@tanstack/react-query';
import * as analyticsApi from '../api/analytics.js';

export function useProjectSkillGaps(id) {
  return useQuery({
    queryKey: ['skill-gaps', id],
    queryFn: () => analyticsApi.getProjectSkillGaps(id),
    enabled: !!id,
  });
}

export function useBottleneckPeople(params) {
  return useQuery({
    queryKey: ['bottlenecks', params],
    queryFn: () => analyticsApi.getBottleneckPeople(params),
  });
}

export function useKnowledgeSilos() {
  return useQuery({
    queryKey: ['knowledge-silos'],
    queryFn: () => analyticsApi.getKnowledgeSilos(),
  });
}

export function useTeamComposition(id) {
  return useQuery({
    queryKey: ['team-composition', id],
    queryFn: () => analyticsApi.getTeamComposition(id),
    enabled: !!id,
  });
}

export function usePersonTimeline(id) {
  return useQuery({
    queryKey: ['person-timeline', id],
    queryFn: () => analyticsApi.getPersonTimeline(id),
    enabled: !!id,
  });
}

export function useSkillDemandSupply() {
  return useQuery({
    queryKey: ['skill-demand-supply'],
    queryFn: () => analyticsApi.getSkillDemandSupply(),
  });
}

export function useProjectTimeline() {
  return useQuery({
    queryKey: ['project-timeline'],
    queryFn: () => analyticsApi.getProjectTimeline(),
  });
}
