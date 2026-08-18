import { apiGet } from './client.js';

export const listDepartments = () => apiGet('/departments');
export const getDepartment = (id) => apiGet(`/departments/${id}`);
export const listCertifications = () => apiGet('/certifications');
export const getCertification = (id) => apiGet(`/certifications/${id}`);
export const getExpiringCertifications = (params) => apiGet('/certifications/expiring', params);
export const getProjectPhases = (projectId) => apiGet(`/phases/project/${projectId}`);
export const getPhase = (id) => apiGet(`/phases/${id}`);
