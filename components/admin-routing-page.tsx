'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Filter,
  LogOut,
  Menu,
  Plus,
  Route,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { adminNavItems, formatDate } from '@/lib/admin-nav';
import { useAuth } from '@/components/auth-provider';

type RoutingRule = {
  id: string;
  name: string;
  priority: number;
  specialty: string;
  imagingType: string;
  urgency: string;
  maxWorkload: number;
  preferredDoctorId: string | null;
  isActive: boolean;
  createdAt: string;
};

type RoutingLog = {
  id: string;
  algorithm: string;
  assignedDoctorId: string | null;
  success: boolean;
  reason: string;
  processingTimeMs: number;
  createdAt: string;
};

type LogResponse = {
  items: RoutingLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type RoutingStats = {
  totalLogs: number;
  successRate: number;
  successCount: number;
  failedCount: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  avgProcessingTimeMs: number;
  rules: { active: number; total: number };
};

type LogFilters = {
  success: string;
  search: string;
};

const initialLogFilters: LogFilters = { success: 'all', search: '' };

const urgencyLabels: Record<string, string> = {
  normal: 'عادی',
  urgent: 'فوری',
  critical: 'بحرانی',
};

const urgencyClasses: Record<string, string> = {
  normal: 'is-active',
  urgent: 'is-suspended',
  critical: 'is-inactive',
};

export function AdminRoutingPage() {
  const { user, signOut } = useAuth();
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [rulesError, setRulesError] = useState('');

  const [stats, setStats] = useState<RoutingStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [logFilters, setLogFilters] = useState<LogFilters>(initialLogFilters);
  const [logData, setLogData] = useState<LogResponse | null>(null);
  const [logPage, setLogPage] = useState(1);
  const [logLoading, setLogLoading] = useState(true);
  const [logError, setLogError] = useState('');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<RoutingRule | null>(null);

  const logQuery = useMemo(() => {
    const params = new URLSearchParams({ page: String(logPage), limit: '10' });
    if (logFilters.success && logFilters.success !== 'all') params.set('success', logFilters.success);
    if (logFilters.search) params.set('search', logFilters.search);
    return params.toString();
  }, [logFilters, logPage]);

  const loadRules = useCallback(async () => {
    setRulesLoading(true);
    setRulesError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/admin/routing/rules', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت قوانین مسیریابی ناموفق بود.');
      const result = await response.json();
      setRules(Array.isArray(result) ? result : result.items ?? []);
    } catch (err) {
      setRulesError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setRulesLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/admin/routing/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت آمار ناموفق بود.');
      const result = await response.json();
      setStats(result);
    } catch {
      // non-fatal
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLogLoading(true);
    setLogError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/routing/logs?${logQuery}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت لاگ‌های مسیریابی ناموفق بود.');
      const result = await response.json();
      setLogData(result);
    } catch (err) {
      setLogError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setLogLoading(false);
    }
  }, [logQuery]);

  useEffect(() => {
    void loadRules();
    void loadStats();
  }, [loadRules, loadStats]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  function updateLogFilter(key: keyof LogFilters, value: string) {
    setLogPage(1);
    setLogFilters((current) => ({ ...current, [key]: value }));
  }

  async function handleDeleteRule(id: string) {
    if (!confirm('آیا از حذف این قانون مطمئن هستید؟')) return;
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      await fetch(`/api/admin/routing/rules/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      void loadRules();
      void loadStats();
    } catch {
      setRulesError('حذف قانون ناموفق بود.');
    }
  }

  return (
    <div className="admin-page-root">
      <div className="admin-page-shell">
        <aside className={`admin-page-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-page-brand">
            <div className="admin-page-brand__mark"><ShieldCheck size={28} strokeWidth={1.7} /></div>
            <div>
              <strong>رادینت</strong>
              <span>پنل مدیریت</span>
            </div>
            <button className="admin-page-sidebar__close" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'grid' : 'none' }}>
              <X size={22} />
            </button>
          </div>
          <nav className="admin-page-nav">
            {adminNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`admin-page-nav__item ${item.href === '/admin/routing' ? 'is-active' : ''}`}
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
          <div className="admin-page-overlay" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,29,65,.42)' }} />
        )}

        <div className="admin-page-content">
          <header className="admin-page-header">
            <div className="admin-page-header__title">
              <Route size={26} strokeWidth={1.7} />
              <span>مسیریابی گزارش‌ها</span>
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
            <div className="admin-page-title">
              <div>
                <h2>مسیریابی گزارش‌ها</h2>
                <p>مدیریت قوانین مسیریابی و مشاهده لاگ‌های پردازش</p>
              </div>
              <button className="admin-page-add-btn" onClick={() => setShowAddModal(true)}>
                <Plus size={18} /> افزودن قانون
              </button>
            </div>

            {/* Stats cards */}
            <section className="admin-page-filter-card">
              <div className="admin-page-table-meta">
                <strong>آمار مسیریابی</strong>
                <span>نمای کلی</span>
              </div>
              <div className="admin-detail-stats">
                <div className="admin-detail-stat">
                  <Route size={20} />
                  <strong>{statsLoading ? '…' : (stats?.totalLogs ?? 0).toLocaleString('fa-IR')}</strong>
                  <span>کل لاگ‌ها</span>
                </div>
                <div className="admin-detail-stat">
                  <ShieldCheck size={20} />
                  <strong>{statsLoading ? '…' : `${(stats?.successRate ?? 0).toLocaleString('fa-IR')}٪`}</strong>
                  <span>نرخ موفقیت</span>
                </div>
                <div className="admin-detail-stat">
                  <Filter size={20} />
                  <strong>{statsLoading ? '…' : (stats?.todayCount ?? 0).toLocaleString('fa-IR')}</strong>
                  <span>لاگ‌های امروز</span>
                </div>
                <div className="admin-detail-stat">
                  <ShieldCheck size={20} />
                  <strong>{statsLoading ? '…' : (stats?.rules.active ?? 0).toLocaleString('fa-IR')}</strong>
                  <span>قوانین فعال</span>
                </div>
              </div>
            </section>

            {/* Routing rules table */}
            {rulesError && <div className="admin-page-error">{rulesError}</div>}

            <section className="admin-page-table-card">
              <div className="admin-page-table-meta">
                <strong>قوانین مسیریابی</strong>
                <span>{rules.length.toLocaleString('fa-IR')} قانون</span>
              </div>
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>نام</th>
                      <th>اولویت</th>
                      <th>تخصص</th>
                      <th>نوع تصویربرداری</th>
                      <th>فوریت</th>
                      <th>حداکثر بار</th>
                      <th>پزشک ترجیحی</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rulesLoading && (
                      <tr><td colSpan={9} className="admin-page-empty">در حال دریافت قوانین…</td></tr>
                    )}
                    {!rulesLoading && rules.map((rule) => (
                      <tr key={rule.id}>
                        <td data-label="نام" className="admin-page-user-cell">
                          <strong>{rule.name}</strong>
                        </td>
                        <td data-label="اولویت">{rule.priority.toLocaleString('fa-IR')}</td>
                        <td data-label="تخصص">{rule.specialty || '—'}</td>
                        <td data-label="نوع تصویربرداری">{rule.imagingType || '—'}</td>
                        <td data-label="فوریت">
                          <span className={`admin-status-badge ${urgencyClasses[rule.urgency] ?? 'is-active'}`}>
                            {urgencyLabels[rule.urgency] ?? rule.urgency}
                          </span>
                        </td>
                        <td data-label="حداکثر بار">{rule.maxWorkload.toLocaleString('fa-IR')}</td>
                        <td data-label="پزشک ترجیحی">{rule.preferredDoctorId ?? '—'}</td>
                        <td data-label="وضعیت">
                          <span className={`admin-status-badge ${rule.isActive ? 'is-active' : 'is-inactive'}`}>
                            {rule.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td data-label="عملیات">
                          <div className="admin-page-actions">
                            <button className="admin-page-action admin-page-action--edit" onClick={() => setShowEditModal(rule)} title="ویرایش">
                              <Edit3 size={16} />
                            </button>
                            <button
                              className="admin-page-action admin-page-action--delete"
                              onClick={() => void handleDeleteRule(rule.id)}
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!rulesLoading && rules.length === 0 && (
                      <tr><td colSpan={9} className="admin-page-empty">قانونی پیدا نشد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Routing logs table */}
            <section className="admin-page-table-card">
              <div className="admin-page-table-meta">
                <strong>لاگ‌های مسیریابی</strong>
                <span>{logData?.total?.toLocaleString('fa-IR') ?? '۰'} لاگ</span>
              </div>

              <div className="admin-page-filter-row">
                <label>
                  <span>وضعیت</span>
                  <select value={logFilters.success} onChange={(e) => updateLogFilter('success', e.target.value)}>
                    <option value="all">همه</option>
                    <option value="true">موفق</option>
                    <option value="false">ناموفق</option>
                  </select>
                </label>
              </div>
              <div className="admin-page-search">
                <Search size={18} />
                <input
                  value={logFilters.search}
                  onChange={(e) => updateLogFilter('search', e.target.value)}
                  placeholder="جستجو در لاگ‌ها..."
                />
                <Filter size={18} />
              </div>

              {logError && <div className="admin-page-error">{logError}</div>}

              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>الگوریتم</th>
                      <th>پزشک</th>
                      <th>موفق</th>
                      <th>دلیل</th>
                      <th>زمان پردازش</th>
                      <th>تاریخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logLoading && (
                      <tr><td colSpan={6} className="admin-page-empty">در حال دریافت لاگ‌ها…</td></tr>
                    )}
                    {!logLoading && logData?.items.map((log) => (
                      <tr key={log.id}>
                        <td data-label="الگوریتم">{log.algorithm || '—'}</td>
                        <td data-label="پزشک">{log.assignedDoctorId ?? '—'}</td>
                        <td data-label="موفق">
                          <span className={`admin-status-badge ${log.success ? 'is-active' : 'is-inactive'}`}>
                            {log.success ? 'موفق' : 'ناموفق'}
                          </span>
                        </td>
                        <td data-label="دلیل">{log.reason || '—'}</td>
                        <td data-label="زمان پردازش">{log.processingTimeMs.toLocaleString('fa-IR')} م‌ث</td>
                        <td data-label="تاریخ">{formatDate(log.createdAt)}</td>
                      </tr>
                    ))}
                    {!logLoading && logData?.items.length === 0 && (
                      <tr><td colSpan={6} className="admin-page-empty">لاگی پیدا نشد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!logLoading && logData && (
                <div className="admin-page-pagination">
                  <button disabled={logData.page <= 1} onClick={() => setLogPage(logData.page - 1)}>
                    <ChevronRight size={16} /> قبلی
                  </button>
                  <div>
                    {Array.from({ length: Math.min(logData.pages, 5) }, (_, i) => i + 1).map((n) => (
                      <button key={n} className={logData.page === n ? 'is-current' : ''} onClick={() => setLogPage(n)}>
                        {n.toLocaleString('fa-IR')}
                      </button>
                    ))}
                  </div>
                  <button disabled={logData.page >= logData.pages} onClick={() => setLogPage(logData.page + 1)}>
                    بعدی <ChevronLeft size={16} />
                  </button>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {showAddModal && (
        <AddRuleModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); void loadRules(); void loadStats(); }}
        />
      )}
      {showEditModal && (
        <EditRuleModal
          rule={showEditModal}
          onClose={() => setShowEditModal(null)}
          onSaved={() => { setShowEditModal(null); void loadRules(); void loadStats(); }}
        />
      )}
    </div>
  );
}

function AddRuleModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('1');
  const [specialty, setSpecialty] = useState('');
  const [imagingType, setImagingType] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [maxWorkload, setMaxWorkload] = useState('10');
  const [preferredDoctorId, setPreferredDoctorId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch('/api/admin/routing/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          priority: Number(priority),
          specialty,
          imagingType,
          urgency,
          maxWorkload: Number(maxWorkload),
          preferredDoctorId: preferredDoctorId || null,
          isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'افزودن قانون ناموفق بود.');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>افزودن قانون مسیریابی</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <label>
            <span>نام قانون</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="مثال: مسیریابی فوری" />
          </label>
          <div className="admin-modal__row">
            <label>
              <span>اولویت</span>
              <input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} required min="1" />
            </label>
            <label>
              <span>حداکثر بار</span>
              <input type="number" value={maxWorkload} onChange={(e) => setMaxWorkload(e.target.value)} required min="1" />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>تخصص</span>
              <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="مثال: رادیولوژی" />
            </label>
            <label>
              <span>نوع تصویربرداری</span>
              <input value={imagingType} onChange={(e) => setImagingType(e.target.value)} placeholder="مثال: MRI" />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>فوریت</span>
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="normal">عادی</option>
                <option value="urgent">فوری</option>
                <option value="critical">بحرانی</option>
              </select>
            </label>
            <label>
              <span>پزشک ترجیحی</span>
              <input value={preferredDoctorId} onChange={(e) => setPreferredDoctorId(e.target.value)} placeholder="شناسه پزشک (اختیاری)" />
            </label>
          </div>
          <label className="admin-modal__check">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>قانون فعال است</span>
          </label>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ذخیره…' : 'افزودن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditRuleModal({ rule, onClose, onSaved }: { rule: RoutingRule; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(rule.name);
  const [priority, setPriority] = useState(String(rule.priority));
  const [specialty, setSpecialty] = useState(rule.specialty);
  const [imagingType, setImagingType] = useState(rule.imagingType);
  const [urgency, setUrgency] = useState(rule.urgency);
  const [maxWorkload, setMaxWorkload] = useState(String(rule.maxWorkload));
  const [preferredDoctorId, setPreferredDoctorId] = useState(rule.preferredDoctorId ?? '');
  const [isActive, setIsActive] = useState(rule.isActive);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/routing/rules/${rule.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          priority: Number(priority),
          specialty,
          imagingType,
          urgency,
          maxWorkload: Number(maxWorkload),
          preferredDoctorId: preferredDoctorId || null,
          isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'ویرایش قانون ناموفق بود.');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>ویرایش قانون مسیریابی</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <label>
            <span>نام قانون</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <div className="admin-modal__row">
            <label>
              <span>اولویت</span>
              <input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} required min="1" />
            </label>
            <label>
              <span>حداکثر بار</span>
              <input type="number" value={maxWorkload} onChange={(e) => setMaxWorkload(e.target.value)} required min="1" />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>تخصص</span>
              <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
            </label>
            <label>
              <span>نوع تصویربرداری</span>
              <input value={imagingType} onChange={(e) => setImagingType(e.target.value)} />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>فوریت</span>
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="normal">عادی</option>
                <option value="urgent">فوری</option>
                <option value="critical">بحرانی</option>
              </select>
            </label>
            <label>
              <span>پزشک ترجیحی</span>
              <input value={preferredDoctorId} onChange={(e) => setPreferredDoctorId(e.target.value)} placeholder="شناسه پزشک (اختیاری)" />
            </label>
          </div>
          <label className="admin-modal__check">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>قانون فعال است</span>
          </label>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
