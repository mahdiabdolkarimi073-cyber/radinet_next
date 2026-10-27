export const BACKEND_URL =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

export type AuthResponse = {
  ok: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
};

export async function postAuth(path: string, body: unknown): Promise<AuthResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = (await res.json()) as AuthResponse;
    return data;
  } catch {
    return { ok: false, error: 'اتصال به سرور برقرار نیست.' };
  }
}

export async function getMe(token: string | null): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; user?: AuthUser };
    return data.user ?? null;
  } catch {
    return null;
  }
}
