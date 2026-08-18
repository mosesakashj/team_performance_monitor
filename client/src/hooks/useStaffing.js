import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as staffingApi from '../api/staffing.js';
import { useToast } from './useToast.jsx';

export function useProjectProposals(projectId) {
  return useQuery({
    queryKey: ['staffing-proposals', projectId],
    queryFn: () => staffingApi.getProjectProposals(projectId),
    enabled: !!projectId,
  });
}

export function useStaffingSummary() {
  return useQuery({
    queryKey: ['staffing-summary'],
    queryFn: staffingApi.getStaffingSummary,
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: staffingApi.createProposal,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staffing-proposals', variables.projectId] });
      toast.success('Proposal submitted');
    },
    onError: (err) => toast.error(err.message || 'Failed to create proposal'),
  });
}

export function useApproveProposal() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: staffingApi.approveProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffing-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['staffing-summary'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Proposal approved');
    },
    onError: (err) => toast.error(err.message || 'Failed to approve'),
  });
}
