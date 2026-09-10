'use client';

export const SUPPORT_API = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

function token(): string | null {
  return typeof window === 'undefined' ? null : window.localStorage.getItem('radinet_auth_token');
}

export async function supportRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = token();
  const response = await fetch(`${SUPPORT_API}${path}`, {
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
