import { apiGet } from './client.js';

export const getOrgHierarchy = () => apiGet('/hierarchy');
export const getEndorsements = (skillId) => apiGet('/hierarchy/endorsements', skillId ? { skillId } : undefined);
