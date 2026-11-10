function readRawBackendEnv(incomingHost?: string | null): string {
  const candidates = [
    process.env.BACKEND_INTERNAL_URL,
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
  ];
  for (const val of candidates) {
    if (typeof val === 'string' && val.trim().length > 0) {
      return val.trim();
    }
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname.toLowerCase();
    if (host === 'radinet24.com' || host.endsWith('.radinet24.com')) {
      return 'https://backend.radinet24.com';
    }
  }
  if (incomingHost && incomingHost.toLowerCase().includes('radinet24.com')) {
    return 'https://backend.radinet24.com';
  }
  return 'http://localhost:4000';
}

export function normalizeBackendOriginUrl(raw = readRawBackendEnv()): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return 'http://localhost:4000';
  return trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
}

export function normalizeBackendApiUrl(raw = readRawBackendEnv()): string {
  const origin = normalizeBackendOriginUrl(raw);
  return `${origin}/api`;
}

export function resolveBackendApiUrlForRequest(incomingHost?: string | null): string {
  return normalizeBackendApiUrl(readRawBackendEnv(incomingHost));
}

export const BACKEND_ORIGIN = normalizeBackendOriginUrl();
export const BACKEND_URL = normalizeBackendApiUrl();

export const AUTH_TOKEN_KEY = 'radinet_auth_token';

export function generateRequestId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
  return `req_${ts}_${rand}`;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromStorage =
      window.localStorage.getItem(AUTH_TOKEN_KEY) ||
      window.localStorage.getItem('token') ||
      window.localStorage.getItem('auth_token');
    if (fromStorage) return fromStorage;
  } catch {
    // Ignore storage access errors in restricted environments
  }
  if (typeof document !== 'undefined' && document.cookie) {
    const cookies = document.cookie.split('; ');
    for (const entry of cookies) {
      if (entry.startsWith(`${AUTH_TOKEN_KEY}=`)) {
        const raw = entry.slice(AUTH_TOKEN_KEY.length + 1);
        if (raw) {
          try {
            return decodeURIComponent(raw);
          } catch {
            return raw;
          }
        }
      }
    }
  }
  return null;
}

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organizationId?: string | null;
};

export type AuthTelemetry = {
  requestId: string;
  targetUrl: string;
  statusCode: number;
  durationMs: number;
  backendReached: boolean;
  connectionStatus:
    | 'CONNECTED'
    | 'NETWORK_ERROR'
    | 'CORS_ERROR'
    | 'TIMEOUT'
    | 'HTTP_ERROR'
    | 'INVALID_RESPONSE';
  failureStage: string;
  errorCategory: string;
  responseType: 'json' | 'html' | 'text' | 'empty' | 'network_error';
  responseKeys: string[];
  startedAt: string;
  completedAt: string;
};

export type AuthResponse = {
  ok: boolean;
  statusCode?: number;
  requestId?: string;
  backendReached?: boolean;
  code?: string;
  stage?: string;
  token?: string;
  user?: AuthUser;
  error?: string;
  telemetry?: AuthTelemetry;
};

export function getPanelPathForRole(role?: string): string {
  switch (role?.toLowerCase()) {
    case 'admin':
      return '/admin';
    case 'support_expert':
    case 'support_admin':
    case 'support_agent':
      return '/support-panel';
    case 'org_admin':
    case 'org_staff':
      return '/org';
    case 'radiant_agency':
    case 'agency_manager':
      return '/agency';
    case 'user':
    case 'patient':
      return '/user-panel';
    case 'radiologist':
    case 'doctor':
    default:
      return '/dashboard';
  }
}

function translateValidationMessages(rawMessage: unknown): string {
  const list = Array.isArray(rawMessage)
    ? rawMessage.map(String)
    : typeof rawMessage === 'string'
      ? [rawMessage]
      : [];
  if (list.length === 0) return '';

  const translated = list.map((msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('email must be an email')) {
      return 'فرمت ایمیل واردشده معتبر نیست.';
    }
    if (lower.includes('password must be longer than or equal to 6')) {
      return 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
    }
    if (lower.includes('password must be a string')) {
      return 'وارد کردن رمز عبور الزامی است.';
    }
    if (lower.includes('fullname must be a string') || lower.includes('fullname should not be empty')) {
      return 'وارد کردن نام و نام خانوادگی الزامی است.';
    }
    return msg;
  });

  return translated.join(' | ');
}

