const BASE_URL = '/api';
const TOKEN_KEY = 'stockflow_token';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  let body = {};
  try { body = await res.json(); } catch {}

  if (!res.ok) {
    const err = new Error(body.message || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return body.data ?? body;
}

export const get   = (url)       => apiRequest(url);
export const post  = (url, data) => apiRequest(url, { method: 'POST',   body: JSON.stringify(data) });
export const put   = (url, data) => apiRequest(url, { method: 'PUT',    body: JSON.stringify(data) });
export const patch = (url, data) => apiRequest(url, { method: 'PATCH',  body: JSON.stringify(data) });
export const del   = (url)       => apiRequest(url, { method: 'DELETE' });

export { TOKEN_KEY };
