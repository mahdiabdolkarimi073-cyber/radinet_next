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
  Search,
  ShieldCheck,
  Ticket,
  Trash2,
  X,
} from 'lucide-react';
import { adminNavItems, formatDate, formatToman } from '@/lib/admin-nav';
import { useAuth } from '@/components/auth-provider';

type Discount = {
  id: string;
  code: string;
  description: string;
  type: string;
  value: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  targetUserId: string | null;
  createdAt: string;
};

type DiscountResponse = {
  items: Discount[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type FilterValues = {
  type: string;
  status: string;
  search: string;
};

const initialFilters: FilterValues = { type: 'all', status: 'all', search: '' };

const typeLabels: Record<string, string> = {
  percent: 'درصدی',
  fixed: 'مبلغ ثابت',
};

const typeClasses: Record<string, string> = {
  percent: 'is-admin',
  fixed: 'is-doctor',
};

function toDateTimeLocal(value: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminDiscountsPage() {
  const { user, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<DiscountResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Discount | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters, page]);

  const loadDiscounts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/discounts?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت کدهای تخفیف ناموفق بود.');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadDiscounts();
  }, [loadDiscounts]);

  function updateFilter(key: keyof FilterValues, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
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
                className={`admin-page-nav__item ${item.href === '/admin/discounts' ? 'is-active' : ''}`}
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
              <Ticket size={26} strokeWidth={1.7} />
              <span>مدیریت کدهای تخفیف</span>
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
                <h2>مدیریت کدهای تخفیف</h2>
                <p>مشاهده، فیلتر، افزودن، ویرایش و حذف کدهای تخفیف سیستم</p>
              </div>
              <button className="admin-page-add-btn" onClick={() => setShowAddModal(true)}>
                <Plus size={18} /> افزودن کد تخفیف
              </button>
            </div>

            <section className="admin-page-filter-card">
              <div className="admin-page-filter-row">
                <label>
                  <span>نوع</span>
                  <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)}>
                    <option value="all">همه انواع</option>
                    <option value="percent">درصدی</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </label>
                <label>
                  <span>وضعیت</span>
                  <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                  </select>
                </label>
              </div>
              <div className="admin-page-search">
                <Search size={18} />
                <input
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="جستجو بر اساس کد یا توضیحات..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="admin-page-error">{error}</div>}

            <section className="admin-page-table-card">
              <div className="admin-page-table-meta">
                <strong>فهرست کدهای تخفیف</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} کد تخفیف</span>
              </div>
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>کد</th>
                      <th>توضیحات</th>
                      <th>نوع</th>
                      <th>مقدار</th>
                      <th>حداقل سفارش</th>
                      <th>حداکثر تخفیف</th>
                      <th>محدودیت استفاده</th>
                      <th>استفاده‌شده</th>
                      <th>وضعیت</th>
                      <th>تاریخ شروع</th>
                      <th>تاریخ پایان</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td colSpan={12} className="admin-page-empty">در حال دریافت کدهای تخفیف…</td></tr>
                    )}
                    {!isLoading && data?.items.map((item) => (
                      <tr key={item.id}>
                        <td data-label="کد"><strong>{item.code}</strong></td>
                        <td data-label="توضیحات">{item.description || '—'}</td>
                        <td data-label="نوع">
                          <span className={`admin-role-badge ${typeClasses[item.type] ?? 'is-user'}`}>
                            {typeLabels[item.type] ?? item.type}
                          </span>
                        </td>
                        <td data-label="مقدار">
                          {item.type === 'percent'
                            ? `${item.value.toLocaleString('fa-IR')}٪`
                            : `${formatToman(item.value)} تومان`}
                        </td>
                        <td data-label="حداقل سفارش">
                          {item.minOrderAmount != null ? `${formatToman(item.minOrderAmount)} تومان` : '—'}
                        </td>
                        <td data-label="حداکثر تخفیف">
                          {item.maxDiscountAmount != null ? `${formatToman(item.maxDiscountAmount)} تومان` : '—'}
                        </td>
                        <td data-label="محدودیت استفاده">
                          {item.usageLimit != null ? item.usageLimit.toLocaleString('fa-IR') : 'نامحدود'}
                        </td>
                        <td data-label="استفاده‌شده">{(item.usedCount ?? 0).toLocaleString('fa-IR')}</td>
                        <td data-label="وضعیت">
                          <span className={`admin-status-badge ${item.isActive ? 'is-active' : 'is-inactive'}`}>
                            {item.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td data-label="تاریخ شروع">{formatDate(item.startsAt)}</td>
                        <td data-label="تاریخ پایان">{formatDate(item.endsAt)}</td>
                        <td data-label="عملیات">
                          <div className="admin-page-actions">
                            <button className="admin-page-action admin-page-action--edit" onClick={() => setShowEditModal(item)} title="ویرایش">
                              <Edit3 size={16} />
                            </button>
                            <button
                              className="admin-page-action admin-page-action--delete"
                              onClick={async () => {
                                if (!confirm('آیا از حذف این کد تخفیف مطمئن هستید؟')) return;
                                const token = window.localStorage.getItem('radinet_auth_token');
                                await fetch(`/api/admin/discounts/${item.id}`, {
                                  method: 'DELETE',
                                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                                });
                                void loadDiscounts();
                              }}
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && data?.items.length === 0 && (
                      <tr><td colSpan={12} className="admin-page-empty">کد تخفیفی با این فیلترها پیدا نشد.</td></tr>
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

      {showAddModal && (
        <DiscountFormModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); void loadDiscounts(); }}
        />
      )}
      {showEditModal && (
        <DiscountFormModal
          mode="edit"
          discount={showEditModal}
          onClose={() => setShowEditModal(null)}
          onSaved={() => { setShowEditModal(null); void loadDiscounts(); }}
        />
      )}
    </div>
  );
}

