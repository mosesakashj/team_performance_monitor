import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '../api/dashboard.js';

export function useUtilizationHeatmap() {
  return useQuery({ queryKey: ['utilization-heatmap'], queryFn: dashboardApi.getUtilizationHeatmap });
}

export function useSkillDistribution() {
  return useQuery({ queryKey: ['skill-distribution'], queryFn: dashboardApi.getSkillDistribution });
}

export function useProjectHealth() {
  return useQuery({ queryKey: ['project-health'], queryFn: dashboardApi.getProjectHealth });
}

export function useTopBottlenecks(params) {
  return useQuery({ queryKey: ['top-bottlenecks', params], queryFn: () => dashboardApi.getTopBottlenecks(params) });
}

export function useGlobalSkillGaps() {
  return useQuery({ queryKey: ['global-skill-gaps'], queryFn: dashboardApi.getGlobalSkillGaps });
}

export function useActivityFeed() {
  return useQuery({ queryKey: ['activity-feed'], queryFn: dashboardApi.getActivityFeed });
}

export function useEnrichedStats() {
  return useQuery({ queryKey: ['enriched-stats'], queryFn: dashboardApi.getEnrichedStats });
}

export function useDashboardBatch(params) {
  return useQuery({
    queryKey: ['dashboard-batch', params],
    queryFn: dashboardApi.getDashboardBatch,
    staleTime: 30_000,
  });
}