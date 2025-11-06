import { API_CONFIG } from './api';

export async function apiFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {})
  };

  const response = await fetch(`${API_CONFIG.BASE_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    let details: any = undefined;
    try { details = await response.json(); } catch { /* ignore */ }
    const message = details?.error || response.statusText || 'Error de API';
    throw new Error(message);
  }
  // Permitir 204
  if (response.status === 204) return undefined as unknown as T;
  return response.json() as Promise<T>;
}


