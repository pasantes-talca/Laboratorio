const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const { headers, ...rest } = options;
  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'same-origin',
    ...rest,
    headers: {
      ...(rest.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  });
  if (!response.ok) {
    let detail = 'Error en el servidor';
    try {
      const body = await response.json();
      detail = body.detail || body.message || detail;
    } catch { /* The server may return a non-JSON proxy error. */ }
    const error = new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    error.status = response.status;
    if (response.status === 401 && !endpoint.startsWith('/auth/')) {
      window.dispatchEvent(new Event('laboratorio:session-expired'));
    }
    throw error;
  }
  return response;
}

export async function fetchJson(endpoint, options = {}) {
  return (await request(endpoint, options)).json();
}
