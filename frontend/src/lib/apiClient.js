import config from '../config';

/**
 * Centralized API client that uses the configured API URL
 * Ensures no hardcoded localhost URLs leak into production
 */
export async function apiFetch(path, options = {}) {
  const url = `${config.apiUrl}${path}`;
  
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
}

/**
 * API client with automatic JSON parsing and error handling
 */
export async function apiRequest(path, options = {}) {
  const response = await apiFetch(path, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export default { apiFetch, apiRequest };
