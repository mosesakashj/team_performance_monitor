import { apiGet } from './client.js';

export const search = (q) => apiGet('/search', { q });
