import { useQuery } from '@tanstack/react-query';
import * as reportsApi from '../api/reports.js';

export function useUtilizationReport() {
  return useQuery({ queryKey: ['report-utilization'], queryFn: reportsApi.getUtilizationReport });
}

export function useSkillInventoryReport() {
  return useQuery({ queryKey: ['report-skill-inventory'], queryFn: reportsApi.getSkillInventoryReport });
}

export function useProjectHealthReport() {
  return useQuery({ queryKey: ['report-project-health'], queryFn: reportsApi.getProjectHealthReport });
}

export function useEndorsementReport() {
  return useQuery({ queryKey: ['report-endorsements'], queryFn: reportsApi.getEndorsementReport });
}
