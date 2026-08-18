const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleAuthError(status) {
  if (status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
}

export async function apiGet(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  }

  let response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json', ...getAuthHeaders() },
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    handleAuthError(response.status);
    const message = body?.error?.message ?? 'Something went wrong. Please try again.';
    throw new ApiError(message, response.status);
  }

  return body;
}

export async function apiPost(path, data = {}) {
  const url = new URL(`${BASE_URL}${path}`);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    handleAuthError(response.status);
    const message = body?.error?.message ?? 'Something went wrong. Please try again.';
    throw new ApiError(message, response.status);
  }

  return body;
}

export async function apiPatch(path, data = {}) {
  const url = new URL(`${BASE_URL}${path}`);

  let response;
  try {
    response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    handleAuthError(response.status);
    const message = body?.error?.message ?? 'Something went wrong. Please try again.';
    throw new ApiError(message, response.status);
  }

  return body;
}

export async function apiDelete(path) {
  const url = new URL(`${BASE_URL}${path}`);

  let response;
  try {
    response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  if (response.status === 204) return null;

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    handleAuthError(response.status);
    const message = body?.error?.message ?? 'Something went wrong. Please try again.';
    throw new ApiError(message, response.status);
  }

  return body;
}
