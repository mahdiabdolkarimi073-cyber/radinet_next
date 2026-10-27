'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Filter,
  LogOut,
  Menu,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { adminNavItems, formatDate } from '@/lib/admin-nav';
import { useAuth } from '@/components/auth-provider';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  targetAudience: string;
  targetUserId: string | null;
  channels: string[];
  status: string;
  sentCount: number;
  sentAt: string | null;
  createdAt: string;
};

type NotificationResponse = {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type SmsTemplate = {
  id: string;
  key: string;
  title: string;
  body: string;
  isActive: boolean;
  createdAt: string;
};

type SmsLog = {
  id: string;
  phoneNumber: string;
  message: string;
  templateKey: string | null;
  status: string;
  provider: string;
  sentAt: string | null;
  createdAt: string;
};

type SmsLogResponse = {
  items: SmsLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type NotificationFilters = {
  type: string;
  status: string;
  search: string;
};

type SmsLogFilters = {
  status: string;
  search: string;
};

const initialNotifFilters: NotificationFilters = { type: 'all', status: 'all', search: '' };
const initialSmsLogFilters: SmsLogFilters = { status: 'all', search: '' };

const notifTypeLabels: Record<string, string> = {
  general: 'عمومی',
  promotional: 'تبلیغاتی',
  system: 'سیستمی',
};

const notifStatusLabels: Record<string, string> = {
  sent: 'ارسال‌شده',
  pending: 'در انتظار',
  failed: 'ناموفق',
};

const notifStatusClasses: Record<string, string> = {
  sent: 'is-active',
  pending: 'is-suspended',
  failed: 'is-inactive',
};

const smsStatusLabels: Record<string, string> = {
  sent: 'ارسال‌شده',
  failed: 'ناموفق',
  pending: 'در انتظار',
};

const smsStatusClasses: Record<string, string> = {
  sent: 'is-active',
  failed: 'is-inactive',
  pending: 'is-suspended',
};

const audienceLabels: Record<string, string> = {
  all: 'همه',
  doctors: 'پزشکان',
  radiologists: 'رادیولوژیست‌ها',
};

export function AdminNotificationsPage() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<'notifications' | 'templates' | 'logs'>('notifications');

  // Notifications state
  const [notifFilters, setNotifFilters] = useState<NotificationFilters>(initialNotifFilters);
  const [notifData, setNotifData] = useState<NotificationResponse | null>(null);
  const [notifPage, setNotifPage] = useState(1);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState('');

  // SMS Templates state
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState('');

  // SMS Logs state
  const [smsLogFilters, setSmsLogFilters] = useState<SmsLogFilters>(initialSmsLogFilters);
  const [smsLogData, setSmsLogData] = useState<SmsLogResponse | null>(null);
  const [smsLogPage, setSmsLogPage] = useState(1);
  const [smsLogLoading, setSmsLogLoading] = useState(true);
  const [smsLogError, setSmsLogError] = useState('');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<SmsTemplate | null>(null);

  const notifQuery = useMemo(() => {
    const params = new URLSearchParams({ page: String(notifPage), limit: '10' });
    Object.entries(notifFilters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
    });
    return params.toString();
  }, [notifFilters, notifPage]);

  const smsLogQuery = useMemo(() => {
    const params = new URLSearchParams({ page: String(smsLogPage), limit: '10' });
    Object.entries(smsLogFilters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
    });
    return params.toString();
  }, [smsLogFilters, smsLogPage]);

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    setNotifError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/notifications?${notifQuery}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت اعلان‌ها ناموفق بود.');
      const result = await response.json();
      setNotifData(result);
    } catch (err) {
      setNotifError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setNotifLoading(false);
    }
  }, [notifQuery]);

  const loadTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    setTemplatesError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/admin/notifications/sms-templates', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت قالب‌های پیامک ناموفق بود.');
      const result = await response.json();
      setTemplates(Array.isArray(result) ? result : result.items ?? []);
    } catch (err) {
      setTemplatesError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  const loadSmsLogs = useCallback(async () => {
    setSmsLogLoading(true);
    setSmsLogError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/notifications/sms-logs?${smsLogQuery}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت گزارش‌های پیامک ناموفق بود.');
      const result = await response.json();
      setSmsLogData(result);
    } catch (err) {
      setSmsLogError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setSmsLogLoading(false);
    }
  }, [smsLogQuery]);

  useEffect(() => {
    if (tab === 'notifications') void loadNotifications();
  }, [loadNotifications, tab]);

  useEffect(() => {
    if (tab === 'templates') void loadTemplates();
  }, [loadTemplates, tab]);

  useEffect(() => {
    if (tab === 'logs') void loadSmsLogs();
  }, [loadSmsLogs, tab]);

  function updateNotifFilter(key: keyof NotificationFilters, value: string) {
    setNotifPage(1);
    setNotifFilters((current) => ({ ...current, [key]: value }));
  }

  function updateSmsLogFilter(key: keyof SmsLogFilters, value: string) {
    setSmsLogPage(1);
    setSmsLogFilters((current) => ({ ...current, [key]: value }));
  }

  async function deleteNotification(id: string) {
    if (!confirm('آیا از حذف این اعلان مطمئن هستید؟')) return;
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('حذف اعلان ناموفق بود.');
      void loadNotifications();
    } catch (err) {
      setNotifError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('آیا از حذف این قالب پیامک مطمئن هستید؟')) return;
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/notifications/sms-templates/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('حذف قالب ناموفق بود.');
      void loadTemplates();
    } catch (err) {
      setTemplatesError(err instanceof Error ? err.message : 'خطایی رخ داد.');
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
                className={`admin-page-nav__item ${item.href === '/admin/notifications' ? 'is-active' : ''}`}
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
              <Bell size={26} strokeWidth={1.7} />
              <span>اعلان‌ها و پیامک</span>
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
                <h2>اعلان‌ها و پیامک</h2>
                <p>مدیریت اعلان‌های سیستمی، قالب‌های پیامک و گزارش ارسال</p>
              </div>
            </div>

            <div className="admin-page-tabs">
              <button className={tab === 'notifications' ? 'is-active' : ''} onClick={() => setTab('notifications')}>
                <Bell size={18} /> اعلان‌ها
              </button>
              <button className={tab === 'templates' ? 'is-active' : ''} onClick={() => setTab('templates')}>
                <FileText size={18} /> قالب‌های پیامک
              </button>
              <button className={tab === 'logs' ? 'is-active' : ''} onClick={() => setTab('logs')}>
                <Filter size={18} /> گزارش‌های پیامک
              </button>
            </div>

            {tab === 'notifications' && (
              <>
                <div className="admin-page-title">
                  <div>
                    <h3>فهرست اعلان‌ها</h3>
                  </div>
                  <button className="admin-page-add-btn" onClick={() => setShowSendModal(true)}>
                    <Send size={18} /> ارسال اعلان
                  </button>
                </div>

                <section className="admin-page-filter-card">
                  <div className="admin-page-filter-row">
                    <label>
                      <span>نوع</span>
                      <select value={notifFilters.type} onChange={(e) => updateNotifFilter('type', e.target.value)}>
                        <option value="all">همه انواع</option>
                        <option value="general">عمومی</option>
                        <option value="promotional">تبلیغاتی</option>
                        <option value="system">سیستمی</option>
                      </select>
                    </label>
                    <label>
                      <span>وضعیت</span>
                      <select value={notifFilters.status} onChange={(e) => updateNotifFilter('status', e.target.value)}>
                        <option value="all">همه وضعیت‌ها</option>
                        <option value="sent">ارسال‌شده</option>
                        <option value="pending">در انتظار</option>
                        <option value="failed">ناموفق</option>
                      </select>
                    </label>
                  </div>
                  <div className="admin-page-search">
                    <Search size={18} />
                    <input
                      value={notifFilters.search}
                      onChange={(e) => updateNotifFilter('search', e.target.value)}
                      placeholder="جستجو بر اساس عنوان یا پیام..."
                    />
                    <Filter size={18} />
                  </div>
                </section>

                {notifError && <div className="admin-page-error">{notifError}</div>}

                <section className="admin-page-table-card">
                  <div className="admin-page-table-meta">
                    <strong>اعلان‌های سیستم</strong>
                    <span>{notifData?.total?.toLocaleString('fa-IR') ?? '۰'} اعلان</span>
                  </div>
                  <div className="admin-page-table-wrap">
                    <table className="admin-page-table">
                      <thead>
                        <tr>
                          <th>عنوان</th>
                          <th>پیام</th>
                          <th>نوع</th>
                          <th>مخاطب</th>
                          <th>گیرندگان</th>
                          <th>وضعیت</th>
                          <th>تاریخ</th>
                          <th>عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notifLoading && (
                          <tr><td colSpan={8} className="admin-page-empty">در حال دریافت اعلان‌ها…</td></tr>
                        )}
                        {!notifLoading && notifData?.items.map((item) => (
                          <tr key={item.id}>
                            <td data-label="عنوان"><strong>{item.title}</strong></td>
                            <td data-label="پیام">{item.message.length > 50 ? `${item.message.slice(0, 50)}…` : item.message}</td>
                            <td data-label="نوع">{notifTypeLabels[item.type] ?? item.type}</td>
                            <td data-label="مخاطب">{audienceLabels[item.targetAudience] ?? item.targetAudience}</td>
                            <td data-label="گیرندگان">{item.sentCount.toLocaleString('fa-IR')}</td>
                            <td data-label="وضعیت">
                              <span className={`admin-status-badge ${notifStatusClasses[item.status] ?? 'is-active'}`}>
                                {notifStatusLabels[item.status] ?? item.status}
                              </span>
                            </td>
                            <td data-label="تاریخ">{formatDate(item.createdAt)}</td>
                            <td data-label="عملیات">
                              <div className="admin-page-actions">
                                <button
                                  className="admin-page-action admin-page-action--delete"
                                  onClick={() => void deleteNotification(item.id)}
                                  title="حذف"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!notifLoading && notifData?.items.length === 0 && (
                          <tr><td colSpan={8} className="admin-page-empty">اعلانی با این فیلترها پیدا نشد.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {!notifLoading && notifData && (
                    <div className="admin-page-pagination">
                      <button disabled={notifData.page <= 1} onClick={() => setNotifPage(notifData.page - 1)}>
                        <ChevronRight size={16} /> قبلی
                      </button>
                      <div>
                        {Array.from({ length: Math.min(notifData.pages, 5) }, (_, i) => i + 1).map((n) => (
                          <button key={n} className={notifData.page === n ? 'is-current' : ''} onClick={() => setNotifPage(n)}>
                            {n.toLocaleString('fa-IR')}
                          </button>
                        ))}
                      </div>
                      <button disabled={notifData.page >= notifData.pages} onClick={() => setNotifPage(notifData.page + 1)}>
                        بعدی <ChevronLeft size={16} />
                      </button>
                    </div>
                  )}
                </section>
              </>
            )}

            {tab === 'templates' && (
              <>
                <div className="admin-page-title">
                  <div>
                    <h3>قالب‌های پیامک</h3>
                  </div>
                  <button className="admin-page-add-btn" onClick={() => { setEditTemplate(null); setShowTemplateModal(true); }}>
                    <Plus size={18} /> افزودن قالب
                  </button>
                </div>

                {templatesError && <div className="admin-page-error">{templatesError}</div>}

                <section className="admin-page-table-card">
                  <div className="admin-page-table-meta">
                    <strong>قالب‌های پیامک</strong>
                    <span>{templates.length.toLocaleString('fa-IR')} قالب</span>
                  </div>
                  <div className="admin-page-table-wrap">
                    <table className="admin-page-table">
                      <thead>
                        <tr>
                          <th>کلید</th>
                          <th>عنوان</th>
                          <th>متن</th>
                          <th>وضعیت</th>
                          <th>عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {templatesLoading && (
                          <tr><td colSpan={5} className="admin-page-empty">در حال دریافت قالب‌ها…</td></tr>
                        )}
                        {!templatesLoading && templates.map((item) => (
                          <tr key={item.id}>
                            <td data-label="کلید"><strong>{item.key}</strong></td>
                            <td data-label="عنوان">{item.title}</td>
                            <td data-label="متن">{item.body.length > 50 ? `${item.body.slice(0, 50)}…` : item.body}</td>
                            <td data-label="وضعیت">
                              <span className={`admin-status-badge ${item.isActive ? 'is-active' : 'is-inactive'}`}>
                                {item.isActive ? 'فعال' : 'غیرفعال'}
                              </span>
                            </td>
                            <td data-label="عملیات">
                              <div className="admin-page-actions">
                                <button
                                  className="admin-page-action admin-page-action--edit"
                                  onClick={() => { setEditTemplate(item); setShowTemplateModal(true); }}
                                  title="ویرایش"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  className="admin-page-action admin-page-action--delete"
                                  onClick={() => void deleteTemplate(item.id)}
                                  title="حذف"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!templatesLoading && templates.length === 0 && (
                          <tr><td colSpan={5} className="admin-page-empty">قالبی پیدا نشد.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

            {tab === 'logs' && (
              <>
                <div className="admin-page-title">
                  <div>
                    <h3>گزارش‌های پیامک</h3>
                  </div>
                </div>

                <section className="admin-page-filter-card">
                  <div className="admin-page-filter-row">
                    <label>
                      <span>وضعیت</span>
                      <select value={smsLogFilters.status} onChange={(e) => updateSmsLogFilter('status', e.target.value)}>
                        <option value="all">همه وضعیت‌ها</option>
                        <option value="sent">ارسال‌شده</option>
                        <option value="failed">ناموفق</option>
                        <option value="pending">در انتظار</option>
                      </select>
                    </label>
                  </div>
                  <div className="admin-page-search">
                    <Search size={18} />
                    <input
                      value={smsLogFilters.search}
                      onChange={(e) => updateSmsLogFilter('search', e.target.value)}
                      placeholder="جستجو بر اساس شماره یا پیام..."
                    />
                    <Filter size={18} />
                  </div>
                </section>

                {smsLogError && <div className="admin-page-error">{smsLogError}</div>}

                <section className="admin-page-table-card">
                  <div className="admin-page-table-meta">
                    <strong>گزارش ارسال پیامک</strong>
                    <span>{smsLogData?.total?.toLocaleString('fa-IR') ?? '۰'} رکورد</span>
                  </div>
                  <div className="admin-page-table-wrap">
                    <table className="admin-page-table">
                      <thead>
                        <tr>
                          <th>شماره</th>
                          <th>پیام</th>
                          <th>قالب</th>
                          <th>وضعیت</th>
                          <th>تاریخ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {smsLogLoading && (
                          <tr><td colSpan={5} className="admin-page-empty">در حال دریافت گزارش‌ها…</td></tr>
                        )}
                        {!smsLogLoading && smsLogData?.items.map((item) => (
                          <tr key={item.id}>
                            <td data-label="شماره"><strong>{item.phoneNumber}</strong></td>
                            <td data-label="پیام">{item.message.length > 50 ? `${item.message.slice(0, 50)}…` : item.message}</td>
                            <td data-label="قالب">{item.templateKey ?? '—'}</td>
                            <td data-label="وضعیت">
                              <span className={`admin-status-badge ${smsStatusClasses[item.status] ?? 'is-active'}`}>
                                {smsStatusLabels[item.status] ?? item.status}
                              </span>
                            </td>
                            <td data-label="تاریخ">{formatDate(item.createdAt)}</td>
                          </tr>
                        ))}
                        {!smsLogLoading && smsLogData?.items.length === 0 && (
                          <tr><td colSpan={5} className="admin-page-empty">گزارشی پیدا نشد.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {!smsLogLoading && smsLogData && (
                    <div className="admin-page-pagination">
                      <button disabled={smsLogData.page <= 1} onClick={() => setSmsLogPage(smsLogData.page - 1)}>
                        <ChevronRight size={16} /> قبلی
                      </button>
                      <div>
                        {Array.from({ length: Math.min(smsLogData.pages, 5) }, (_, i) => i + 1).map((n) => (
                          <button key={n} className={smsLogData.page === n ? 'is-current' : ''} onClick={() => setSmsLogPage(n)}>
                            {n.toLocaleString('fa-IR')}
                          </button>
                        ))}
                      </div>
                      <button disabled={smsLogData.page >= smsLogData.pages} onClick={() => setSmsLogPage(smsLogData.page + 1)}>
                        بعدی <ChevronLeft size={16} />
                      </button>
                    </div>
                  )}
                </section>
              </>
            )}
          </main>
        </div>
      </div>

      {showSendModal && (
        <SendNotificationModal
          onClose={() => setShowSendModal(false)}
          onSaved={() => { setShowSendModal(false); void loadNotifications(); }}
        />
      )}
      {showTemplateModal && (
        <SmsTemplateModal
          template={editTemplate}
          onClose={() => { setShowTemplateModal(false); setEditTemplate(null); }}
          onSaved={() => { setShowTemplateModal(false); setEditTemplate(null); void loadTemplates(); }}
        />
      )}
    </div>
  );
}

function SendNotificationModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('general');
  const [targetAudience, setTargetAudience] = useState('all');
  const [targetUserId, setTargetUserId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const payload: Record<string, string> = { title, message, type, targetAudience };
      if (targetUserId.trim()) payload.targetUserId = targetUserId.trim();
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'ارسال اعلان ناموفق بود.');
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
          <h3>ارسال اعلان جدید</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <label>
            <span>عنوان</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="عنوان اعلان" />
          </label>
          <label>
            <span>پیام</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} placeholder="متن پیام اعلان" />
          </label>
          <div className="admin-modal__row">
            <label>
              <span>نوع</span>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="general">عمومی</option>
                <option value="promotional">تبلیغاتی</option>
                <option value="system">سیستمی</option>
              </select>
            </label>
            <label>
              <span>مخاطب</span>
              <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}>
                <option value="all">همه</option>
                <option value="doctors">پزشکان</option>
                <option value="radiologists">رادیولوژیست‌ها</option>
              </select>
            </label>
          </div>
          <label>
            <span>شناسه کاربر هدف (اختیاری)</span>
            <input value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} placeholder="در صورت خالی بودن، به گروه ارسال می‌شود" />
          </label>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ارسال…' : 'ارسال'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SmsTemplateModal({ template, onClose, onSaved }: { template: SmsTemplate | null; onClose: () => void; onSaved: () => void }) {
  const [key, setKey] = useState(template?.key ?? '');
  const [title, setTitle] = useState(template?.title ?? '');
  const [body, setBody] = useState(template?.body ?? '');
  const [isActive, setIsActive] = useState(template?.isActive ?? true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const isEdit = !!template;
      const url = isEdit
        ? `/api/admin/notifications/sms-templates/${template!.id}`
        : '/api/admin/notifications/sms-templates';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ key, title, body, isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? (isEdit ? 'ویرایش قالب ناموفق بود.' : 'افزودن قالب ناموفق بود.'));
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
          <h3>{template ? 'ویرایش قالب پیامک' : 'افزودن قالب پیامک'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <label>
            <span>کلید</span>
            <input value={key} onChange={(e) => setKey(e.target.value)} required placeholder="مثال: welcome_sms" />
          </label>
          <label>
            <span>عنوان</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="عنوان قالب" />
          </label>
          <label>
            <span>متن</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={5} placeholder="متن پیامک" />
          </label>
          <label className="admin-modal__check">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>قالب فعال است</span>
          </label>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ذخیره…' : 'ذخیره'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
