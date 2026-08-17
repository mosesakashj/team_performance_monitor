import { useQuery } from '@tanstack/react-query';
import * as teamsApi from '../api/teams.js';

export function useTeamsList() {
  return useQuery({ queryKey: ['teams'], queryFn: teamsApi.listTeams });
}

export function useTeam(id) {
  return useQuery({
    queryKey: ['team', id],
    queryFn: () => teamsApi.getTeam(id),
    enabled: !!id,
  });
}
