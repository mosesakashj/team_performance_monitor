import { apiGet } from './client.js';

export const getUtilizationHeatmap = () => apiGet('/dashboard/utilization-heatmap');
export const getSkillDistribution = () => apiGet('/dashboard/skill-distribution');
export const getProjectHealth = () => apiGet('/dashboard/project-health');
export const getTopBottlenecks = (params) => apiGet('/dashboard/bottlenecks', params);
export const getGlobalSkillGaps = () => apiGet('/dashboard/skill-gaps');
export const getActivityFeed = () => apiGet('/dashboard/activity-feed');
export const getEnrichedStats = () => apiGet('/dashboard/enriched-stats');
