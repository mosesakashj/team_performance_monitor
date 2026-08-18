import { apiGet } from './client.js';

export const getUtilizationReport = () => apiGet('/reports/utilization');
export const getSkillInventoryReport = () => apiGet('/reports/skill-inventory');
export const getProjectHealthReport = () => apiGet('/reports/project-health');
export const getEndorsementReport = () => apiGet('/reports/endorsements');
