'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Database,
  Eye,
  Filter,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { getStoredToken } from '@/lib/auth-client';
import { adminNavItems } from '@/lib/admin-nav';

type AuthLogLevel = 'INFO' | 'WARN' | 'ERROR';
type AuthLogSource = 'frontend-client' | 'frontend-proxy' | 'backend';

type SystemAuthLogItem = {
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

type BackendHealth = {
  backendOnline: boolean;
  databaseConnected: boolean;
  usersTableReady: boolean;
  logsTableReady: boolean;
  userCount: number | null;
  dbError: string | null;
  checkedAt: string;
  backendBaseUrl: string;
};

type LogsResponse = {
  ok: boolean;
  backendHealth: BackendHealth;
  items: SystemAuthLogItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  summary: {
    total: number;
    successCount: number;
    failedCount: number;
    backendReachedCount: number;
    notReachedBackendCount: number;
    avgDurationMs: number;
    statusBreakdown: {
      s200: number;
      s400: number;
      s401: number;
      s403: number;
      s404: number;
      s409: number;
      s500: number;
      network: number;
    };
  };
};

type LivePingResult = {
  ok: boolean;
  requestId: string;
  targetUrl: string;
  durationMs: number;
  statusCode: number;
  backendReached: boolean;
  databaseConnected: boolean;
  usersTableReady: boolean;
  userCount: number | null;
  dbError: string | null;
  diagnosis: string;
};

const operationLabels: Record<string, string> = {
  REGISTER: 'ثبت‌نام (Register)',
  LOGIN: 'ورود (Login)',
  AUTH_ME: 'بررسی نشست (Auth Me)',
  HEALTH_CHECK: 'تست سلامت اتصال',
};

const stageLabels: Record<string, string> = {
  NONE: 'بدون خطا (تکمیل موفق)',
  DTO_VALIDATION: 'اعتبارسنجی DTO در بک‌اند',
  DUPLICATE_USER: 'تکراری بودن ایمیل کاربر',
  USER_NOT_FOUND: 'عدم وجود کاربر با ایمیل واردشده',
  INVALID_PASSWORD: 'عدم تطابق رمز عبور',
  ACCOUNT_STATUS: 'حساب غیرفعال یا معلق',
  ROLE_FORBIDDEN: 'عدم مجوز نقش کاربری',
  BACKEND_DATABASE: 'خطای دیتابیس PostgreSQL در بک‌اند',
  TOKEN_VERIFY: 'بررسی امضای توکن JWT',
  PROXY_TO_BACKEND_NETWORK: 'عدم ارتباط شبکه فرانت‌اند با بک‌اند',
  PROXY_TO_BACKEND_TIMEOUT: 'پایان مهلت زمانی پاسخ بک‌اند (Timeout)',
  BACKEND_CORS_BLOCKED: 'مسدود شدن درخواست توسط CORS',
  BACKEND_ROUTE_NOT_FOUND: 'عدم وجود مسیر در بک‌اند (404)',
  GATEWAY_BAD_UPSTREAM: 'خطای درگاه/پروکسی سرور (502/503/504)',
  REVERSE_PROXY_OR_GATEWAY: 'پاسخ غیر JSON از پروکسی یا آدرس اشتباه',
  BROWSER_TO_FRONTEND_NETWORK: 'قطع ارتباط مرورگر کاربر با سرور فرانت‌اند',
  BROWSER_TO_FRONTEND_NON_JSON: 'پاسخ غیر JSON از درگاه فرانت‌اند',
  FRONTEND_JSON_PARSE: 'خطای ساختار JSON ارسالی در فرانت‌اند',
};

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function AdminSystemLogsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [requestIdFilter, setRequestIdFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [operationFilter, setOperationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusCodeFilter, setStatusCodeFilter] = useState('all');
  const [backendReachedFilter, setBackendReachedFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  // State
  const [data, setData] = useState<LogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<SystemAuthLogItem | null>(null);
  const [copiedId, setCopiedId] = useState('');
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState<LivePingResult | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: '25',
    });
    if (requestIdFilter.trim()) params.set('requestId', requestIdFilter.trim());
    if (searchFilter.trim()) params.set('search', searchFilter.trim());
    if (operationFilter !== 'all') params.set('operation', operationFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (statusCodeFilter !== 'all') params.set('statusCode', statusCodeFilter);
    if (backendReachedFilter !== 'all') params.set('backendReached', backendReachedFilter);
    if (levelFilter !== 'all') params.set('level', levelFilter);
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    return params.toString();
  }, [
    page,
    requestIdFilter,
    searchFilter,
    operationFilter,
    statusFilter,
    statusCodeFilter,
    backendReachedFilter,
    levelFilter,
    fromDate,
    toDate,
  ]);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/admin/system-logs?${queryString}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || 'دریافت لاگ‌های سیستم و احراز هویت ناموفق بود.');
      }
      setData(json as LogsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری لاگ‌ها.');
    } finally {
      setIsLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    if (!authLoading) {
      void loadLogs();
    }
  }, [authLoading, loadLogs]);

  async function handleRunLivePing() {
    setPingLoading(true);
    setPingResult(null);
    setError('');
    try {
      const token = getStoredToken();
      const res = await fetch('/api/admin/system-logs', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json) {
        throw new Error(json?.message || 'اجرای تست اتصال ناموفق بود.');
      }
      setPingResult(json as LivePingResult);
      await loadLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در اجرای تست اتصال.');
    } finally {
      setPingLoading(false);
    }
  }

  function handleCopyRequestId(reqId: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(reqId);
      setCopiedId(reqId);
      setTimeout(() => setCopiedId(''), 2000);
    }
  }

  function resetFilters() {
    setRequestIdFilter('');
    setSearchFilter('');
    setOperationFilter('all');
    setStatusFilter('all');
    setStatusCodeFilter('all');
    setBackendReachedFilter('all');
    setLevelFilter('all');
    setFromDate('');
    setToDate('');
    setPage(1);
  }

  if (!authLoading && user && user.role.toLowerCase() !== 'admin') {
    return (
      <div style={{ padding: 48, textAlign: 'center', direction: 'rtl' }}>
        <ShieldAlert size={48} style={{ margin: '0 auto 16px', color: '#dc2626' }} />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>دسترسی محدود به مدیر کل</h2>
        <p style={{ color: '#475569', marginTop: 8 }}>
          این بخش فقط برای مدیران دارای مجوز (Admin) قابل مشاهده است.
        </p>
      </div>
    );
  }

  const summary = data?.summary ?? {
    total: 0,
    successCount: 0,
    failedCount: 0,
    backendReachedCount: 0,
    notReachedBackendCount: 0,
    avgDurationMs: 0,
    statusBreakdown: { s200: 0, s400: 0, s401: 0, s403: 0, s404: 0, s409: 0, s500: 0, network: 0 },
  };
  const health = data?.backendHealth;

  return (
    <div className="admin-page-root">
      <div className="admin-page-shell">
        <aside className={`admin-page-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-page-brand">
            <div className="admin-page-brand__mark">
              <ShieldCheck size={28} strokeWidth={1.7} />
            </div>
            <div>
              <strong>رادینت</strong>
              <span>پنل مدیریت</span>
            </div>
            <button
              className="admin-page-sidebar__close"
              onClick={() => setSidebarOpen(false)}
              style={{ display: sidebarOpen ? 'grid' : 'none' }}
            >
              <X size={22} />
            </button>
          </div>
          <nav className="admin-page-nav">
            {adminNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`admin-page-nav__item ${item.href === '/admin/system-logs' ? 'is-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="admin-page-nav__logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج</span>
          </button>
        </aside>

        {sidebarOpen && (
          <div
            className="admin-page-overlay"
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,29,65,.42)' }}
          />
        )}

        <div className="admin-page-content">
          <header className="admin-page-header">
            <div className="admin-page-header__title">
              <Activity size={26} strokeWidth={1.7} />
              <span>لاگ سیستم و احراز هویت</span>
            </div>
            <div className="admin-page-profile">
              <div className="admin-page-avatar">{user?.fullName?.charAt(0) ?? 'A'}</div>
              <div className="admin-page-user">
                <strong>{user?.fullName ?? 'مدیر سیستم'}</strong>
                <span>مدیر کل</span>
              </div>
              <ChevronDown className="admin-page-profile__chevron" size={17} />
            </div>
            <button className="admin-page-burger" onClick={() => setSidebarOpen(true)} aria-label="منو">
              <Menu size={26} strokeWidth={1.7} />
            </button>
          </header>

          <main className="admin-page-main">
            <div
              className="admin-page-title"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div>
                <h2>لاگ سیستم، احراز هویت و ردیابی ارتباط فرانت‌اند و بک‌اند</h2>
                <p>
                  پایش لحظه‌ای درخواست‌های ثبت‌نام و ورود، ردیابی با شناسه یکتای <code>X-Request-ID</code>، تشخیص رسیدن یا نرسیدن درخواست به بک‌اند NestJS و بررسی خطاهای 400، 401، 403، 404 و 500
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => void handleRunLivePing()}
                  disabled={pingLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    borderRadius: 10,
                    background: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: pingLoading ? 'wait' : 'pointer',
                  }}
                >
                  <Wifi size={17} />
                  {pingLoading ? 'در حال تست زنجیره اتصال...' : 'تست زنده اتصال فرانت‌اند به بک‌اند (X-Request-ID)'}
                </button>
                <button
                  type="button"
                  onClick={() => void loadLogs()}
                  disabled={isLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: '#fff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={16} />
                  بروزرسانی
                </button>
              </div>
            </div>

            {/* Live Connection Status Banner */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: 16,
                marginBottom: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 10,
                  background: health?.backendOnline ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${health?.backendOnline ? '#a7f3d0' : '#fecaca'}`,
                }}
              >
                {health?.backendOnline ? (
                  <Server size={24} style={{ color: '#059669', flexShrink: 0 }} />
                ) : (
                  <WifiOff size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                    وضعیت ارتباط فرانت‌اند با بک‌اند NestJS
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: health?.backendOnline ? '#047857' : '#b91c1c',
                    }}
                  >
                    {health?.backendOnline ? 'متصل و پاسخ‌گو (Online)' : 'عدم برقراری ارتباط با بک‌اند'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', direction: 'ltr', textAlign: 'right' }}>
                    {health?.backendBaseUrl || '—'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 10,
                  background: health?.databaseConnected ? '#ecfdf5' : '#fffbeb',
                  border: `1px solid ${health?.databaseConnected ? '#a7f3d0' : '#fde68a'}`,
                }}
              >
                <Database
                  size={24}
                  style={{ color: health?.databaseConnected ? '#059669' : '#d97706', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                    وضعیت دیتابیس PostgreSQL و جدول کاربران
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: health?.databaseConnected ? '#047857' : '#b45309',
                    }}
                  >
                    {health?.databaseConnected
                      ? `متصل (${health.userCount ?? 0} کاربر ثبت‌شده)`
                      : 'عدم اتصال دیتابیس یا عدم ایجاد جدول'}
                  </div>
                  {health?.dbError && (
                    <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 2 }}>
                      {health.dbError}
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Clock size={24} style={{ color: '#0284c7', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                    میانگین زمان پاسخ‌گویی API احراز هویت
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                    {summary.avgDurationMs.toLocaleString('fa-IR')} میلی‌ثانیه
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    حفظ پایدار لاگ‌ها در دیتابیس و دیسک سرور
                  </div>
                </div>
              </div>
            </div>

            {/* Live Ping Result Box */}
            {pingResult && (
              <div
                style={{
                  background: pingResult.ok ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${pingResult.ok ? '#6ee7b7' : '#fca5a5'}`,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <strong style={{ color: pingResult.ok ? '#065f46' : '#991b1b', fontSize: 14 }}>
                    نتیجه تست زنده اتصال: {pingResult.diagnosis}
                  </strong>
                  <span style={{ fontSize: 12, fontWeight: 700, direction: 'ltr', background: '#fff', padding: '3px 8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                    X-Request-ID: {pingResult.requestId}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#334155', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span>آدرس مقصد: <code dir="ltr">{pingResult.targetUrl}</code></span>
                  <span>رسیدن به بک‌اند: <strong>{pingResult.backendReached ? 'بله (تأیید شد)' : 'خیر (نرسید)'}</strong></span>
                  <span>اتصال دیتابیس: <strong>{pingResult.databaseConnected ? 'برقرار' : 'قطع'}</strong></span>
                  <span>کد وضعیت: <strong>{pingResult.statusCode || 'خطای شبکه'}</strong></span>
                  <span>مدت زمان: <strong>{pingResult.durationMs} ms</strong></span>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  padding: '12px 16px',
                  borderRadius: 10,
                  marginBottom: 16,
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            {/* Summary Breakdown Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 10,
                marginBottom: 16,
              }}
            >
              {[
                { label: 'کل لاگ‌ها', value: summary.total, color: '#0284c7', filterCode: 'all', filterStatus: 'all' },
                { label: 'عملیات موفق (200)', value: summary.successCount, color: '#059669', filterCode: 'all', filterStatus: 'success' },
                { label: 'عملیات ناموفق', value: summary.failedCount, color: '#dc2626', filterCode: 'all', filterStatus: 'failed' },
                { label: 'رسیده به بک‌اند', value: summary.backendReachedCount, color: '#0d9488', filterReached: 'true' },
                { label: 'نرسیده به بک‌اند (شبکه/پروکسی)', value: summary.notReachedBackendCount, color: '#e11d48', filterReached: 'false' },
                { label: 'خطای 400 (Bad Request)', value: summary.statusBreakdown.s400, color: '#d97706', filterCode: '400' },
                { label: 'خطای 401 / 403 (احراز/مجوز)', value: summary.statusBreakdown.s401 + summary.statusBreakdown.s403, color: '#9333ea', filterCode: '401' },
                { label: 'خطای 404 / 500+', value: summary.statusBreakdown.s404 + summary.statusBreakdown.s500, color: '#b91c1c', filterCode: '5xx' },
              ].map((card, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    if (card.filterStatus) setStatusFilter(card.filterStatus);
                    if (card.filterCode) setStatusCodeFilter(card.filterCode);
                    if (card.filterReached) setBackendReachedFilter(card.filterReached);
                  }}
                  style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRight: `4px solid ${card.color}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    textAlign: 'right',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{card.label}</span>
                  <strong style={{ fontSize: 20, color: '#0f172a', fontWeight: 800 }}>
                    {card.value.toLocaleString('fa-IR')}
                  </strong>
                </button>
              ))}
            </div>

            {/* Search & Filter Panel */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 700, color: '#1e293b', fontSize: 14 }}>
                <Filter size={17} />
                <span>جستجو و فیلتر پیشرفته لاگ‌ها</span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
                  gap: 10,
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 4 }}>
                    شناسه درخواست (X-Request-ID)
                  </label>
                  <input
                    type="text"
                    value={requestIdFilter}
                    onChange={(e) => {
                      setPage(1);
                      setRequestIdFilter(e.target.value);
                    }}
                    placeholder="مثال: req_..."
                    dir="ltr"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 4 }}>
                    جستجو در مسیر یا متن خطا
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => {
                        setPage(1);
                        setSearchFilter(e.target.value);
                      }}
                      placeholder="مسیر، علت شکست، ایمیل ماسک‌شده..."
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 4 }}>
                    نوع عملیات
                  </label>
                  <select
                    value={operationFilter}
                    onChange={(e) => {
                      setPage(1);
                      setOperationFilter(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      background: '#fff',
                    }}
                  >
                    <option value="all">همه عملیات‌ها</option>
                    <option value="REGISTER">ثبت‌نام (REGISTER)</option>
                    <option value="LOGIN">ورود (LOGIN)</option>
                    <option value="AUTH_ME">بررسی نشست (AUTH_ME)</option>
                    <option value="HEALTH_CHECK">تست سلامت اتصال (HEALTH_CHECK)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 4 }}>
                    وضعیت عملیات
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setPage(1);
                      setStatusFilter(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      background: '#fff',
                    }}
                  >
                    <option value="all">همه (موفق و ناموفق)</option>
                    <option value="success">فقط موفق (SUCCESS)</option>
                    <option value="failed">فقط ناموفق (FAILED)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 4 }}>
                    کد وضعیت HTTP / نوع خطا
                  </label>
                  <select
                    value={statusCodeFilter}
                    onChange={(e) => {
                      setPage(1);
                      setStatusCodeFilter(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      background: '#fff',
                    }}
                  >
                    <option value="all">همه کدهای HTTP</option>
                    <option value="200">200 (OK)</option>
                    <option value="400">400 (Bad Request / خطای اعتبارسنجی)</option>
                    <option value="401">401 (Unauthorized / رمز یا توکن نامعتبر)</option>
                    <option value="403">403 (Forbidden / عدم دسترسی)</option>
                    <option value="404">404 (Not Found / مسیر یافت نشد)</option>
                    <option value="409">409 (Conflict / ایمیل تکراری)</option>
                    <option value="5xx">500 / 502 / 503 (خطای سرور یا دیتابیس)</option>
                    <option value="network">خطای شبکه / CORS / Timeout</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 4 }}>
                    وضعیت رسیدن به بک‌اند
                  </label>
                  <select
                    value={backendReachedFilter}
                    onChange={(e) => {
                      setPage(1);
                      setBackendReachedFilter(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      background: '#fff',
                    }}
                  >
                    <option value="all">همه درخواست‌ها</option>
                    <option value="true">رسیده به بک‌اند NestJS</option>
                    <option value="false">نرسیده به بک‌اند (متوقف در فرانت‌اند/شبکه)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 4 }}>
                    سطح لاگ (Level)
                  </label>
                  <select
                    value={levelFilter}
                    onChange={(e) => {
                      setPage(1);
                      setLevelFilter(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      background: '#fff',
                    }}
                  >
                    <option value="all">همه سطوح (INFO, WARN, ERROR)</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 4 }}>
                    از تاریخ
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setPage(1);
                      setFromDate(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 4 }}>
                    تا تاریخ
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setPage(1);
                      setToDate(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={resetFilters}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#334155',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  پاک‌سازی فیلترها
                </button>
              </div>
            </div>

            {/* Logs Table */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 700, color: '#334155' }}>زمان</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, color: '#334155' }}>Request ID</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, color: '#334155' }}>سطح / عملیات</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, color: '#334155' }}>وضعیت رسیدن به بک‌اند</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, color: '#334155' }}>کد HTTP</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, color: '#334155' }}>زمان پاسخ</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, color: '#334155' }}>مرحله / علت خطا</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, color: '#334155' }}>جزئیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>
                          در حال بارگذاری لاگ‌های احراز هویت و سیستم...
                        </td>
                      </tr>
                    ) : !data?.items || data.items.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>
                          هیچ لاگی با فیلترهای انتخاب‌شده یافت نشد.
                        </td>
                      </tr>
                    ) : (
                      data.items.map((item) => {
                        const isSuccess = item.operationResult === 'SUCCESS';
                        const levelBadgeColor =
                          item.level === 'ERROR'
                            ? { bg: '#fef2f2', fg: '#b91c1c', border: '#fecaca' }
                            : item.level === 'WARN'
                              ? { bg: '#fffbeb', fg: '#b45309', border: '#fde68a' }
                              : { bg: '#ecfdf5', fg: '#047857', border: '#a7f3d0' };

                        return (
                          <tr
                            key={`${item.requestId}-${item.source}-${item.id}`}
                            style={{ borderBottom: '1px solid #f1f5f9' }}
                          >
                            <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: '#334155' }}>
                              {formatDateTime(item.createdAt)}
                            </td>

                            <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, direction: 'ltr' }}>
                                <code
                                  style={{
                                    background: '#f1f5f9',
                                    padding: '3px 7px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    color: '#0f172a',
                                  }}
                                >
                                  {item.requestId}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => handleCopyRequestId(item.requestId)}
                                  title="کپی Request ID"
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: copiedId === item.requestId ? '#059669' : '#64748b',
                                    padding: 2,
                                  }}
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            </td>

                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 800,
                                    background: levelBadgeColor.bg,
                                    color: levelBadgeColor.fg,
                                    border: `1px solid ${levelBadgeColor.border}`,
                                  }}
                                >
                                  {item.level}
                                </span>
                                <strong style={{ color: '#0f172a' }}>
                                  {operationLabels[item.operation] || item.operation}
                                </strong>
                              </div>
                              {item.maskedIdentifier && (
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 3, direction: 'ltr', textAlign: 'right' }}>
                                  کاربر: {item.maskedIdentifier}
                                </div>
                              )}
                            </td>

                            <td style={{ padding: '12px 14px' }}>
                              {item.backendReached ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    padding: '4px 10px',
                                    borderRadius: 999,
                                    background: '#ecfdf5',
                                    color: '#047857',
                                    border: '1px solid #a7f3d0',
                                    fontSize: 12,
                                    fontWeight: 700,
                                  }}
                                >
                                  <CheckCircle2 size={14} />
                                  رسیده به بک‌اند NestJS
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    padding: '4px 10px',
                                    borderRadius: 999,
                                    background: '#fef2f2',
                                    color: '#b91c1c',
                                    border: '1px solid #fecaca',
                                    fontSize: 12,
                                    fontWeight: 700,
                                  }}
                                >
                                  <AlertTriangle size={14} />
                                  نرسیده به بک‌اند ({item.connectionStatus})
                                </span>
                              )}
                            </td>

                            <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                              <span
                                style={{
                                  padding: '3px 9px',
                                  borderRadius: 6,
                                  fontWeight: 800,
                                  fontSize: 12,
                                  background: isSuccess ? '#ecfdf5' : '#fef2f2',
                                  color: isSuccess ? '#047857' : '#b91c1c',
                                }}
                              >
                                {item.statusCode === 0 ? 'ERR_NET' : `HTTP ${item.statusCode}`}
                              </span>
                            </td>

                            <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontWeight: 700, color: '#334155' }}>
                              {item.durationMs.toLocaleString('fa-IR')} ms
                            </td>

                            <td style={{ padding: '12px 14px', maxWidth: 320 }}>
                              <div style={{ fontWeight: 700, color: isSuccess ? '#047857' : '#0f172a', fontSize: 12 }}>
                                {stageLabels[item.failureStage] || item.failureStage}
                              </div>
                              {item.errorMessage && (
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: '#b91c1c',
                                    marginTop: 2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={item.errorMessage}
                                >
                                  {item.errorMessage}
                                </div>
                              )}
                            </td>

                            <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedLog(item)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  padding: '6px 12px',
                                  borderRadius: 8,
                                  background: '#f0f9ff',
                                  color: '#0369a1',
                                  border: '1px solid #bae6fd',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                <Eye size={14} />
                                ردیابی کامل
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.pages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderTop: '1px solid #e2e8f0',
                    background: '#f8fafc',
                  }}
                >
                  <span style={{ fontSize: 12, color: '#475569' }}>
                    صفحه {data.page.toLocaleString('fa-IR')} از {data.pages.toLocaleString('fa-IR')} (مجموع:{' '}
                    {data.total.toLocaleString('fa-IR')} مورد)
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        cursor: page <= 1 ? 'not-allowed' : 'pointer',
                        opacity: page <= 1 ? 0.5 : 1,
                      }}
                    >
                      <ChevronRight size={15} /> قبلی
                    </button>
                    <button
                      type="button"
                      disabled={page >= data.pages}
                      onClick={() => setPage((p) => p + 1)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        cursor: page >= data.pages ? 'not-allowed' : 'pointer',
                        opacity: page >= data.pages ? 0.5 : 1,
                      }}
                    >
                      بعدی <ChevronLeft size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Detail Trace Modal */}
      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            direction: 'rtl',
          }}
          onClick={() => setSelectedLog(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              maxWidth: 780,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 14, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  جزئیات کامل ردیابی درخواست (End-to-End Request Trace)
                </h3>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, direction: 'ltr', textAlign: 'right' }}>
                  X-Request-ID: <strong>{selectedLog.requestId}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                style={{
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  borderRadius: 8,
                  padding: 6,
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Connection Diagnosis Box */}
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                marginBottom: 16,
                background: selectedLog.backendReached ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${selectedLog.backendReached ? '#86efac' : '#fecaca'}`,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 14, color: selectedLog.backendReached ? '#166534' : '#991b1b' }}>
                تشخیص وضعیت اتصال فرانت‌اند و بک‌اند:
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: '#1e293b', lineHeight: 1.7 }}>
                {selectedLog.connectionDiagnosis}
              </p>
            </div>

            {/* Key Fields Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>نوع عملیات و متد</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginTop: 2 }}>
                  {operationLabels[selectedLog.operation] || selectedLog.operation} ({selectedLog.method})
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>آدرس API مقصد (Target URL)</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#0f172a', marginTop: 2, direction: 'ltr', textAlign: 'right', wordBreak: 'break-all' }}>
                  {selectedLog.targetUrl}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>کد وضعیت و نوع پاسخ</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginTop: 2 }}>
                  {selectedLog.statusCode === 0 ? 'خطای شبکه (0)' : `HTTP ${selectedLog.statusCode}`} — نوع پاسخ: {selectedLog.responseType.toUpperCase()}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>نتیجه اعتبارسنجی DTO در بک‌اند</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginTop: 2 }}>
                  {selectedLog.dtoValidationPassed === true
                    ? 'معتبر (Passed)'
                    : selectedLog.dtoValidationPassed === false
                      ? 'رد شده در اعتبارسنجی DTO (Failed)'
                      : 'بررسی نشده (قبل از رسیدن به کنترلر)'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>مرحله شکست (Failure Stage)</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginTop: 2 }}>
                  {stageLabels[selectedLog.failureStage] || selectedLog.failureStage}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>مدت زمان پردازش</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginTop: 2 }}>
                  کل: {selectedLog.durationMs} ms
                  {selectedLog.backendTrace ? ` | بک‌اند: ${selectedLog.backendTrace.durationMs} ms` : ''}
                </div>
              </div>
            </div>

            {selectedLog.errorMessage && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: '#991b1b', marginBottom: 4 }}>
                  پیام دقیق خطا:
                </div>
                <div style={{ fontSize: 13, color: '#7f1d1d' }}>{selectedLog.errorMessage}</div>
              </div>
            )}

            {/* Side-by-Side Frontend vs Backend Trace */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#0284c7', marginBottom: 8 }}>
                  ۱. لاگ ثبت‌شده در لایه فرانت‌اند (Next.js)
                </div>
                {selectedLog.frontendTrace || selectedLog.source !== 'backend' ? (
                  <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.8 }}>
                    <div>زمان ارسال: {formatDateTime((selectedLog.frontendTrace ?? selectedLog).startedAt)}</div>
                    <div>آدرس مقصد: <code dir="ltr">{(selectedLog.frontendTrace ?? selectedLog).targetUrl}</code></div>
                    <div>وضعیت اتصال: <strong>{(selectedLog.frontendTrace ?? selectedLog).connectionStatus}</strong></div>
                    <div>مدت زمان کل: <strong>{(selectedLog.frontendTrace ?? selectedLog).durationMs} ms</strong></div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    درخواست مستقیماً به بک‌اند ارسال شده است.
                  </div>
                )}
              </div>

              <div style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#059669', marginBottom: 8 }}>
                  ۲. لاگ ثبت‌شده در لایه بک‌اند (NestJS)
                </div>
                {selectedLog.backendTrace || selectedLog.source === 'backend' ? (
                  <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.8 }}>
                    <div>زمان دریافت: {formatDateTime((selectedLog.backendTrace ?? selectedLog).startedAt)}</div>
                    <div>مسیر کنترلر: <code dir="ltr">{(selectedLog.backendTrace ?? selectedLog).routePath}</code></div>
                    <div>اعتبارسنجی DTO: <strong>{(selectedLog.backendTrace ?? selectedLog).dtoValidationPassed ? 'موفق' : 'ناموفق'}</strong></div>
                    <div>مدت زمان پردازش بک‌اند: <strong>{(selectedLog.backendTrace ?? selectedLog).durationMs} ms</strong></div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#b91c1c', fontWeight: 700 }}>
                    این درخواست به بک‌اند NestJS نرسیده است (قبل از رسیدن به بک‌اند در لایه شبکه/پروکسی/CORS متوقف شده است).
                  </div>
                )}
              </div>
            </div>

            {/* Sanitized Metadata JSON */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                متادیتای ساختاریافته و امن (رمز عبور، توکن، کوکی و اطلاعات شخصی حذف شده‌اند):
              </div>
              <pre
                dir="ltr"
                style={{
                  background: '#0f172a',
                  color: '#e2e8f0',
                  padding: 14,
                  borderRadius: 10,
                  fontSize: 12,
                  overflowX: 'auto',
                  margin: 0,
                }}
              >
                {JSON.stringify(selectedLog.metadata ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
