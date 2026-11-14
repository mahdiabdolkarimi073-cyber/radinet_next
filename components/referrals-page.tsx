'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  Eye,
  FileText,
  FilePlus2,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleQuestion,
  RotateCcw,
  Search,
  Stethoscope,
  UserCog,
  UsersRound,
  Wallet,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { PersianDatePicker } from '@/components/persian-date-picker';

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
  { label: 'بیماران', href: '/dashboard/patients', icon: UsersRound },
  { label: 'درخواست اطلاعات تکمیلی', href: '/dashboard/info-requests', icon: MessageCircleQuestion },
  { label: 'مالی و درآمد', href: '/dashboard/finance', icon: Wallet },
  { label: 'آرشیو گزارش‌ها', href: '/dashboard/report-archive', icon: Archive },
  { label: 'پروفایل تخصصی', href: '/dashboard/doctor-profile', icon: UserCog },
];

const statusLabels: Record<string, string> = {
  new: 'جدید',
  pending: 'در انتظار',
  pending_review: 'در انتظار بررسی',
  assigned: 'ارجاع‌شده به شما',
  in_progress: 'در حال بررسی',
  reviewing: 'در حال بررسی',
  pending_approval: 'در انتظار تأیید مدیر/پشتیبانی',
  completed: 'تکمیل شده',
  referred: 'در حال بررسی',
  rejected: 'رد شده',
};

const statusClasses: Record<string, string> = {
  new: 'is-pending',
  pending: 'is-pending',
  pending_review: 'is-pending',
  assigned: 'is-reviewing',
  in_progress: 'is-reviewing',
  reviewing: 'is-reviewing',
  pending_approval: 'is-reviewing',
  referred: 'is-reviewing',
  completed: 'is-completed',
  rejected: 'is-rejected',
};

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  } catch {
    return '—';
  }
}

function formatTime(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(d);
  } catch {
    return '—';
  }
}

export function ReferralsPage() {
  const { user, loading, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<ReferralResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [viewing, setViewing] = useState<ReferralItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '8' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
    });
    if (user?.id) params.set('doctorUserId', user.id);
    return params.toString();
  }, [filters, page, user]);

  const loadReferrals = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/dashboard/referrals?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت درخواست‌ها ناموفق بود.');
      const raw = await response.json().catch(() => null);
      const itemsList = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
          ? raw.items
          : [];
      setData({
        items: itemsList,
        total: typeof raw?.total === 'number' ? raw.total : itemsList.length,
        page: typeof raw?.page === 'number' ? raw.page : 1,
        limit: typeof raw?.limit === 'number' ? raw.limit : 8,
        pages: typeof raw?.pages === 'number' && raw.pages > 0 ? raw.pages : 1,
      });
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
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
    const list = data?.items || [];
    setSelected(selected.length === list.length && list.length > 0 ? [] : list.map((item) => item.id));
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
      <div className="referrals-shell">
        <aside className={`referrals-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="referrals-brand">
            <div className="referrals-brand__mark"><Stethoscope size={29} strokeWidth={1.7} /></div>
            <div>
              <strong>داشبورد</strong>
              <span>سامانه مدیریت خدمات پزشکی</span>
            </div>
          </div>
          <nav className="referrals-nav" aria-label="منوی داشبورد">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`referrals-nav-item ${item.active ? 'is-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="referrals-nav-item--logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج از حساب</span>
          </button>
        </aside>

        {sidebarOpen && <div className="referrals-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="referrals-content">
          <header className="referrals-header">
            <button className="referrals-burger" onClick={() => setSidebarOpen((open) => !open)} aria-label="باز کردن منو">
              {sidebarOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
            <div className="referrals-profile">
              <div className="referrals-avatar">{user?.fullName?.charAt(0) ?? 'م'}</div>
              <div>
                <strong>{loading ? 'در حال بارگذاری…' : user?.fullName ?? 'مهدی عبدالكریمی'}</strong>
                <span>مدیریت هوشمند خدمات پزشکی</span>
              </div>
              <ChevronDown className="referrals-profile__chevron" size={17} />
            </div>
            <div className="referrals-header__actions">
              <button className="referrals-header__icon" aria-label="تقویم"><CalendarDays size={25} strokeWidth={1.7} /></button>
            </div>
          </header>

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
                  <span>از تاریخ (شمسی)</span>
                  <PersianDatePicker
                    value={filters.from}
                    onChange={(val) => updateFilter('from', val)}
                    placeholder="انتخاب تاریخ شروع..."
                  />
                </label>
                <label>
                  <span>تا تاریخ (شمسی)</span>
                  <PersianDatePicker
                    value={filters.to}
                    onChange={(val) => updateFilter('to', val)}
                    placeholder="انتخاب تاریخ پایان..."
                  />
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
                      <th><input type="checkbox" checked={Boolean(data?.items?.length) && selected.length === (data?.items?.length ?? 0)} onChange={toggleAll} /></th>
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
                    {isLoading && (
                      <tr>
                        <td colSpan={8} className="referrals-empty">در حال دریافت درخواست‌ها…</td>
                      </tr>
                    )}
                    {!isLoading && data && Array.isArray(data.items) && data.items.map((item) => (
                      <ReferralRow
                        key={item.id}
                        item={item}
                        selected={selected.includes(item.id)}
                        onSelect={() => toggleSelected(item.id)}
                        onView={() => setViewing(item)}
                        onUpdateStatus={updateStatus}
                      />
                    ))}
                    {!isLoading && (!data?.items || data.items.length === 0) && (
                      <tr>
                        <td colSpan={8} className="referrals-empty" style={{ padding: '36px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <ClipboardList size={34} style={{ color: '#94a3b8' }} />
                            <strong style={{ fontSize: '15px', color: '#1e293b' }}>پرونده ارجاعی در کارتابل شما یافت نشد</strong>
                            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                              به محض ارجاع پرونده توسط پشتیبانی یا مدیریت سامانه، درخواست‌ها در این جدول نمایش داده می‌شوند.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && data && <Pagination page={data.page || 1} pages={data.pages || 1} onPageChange={setPage} />}
            </section>
          </main>
        </div>
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
            <div className="referrals-modal__links">
              <a href={`/dashboard/patients/${viewing.id}`} className="referrals-modal__link">
                <Eye size={18} /> پرونده بیمار
              </a>
              <a href={`/dashboard/reports/new?requestId=${viewing.id}`} className="referrals-modal__link referrals-modal__link--report">
                <FilePlus2 size={18} /> ثبت گزارش
              </a>
            </div>
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
          <a className="referral-action referral-action--view" href={`/dashboard/patients/${item.id}`} title="پرونده بیمار">
            <Eye size={16} />
          </a>
          <a className="referral-action referral-action--report" href={`/dashboard/reports/new?requestId=${item.id}`} title="ثبت گزارش">
            <FilePlus2 size={16} />
          </a>
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
  const safePages = Math.max(Number(pages) || 1, 1);
  const safePage = Math.max(Number(page) || 1, 1);
  const numbers = Array.from({ length: Math.min(safePages, 5) }, (_, index) => index + 1);
  return (
    <div className="referrals-pagination">
      <button disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>
        <ChevronRight size={16} /> قبلی
      </button>
      <div>
        {numbers.map((number) => (
          <button key={number} className={safePage === number ? 'is-current' : ''} onClick={() => onPageChange(number)}>
            {number.toLocaleString('fa-IR')}
          </button>
        ))}
      </div>
      <button disabled={safePage >= safePages} onClick={() => onPageChange(safePage + 1)}>
        بعدی <ChevronLeft size={16} />
      </button>
    </div>
  );
}
