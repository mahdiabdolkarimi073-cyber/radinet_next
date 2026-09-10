'use client';

export const USER_API = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

function token(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('radinet_auth_token');
}

export async function userRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = token();
  const response = await fetch(`${USER_API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      ...(options.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (response.status === 401 || response.status === 403) {
    if (typeof window !== 'undefined') window.location.href = '/auth';
    throw new Error('دسترسی غیرمجاز');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message ?? data?.error ?? 'درخواست ناموفق بود');
  return data as T;
}

export const userGet = <T,>(path: string) => userRequest<T>(path);
export const userPut = <T,>(path: string, body: unknown) => userRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) });

export type UserDashboard = {
  stats: { totalOrders: number; totalTeleReports: number; totalConsultations: number };
  latestOrders: Array<{ id: string; orderNumber: string; total: string; status: string; createdAt: string; items: Array<{ productName: string; quantity: number }> }>;
  latestTeleReports: Array<{ id: string; requestNumber: string; imagingType: string; imagingArea: string; status: string; createdAt: string }>;
  latestConsultations: Array<{ id: string; name: string; message: string | null; status: string; createdAt: string }>;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  country: string;
  status: string;
  createdAt: string;
};
