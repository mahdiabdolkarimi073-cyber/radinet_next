import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  BACKEND_URL,
  generateRequestId,
  resolveBackendApiUrlForRequest,
} from '@/lib/auth-client';

export type AuthLogLevel = 'INFO' | 'WARN' | 'ERROR';
export type AuthLogSource = 'frontend-client' | 'frontend-proxy' | 'backend';

export type SystemAuthLogItem = {
  id: string;
  requestId: string;
  source: AuthLogSource;
  level: AuthLogLevel;
  operation: string;
  method: string;
  routePath: string;
  targetUrl: string;
  statusCode: number;
  durationMs: number;
  backendReached: boolean;
  dtoValidationPassed: boolean | null;
  operationResult: 'SUCCESS' | 'FAILED' | string;
  connectionStatus: string;
  failureStage: string;
  errorCategory: string;
  errorMessage: string | null;
  maskedIdentifier: string | null;
  responseType: string;
  metadata: Record<string, unknown>;
  startedAt: string;
  completedAt: string;
  createdAt: string;
  correlatedSources?: AuthLogSource[];
  backendTrace?: SystemAuthLogItem | null;
  frontendTrace?: SystemAuthLogItem | null;
  connectionDiagnosis?: string;
};

export type RecordFrontendAuthLogInput = {
  requestId?: string;
  source?: AuthLogSource;
  level: AuthLogLevel;
  operation: 'REGISTER' | 'LOGIN' | 'AUTH_ME' | 'HEALTH_CHECK' | string;
  method?: string;
  routePath: string;
  targetUrl?: string;
  statusCode: number;
  durationMs: number;
  backendReached: boolean;
  dtoValidationPassed?: boolean | null;
  operationResult: 'SUCCESS' | 'FAILED';
  connectionStatus: string;
  failureStage: string;
  errorCategory: string;
  errorMessage?: string | null;
  rawIdentifier?: string | null;
  responseType?: string;
  metadata?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
  incomingHost?: string | null;
};

const SENSITIVE_KEY_REGEX = /password|pass|pwd|secret|token|cookie|authorization|auth_token|jwt|credential|private/i;
const MAX_LOCAL_LOGS = 2500;

export function maskIdentifier(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  const atIdx = trimmed.indexOf('@');
  if (atIdx > 0) {
    const local = trimmed.slice(0, atIdx);
    const domain = trimmed.slice(atIdx + 1);
    const maskedLocal =
      local.length <= 2
        ? `${local.charAt(0)}***`
        : `${local.charAt(0)}***${local.charAt(local.length - 1)}`;
    const dotIdx = domain.lastIndexOf('.');
    if (dotIdx > 1) {
      const domName = domain.slice(0, dotIdx);
      const tld = domain.slice(dotIdx);
      const maskedDom =
        domName.length <= 2
          ? `${domName.charAt(0)}**`
          : `${domName.charAt(0)}***${domName.charAt(domName.length - 1)}`;
      return `${maskedLocal}@${maskedDom}${tld}`;
    }
    return `${maskedLocal}@***`;
  }
  if (trimmed.length <= 3) return '***';
  return `${trimmed.slice(0, 2)}***${trimmed.slice(-1)}`;
}

export function sanitizeMetadata(meta?: Record<string, unknown> | null): Record<string, unknown> {
  if (!meta || typeof meta !== 'object') return {};
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(meta)) {
    if (SENSITIVE_KEY_REGEX.test(key)) {
      out[key] = '[REDACTED]';
      continue;
    }
    if (key.toLowerCase().includes('email') && typeof val === 'string') {
      out[key] = maskIdentifier(val);
      continue;
    }
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      out[key] = sanitizeMetadata(val as Record<string, unknown>);
    } else {
      out[key] = val;
    }
  }
  return out;
}

function getLogFilePath(): string {
  const dataDir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // Ignore if read-only
    }
  }
  return path.join(dataDir, 'auth-system-logs.json');
}

