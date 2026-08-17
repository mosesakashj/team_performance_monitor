import { apiGet } from './client.js';

export const listPeople = (params) => apiGet('/people', params);
export const getPerson = (id) => apiGet(`/people/${id}`);
export const getPersonNetwork = (id) => apiGet(`/people/${id}/network`);
export const getPersonPath = (id, otherId) => apiGet(`/people/${id}/path/${otherId}`);
