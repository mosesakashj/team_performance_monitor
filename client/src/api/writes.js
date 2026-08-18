import { apiPost, apiPatch, apiDelete } from './client.js';

export const createPerson = (data) => apiPost('/write/people', data);
export const updatePerson = (id, data) => apiPatch(`/write/people/${id}`, data);
export const deletePerson = (id) => apiDelete(`/write/people/${id}`);

export const createProject = (data) => apiPost('/write/projects', data);
export const updateProject = (id, data) => apiPatch(`/write/projects/${id}`, data);
export const assignToProject = (personId, projectId, data) =>
  apiPost(`/write/people/${personId}/projects/${projectId}`, data);
export const removeFromProject = (personId, projectId) =>
  apiDelete(`/write/people/${personId}/projects/${projectId}`);

export const createSkill = (data) => apiPost('/write/skills', data);
export const updateSkill = (id, data) => apiPatch(`/write/skills/${id}`, data);

export const createTeam = (data) => apiPost('/write/teams', data);
export const updateTeam = (id, data) => apiPatch(`/write/teams/${id}`, data);
export const assignToTeam = (personId, teamId, data) =>
  apiPost(`/write/people/${personId}/teams/${teamId}`, data);
export const removeFromTeam = (personId, teamId) =>
  apiDelete(`/write/people/${personId}/teams/${teamId}`);

export const createEndorsement = (personId, data) =>
  apiPost(`/write/people/${personId}/endorsements`, data);
export const assignSkill = (personId, data) =>
  apiPost(`/write/people/${personId}/skills`, data);
export const removeSkill = (personId, skillId) =>
  apiDelete(`/write/people/${personId}/skills/${skillId}`);
