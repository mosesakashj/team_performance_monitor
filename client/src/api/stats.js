import { apiGet } from './client.js';

export const getStats = () => apiGet('/stats');
