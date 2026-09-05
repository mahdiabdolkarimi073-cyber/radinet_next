'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Users,
  Stethoscope,
  Building2,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type OrderItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentStatus: string;
  trackingCode: string | null;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: { id: string; name: string; imageUrl: string };
  }[];
};

type OrderResponse = {
  items: OrderItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type OrderStats = {
  total: number;
  byStatus: {
    pending: number;
    processing: number;
    readyToShip: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  paidRevenue: number;
};

type FilterValues = {
  status: string;
  paymentStatus: string;
  search: string;
};

const initialFilters: FilterValues = { status: 'all', paymentStatus: 'all', search: '' };

const navItems = [
  { label: 'داشبورد', href: '/admin', icon: LayoutDashboard },
  { label: 'کاربران', href: '/admin/users', icon: Users },
  { label: 'پزشکان', href: '/admin/doctors', icon: Stethoscope },
  { label: 'مراکز تصویربرداری', href: '/admin/imaging-centers', icon: Building2 },
  { label: 'سازمان‌ها', href: '/admin/organizations', icon: Building2 },
  { label: 'محصولات فروشگاه', href: '/admin/shop-products', icon: Package },
  { label: 'سفارش‌های فروشگاه', href: '/admin/shop-orders', icon: ShoppingCart, active: true },
  { label: 'درخواست‌های تله‌ریپورت', href: '/admin/tele-reports', icon: ShieldCheck },
];

const statusLabels: Record<string, string> = {
  pending: 'در انتظار',
  processing: 'در حال پردازش',
  ready_to_ship: 'آماده ارسال',
  shipped: 'ارسال‌شده',
  delivered: 'تحویل‌شده',
  cancelled: 'لغوشده',
};

const statusColors: Record<string, string> = {
  pending: '#C9973E',
  processing: '#1456c3',
  ready_to_ship: '#7c3aed',
  shipped: '#0891b2',
  delivered: '#168a68',
  cancelled: '#dc2626',
};

const paymentLabels: Record<string, string> = {
  paid: 'پرداخت‌شده',
  unpaid: 'پرداخت‌نشده',
  pending: 'در انتظار پرداخت',
};

const paymentColors: Record<string, string> = {
  paid: '#168a68',
  unpaid: '#dc2626',
  pending: '#C9973E',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

function formatToman(n: number): string {
  return n.toLocaleString('fa-IR');
}

export function AdminShopOrdersPage() {
  const { user, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<OrderResponse | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<OrderItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editStatusOrder, setEditStatusOrder] = useState<OrderItem | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
    });
    return params.toString();
  }, [filters, page]);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/orders?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت سفارش‌ها ناموفق بود.');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const loadStats = useCallback(async () => {
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/admin/orders/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (response.ok) {
        const result = await response.json();
        setStats(result);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  function updateFilter(key: keyof FilterValues, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function loadOrderDetail(orderNumber: string) {
    setDetailLoading(true);
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/orders/${orderNumber}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت اطلاعات سفارش ناموفق بود.');
      const result = await response.json();
      setDetailOrder(result);
    } catch {
      setError('دریافت اطلاعات سفارش ناموفق بود.');
    } finally {
      setDetailLoading(false);
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
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className={`admin-page-nav__item ${item.active ? 'is-active' : ''}`} onClick={() => setSidebarOpen(false)}>
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
              <ShoppingCart size={26} strokeWidth={1.7} />
              <span>مدیریت سفارش‌های فروشگاه</span>
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
                <h2>مدیریت سفارش‌های فروشگاه</h2>
                <p>مشاهده، فیلتر و مدیریت وضعیت سفارش‌های فروشگاه</p>
              </div>
            </div>

            {stats && (
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-card__top">
                    <span>کل سفارش‌ها</span>
                    <div className="admin-stat-card__icon" style={{ background: '#eff4fb', color: '#1456c3' }}><ShoppingCart size={22} /></div>
                  </div>
                  <strong>{stats.total.toLocaleString('fa-IR')}</strong>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-card__top">
                    <span>در انتظار</span>
                    <div className="admin-stat-card__icon" style={{ background: '#fef9ef', color: '#C9973E' }}><Package size={22} /></div>
                  </div>
                  <strong>{stats.byStatus.pending.toLocaleString('fa-IR')}</strong>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-card__top">
                    <span>در حال پردازش</span>
                    <div className="admin-stat-card__icon" style={{ background: '#eff4fb', color: '#1456c3' }}><Package size={22} /></div>
                  </div>
                  <strong>{stats.byStatus.processing.toLocaleString('fa-IR')}</strong>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-card__top">
                    <span>ارسال‌شده</span>
                    <div className="admin-stat-card__icon" style={{ background: '#e8f6f3', color: '#0891b2' }}><Package size={22} /></div>
                  </div>
                  <strong>{stats.byStatus.shipped.toLocaleString('fa-IR')}</strong>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-card__top">
                    <span>درآمد پرداخت‌شده</span>
                    <div className="admin-stat-card__icon" style={{ background: '#e8f6f3', color: '#168a68' }}><ShieldCheck size={22} /></div>
                  </div>
                  <strong>{formatToman(stats.paidRevenue)}</strong>
                </div>
              </div>
            )}

            <section className="admin-page-filter-card">
              <div className="admin-page-filter-row">
                <label>
                  <span>وضعیت سفارش</span>
                  <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="pending">در انتظار</option>
                    <option value="processing">در حال پردازش</option>
                    <option value="ready_to_ship">آماده ارسال</option>
                    <option value="shipped">ارسال‌شده</option>
                    <option value="delivered">تحویل‌شده</option>
                    <option value="cancelled">لغوشده</option>
                  </select>
                </label>
                <label>
                  <span>وضعیت پرداخت</span>
                  <select value={filters.paymentStatus} onChange={(e) => updateFilter('paymentStatus', e.target.value)}>
                    <option value="all">همه</option>
                    <option value="paid">پرداخت‌شده</option>
                    <option value="unpaid">پرداخت‌نشده</option>
                    <option value="pending">در انتظار پرداخت</option>
                  </select>
                </label>
              </div>
              <div className="admin-page-search">
                <Search size={18} />
                <input
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="جستجو بر اساس شماره سفارش، نام مشتری، تلفن..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="admin-page-error">{error}</div>}

            <section className="admin-page-table-card">
              <div className="admin-page-table-meta">
                <strong>فهرست سفارش‌ها</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} سفارش</span>
              </div>
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>شماره سفارش</th>
                      <th>مشتری</th>
                      <th>تعداد آیتم</th>
                      <th>مبلغ کل</th>
                      <th>پرداخت</th>
                      <th>وضعیت</th>
                      <th>کد رهگیری</th>
                      <th>تاریخ</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td colSpan={9} className="admin-page-empty">در حال دریافت سفارش‌ها…</td></tr>
                    )}
                    {!isLoading && data?.items.map((item) => (
                      <tr key={item.id}>
                        <td data-label="شماره سفارش"><strong>{item.orderNumber}</strong></td>
                        <td data-label="مشتری" className="admin-page-user-cell">
                          <strong>{item.customerName}</strong>
                          <small>{item.customerPhone}</small>
                        </td>
                        <td data-label="تعداد آیتم">{item.items.length.toLocaleString('fa-IR')}</td>
                        <td data-label="مبلغ کل">{formatToman(item.total)} تومان</td>
                        <td data-label="پرداخت">
                          <span className="admin-status-badge" style={{ background: `${paymentColors[item.paymentStatus]}15`, color: paymentColors[item.paymentStatus], border: `1px solid ${paymentColors[item.paymentStatus]}30` }}>
                            {paymentLabels[item.paymentStatus] ?? item.paymentStatus}
                          </span>
                        </td>
                        <td data-label="وضعیت">
                          <span className="admin-status-badge" style={{ background: `${statusColors[item.status] ?? '#718198'}15`, color: statusColors[item.status] ?? '#718198', border: `1px solid ${statusColors[item.status] ?? '#718198'}30` }}>
                            {statusLabels[item.status] ?? item.status}
                          </span>
                        </td>
                        <td data-label="کد رهگیری">{item.trackingCode ?? '—'}</td>
                        <td data-label="تاریخ">{formatDate(item.createdAt)}</td>
                        <td data-label="عملیات">
                          <div className="admin-page-actions">
                            <button className="admin-page-action admin-page-action--view" onClick={() => loadOrderDetail(item.orderNumber)} title="مشاهده">
                              <Eye size={16} />
                            </button>
                            <button className="admin-page-action admin-page-action--edit" onClick={() => setEditStatusOrder(item)} title="تغییر وضعیت">
                              <Edit3 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && data?.items.length === 0 && (
                      <tr><td colSpan={9} className="admin-page-empty">سفارشی با این فیلترها پیدا نشد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && data && (
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

      {detailOrder && (
        <OrderDetailModal order={detailOrder} loading={detailLoading} onClose={() => setDetailOrder(null)} />
      )}
      {editStatusOrder && (
        <EditStatusModal order={editStatusOrder} onClose={() => setEditStatusOrder(null)} onSaved={() => { setEditStatusOrder(null); void loadOrders(); void loadStats(); }} />
      )}
    </div>
  );
}

function OrderDetailModal({ order, loading, onClose }: { order: OrderItem | null; loading: boolean; onClose: () => void }) {
  if (loading || !order) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>جزئیات سفارش {order.orderNumber}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="admin-modal__body">
          <div className="admin-detail-section">
            <h4>اطلاعات مشتری</h4>
            <div className="admin-detail-grid">
              <div><span>نام</span><strong>{order.customerName}</strong></div>
              <div><span>تلفن</span><strong>{order.customerPhone}</strong></div>
              <div><span>ایمیل</span><strong>{order.customerEmail || '—'}</strong></div>
              <div><span>تاریخ</span><strong>{formatDate(order.createdAt)}</strong></div>
            </div>
          </div>

          <div className="admin-detail-section">
            <h4>وضعیت</h4>
            <div className="admin-detail-grid">
              <div><span>وضعیت سفارش</span><strong>{statusLabels[order.status] ?? order.status}</strong></div>
              <div><span>وضعیت پرداخت</span><strong>{paymentLabels[order.paymentStatus] ?? order.paymentStatus}</strong></div>
              <div><span>کد رهگیری</span><strong>{order.trackingCode ?? '—'}</strong></div>
              <div><span>مبلغ کل</span><strong>{formatToman(order.total)} تومان</strong></div>
            </div>
          </div>

          <div className="admin-detail-section">
            <h4>آیتم‌های سفارش</h4>
            <div className="admin-page-table-wrap">
              <table className="admin-page-table">
                <thead>
                  <tr>
                    <th>محصول</th>
                    <th>تعداد</th>
                    <th>قیمت واحد</th>
                    <th>مجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td data-label="محصول"><strong>{item.product.name}</strong></td>
                      <td data-label="تعداد">{item.quantity.toLocaleString('fa-IR')}</td>
                      <td data-label="قیمت واحد">{formatToman(item.price)} تومان</td>
                      <td data-label="مجموع">{formatToman(item.price * item.quantity)} تومان</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditStatusModal({ order, onClose, onSaved }: { order: OrderItem; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState(order.status);
  const [trackingCode, setTrackingCode] = useState(order.trackingCode ?? '');
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/orders/${order.orderNumber}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status, trackingCode, paymentStatus, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'به‌روزرسانی وضعیت ناموفق بود.');
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
          <h3>تغییر وضعیت سفارش {order.orderNumber}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <label>
            <span>وضعیت سفارش</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">در انتظار</option>
              <option value="processing">در حال پردازش</option>
              <option value="ready_to_ship">آماده ارسال</option>
              <option value="shipped">ارسال‌شده</option>
              <option value="delivered">تحویل‌شده</option>
              <option value="cancelled">لغوشده</option>
            </select>
          </label>
          <label>
            <span>کد رهگیری</span>
            <input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} placeholder="کد رهگیری پستی" />
          </label>
          <label>
            <span>وضعیت پرداخت</span>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              <option value="unpaid">پرداخت‌نشده</option>
              <option value="pending">در انتظار پرداخت</option>
              <option value="paid">پرداخت‌شده</option>
            </select>
          </label>
          <label>
            <span>یادداشت</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="یادداشت اختیاری" />
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
