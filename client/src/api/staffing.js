import { apiGet, apiPost } from './client.js';

export const createProposal = (data) => apiPost('/staffing/proposals', data);
export const getProjectProposals = (projectId) => apiGet(`/staffing/proposals/project/${projectId}`);
export const approveProposal = (id) => apiPost(`/staffing/proposals/${id}/approve`);
export const rejectProposal = (id, data) => apiPost(`/staffing/proposals/${id}/reject`, data);
export const getStaffingSummary = () => apiGet('/staffing/summary');
