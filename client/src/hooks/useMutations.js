import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './useToast.jsx';
import * as writesApi from '../api/writes.js';

export function useCreatePerson() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: writesApi.createPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Person created successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create person');
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => writesApi.updatePerson(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['person', id] });
      toast.success('Person updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update person');
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: writesApi.deletePerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Person deleted successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete person');
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: writesApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create project');
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => writesApi.updateProject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Project updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update project');
    },
  });
}

export function useAssignToProject() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ personId, projectId, data }) => writesApi.assignToProject(personId, projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Assigned to project');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to assign');
    },
  });
}

export function useCreateEndorsement() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ personId, data }) => writesApi.createEndorsement(personId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hierarchy'] });
      queryClient.invalidateQueries({ queryKey: ['endorsements'] });
      toast.success('Endorsement created');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create endorsement');
    },
  });
}

export function useAssignSkill() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ personId, data }) => writesApi.assignSkill(personId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('Skill assigned');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to assign skill');
    },
  });
}
