import { apiGet, apiPost } from './client.js';

export const getSkillRecommendations = (id, params) => apiGet(`/recommendations/skills/${id}`, params);
export const getProjectRecommendations = (id, params) => apiGet(`/recommendations/projects/${id}`, params);
export const getTeamCompatibility = (personIds) => apiPost('/recommendations/team-compatibility', { personIds });
export const getKnowledgeTransferAlerts = () => apiGet('/recommendations/knowledge-transfer');
