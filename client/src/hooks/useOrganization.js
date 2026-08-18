import { useQuery } from '@tanstack/react-query';
import * as organizationApi from '../api/organization.js';

export function useDepartments() {
  return useQuery({ queryKey: ['departments'], queryFn: organizationApi.listDepartments });
}

export function useDepartment(id) {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => organizationApi.getDepartment(id),
    enabled: !!id,
  });
}

export function useCertifications() {
  return useQuery({ queryKey: ['certifications'], queryFn: organizationApi.listCertifications });
}

export function useExpiringCertifications(days = 90) {
  return useQuery({
    queryKey: ['certifications-expiring', days],
    queryFn: () => organizationApi.getExpiringCertifications({ days }),
  });
}

export function useProjectPhases(projectId) {
  return useQuery({
    queryKey: ['project-phases', projectId],
    queryFn: () => organizationApi.getProjectPhases(projectId),
    enabled: !!projectId,
  });
}
