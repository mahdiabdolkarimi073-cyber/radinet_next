'use client';

import { BACKEND_URL, getStoredToken } from '@/lib/auth-client';

export const SUPPORT_API = BACKEND_URL;

function token(): string | null {
  return getStoredToken();
}

export async function supportRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = token();
  const useLocalNextApi =
    path.startsWith('/support/telereports') || path.startsWith('/support/tickets');
  const baseUrl = useLocalNextApi ? '/api' : SUPPORT_API;
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      ...(options.headers ?? {}),
    },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message ?? data?.error ?? 'دریافت اطلاعات ناموفق بود');
  return data as T;
}

export const supportGet = <T,>(path: string) => supportRequest<T>(path);
export const supportPost = <T,>(path: string, body: unknown) => supportRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const supportPatch = <T,>(path: string, body: unknown = {}) => supportRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
export const supportDelete = <T,>(path: string) => supportRequest<T>(path, { method: 'DELETE' });

