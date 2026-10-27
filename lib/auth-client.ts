export const BACKEND_URL =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organizationId?: string | null;
};

export type AuthResponse = {
  ok: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
};

export function getPanelPathForRole(role?: string): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'support_expert':
    case 'SUPPORT_EXPERT':
    case 'SUPPORT_ADMIN':
    case 'SUPPORT_AGENT':
      return '/support-panel';
    case 'ORG_ADMIN':
    case 'ORG_STAFF':
      return '/org';
    case 'RADIANT_AGENCY':
    case 'AGENCY_MANAGER':
      return '/agency';
    case 'user':
      return '/user-panel';
    case 'radiologist':
    case 'doctor':
    default:
      return '/dashboard';
  }
}

export async function postAuth(path: string, body: unknown): Promise<AuthResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => null);
    if (!data) {
      return { ok: false, error: 'پاسخ نامعتبر از سرور دریافت شد.' };
    }
    if (data.ok === undefined && !res.ok) {
      const msg = Array.isArray(data.message)
        ? data.message.join('، ')
        : (data.message ?? data.error ?? 'خطا در احراز هویت');
      return { ok: false, error: msg };
    }
    return data as AuthResponse;
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
