import { useQuery } from '@tanstack/react-query';
import * as peopleApi from '../api/people.js';

export function usePeopleList(filters) {
  return useQuery({
    queryKey: ['people', filters],
    queryFn: () => peopleApi.listPeople(filters),
  });
}

export function usePerson(id) {
  return useQuery({
    queryKey: ['person', id],
    queryFn: () => peopleApi.getPerson(id),
    enabled: !!id,
  });
}

export function usePersonNetwork(id) {
  return useQuery({
    queryKey: ['person-network', id],
    queryFn: () => peopleApi.getPersonNetwork(id),
    enabled: !!id,
  });
}

export function usePersonPath(id, otherId) {
  return useQuery({
    queryKey: ['person-path', id, otherId],
    queryFn: () => peopleApi.getPersonPath(id, otherId),
    enabled: !!id && !!otherId,
    retry: false,
  });
}
