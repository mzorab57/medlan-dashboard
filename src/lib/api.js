const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/medlan-backend/public';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (payload && payload.success === false) {
    const err = new Error(payload.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = payload.data;
    throw err;
  }
  return payload.data ?? payload;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
  postForm: async (path, formData) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const payload = await res.json();
      if (payload && payload.success === false) {
        const err = new Error(payload.message || `HTTP ${res.status}`);
        err.status = res.status;
        err.data = payload.data;
        throw err;
      }
      return payload.data ?? payload;
    }
    const text = await res.text();
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  },
};

export const API_BASE = BASE_URL;
