import { apiGet } from './client.js';

export const simulatePersonRemoval = (personId) => apiGet(`/what-if/person-removal/${personId}`);
export const simulateSkillAddition = (personId, skillId) => apiGet(`/what-if/skill-addition/${personId}/${skillId}`);
