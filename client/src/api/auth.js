import { apiGet, apiPost, apiPatch, apiDelete } from './client.js';

export const login = (data) => apiPost('/auth/login', data);
export const register = (data) => apiPost('/auth/register', data);
export const getMe = () => apiGet('/auth/me');
export const updateMe = (data) => apiPatch('/auth/me', data);
