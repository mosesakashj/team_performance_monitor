import { apiGet } from './client.js';

export const getProjectSkillGaps = (id) => apiGet(`/analytics/skill-gaps/${id}`);
export const getBottleneckPeople = (params) => apiGet('/analytics/bottlenecks', params);
export const getKnowledgeSilos = () => apiGet('/analytics/knowledge-silos');
export const getTeamComposition = (id) => apiGet(`/analytics/team-composition/${id}`);
export const getPersonTimeline = (id) => apiGet(`/analytics/person-timeline/${id}`);
export const getSkillDemandSupply = () => apiGet('/analytics/skill-demand-supply');
export const getProjectTimeline = () => apiGet('/analytics/project-timeline');
