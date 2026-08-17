import { apiGet } from './client.js';

export const listSkills = (params) => apiGet('/skills', params);
export const getSkillAdjacent = (id) => apiGet(`/skills/${id}/adjacent`);