export function readFrontendDiskLogs(): SystemAuthLogItem[] {
  try {
    const file = getLogFilePath();
    if (!fs.existsSync(file)) return [];
    const content = fs.readFileSync(file, 'utf-8');
    if (!content.trim()) return [];
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? (parsed as SystemAuthLogItem[]) : [];
  } catch {
    return [];
  }
}

function writeFrontendDiskLog(item: SystemAuthLogItem): void {
  try {
    const file = getLogFilePath();
    const current = readFrontendDiskLogs();
    const filtered = current.filter(
      (existing) =>
        !(
          existing.requestId === item.requestId &&
          existing.source === item.source &&
          existing.operation === item.operation
        ),
    );
    const updated = [item, ...filtered].slice(0, MAX_LOCAL_LOGS);
    fs.writeFileSync(file, JSON.stringify(updated, null, 2), 'utf-8');
  } catch {
    // Ignore filesystem errors
  }
}

export async function recordFrontendAuthLog(
  input: RecordFrontendAuthLogInput,
): Promise<SystemAuthLogItem> {
  const nowIso = new Date().toISOString();
  const item: SystemAuthLogItem = {
    id: randomUUID(),
    requestId: input.requestId?.trim() || generateRequestId(),
    source: input.source ?? 'frontend-proxy',
    level: input.level,
    operation: input.operation,
    method: (input.method ?? 'POST').toUpperCase(),
    routePath: input.routePath,
    targetUrl: input.targetUrl ?? input.routePath,
    statusCode: Number.isFinite(input.statusCode) ? input.statusCode : 500,
    durationMs: Math.max(0, Math.round(input.durationMs || 0)),
    backendReached: Boolean(input.backendReached),
    dtoValidationPassed:
      typeof input.dtoValidationPassed === 'boolean' ? input.dtoValidationPassed : null,
    operationResult: input.operationResult,
    connectionStatus: input.connectionStatus,
    failureStage: input.failureStage,
    errorCategory: input.errorCategory,
    errorMessage: input.errorMessage ?? null,
    maskedIdentifier: maskIdentifier(input.rawIdentifier),
    responseType: input.responseType ?? 'json',
    metadata: sanitizeMetadata(input.metadata),
    startedAt: input.startedAt ?? nowIso,
    completedAt: input.completedAt ?? nowIso,
    createdAt: nowIso,
  };

  // Structured server log
  const logLine = JSON.stringify({
    ts: item.createdAt,
    level: item.level,
    source: item.source,
    requestId: item.requestId,
    op: item.operation,
    route: item.routePath,
    targetUrl: item.targetUrl,
    statusCode: item.statusCode,
    durationMs: item.durationMs,
    backendReached: item.backendReached,
    connectionStatus: item.connectionStatus,
    stage: item.failureStage,
    error: item.errorMessage,
  });
  if (item.level === 'ERROR') {
    console.error(`[RADINET_FRONTEND_AUTH_LOG] ${logLine}`);
  } else if (item.level === 'WARN') {
    console.warn(`[RADINET_FRONTEND_AUTH_LOG] ${logLine}`);
  } else {
    console.log(`[RADINET_FRONTEND_AUTH_LOG] ${logLine}`);
  }

  // 1. Always save persistently on Frontend server disk
  writeFrontendDiskLog(item);

  // 2. Also sync to Backend log store asynchronously if backend is reachable
  const backendBase = resolveBackendApiUrlForRequest(input.incomingHost);
  fetch(`${backendBase}/admin/system-logs/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': item.requestId,
    },
    body: JSON.stringify(item),
    cache: 'no-store',
  }).catch(() => {
    // If backend is unreachable, local disk log already captured the failure
  });

  return item;
}

function buildConnectionDiagnosis(
  primary: SystemAuthLogItem,
  hasBackendLog: boolean,
  hasFrontendLog: boolean,
): string {
  if (primary.backendReached || hasBackendLog) {
    if (primary.operationResult === 'SUCCESS') {
      return 'درخواست از فرانت‌اند با موفقیت به بک‌اند NestJS رسید، پردازش شد و پاسخ معتبر برگرداند.';
    }
    if (primary.failureStage === 'DTO_VALIDATION') {
      return 'درخواست به بک‌اند NestJS رسید اما در مرحله اعتبارسنجی فیلدهای ورودی (DTO Validation) با کد 400 رد شد.';
    }
    if (primary.failureStage === 'BACKEND_DATABASE') {
      return 'درخواست به بک‌اند NestJS رسید اما در مرحله کوئری به دیتابیس PostgreSQL با خطا مواجه شد.';
    }
    return `درخواست به بک‌اند NestJS رسید و در مرحله «${primary.failureStage}» با کد HTTP ${primary.statusCode} متوقف شد.`;
  }

  if (primary.connectionStatus === 'TIMEOUT') {
    return 'درخواست از لایه فرانت‌اند ارسال شد اما بک‌اند در مهلت مقرر (15 ثانیه) پاسخ نداد (Timeout - عدم دریافت در بک‌اند).';
  }
  if (primary.connectionStatus === 'CORS_ERROR') {
    return 'درخواست به دلیل محدودیت CORS قبل از دریافت پاسخ معتبر از بک‌اند مسدود شد.';
  }
  if (primary.connectionStatus === 'INVALID_RESPONSE') {
    return `درخواست به جای پاسخ JSON بک‌اند، پاسخ غیرمنتظره (${primary.responseType.toUpperCase()} - کد ${primary.statusCode}) از لایه Reverse Proxy یا آدرس اشتباه دریافت کرد و به کنترلر NestJS نرسید.`;
  }
  if (hasFrontendLog && !hasBackendLog) {
    return `درخواست در لایه فرانت‌اند ثبت شد اما هرگز به بک‌اند NestJS نرسید (${primary.connectionStatus} / ${primary.failureStage}).`;
  }
  return 'درخواست قبل از رسیدن به بک‌اند در لایه شبکه یا پروکسی متوقف شد.';
}

export async function queryMergedSystemLogs(
  filters: {
    requestId?: string;
    operation?: string;
    level?: string;
    status?: string;
    statusCode?: string;
    backendReached?: string;
    source?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
  options: { authHeader?: string | null; incomingHost?: string | null },
) {
  const localLogs = readFrontendDiskLogs();
  const backendBase = resolveBackendApiUrlForRequest(options.incomingHost);

  let remoteLogs: SystemAuthLogItem[] = [];
  let backendHealth: {
    backendOnline: boolean;
    databaseConnected: boolean;
    usersTableReady: boolean;
    logsTableReady: boolean;
    userCount: number | null;
    dbError: string | null;
    checkedAt: string;
    backendBaseUrl: string;
  } = {
    backendOnline: false,
    databaseConnected: false,
    usersTableReady: false,
    logsTableReady: false,
    userCount: null,
    dbError: null,
    checkedAt: new Date().toISOString(),
    backendBaseUrl: backendBase,
  };

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;
    const res = await fetch(`${backendBase}/admin/system-logs?limit=100`, {
      headers: {
        ...(options.authHeader ? { Authorization: options.authHeader } : {}),
        Accept: 'application/json',
      },
      cache: 'no-store',
      ...(controller ? { signal: controller.signal } : {}),
    });
    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.items)) {
        remoteLogs = data.items as SystemAuthLogItem[];
      }
      if (data?.backendHealth) {
        backendHealth = {
          ...backendHealth,
          ...data.backendHealth,
          backendOnline: true,
          backendBaseUrl: backendBase,
        };
      } else {
        backendHealth.backendOnline = true;
      }
    } else {
      // Try public /auth/health to see if backend is online even if admin token had an issue
      const healthRes = await fetch(`${backendBase}/auth/health`, { cache: 'no-store' }).catch(() => null);
      if (healthRes) {
        const healthData = await healthRes.json().catch(() => null);
        if (healthData) {
          backendHealth = {
            backendOnline: true,
            databaseConnected: Boolean(healthData.databaseConnected),
            usersTableReady: Boolean(healthData.usersTableReady),
            logsTableReady: Boolean(healthData.logsTableReady),
            userCount: typeof healthData.userCount === 'number' ? healthData.userCount : null,
            dbError: healthData.dbError ?? null,
            checkedAt: new Date().toISOString(),
            backendBaseUrl: backendBase,
          };
        }
      }
    }
  } catch (err) {
    backendHealth.backendOnline = false;
    backendHealth.dbError =
      err instanceof Error
        ? `عدم ارتباط با بک‌اند (${backendBase}): ${err.message}`
        : `عدم ارتباط با بک‌اند (${backendBase})`;
  }

  // Group logs by requestId to correlate Frontend and Backend entries
  const byRequestId = new Map<
    string,
    {
      backend?: SystemAuthLogItem;
      frontendProxy?: SystemAuthLogItem;
      frontendClient?: SystemAuthLogItem;
    }
  >();

  for (const log of [...remoteLogs, ...localLogs]) {
    if (!log || !log.requestId) continue;
    const group = byRequestId.get(log.requestId) ?? {};
    if (log.source === 'backend' && !group.backend) {
      group.backend = log;
    } else if (log.source === 'frontend-proxy' && !group.frontendProxy) {
      group.frontendProxy = log;
    } else if (log.source === 'frontend-client' && !group.frontendClient) {
      group.frontendClient = log;
    }
    byRequestId.set(log.requestId, group);
  }

  const correlatedItems: SystemAuthLogItem[] = [];
  for (const [, group] of Array.from(byRequestId.entries())) {
    const primary = group.backend ?? group.frontendProxy ?? group.frontendClient;
    if (!primary) continue;

    const sources: AuthLogSource[] = [];
    if (group.frontendClient) sources.push('frontend-client');
    if (group.frontendProxy) sources.push('frontend-proxy');
    if (group.backend) sources.push('backend');

    const backendReached = Boolean(group.backend || primary.backendReached);
    const merged: SystemAuthLogItem = {
      ...primary,
      backendReached,
      targetUrl: group.frontendProxy?.targetUrl || primary.targetUrl || primary.routePath,
      durationMs: group.frontendProxy?.durationMs || primary.durationMs,
      correlatedSources: sources,
      backendTrace: group.backend ?? null,
      frontendTrace: group.frontendProxy ?? group.frontendClient ?? null,
      metadata: {
        ...(group.frontendProxy?.metadata ?? {}),
        ...(group.backend?.metadata ?? {}),
        frontendDurationMs: group.frontendProxy?.durationMs ?? group.frontendClient?.durationMs ?? null,
        backendDurationMs: group.backend?.durationMs ?? null,
      },
    };
    merged.connectionDiagnosis = buildConnectionDiagnosis(
      merged,
      Boolean(group.backend),
      Boolean(group.frontendProxy || group.frontendClient),
    );
    correlatedItems.push(merged);
  }

  correlatedItems.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const filtered = correlatedItems.filter((item) => {
    if (filters.requestId?.trim()) {
      const q = filters.requestId.trim().toLowerCase();
      if (!item.requestId.toLowerCase().includes(q)) return false;
    }
    if (filters.operation && filters.operation !== 'all') {
      if (item.operation.toUpperCase() !== filters.operation.toUpperCase()) return false;
    }
    if (filters.level && filters.level !== 'all') {
      if (item.level.toUpperCase() !== filters.level.toUpperCase()) return false;
    }
    if (filters.source && filters.source !== 'all') {
      if (item.source !== filters.source && !(item.correlatedSources || []).includes(filters.source as AuthLogSource)) {
        return false;
      }
    }
    if (filters.backendReached && filters.backendReached !== 'all') {
      const expected = filters.backendReached === 'true' || filters.backendReached === 'reached';
      if (item.backendReached !== expected) return false;
    }
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'success' && item.operationResult !== 'SUCCESS') return false;
      if (filters.status === 'failed' && item.operationResult !== 'FAILED') return false;
    }
    if (filters.statusCode && filters.statusCode !== 'all') {
      if (filters.statusCode === 'network') {
        if (
          item.statusCode !== 0 &&
          item.connectionStatus !== 'NETWORK_ERROR' &&
          item.connectionStatus !== 'CORS_ERROR' &&
          item.connectionStatus !== 'TIMEOUT' &&
          item.connectionStatus !== 'INVALID_RESPONSE'
        ) {
          return false;
        }
      } else if (filters.statusCode === '5xx') {
        if (item.statusCode < 500) return false;
      } else {
        const codeNum = Number(filters.statusCode);
        if (Number.isFinite(codeNum) && item.statusCode !== codeNum) return false;
      }
    }
    if (filters.fromDate?.trim()) {
      const fromTs = new Date(filters.fromDate.trim()).getTime();
      if (Number.isFinite(fromTs) && new Date(item.createdAt).getTime() < fromTs) return false;
    }
    if (filters.toDate?.trim()) {
      const toDateObj = new Date(filters.toDate.trim());
      toDateObj.setHours(23, 59, 59, 999);
      const toTs = toDateObj.getTime();
      if (Number.isFinite(toTs) && new Date(item.createdAt).getTime() > toTs) return false;
    }
    if (filters.search?.trim()) {
      const s = filters.search.trim().toLowerCase();
      const hay = [
        item.requestId,
        item.routePath,
        item.targetUrl,
        item.operation,
        item.failureStage,
        item.errorCategory,
        item.errorMessage ?? '',
        item.maskedIdentifier ?? '',
        item.connectionDiagnosis ?? '',
        String(item.statusCode),
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });

  const summary = {
    total: correlatedItems.length,
    successCount: correlatedItems.filter((i) => i.operationResult === 'SUCCESS').length,
    failedCount: correlatedItems.filter((i) => i.operationResult === 'FAILED').length,
    backendReachedCount: correlatedItems.filter((i) => i.backendReached).length,
    notReachedBackendCount: correlatedItems.filter((i) => !i.backendReached).length,
    avgDurationMs:
      correlatedItems.length > 0
        ? Math.round(
            correlatedItems.reduce((acc, i) => acc + (i.durationMs || 0), 0) /
              correlatedItems.length,
          )
        : 0,
    statusBreakdown: {
      s200: correlatedItems.filter((i) => i.statusCode >= 200 && i.statusCode < 300).length,
      s400: correlatedItems.filter((i) => i.statusCode === 400).length,
      s401: correlatedItems.filter((i) => i.statusCode === 401).length,
      s403: correlatedItems.filter((i) => i.statusCode === 403).length,
      s404: correlatedItems.filter((i) => i.statusCode === 404).length,
      s409: correlatedItems.filter((i) => i.statusCode === 409).length,
      s500: correlatedItems.filter((i) => i.statusCode >= 500).length,
      network: correlatedItems.filter(
        (i) =>
          i.statusCode === 0 ||
          i.connectionStatus === 'NETWORK_ERROR' ||
          i.connectionStatus === 'CORS_ERROR' ||
          i.connectionStatus === 'TIMEOUT' ||
          i.connectionStatus === 'INVALID_RESPONSE',
      ).length,
    },
  };

  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.min(Math.max(Number(filters.limit) || 25, 1), 100);
  const startIdx = (page - 1) * limit;
  const paginated = filtered.slice(startIdx, startIdx + limit);

  return {
    ok: true,
    backendHealth,
    items: paginated,
    total: filtered.length,
    page,
    limit,
    pages: Math.max(Math.ceil(filtered.length / limit), 1),
    summary,
  };
}

export async function runEndToEndConnectivityCheck(incomingHost?: string | null) {
  const requestId = generateRequestId();
  const backendBase = resolveBackendApiUrlForRequest(incomingHost);
  const targetUrl = `${backendBase}/auth/health`;
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 10000) : null;
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Request-ID': requestId,
      },
      cache: 'no-store',
      ...(controller ? { signal: controller.signal } : {}),
    });
    if (timeoutId) clearTimeout(timeoutId);

    const durationMs = Date.now() - startMs;
    const completedAt = new Date().toISOString();
    const rawText = await res.text().catch(() => '');
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : null;
    } catch {
      parsed = null;
    }

    const backendReached =
      res.headers.get('x-backend-reached') === 'true' || Boolean(parsed?.backendReached);
    const databaseConnected = Boolean(parsed?.databaseConnected);
    const ok = res.ok && backendReached && databaseConnected;

    const logItem = await recordFrontendAuthLog({
      requestId,
      source: 'frontend-proxy',
      level: ok ? 'INFO' : 'ERROR',
      operation: 'HEALTH_CHECK',
      method: 'GET',
      routePath: '/api/auth/health',
      targetUrl,
      statusCode: res.status || 503,
      durationMs,
      backendReached,
      dtoValidationPassed: true,
      operationResult: ok ? 'SUCCESS' : 'FAILED',
      connectionStatus: backendReached ? 'CONNECTED' : 'INVALID_RESPONSE',
      failureStage: ok
        ? 'NONE'
        : !backendReached
          ? 'REVERSE_PROXY_OR_GATEWAY'
          : 'BACKEND_DATABASE',
      errorCategory: ok ? 'NONE' : !backendReached ? 'HTTP' : 'DATABASE',
      errorMessage: ok
        ? null
        : !backendReached
          ? `پاسخ معتبر از بک‌اند دریافت نشد (HTTP ${res.status})`
          : String(parsed?.dbError || 'عدم اتصال بک‌اند به دیتابیس PostgreSQL'),
      responseType: parsed ? 'json' : 'text',
      metadata: {
        databaseConnected,
        usersTableReady: parsed?.usersTableReady ?? false,
        userCount: parsed?.userCount ?? null,
      },
      startedAt,
      completedAt,
      incomingHost,
    });

    return {
      ok,
      requestId,
      targetUrl,
      durationMs,
      statusCode: res.status,
      backendReached,
      databaseConnected,
      usersTableReady: Boolean(parsed?.usersTableReady),
      userCount: typeof parsed?.userCount === 'number' ? parsed.userCount : null,
      dbError: parsed?.dbError ? String(parsed.dbError) : null,
      diagnosis: buildConnectionDiagnosis(logItem, backendReached, true),
    };
  } catch (err) {
    const durationMs = Date.now() - startMs;
    const completedAt = new Date().toISOString();
    const errMsg = err instanceof Error ? err.message : String(err);

    const logItem = await recordFrontendAuthLog({
      requestId,
      source: 'frontend-proxy',
      level: 'ERROR',
      operation: 'HEALTH_CHECK',
      method: 'GET',
      routePath: '/api/auth/health',
      targetUrl,
      statusCode: 0,
      durationMs,
      backendReached: false,
      dtoValidationPassed: null,
      operationResult: 'FAILED',
      connectionStatus: 'NETWORK_ERROR',
      failureStage: 'PROXY_TO_BACKEND_NETWORK',
      errorCategory: 'NETWORK',
      errorMessage: `عدم برقراری ارتباط شبکه با بک‌اند (${targetUrl}): ${errMsg}`,
      responseType: 'network_error',
      startedAt,
      completedAt,
      incomingHost,
    });

    return {
      ok: false,
      requestId,
      targetUrl,
      durationMs,
      statusCode: 0,
      backendReached: false,
      databaseConnected: false,
      usersTableReady: false,
      userCount: null,
      dbError: errMsg,
      diagnosis: buildConnectionDiagnosis(logItem, false, true),
    };
  }
}
