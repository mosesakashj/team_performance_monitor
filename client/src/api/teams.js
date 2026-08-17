import { apiGet } from './client.js';

export const listTeams = () => apiGet('/teams');
export const getTeam = (id) => apiGet(`/teams/${id}`);
