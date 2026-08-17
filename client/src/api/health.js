import { apiGet } from './client.js';

export const getHealth = () => apiGet('/health');
