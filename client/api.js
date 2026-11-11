const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getToken() { return localStorage.getItem('roadresq_token'); }
export function setSession(token, user) {
  localStorage.setItem('roadresq_token', token);
  localStorage.setItem('roadresq_user', JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem('roadresq_token');
  localStorage.removeItem('roadresq_user');
}
export function getSessionUser() {
  try { return JSON.parse(localStorage.getItem('roadresq_user') || 'null'); } catch { return null; }
}
export async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Request failed');
  return payload;
}
