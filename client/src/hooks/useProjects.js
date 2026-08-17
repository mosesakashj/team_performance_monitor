import { useQuery } from '@tanstack/react-query';
import * as projectsApi from '../api/projects.js';

export function useProjectsList(filters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsApi.listProjects(filters),
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getProject(id),
    enabled: !!id,
  });
}

export function useProjectCandidates(id) {
  return useQuery({
    queryKey: ['project-candidates', id],
    queryFn: () => projectsApi.getProjectCandidates(id),
    enabled: !!id,
  });
}
