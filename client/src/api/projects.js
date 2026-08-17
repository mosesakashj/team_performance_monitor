import { apiGet } from './client.js';

export const listProjects = (params) => apiGet('/projects', params);
export const getProject = (id) => apiGet(`/projects/${id}`);
export const getProjectCandidates = (id, params) => apiGet(`/projects/${id}/candidates`, params);
