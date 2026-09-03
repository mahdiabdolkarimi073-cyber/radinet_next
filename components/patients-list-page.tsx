'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Stethoscope,
  UsersRound,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type PatientItem = {
  id: string;
  requestNumber: string;
  patientFirstName: string;
  patientLastName: string;
  nationalId: string | null;
  phone: string;
  age: number | null;
  gender: string;
  country: string;
  city: string;
  imagingType: string;
  imagingArea: string;
  status: string;
  createdAt: string;
  _count?: { reports: number };
};

type PatientResponse = {
  items: PatientItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type FilterValues = {
  status: string;
  imagingType: string;
  search: string;
};

const initialFilters: FilterValues = { status: 'all', imagingType: 'all', search: '' };

const navItems = [
  { label: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { label: 'درخواست‌های ارجاعی', href: '/dashboard/referrals', icon: ClipboardList },
  { label: 'گزارش‌ها', href: '/dashboard/reports', icon: FileText },
  { label: 'بیماران', href: '/dashboard/patients', icon: UsersRound, active: true },
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

const genderLabels: Record<string, string> = {
  male: 'مرد',
  female: 'زن',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function PatientsListPage() {
  const { user, loading, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<PatientResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '8' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters, page]);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/dashboard/patients/list?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت بیماران ناموفق بود.');
      const result = (await response.json()) as PatientResponse;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  function updateFilter(key: keyof FilterValues, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="patients-list-root">
      <div className="patients-list-shell">
        <aside className={`patients-list-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="patients-list-brand">
            <div className="patients-list-brand__mark"><Stethoscope size={29} strokeWidth={1.7} /></div>
            <div>
              <strong>داشبورد</strong>
              <span>سامانه مدیریت خدمات پزشکی</span>
            </div>
          </div>
          <nav className="patients-list-nav" aria-label="منوی داشبورد">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`patients-list-nav-item ${item.active ? 'is-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="patients-list-nav-item--logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج از حساب</span>
          </button>
        </aside>

        {sidebarOpen && <div className="patients-list-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="patients-list-content">
          <header className="patients-list-header">
            <button className="patients-list-burger" onClick={() => setSidebarOpen((open) => !open)} aria-label="باز کردن منو">
              {sidebarOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
            <div className="patients-list-profile">
              <div className="patients-list-avatar">{user?.fullName?.charAt(0) ?? 'م'}</div>
              <div>
                <strong>{loading ? 'در حال بارگذاری…' : user?.fullName ?? 'مهدی عبدالكریمی'}</strong>
                <span>مدیریت هوشمند خدمات پزشکی</span>
              </div>
              <ChevronDown className="patients-list-profile__chevron" size={17} />
            </div>
            <div className="patients-list-header__actions">
              <button className="patients-list-header__icon patients-list-header__icon--notification" aria-label="اعلان‌ها">
                <Bell size={25} strokeWidth={1.7} />
                <span>۳</span>
              </button>
              <span className="patients-list-header__divider" />
              <button className="patients-list-header__icon" aria-label="تقویم"><CalendarDays size={25} strokeWidth={1.7} /></button>
            </div>
          </header>

          <main className="patients-list-main">
            <div className="patients-list-title">
              <div>
                <h2>بیماران</h2>
                <p>مدیریت و مشاهده پرونده بیماران مراجعه‌کننده</p>
              </div>
              <a href="/dashboard" className="patients-list-back-dashboard">
                <ChevronRight size={16} /> بازگشت به داشبورد
              </a>
            </div>

            <section className="patients-list-filter-card">
              <div className="patients-list-filter-row">
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
              </div>
              <div className="patients-list-search">
                <Search size={18} />
                <input
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="جستجو بر اساس کد درخواست، نام، کد ملی یا تلفن..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="patients-list-error">{error}</div>}

            <section className="patients-list-table-card">
              <div className="patients-list-table-meta">
                <strong>فهرست بیماران</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} بیمار ثبت‌شده</span>
              </div>
              <div className="patients-list-table-wrap">
                <table className="patients-list-table">
                  <thead>
                    <tr>
                      <th>کد درخواست</th>
                      <th>نام بیمار</th>
                      <th>کد ملی</th>
                      <th>تلفن</th>
                      <th>سن / جنسیت</th>
                      <th>شهر / کشور</th>
                      <th>نوع تصویربرداری</th>
                      <th>گزارش‌ها</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={10} className="patients-list-empty">در حال دریافت بیماران…</td>
                      </tr>
                    )}
                    {!isLoading && data?.items.map((item) => (
                      <PatientRow key={item.id} item={item} />
                    ))}
                    {!isLoading && data?.items.length === 0 && (
                      <tr>
                        <td colSpan={10} className="patients-list-empty">بیماری با این فیلترها پیدا نشد.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && data && <PatientPagination page={data.page} pages={data.pages} onPageChange={setPage} />}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function PatientRow({ item }: { item: PatientItem }) {
  return (
    <tr>
      <td data-label="کد درخواست" className="patient-code">{item.requestNumber}</td>
      <td data-label="نام بیمار">
        <strong>{item.patientFirstName} {item.patientLastName}</strong>
        <small>{item.imagingArea}</small>
      </td>
      <td data-label="کد ملی">{item.nationalId ?? '—'}</td>
      <td data-label="تلفن">{item.phone}</td>
      <td data-label="سن / جنسیت">
        {item.age ?? '—'} / {genderLabels[item.gender] ?? item.gender}
      </td>
      <td data-label="شهر / کشور">{item.city}، {item.country}</td>
      <td data-label="نوع تصویربرداری">{item.imagingType}</td>
      <td data-label="گزارش‌ها">{(item._count?.reports ?? 0).toLocaleString('fa-IR')}</td>
      <td data-label="وضعیت">
        <span className={`patient-status ${statusClasses[item.status] ?? 'is-reviewing'}`}>
          {statusLabels[item.status] ?? item.status}
        </span>
      </td>
      <td data-label="عملیات">
        <div className="patient-list-actions">
          <a className="patient-list-action patient-list-action--view" href={`/dashboard/patients/${item.id}`} title="پرونده بیمار">
            <Eye size={16} />
          </a>
        </div>
      </td>
    </tr>
  );
}

function PatientPagination({ page, pages, onPageChange }: { page: number; pages: number; onPageChange: (page: number) => void }) {
  const numbers = Array.from({ length: Math.min(pages, 5) }, (_, index) => index + 1);
  return (
    <div className="patients-list-pagination">
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
