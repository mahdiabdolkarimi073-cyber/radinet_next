'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Search,
  Send,
  ShieldCheck,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { getStoredToken } from '@/lib/auth-client';
import { adminNavItems } from '@/lib/admin-nav';

type CommMessage = {
  id: string;
  senderRole: 'doctor' | 'patient' | 'admin' | 'support';
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
};

type CommunicationItem = {
  id: string;
  requestId: string;
  requestNumber: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  imagingType: string;
  imagingArea: string;
  subject: string;
  message: string;
  response: string | null;
  status: 'open' | 'answered' | 'closed' | string;
  adminNote: string | null;
  messages: CommMessage[];
  createdAt: string;
  updatedAt: string;
};

type CommunicationListResponse = {
  items: CommunicationItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  counts: {
    all: number;
    open: number;
    answered: number;
    closed: number;
  };
};

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

const statusLabels: Record<string, string> = {
  open: 'در انتظار پاسخ بیمار',
  answered: 'پاسخ داده شده',
  closed: 'بسته شده (تکمیل پیگیری)',
};

const senderRoleLabels: Record<string, string> = {
  doctor: 'پزشک رادیولوژیست',
  patient: 'بیمار',
  admin: 'مدیر سامانه',
  support: 'پشتیبانی',
};

export function AdminCommunicationsPage() {
  const { user, signOut } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'answered' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CommunicationListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<CommunicationItem | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [modalStatus, setModalStatus] = useState<'open' | 'answered' | 'closed'>('open');
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: '15',
      status: statusFilter,
    });
    if (search.trim()) {
      params.set('search', search.trim());
    }
    return params.toString();
  }, [page, statusFilter, search]);

  const loadCommunications = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/admin/communications?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || 'دریافت فهرست مکالمات پزشک و بیمار ناموفق بود.');
      }
      setData(json);
      if (selectedItem) {
        const refreshed = (json.items || []).find((i: CommunicationItem) => i.id === selectedItem.id);
        if (refreshed) {
          setSelectedItem(refreshed);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت مکالمات.');
    } finally {
      setIsLoading(false);
    }
  }, [query, selectedItem]);

  useEffect(() => {
    void loadCommunications();
  }, [query]);

  function openDetailModal(item: CommunicationItem) {
    setSelectedItem(item);
    setAdminNote(item.adminNote || '');
    setAdminMessage('');
    setModalStatus((item.status as any) || 'open');
    setActionMsg('');
  }

  async function handleSaveManagementAction() {
    if (!selectedItem) return;
    setSaving(true);
    setActionMsg('');
    setError('');
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/admin/communications/${encodeURIComponent(selectedItem.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: modalStatus,
          adminNote,
          adminMessage: adminMessage.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || 'ثبت تغییرات مدیریتی ناموفق بود.');
      }
      setAdminMessage('');
      setActionMsg('وضعیت پیگیری و یادداشت مدیریتی با حفظ کامل تاریخچه مکالمه ذخیره شد.');
      await loadCommunications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره تغییرات.');
    } finally {
      setSaving(false);
    }
  }

  function renderStatusBadge(status: string) {
    if (status === 'answered') {
      return (
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
          پاسخ داده شده
        </span>
      );
    }
    if (status === 'closed') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            borderRadius: 999,
            background: '#f1f5f9',
            color: '#475569',
            border: '1px solid #cbd5e1',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          بسته شده
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 10px',
          borderRadius: 999,
          background: '#fffbeb',
          color: '#b45309',
          border: '1px solid #fde68a',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <Clock size={14} />
        در انتظار پاسخ بیمار
      </span>
    );
  }

  const counts = data?.counts ?? { all: 0, open: 0, answered: 0, closed: 0 };

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
                className={`admin-page-nav__item ${item.href === '/admin/communications' ? 'is-active' : ''}`}
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
              <MessageCircleQuestion size={26} strokeWidth={1.7} />
              <span>مدیریت ارتباطات پزشک و بیمار</span>
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
                <h2>مدیریت و نظارت بر مکالمات پزشک و بیمار</h2>
                <p>
                  مشاهده و پیگیری تمامی درخواست‌های اطلاعات تکمیلی و پیام‌های تبادل‌شده میان پزشک رادیولوژیست و بیمار (با حفظ دائمی تاریخچه مکالمات)
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
                gap: 12,
                marginBottom: 16,
              }}
            >
              {[
                { key: 'all', label: 'همه مکالمات', count: counts.all, color: '#0284c7' },
                { key: 'open', label: 'در انتظار پاسخ بیمار', count: counts.open, color: '#d97706' },
                { key: 'answered', label: 'پاسخ داده شده', count: counts.answered, color: '#059669' },
                { key: 'closed', label: 'بسته شده', count: counts.closed, color: '#475569' },
              ].map((stat) => {
                const active = statusFilter === stat.key;
                return (
                  <button
                    key={stat.key}
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setStatusFilter(stat.key as any);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: 14,
                      background: active ? '#eff6ff' : '#ffffff',
                      border: active ? `2px solid ${stat.color}` : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      textAlign: 'right',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{stat.label}</span>
                    <strong style={{ fontSize: 18, fontWeight: 800, color: stat.color }}>
                      {stat.count.toLocaleString('fa-IR')}
                    </strong>
                  </button>
                );
              })}
            </div>

            <section className="admin-page-filter-card">
              <div className="admin-page-filter-row">
                <label>
                  <span>وضعیت پیگیری</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setPage(1);
                      setStatusFilter(e.target.value as any);
                    }}
                  >
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="open">در انتظار پاسخ بیمار</option>
                    <option value="answered">پاسخ داده شده</option>
                    <option value="closed">بسته شده</option>
                  </select>
                </label>
              </div>
              <div className="admin-page-search">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  placeholder="جستجو بر اساس نام بیمار، نام پزشک، شماره درخواست تله‌ریپورت یا متن پیام..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="admin-page-error">{error}</div>}

            <section className="admin-page-table-card">
              <div className="admin-page-table-meta">
                <strong>فهرست ارتباطات پزشک و بیمار</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} رشته مکالمه</span>
              </div>
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>درخواست تله‌ریپورت</th>
                      <th>نام بیمار</th>
                      <th>نام پزشک</th>
                      <th>موضوع و خلاصه پیام</th>
                      <th>تاریخ و زمان</th>
                      <th>وضعیت پیگیری</th>
                      <th>مشاهده و مدیریت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={7} className="admin-page-empty">
                          در حال دریافت مکالمات پزشک و بیمار…
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      data?.items.map((item) => (
                        <tr key={item.id}>
                          <td data-label="درخواست تله‌ریپورت">
                            <strong>{item.requestNumber}</strong>
                            <small style={{ display: 'block', color: '#64748b', fontSize: 11 }}>
                              {item.imagingType} ({item.imagingArea})
                            </small>
                          </td>
                          <td data-label="نام بیمار">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <User size={14} color="#0284c7" />
                              <strong>{item.patientName}</strong>
                            </div>
                            <small style={{ display: 'block', color: '#64748b', fontSize: 11 }}>{item.patientPhone}</small>
                          </td>
                          <td data-label="نام پزشک">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Stethoscope size={14} color="#0f766e" />
                              <strong>{item.doctorName}</strong>
                            </div>
                          </td>
                          <td data-label="موضوع و خلاصه پیام" style={{ maxWidth: 320 }}>
                            <strong style={{ display: 'block', fontSize: 13, color: '#0f172a' }}>{item.subject}</strong>
                            <span style={{ fontSize: 12, color: '#475569' }}>
                              {item.message.length > 85 ? `${item.message.slice(0, 85)}…` : item.message}
                            </span>
                            {item.response && (
                              <small style={{ display: 'block', color: '#047857', marginTop: 3, fontWeight: 600 }}>
                                پاسخ بیمار: {item.response.length > 60 ? `${item.response.slice(0, 60)}…` : item.response}
                              </small>
                            )}
                          </td>
                          <td data-label="تاریخ و زمان">
                            <div style={{ fontSize: 12 }}>{formatDateTime(item.updatedAt || item.createdAt)}</div>
                          </td>
                          <td data-label="وضعیت پیگیری">{renderStatusBadge(item.status)}</td>
                          <td data-label="مشاهده و مدیریت">
                            <button
                              type="button"
                              onClick={() => openDetailModal(item)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '6px 12px',
                                borderRadius: 8,
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <Eye size={14} />
                              <span>مشاهده تاریخچه</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    {!isLoading && data?.items.length === 0 && (
                      <tr>
                        <td colSpan={7} className="admin-page-empty">
                          هیچ مکالمه یا درخواست اطلاعات تکمیلی با این فیلترها یافت نشد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {!isLoading && data && data.pages > 1 && (
                <div className="admin-page-pagination">
                  <button disabled={data.page <= 1} onClick={() => setPage(data.page - 1)}>
                    <ChevronRight size={16} /> قبلی
                  </button>
                  <div>
                    {Array.from({ length: Math.min(data.pages, 5) }, (_, i) => i + 1).map((n) => (
                      <button key={n} className={data.page === n ? 'is-current' : ''} onClick={() => setPage(n)}>
                        {n.toLocaleString('fa-IR')}
                      </button>
                    ))}
                  </div>
                  <button disabled={data.page >= data.pages} onClick={() => setPage(data.page + 1)}>
                    بعدی <ChevronLeft size={16} />
                  </button>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {selectedItem && (
        <div className="admin-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h3>
                جزئیات مکالمه پزشک و بیمار — پرونده {selectedItem.requestNumber}
              </h3>
              <button onClick={() => setSelectedItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal__body">
              {actionMsg && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#ecfdf5',
                    color: '#047857',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {actionMsg}
                </div>
              )}

              <div className="admin-detail-section">
                <h4>مشخصات طرفین ارتباط و پرونده مرتبط</h4>
                <div className="admin-detail-grid">
                  <div>
                    <span>نام بیمار</span>
                    <strong>{selectedItem.patientName}</strong>
                  </div>
                  <div>
                    <span>تلفن بیمار</span>
                    <strong>{selectedItem.patientPhone}</strong>
                  </div>
                  <div>
                    <span>نام پزشک رادیولوژیست</span>
                    <strong>{selectedItem.doctorName}</strong>
                  </div>
                  <div>
                    <span>شماره درخواست تله‌ریپورت</span>
                    <strong>{selectedItem.requestNumber}</strong>
                  </div>
                  <div>
                    <span>نوع و ناحیه تصویربرداری</span>
                    <strong>
                      {selectedItem.imagingType} ({selectedItem.imagingArea})
                    </strong>
                  </div>
                  <div>
                    <span>تاریخ ثبت اولیه</span>
                    <strong>{formatDateTime(selectedItem.createdAt)}</strong>
                  </div>
                </div>
              </div>

              <div className="admin-detail-section">
                <h4>تاریخچه کامل پیام‌ها و پاسخ‌ها ({selectedItem.subject})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(selectedItem.messages && selectedItem.messages.length > 0
                    ? selectedItem.messages
                    : [
                        {
                          id: `${selectedItem.id}-doc`,
                          senderRole: 'doctor' as const,
                          senderId: '',
                          senderName: selectedItem.doctorName,
                          message: selectedItem.message,
                          createdAt: selectedItem.createdAt,
                        },
                        ...(selectedItem.response
                          ? [
                              {
                                id: `${selectedItem.id}-pat`,
                                senderRole: 'patient' as const,
                                senderId: '',
                                senderName: selectedItem.patientName,
                                message: selectedItem.response,
                                createdAt: selectedItem.updatedAt,
                              },
                            ]
                          : []),
                      ]
                  ).map((msg) => {
                    const isDoctor = msg.senderRole === 'doctor';
                    const isPatient = msg.senderRole === 'patient';
                    return (
                      <div
                        key={msg.id}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          background: isDoctor ? '#f0f9ff' : isPatient ? '#f0fdf4' : '#fffbeb',
                          border: isDoctor
                            ? '1px solid #bae6fd'
                            : isPatient
                            ? '1px solid #bbf7d0'
                            : '1px solid #fde68a',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 6,
                            fontSize: 12,
                          }}
                        >
                          <strong>
                            {msg.senderName} ({senderRoleLabels[msg.senderRole] ?? msg.senderRole})
                          </strong>
                          <span style={{ color: '#64748b' }}>{formatDateTime(msg.createdAt)}</span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            lineHeight: 1.7,
                            color: '#0f172a',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {msg.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="admin-detail-section">
                <h4>مدیریت وضعیت پیگیری و ثبت یادداشت مدیریتی (بدون حذف تاریخچه مکالمه)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>وضعیت پیگیری:</label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value as any)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                      }}
                    >
                      <option value="open">{statusLabels.open}</option>
                      <option value="answered">{statusLabels.answered}</option>
                      <option value="closed">{statusLabels.closed}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      یادداشت داخلی مدیریت:
                    </label>
                    <input
                      type="text"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="ثبت یادداشت پیگیری برای این پرونده..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      افزودن پیام راهنما در رشته مکالمه (اختیاری):
                    </label>
                    <textarea
                      rows={2}
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      placeholder="در صورت نیاز، پیام هماهنگی برای پزشک و بیمار ثبت کنید..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      بستن
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleSaveManagementAction()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 18px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#1456c3',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: saving ? 'wait' : 'pointer',
                      }}
                    >
                      <Send size={14} />
                      <span>{saving ? 'در حال ذخیره…' : 'ذخیره تغییرات مدیریتی'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
