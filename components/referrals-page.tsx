'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  RotateCcw,
  Search,
  Settings,
  Stethoscope,
  X,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type ReferralItem = {
  id: string;
  requestNumber: string;
  patientFirstName: string;
  patientLastName: string;
  imagingType: string;
  imagingArea: string;
  studyDate: string | null;
  status: string;
  createdAt: string;
  city: string;
  country: string;
};

type ReferralResponse = {
  items: ReferralItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type FilterValues = {
  status: string;
  imagingType: string;
  from: string;
  to: string;
  search: string;
};

const initialFilters: FilterValues = { status: 'all', imagingType: 'all', from: '', to: '', search: '' };

const navItems = [
  { label: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { label: 'درخواست‌های ارجاعی', href: '/dashboard/referrals', icon: ClipboardList, active: true },
  { label: 'گزارش‌ها', href: '/dashboard/reports', icon: FileText },
  { label: 'بیماران', href: '/dashboard/patients', icon: Stethoscope },
  { label: 'اعلان‌ها', href: '/dashboard/notifications', icon: Bell },
  { label: 'تنظیمات', href: '/dashboard/settings', icon: Settings },
];

const statusLabels: Record<string, string> = {
  new: 'جدید',
  pending: 'در انتظار',
  in_progress: 'در حال بررسی',
  reviewing: 'در حال بررسی',
  completed: 'تکمیل شده',
  referred: 'در حال بررسی',
  rejected: 'رد شده',
};

const statusClasses: Record<string, string> = {
  new: 'is-pending',
  pending: 'is-pending',
  in_progress: 'is-reviewing',
  reviewing: 'is-reviewing',
  referred: 'is-reviewing',
  completed: 'is-completed',
  rejected: 'is-rejected',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function ReferralsPage() {
  const { user, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<ReferralResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [viewing, setViewing] = useState<ReferralItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '8' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters, page]);

  const loadReferrals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/dashboard/referrals?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت درخواست‌ها ناموفق بود.');
      const result = (await response.json()) as ReferralResponse;
      setData(result);
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadReferrals();
  }, [loadReferrals]);

  function updateFilter(key: keyof FilterValues, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleSelected(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleAll() {
    if (!data) return;
    setSelected(selected.length === data.items.length ? [] : data.items.map((item) => item.id));
  }

  async function updateStatus(id: string, status: 'new' | 'in_progress' | 'rejected') {
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/dashboard/referrals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('تغییر وضعیت انجام نشد.');
      await loadReferrals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تغییر وضعیت انجام نشد.');
    }
  }

  return (
    <div className="referrals-root">
      <header className="referrals-header">
        <div className="referrals-header__right">
          <button className="referrals-burger" onClick={() => setSidebarOpen((value) => !value)} aria-label="منو">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <a href="/dashboard" className="referrals-logo">
            <span>◈</span>
            <strong>رادینت</strong>
          </a>
        </div>
        <h1>مدیریت درخواست‌های ارجاعی</h1>
        <div className="referrals-profile">
          <div className="referrals-avatar">{user?.fullName?.charAt(0) ?? 'د'}</div>
          <div>
            <strong>{user?.fullName ?? 'دکتر احمدی'}</strong>
            <span>پزشک رادیولوژیست</span>
          </div>
        </div>
      </header>

      <div className="referrals-layout">
        <aside className={`referrals-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="referrals-sidebar__label">منوی اصلی</div>
          <nav>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`referrals-nav-item ${item.active ? 'is-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="referrals-nav-item referrals-nav-item--logout" onClick={() => signOut()}>
            <LogOut size={20} />
            <span>خروج از حساب</span>
          </button>
        </aside>
        {sidebarOpen && <div className="referrals-overlay" onClick={() => setSidebarOpen(false)} />}

        <main className="referrals-main">
          <div className="referrals-title">
            <div>
              <h2>درخواست‌های ارجاعی</h2>
              <p>مدیریت و بررسی درخواست‌های تصویربرداری بیماران</p>
            </div>
            <a href="/dashboard" className="back-dashboard">
              <ChevronRight size={16} /> بازگشت به داشبورد
            </a>
          </div>

          <section className="referrals-filter-card">
            <div className="referrals-filter-row">
              <label>
                <span>وضعیت</span>
                <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="new">جدید</option>
                  <option value="in_progress">در حال بررسی</option>
                  <option value="completed">تکمیل شده</option>
                  <option value="rejected">رد شده</option>
                </select>
              </label>
              <label>
                <span>نوع تصویربرداری</span>
                <select value={filters.imagingType} onChange={(event) => updateFilter('imagingType', event.target.value)}>
                  <option value="all">همه انواع</option>
                  <option value="MRI">MRI</option>
                  <option value="CT">CT</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="سونوگرافی">سونوگرافی</option>
                </select>
              </label>
              <label>
                <span>از تاریخ</span>
                <div className="referrals-date-input">
                  <CalendarDays size={18} />
                  <input type="date" value={filters.from} onChange={(event) => updateFilter('from', event.target.value)} />
                </div>
              </label>
              <label>
                <span>تا تاریخ</span>
                <div className="referrals-date-input">
                  <CalendarDays size={18} />
                  <input type="date" value={filters.to} onChange={(event) => updateFilter('to', event.target.value)} />
                </div>
              </label>
            </div>
            <div className="referrals-search">
              <Search size={18} />
              <input
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="جستجو بر اساس کد درخواست یا نام بیمار..."
              />
              <Filter size={18} />
            </div>
          </section>

          {error && <div className="referrals-error">{error}</div>}

          <section className="referrals-table-card">
            <div className="referrals-table-meta">
              <strong>فهرست درخواست‌ها</strong>
              <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} درخواست ثبت‌شده</span>
            </div>
            <div className="referrals-table-wrap">
              <table className="referrals-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" checked={Boolean(data?.items.length) && selected.length === data?.items.length} onChange={toggleAll} /></th>
                    <th>کد درخواست</th>
                    <th>بیمار</th>
                    <th>نوع درخواست</th>
                    <th>تاریخ</th>
                    <th>زمان</th>
                    <th>وضعیت</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={8} className="referrals-empty">در حال دریافت درخواست‌ها…</td>
                    </tr>
                  )}
                  {!loading && data?.items.map((item) => (
                    <ReferralRow
                      key={item.id}
                      item={item}
                      selected={selected.includes(item.id)}
                      onSelect={() => toggleSelected(item.id)}
                      onView={() => setViewing(item)}
                      onUpdateStatus={updateStatus}
                    />
                  ))}
                  {!loading && data?.items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="referrals-empty">درخواستی با این فیلترها پیدا نشد.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {!loading && data && <Pagination page={data.page} pages={data.pages} onPageChange={setPage} />}
          </section>
        </main>
      </div>

      {viewing && (
        <div className="referrals-modal-backdrop" onClick={() => setViewing(null)}>
          <div className="referrals-modal" onClick={(event) => event.stopPropagation()}>
            <button className="referrals-modal__close" onClick={() => setViewing(null)}>
              <X size={20} />
            </button>
            <div className="referrals-modal__header">
              <div className="referrals-modal__icon">
                <ClipboardList size={28} />
              </div>
              <h3>جزئیات درخواست ارجاعی</h3>
            </div>
            <div className="referrals-modal__body">
              <div className="referrals-modal__row">
                <span>کد درخواست</span>
                <strong>{viewing.requestNumber}</strong>
              </div>
              <div className="referrals-modal__row">
                <span>نام بیمار</span>
                <strong>{viewing.patientFirstName} {viewing.patientLastName}</strong>
              </div>
              <div className="referrals-modal__row">
                <span>نوع تصویربرداری</span>
                <strong>{viewing.imagingType} - {viewing.imagingArea}</strong>
              </div>
              <div className="referrals-modal__row">
                <span>محل ثبت</span>
                <strong>{viewing.city}، {viewing.country}</strong>
              </div>
              <div className="referrals-modal__row">
                <span>تاریخ ثبت</span>
                <strong>{formatDate(viewing.createdAt)}</strong>
              </div>
              <div className="referrals-modal__row">
                <span>وضعیت</span>
                <span className={`referral-status ${statusClasses[viewing.status] ?? 'is-reviewing'}`}>
                  {statusLabels[viewing.status] ?? viewing.status}
                </span>
              </div>
            </div>
            <button className="referrals-modal__button" onClick={() => setViewing(null)}>بستن</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReferralRow({ item, selected, onSelect, onView, onUpdateStatus }: {
  item: ReferralItem;
  selected: boolean;
  onSelect: () => void;
  onView: () => void;
  onUpdateStatus: (id: string, status: 'new' | 'in_progress' | 'rejected') => void;
}) {
  return (
    <tr className={selected ? 'is-selected' : ''}>
      <td data-label="انتخاب">
        <input type="checkbox" checked={selected} onChange={onSelect} />
      </td>
      <td data-label="کد درخواست" className="referral-code">{item.requestNumber}</td>
      <td data-label="بیمار">
        <strong>{item.patientFirstName} {item.patientLastName}</strong>
        <small>{item.imagingArea}</small>
      </td>
      <td data-label="نوع درخواست">{item.imagingType}</td>
      <td data-label="تاریخ">{formatDate(item.studyDate ?? item.createdAt)}</td>
      <td data-label="زمان">{formatTime(item.createdAt)}</td>
      <td data-label="وضعیت">
        <span className={`referral-status ${statusClasses[item.status] ?? 'is-reviewing'}`}>
          {statusLabels[item.status] ?? item.status}
        </span>
      </td>
      <td data-label="عملیات">
        <div className="referral-actions">
          <button className="referral-action referral-action--view" onClick={onView} title="مشاهده">
            <Eye size={16} />
          </button>
          {item.status === 'rejected' ? (
            <button className="referral-action referral-action--restore" onClick={() => onUpdateStatus(item.id, 'new')} title="بازگردانی">
              <RotateCcw size={16} />
            </button>
          ) : (
            <>
              <button className="referral-action referral-action--accept" onClick={() => onUpdateStatus(item.id, 'in_progress')} title="پذیرش">
                <CheckCircle2 size={16} />
              </button>
              <button className="referral-action referral-action--reject" onClick={() => onUpdateStatus(item.id, 'rejected')} title="رد">
                <XCircle size={16} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function Pagination({ page, pages, onPageChange }: { page: number; pages: number; onPageChange: (page: number) => void }) {
  const numbers = Array.from({ length: Math.min(pages, 5) }, (_, index) => index + 1);
  return (
    <div className="referrals-pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronRight size={16} /> قبلی
      </button>
      <div>
        {numbers.map((number) => (
          <button key={number} className={page === number ? 'is-current' : ''} onClick={() => onPageChange(number)}>
            {number.toLocaleString('fa-IR')}
          </button>
        ))}
      </div>
      <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        بعدی <ChevronLeft size={16} />
      </button>
    </div>
  );
}
