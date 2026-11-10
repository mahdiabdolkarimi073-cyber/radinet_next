'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  AUTH_TOKEN_KEY,
  generateRequestId,
  getStoredToken,
  type AuthUser,
} from '@/lib/auth-client';

const TOKEN_KEY = AUTH_TOKEN_KEY;

export type AuthActionResult = {
  ok: boolean;
  error?: string;
  role?: string;
  requestId?: string;
  statusCode?: number;
  stage?: string;
  backendReached?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (fullName: string, email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => ({ ok: false }),
  signUp: async () => ({ ok: false }),
  signOut: () => {},
  logout: () => {},
});

function readToken(): string | null {
  return getStoredToken();
}

function writeToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Ignore storage quota/privacy mode errors
    }
    const secureFlag =
      typeof window !== 'undefined' && window.location?.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`;
  } else {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('auth_token');
    } catch {
      // Ignore storage errors
    }
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  }
}

function sendClientFailureTelemetry(payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  fetch('/api/auth/client-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  }).catch(() => {
    // Ignore telemetry network error
  });
}

async function executeAuthRequest(
  operation: 'LOGIN' | 'REGISTER',
  endpoint: '/api/auth/login' | '/api/auth/register',
  payload: Record<string, unknown>,
): Promise<{
  ok: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
  requestId: string;
  statusCode: number;
  stage?: string;
  backendReached?: boolean;
}> {
  const requestId = generateRequestId();
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Request-ID': requestId,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const durationMs = Date.now() - startMs;
    const completedAt = new Date().toISOString();
    const headerRequestId = res.headers.get('x-request-id') || requestId;
    const rawText = await res.text().catch(() => '');

    let data: Record<string, unknown> | null = null;
    if (rawText.trim()) {
      try {
        const parsed = JSON.parse(rawText);
        if (parsed && typeof parsed === 'object') {
          data = parsed as Record<string, unknown>;
        }
      } catch {
        data = null;
      }
    }

    if (!data) {
      const statusMsg =
        res.status === 404
          ? `مسیر ${endpoint} یافت نشد (HTTP 404).`
          : res.status === 502 || res.status === 503 || res.status === 504
            ? `درگاه سرور در دسترس نیست (HTTP ${res.status}).`
            : `سرور پاسخ غیرمنتظره (HTTP ${res.status}) برگرداند.`;

      sendClientFailureTelemetry({
        requestId: headerRequestId,
        operation,
        routePath: endpoint,
        targetUrl: endpoint,
        statusCode: res.status || 502,
        durationMs,
        backendReached: false,
        operationResult: 'FAILED',
        connectionStatus: 'INVALID_RESPONSE',
        failureStage: 'BROWSER_TO_FRONTEND_NON_JSON',
        errorCategory: 'HTTP',
        errorMessage: statusMsg,
        responseType: rawText.trim().startsWith('<') ? 'html' : 'text',
        startedAt,
        completedAt,
      });

      return {
        ok: false,
        requestId: headerRequestId,
        statusCode: res.status || 502,
        stage: 'BROWSER_TO_FRONTEND_NON_JSON',
        backendReached: false,
        error: statusMsg,
      };
    }

    const finalRequestId =
      typeof data.requestId === 'string' && data.requestId.trim()
        ? data.requestId.trim()
        : headerRequestId;
    const statusCode =
      typeof data.statusCode === 'number' ? data.statusCode : res.status || (data.ok ? 200 : 400);
    const backendReached = Boolean(data.backendReached);

    if (res.ok && data.ok && typeof data.token === 'string') {
      return {
        ok: true,
        token: data.token,
        user: data.user as AuthUser,
        requestId: finalRequestId,
        statusCode: 200,
        backendReached: true,
      };
    }

    const errorMessage =
      (typeof data.error === 'string' && data.error.trim()) ||
      (Array.isArray(data.message) ? data.message.join(' | ') : '') ||
      (typeof data.message === 'string' ? data.message : '') ||
      (operation === 'LOGIN' ? 'ورود ناموفق بود.' : 'ثبت‌نام ناموفق بود.');

    return {
      ok: false,
      requestId: finalRequestId,
      statusCode,
      stage: typeof data.stage === 'string' ? data.stage : undefined,
      backendReached,
      error: errorMessage,
    };
  } catch (err) {
    const durationMs = Date.now() - startMs;
    const completedAt = new Date().toISOString();
    const errMsg = err instanceof Error ? err.message : 'Network error';

    sendClientFailureTelemetry({
      requestId,
      operation,
      routePath: endpoint,
      targetUrl: endpoint,
      statusCode: 0,
      durationMs,
      backendReached: false,
      operationResult: 'FAILED',
      connectionStatus: 'NETWORK_ERROR',
      failureStage: 'BROWSER_TO_FRONTEND_NETWORK',
      errorCategory: 'NETWORK',
      errorMessage: `خطای شبکه در ارسال درخواست از مرورگر: ${errMsg}`,
      responseType: 'network_error',
      startedAt,
      completedAt,
    });

    return {
      ok: false,
      requestId,
      statusCode: 0,
      stage: 'BROWSER_TO_FRONTEND_NETWORK',
      backendReached: false,
      error: 'ارتباط مرورگر با سرور برقرار نشد. لطفاً اتصال اینترنت یا وضعیت سرور را بررسی کنید.',
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = readToken();
    if (!token) {
      setLoading(false);
      return;
    }
    writeToken(token);
    const requestId = generateRequestId();
    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Request-ID': requestId,
      },
      cache: 'no-store',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
        else writeToken(null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthActionResult> => {
    const result = await executeAuthRequest('LOGIN', '/api/auth/login', { email, password });
    if (result.ok && result.token && result.user) {
      writeToken(result.token);
      setUser(result.user);
      return {
        ok: true,
        role: result.user.role,
        requestId: result.requestId,
        statusCode: 200,
        backendReached: true,
      };
    }
    return {
      ok: false,
      error: result.error ?? 'ورود ناموفق بود',
      requestId: result.requestId,
      statusCode: result.statusCode,
      stage: result.stage,
      backendReached: result.backendReached,
    };
  }, []);

  const signUp = useCallback(
    async (fullName: string, email: string, password: string): Promise<AuthActionResult> => {
      const result = await executeAuthRequest('REGISTER', '/api/auth/register', {
        fullName,
        email,
        password,
      });
      if (result.ok && result.token && result.user) {
        writeToken(result.token);
        setUser(result.user);
        return {
          ok: true,
          role: result.user.role,
          requestId: result.requestId,
          statusCode: 200,
          backendReached: true,
        };
      }
      return {
        ok: false,
        error: result.error ?? 'ثبت‌نام ناموفق بود',
        requestId: result.requestId,
        statusCode: result.statusCode,
        stage: result.stage,
        backendReached: result.backendReached,
      };
    },
    [],
  );

  const signOut = useCallback(() => {
    writeToken(null);
    setUser(null);
    if (typeof window !== 'undefined') window.location.href = '/auth';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, logout: signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