type DiscountFormModalProps = {
  mode: 'add' | 'edit';
  discount?: Discount | null;
  onClose: () => void;
  onSaved: () => void;
};

function DiscountFormModal({ mode, discount, onClose, onSaved }: DiscountFormModalProps) {
  const [code, setCode] = useState(discount?.code ?? '');
  const [description, setDescription] = useState(discount?.description ?? '');
  const [type, setType] = useState(discount?.type ?? 'percent');
  const [value, setValue] = useState<number | ''>(discount?.value ?? '');
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>(
    discount?.minOrderAmount != null ? discount.minOrderAmount : ''
  );
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | ''>(
    discount?.maxDiscountAmount != null ? discount.maxDiscountAmount : ''
  );
  const [usageLimit, setUsageLimit] = useState<number | ''>(
    discount?.usageLimit != null ? discount.usageLimit : ''
  );
  const [startsAt, setStartsAt] = useState(discount ? toDateTimeLocal(discount.startsAt) : '');
  const [endsAt, setEndsAt] = useState(discount ? toDateTimeLocal(discount.endsAt) : '');
  const [isActive, setIsActive] = useState(discount?.isActive ?? true);
  const [targetUserId, setTargetUserId] = useState(discount?.targetUserId ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const payload: Record<string, unknown> = {
        code,
        description,
        type,
        value: Number(value),
        minOrderAmount: minOrderAmount === '' ? null : Number(minOrderAmount),
        maxDiscountAmount: maxDiscountAmount === '' ? null : Number(maxDiscountAmount),
        usageLimit: usageLimit === '' ? null : Number(usageLimit),
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        isActive,
        targetUserId: targetUserId ? targetUserId : null,
      };
      const url = mode === 'edit' && discount ? `/api/admin/discounts/${discount.id}` : '/api/admin/discounts';
      const method = mode === 'edit' ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? (mode === 'edit' ? 'ویرایش کد تخفیف ناموفق بود.' : 'افزودن کد تخفیف ناموفق بود.'));
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
          <h3>{mode === 'edit' ? 'ویرایش کد تخفیف' : 'افزودن کد تخفیف جدید'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <label>
            <span>کد تخفیف</span>
            <input value={code} onChange={(e) => setCode(e.target.value)} required placeholder="مثال: SUMMER1403" />
          </label>
          <label>
            <span>توضیحات</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیحات کد تخفیف..." />
          </label>
          <div className="admin-modal__row">
            <label>
              <span>نوع تخفیف</span>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="percent">درصدی</option>
                <option value="fixed">مبلغ ثابت</option>
              </select>
            </label>
            <label>
              <span>مقدار</span>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
                required
                min={0}
                placeholder={type === 'percent' ? 'مثال: ۲۰' : 'مثال: ۵۰۰۰۰'}
              />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>حداقل مبلغ سفارش (تومان)</span>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                placeholder="اختیاری"
              />
            </label>
            <label>
              <span>حداکثر مبلغ تخفیف (تومان)</span>
              <input
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                placeholder="اختیاری"
              />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>محدودیت استفاده</span>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                placeholder="خالی = نامحدود"
              />
            </label>
            <label>
              <span>شناسه کاربر هدف (اختیاری)</span>
              <input
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="مخصوص یک کاربر"
              />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>تاریخ شروع</span>
              <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </label>
            <label>
              <span>تاریخ پایان</span>
              <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </label>
          </div>
          <label className="admin-modal__check">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>کد تخفیف فعال است</span>
          </label>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ذخیره…' : mode === 'edit' ? 'ذخیره تغییرات' : 'افزودن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