export async function postAuth(
  path: 'login' | 'register' | string,
  body: unknown,
  options?: { requestId?: string; incomingHost?: string | null },
): Promise<AuthResponse> {
  const requestId = options?.requestId?.trim() || generateRequestId();
  const baseUrl = resolveBackendApiUrlForRequest(options?.incomingHost);
  const targetUrl = `${baseUrl}/auth/${path}`;
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 15000) : null;

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Request-ID': requestId,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      ...(controller ? { signal: controller.signal } : {}),
    });

    if (timeoutId) clearTimeout(timeoutId);
    const durationMs = Date.now() - startMs;
    const completedAt = new Date().toISOString();

    const responseRequestId = res.headers.get('x-request-id') || requestId;
    const headerBackendReached = res.headers.get('x-backend-reached') === 'true';
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const rawText = await res.text().catch(() => '');

    let parsedData: Record<string, unknown> | null = null;
    if (rawText.trim()) {
      try {
        const json = JSON.parse(rawText);
        if (json && typeof json === 'object') {
          parsedData = json as Record<string, unknown>;
        }
      } catch {
        parsedData = null;
      }
    }

    const responseType: AuthTelemetry['responseType'] = parsedData
      ? 'json'
      : contentType.includes('text/html') || rawText.trim().startsWith('<')
        ? 'html'
        : rawText.trim()
          ? 'text'
          : 'empty';

    // Case 1: Backend or Reverse Proxy returned non-JSON (e.g. HTML 404/502/503/504)
    if (!parsedData) {
      let specificError = `سرور بک‌اند پاسخ غیرمنتظره (HTTP ${res.status}) ارسال کرد.`;
      let failureStage = 'REVERSE_PROXY_OR_GATEWAY';
      let backendReached = headerBackendReached;

      if (res.status === 404) {
        specificError = `مسیر احراز هویت در بک‌اند یافت نشد (HTTP 404: ${targetUrl}). لطفاً آدرس NEXT_PUBLIC_API_URL و اجرای سرویس بک‌اند را بررسی کنید.`;
        failureStage = 'BACKEND_ROUTE_NOT_FOUND';
      } else if (res.status === 502 || res.status === 503 || res.status === 504) {
        specificError = `سرویس بک‌اند در دسترس نیست یا درگاه سرور خطای ${res.status} برگرداند (${targetUrl}).`;
        failureStage = 'GATEWAY_BAD_UPSTREAM';
        backendReached = false;
      } else if (res.status >= 500) {
        specificError = `خطای داخلی در سرور بک‌اند رخ داد (HTTP ${res.status}).`;
        failureStage = 'BACKEND_UNHANDLED_500';
      }

      const telemetry: AuthTelemetry = {
        requestId: responseRequestId,
        targetUrl,
        statusCode: res.status || 502,
        durationMs,
        backendReached,
        connectionStatus: 'INVALID_RESPONSE',
        failureStage,
        errorCategory: 'HTTP',
        responseType,
        responseKeys: [],
        startedAt,
        completedAt,
      };

      return {
        ok: false,
        statusCode: res.status && res.status >= 400 ? res.status : 502,
        requestId: responseRequestId,
        backendReached,
        code: `HTTP_${res.status || 502}_NON_JSON`,
        stage: failureStage,
        error: specificError,
        telemetry,
      };
    }

    // Case 2: Valid JSON received from NestJS Backend
    const responseKeys = Object.keys(parsedData).map((k) =>
      k.toLowerCase().includes('token') ? `${k}(redacted)` : k,
    );
    const backendReached =
      headerBackendReached ||
      parsedData.backendReached === true ||
      'ok' in parsedData ||
      'statusCode' in parsedData;

    const isSuccess = res.ok && parsedData.ok !== false;

    if (!isSuccess) {
      const statusCode =
        typeof parsedData.statusCode === 'number'
          ? parsedData.statusCode
          : res.status >= 400
            ? res.status
            : 400;

      const translatedMsg =
        (typeof parsedData.error === 'string' && parsedData.error !== 'Bad Request'
          ? parsedData.error
          : '') ||
        translateValidationMessages(parsedData.message) ||
        (typeof parsedData.error === 'string' ? parsedData.error : '') ||
        `درخواست احراز هویت با کد وضعیت ${statusCode} رد شد.`;

      const failureStage =
        typeof parsedData.stage === 'string'
          ? parsedData.stage
          : statusCode === 400
            ? 'DTO_VALIDATION'
            : statusCode === 401
              ? 'AUTH_CREDENTIALS'
              : statusCode === 403
                ? 'AUTH_FORBIDDEN'
                : statusCode === 409
                  ? 'DUPLICATE_USER'
                  : statusCode >= 500
                    ? 'BACKEND_SERVER_OR_DB'
                    : 'BACKEND_HTTP_ERROR';

      const errorCategory =
        statusCode === 400
          ? 'VALIDATION'
          : statusCode === 401 || statusCode === 403 || statusCode === 409
            ? 'AUTH'
            : statusCode >= 500
              ? 'DATABASE'
              : 'HTTP';

      const telemetry: AuthTelemetry = {
        requestId: responseRequestId,
        targetUrl,
        statusCode,
        durationMs,
        backendReached,
        connectionStatus: 'HTTP_ERROR',
        failureStage,
        errorCategory,
        responseType: 'json',
        responseKeys,
        startedAt,
        completedAt,
      };

      return {
        ok: false,
        statusCode,
        requestId: responseRequestId,
        backendReached,
        code: typeof parsedData.code === 'string' ? parsedData.code : `HTTP_${statusCode}`,
        stage: failureStage,
        error: translatedMsg,
        telemetry,
      };
    }

    const telemetry: AuthTelemetry = {
      requestId: responseRequestId,
      targetUrl,
      statusCode: res.status || 200,
      durationMs,
      backendReached: true,
      connectionStatus: 'CONNECTED',
      failureStage: 'NONE',
      errorCategory: 'NONE',
      responseType: 'json',
      responseKeys,
      startedAt,
      completedAt,
    };

    return {
      ok: true,
      statusCode: res.status || 200,
      requestId: responseRequestId,
      backendReached: true,
      token: typeof parsedData.token === 'string' ? parsedData.token : undefined,
      user: parsedData.user as AuthUser | undefined,
      telemetry,
    };
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    const durationMs = Date.now() - startMs;
    const completedAt = new Date().toISOString();
    const errName = err instanceof Error ? err.name : 'NetworkError';
    const errMsg = err instanceof Error ? err.message : String(err);

    const isTimeout = errName === 'AbortError' || errMsg.toLowerCase().includes('abort') || errMsg.toLowerCase().includes('timeout');
    const isCors = errMsg.toLowerCase().includes('cors');

    const connectionStatus: AuthTelemetry['connectionStatus'] = isTimeout
      ? 'TIMEOUT'
      : isCors
        ? 'CORS_ERROR'
        : 'NETWORK_ERROR';

    const failureStage = isTimeout
      ? 'PROXY_TO_BACKEND_TIMEOUT'
      : isCors
        ? 'BACKEND_CORS_BLOCKED'
        : 'PROXY_TO_BACKEND_NETWORK';

    const userFriendlyError = isTimeout
      ? `مهلت زمانی اتصال به سرور بک‌اند (${targetUrl}) به پایان رسید.`
      : isCors
        ? `خطای CORS در ارتباط با سرور بک‌اند (${targetUrl}).`
        : `عدم برقراری ارتباط شبکه با سرور بک‌اند (${targetUrl}). لطفاً فعال بودن سرویس بک‌اند و تنظیمات پورت/دامنه را بررسی کنید.`;

    const telemetry: AuthTelemetry = {
      requestId,
      targetUrl,
      statusCode: 0,
      durationMs,
      backendReached: false,
      connectionStatus,
      failureStage,
      errorCategory: isTimeout ? 'TIMEOUT' : isCors ? 'CORS' : 'NETWORK',
      responseType: 'network_error',
      responseKeys: [],
      startedAt,
      completedAt,
    };

    return {
      ok: false,
      statusCode: 503,
      requestId,
      backendReached: false,
      code: connectionStatus,
      stage: failureStage,
      error: userFriendlyError,
      telemetry,
    };
  }
}

export async function getMe(
  token: string | null,
  options?: { requestId?: string; incomingHost?: string | null },
): Promise<AuthUser | null> {
  if (!token) return null;
  const requestId = options?.requestId?.trim() || generateRequestId();
  const baseUrl = resolveBackendApiUrlForRequest(options?.incomingHost);
  try {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Request-ID': requestId,
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; user?: AuthUser };
    return data.user ?? null;
  } catch {
    return null;
  }
}
