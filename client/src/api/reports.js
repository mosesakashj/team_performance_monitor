import { apiGet } from './client.js';

export const getUtilizationReport = (params) => apiGet('/reports/utilization', params);
export const getSkillInventoryReport = (params) => apiGet('/reports/skill-inventory', params);
export const getProjectHealthReport = (params) => apiGet('/reports/project-health', params);
export const getEndorsementReport = (params) => apiGet('/reports/endorsements', params);