'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { getStoredToken } from '@/lib/auth-client';
import { adminNavItems, formatDate } from '@/lib/admin-nav';
import type { AdminReviewListResponse, ProductReview } from '@/lib/shop-data';

export function AdminReviewsPage() {
  const { user, signOut } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminReviewListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/admin/reviews?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || 'دریافت فهرست نظرات ناموفق بود.');
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری نظرات.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  async function handleStatusChange(review: ProductReview, nextStatus: 'approved' | 'rejected') {
    setActionBusyId(review.id);
    setError('');
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/admin/reviews/${encodeURIComponent(review.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || 'تغییر وضعیت نظر ناموفق بود.');
      }
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در تغییر وضعیت نظر.');
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleDelete(review: ProductReview) {
    setActionBusyId(review.id);
    setError('');
    try {
      const token = getStoredToken();
      const res = await fetch(`/api/admin/reviews/${encodeURIComponent(review.id)}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || 'حذف نظر ناموفق بود.');
      }
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف نظر.');
    } finally {
      setActionBusyId(null);
    }
  }

  function renderStatusBadge(status?: string) {
    if (status === 'approved') {
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
          تأیید و منتشرشده
        </span>
      );
    }
    if (status === 'rejected') {
      return (
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
          <XCircle size={14} />
          ردشده
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
        در انتظار تأیید
      </span>
    );
  }

  const counts = data?.counts ?? { all: 0, pending: 0, approved: 0, rejected: 0 };

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
                className={`admin-page-nav__item ${item.href === '/admin/reviews' ? 'is-active' : ''}`}
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
              <MessageSquare size={26} strokeWidth={1.7} />
              <span>مدیریت نظرات کاربران</span>
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
                <h2>مدیریت نظرات کاربران</h2>
                <p>بررسی، تأیید و انتشار یا رد و حذف نظرات ثبت‌شده در محصولات فروشگاه و بخش پشتیبانی</p>
              </div>
            </div>

            {/* Summary Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 12,
                marginBottom: 16,
              }}
            >
              {[
                { key: 'all', label: 'همه نظرات', count: counts.all, color: '#0284c7' },
                { key: 'pending', label: 'در انتظار تأیید', count: counts.pending, color: '#d97706' },
                { key: 'approved', label: 'تأیید و منتشرشده', count: counts.approved, color: '#059669' },
                { key: 'rejected', label: 'ردشده', count: counts.rejected, color: '#dc2626' },
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
                  <span>فیلتر وضعیت</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setPage(1);
                      setStatusFilter(e.target.value as any);
                    }}
                  >
                    <option value="all">همه نظرات</option>
                    <option value="pending">در انتظار تأیید</option>
                    <option value="approved">تأیید و منتشرشده</option>
                    <option value="rejected">ردشده</option>
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
                  placeholder="جستجو بر اساس متن نظر، نام کاربر یا نام محصول..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="admin-page-error">{error}</div>}

            <section className="admin-page-table-card">
              <div className="admin-page-table-meta">
                <strong>فهرست نظرات</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} نظر</span>
              </div>
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>کاربر</th>
                      <th>بخش / محصول</th>
                      <th>امتیاز</th>
                      <th>متن نظر</th>
                      <th>تاریخ ثبت</th>
                      <th>وضعیت</th>
                      <th>عملیات مدیریت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={7} className="admin-page-empty">
                          در حال دریافت نظرات…
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      data?.items.map((item) => {
                        const isBusy = actionBusyId === item.id;
                        return (
                          <tr key={item.id}>
                            <td data-label="کاربر" className="admin-page-user-cell">
                              <strong>{item.userName || 'کاربر رادینت'}</strong>
                              {item.userEmail && <small style={{ display: 'block' }}>{item.userEmail}</small>}
                            </td>
                            <td data-label="بخش / محصول">
                              {item.targetType === 'support' || item.productId === 'support-center' ? (
                                <a
                                  href="/support#support-reviews"
                                  style={{ color: '#0f766e', fontWeight: 700, textDecoration: 'none' }}
                                >
                                  بخش پشتیبانی رادینت
                                </a>
                              ) : item.productSlug ? (
                                <a
                                  href={`/shop/product/${item.productSlug}`}
                                  style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}
                                >
                                  {item.productName}
                                </a>
                              ) : (
                                <strong>{item.productName}</strong>
                              )}
                            </td>
                            <td data-label="امتیاز">
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Star size={15} fill="#F59E0B" stroke="#F59E0B" />
                                <strong>{Number(item.rating || 5).toLocaleString('fa-IR')} از ۵</strong>
                              </div>
                            </td>
                            <td data-label="متن نظر" style={{ maxWidth: 340 }}>
                              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                                {item.content}
                              </p>
                            </td>
                            <td data-label="تاریخ ثبت">{formatDate(item.createdAt)}</td>
                            <td data-label="وضعیت">{renderStatusBadge(item.status)}</td>
                            <td data-label="عملیات مدیریت">
                              <div className="admin-page-actions" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {item.status !== 'approved' && (
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => void handleStatusChange(item, 'approved')}
                                    title="تأیید و انتشار نظر"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      padding: '6px 10px',
                                      borderRadius: 8,
                                      border: '1px solid #10b981',
                                      background: '#ecfdf5',
                                      color: '#047857',
                                      fontSize: 12,
                                      fontWeight: 700,
                                      cursor: isBusy ? 'wait' : 'pointer',
                                    }}
                                  >
                                    <CheckCircle2 size={14} />
                                    <span>تأیید</span>
                                  </button>
                                )}
                                {item.status !== 'rejected' && (
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => void handleStatusChange(item, 'rejected')}
                                    title="رد کردن و حذف نظر از دیتابیس"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      padding: '6px 10px',
                                      borderRadius: 8,
                                      border: '1px solid #f59e0b',
                                      background: '#fffbeb',
                                      color: '#b45309',
                                      fontSize: 12,
                                      fontWeight: 700,
                                      cursor: isBusy ? 'wait' : 'pointer',
                                    }}
                                  >
                                    <XCircle size={14} />
                                    <span>رد و حذف</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => void handleDelete(item)}
                                  title="حذف کامل نظر"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '6px 10px',
                                    borderRadius: 8,
                                    border: '1px solid #fca5a5',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: isBusy ? 'wait' : 'pointer',
                                  }}
                                >
                                  <Trash2 size={14} />
                                  <span>حذف</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {!isLoading && data?.items.length === 0 && (
                      <tr>
                        <td colSpan={7} className="admin-page-empty">
                          نظری با این فیلترها پیدا نشد.
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
    </div>
  );
}
