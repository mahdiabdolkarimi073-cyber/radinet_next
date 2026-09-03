'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  FilePlus2,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Search,
  Stethoscope,
  UserCog,
  UsersRound,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type ReportItem = {
  id: string;
  status: string;
  signed: boolean;
  signatureName: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; fullName: string } | null;
  request?: {
    id: string;
    requestNumber: string;
    patientFirstName: string;
    patientLastName: string;
    imagingType: string;
    imagingArea: string;
  } | null;
};

type ReportResponse = {
  items: ReportItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type FilterValues = {
  status: string;
  search: string;
};

const initialFilters: FilterValues = { status: 'all', search: '' };

const navItems = [
  { label: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { label: 'درخواست‌های ارجاعی', href: '/dashboard/referrals', icon: ClipboardList },
  { label: 'گزارش‌ها', href: '/dashboard/reports', icon: FileText, active: true },
  { label: 'بیماران', href: '/dashboard/patients', icon: UsersRound },
  { label: 'درخواست اطلاعات تکمیلی', href: '/dashboard/info-requests', icon: MessageCircleQuestion },
  { label: 'آرشیو گزارش‌ها', href: '/dashboard/report-archive', icon: Archive },
  { label: 'پروفایل تخصصی', href: '/dashboard/doctor-profile', icon: UserCog },
];

const statusLabels: Record<string, string> = {
  draft: 'پیش‌نویس',
  final: 'نهایی شده',
};

const statusClasses: Record<string, string> = {
  draft: 'is-draft',
  final: 'is-final',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function ReportsListPage() {
  const { user, loading, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<ReportResponse | null>(null);
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

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/dashboard/reports/list?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت گزارش‌ها ناموفق بود.');
      const result = (await response.json()) as ReportResponse;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  function updateFilter(key: keyof FilterValues, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="reports-list-root">
      <div className="reports-list-shell">
        <aside className={`reports-list-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="reports-list-brand">
            <div className="reports-list-brand__mark"><Stethoscope size={29} strokeWidth={1.7} /></div>
            <div>
              <strong>داشبورد</strong>
              <span>سامانه مدیریت خدمات پزشکی</span>
            </div>
          </div>
          <nav className="reports-list-nav" aria-label="منوی داشبورد">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`reports-list-nav-item ${item.active ? 'is-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="reports-list-nav-item--logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج از حساب</span>
          </button>
        </aside>

        {sidebarOpen && <div className="reports-list-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="reports-list-content">
          <header className="reports-list-header">
            <button className="reports-list-burger" onClick={() => setSidebarOpen((open) => !open)} aria-label="باز کردن منو">
              {sidebarOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
            <div className="reports-list-profile">
              <div className="reports-list-avatar">{user?.fullName?.charAt(0) ?? 'م'}</div>
              <div>
                <strong>{loading ? 'در حال بارگذاری…' : user?.fullName ?? 'مهدی عبدالكریمی'}</strong>
                <span>مدیریت هوشمند خدمات پزشکی</span>
              </div>
              <ChevronDown className="reports-list-profile__chevron" size={17} />
            </div>
            <div className="reports-list-header__actions">
              <button className="reports-list-header__icon" aria-label="تقویم"><CalendarDays size={25} strokeWidth={1.7} /></button>
            </div>
          </header>

          <main className="reports-list-main">
            <div className="reports-list-title">
              <div>
                <h2>گزارش‌های رادیولوژی</h2>
                <p>مدیریت و بررسی گزارش‌های تخصصی تصویربرداری</p>
              </div>
              <a href="/dashboard" className="reports-list-back-dashboard">
                <ChevronRight size={16} /> بازگشت به داشبورد
              </a>
            </div>

            <section className="reports-list-filter-card">
              <div className="reports-list-filter-row">
                <label>
                  <span>وضعیت گزارش</span>
                  <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="draft">پیش‌نویس</option>
                    <option value="final">نهایی شده</option>
                  </select>
                </label>
              </div>
              <div className="reports-list-search">
                <Search size={18} />
                <input
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="جستجو بر اساس کد درخواست، نام بیمار یا محتوای گزارش..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="reports-list-error">{error}</div>}

            <section className="reports-list-table-card">
              <div className="reports-list-table-meta">
                <strong>فهرست گزارش‌ها</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} گزارش ثبت‌شده</span>
              </div>
              <div className="reports-list-table-wrap">
                <table className="reports-list-table">
                  <thead>
                    <tr>
                      <th>کد درخواست</th>
                      <th>بیمار</th>
                      <th>نوع تصویربرداری</th>
                      <th>نویسنده</th>
                      <th>تاریخ به‌روزرسانی</th>
                      <th>وضعیت</th>
                      <th>امضا</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={8} className="reports-list-empty">در حال دریافت گزارش‌ها…</td>
                      </tr>
                    )}
                    {!isLoading && data?.items.map((item) => (
                      <ReportRow key={item.id} item={item} />
                    ))}
                    {!isLoading && data?.items.length === 0 && (
                      <tr>
                        <td colSpan={8} className="reports-list-empty">گزارشی با این فیلترها پیدا نشد.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && data && <ReportPagination page={data.page} pages={data.pages} onPageChange={setPage} />}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function ReportRow({ item }: { item: ReportItem }) {
  const patientName = item.request
    ? `${item.request.patientFirstName} ${item.request.patientLastName}`
    : '—';

  return (
    <tr>
      <td data-label="کد درخواست" className="report-code">{item.request?.requestNumber ?? '—'}</td>
      <td data-label="بیمار">
        <strong>{patientName}</strong>
        <small>{item.request?.imagingArea ?? '—'}</small>
      </td>
      <td data-label="نوع تصویربرداری">{item.request?.imagingType ?? '—'}</td>
      <td data-label="نویسنده">{item.author?.fullName ?? '—'}</td>
      <td data-label="تاریخ به‌روزرسانی">{formatDateTime(item.updatedAt)}</td>
      <td data-label="وضعیت">
        <span className={`report-status ${statusClasses[item.status] ?? 'is-draft'}`}>
          {statusLabels[item.status] ?? item.status}
        </span>
      </td>
      <td data-label="امضا">
        {item.signed ? (
          <span className="report-signed-badge">مهر و امضا شده</span>
        ) : (
          <span className="report-unsigned-badge">بدون امضا</span>
        )}
      </td>
      <td data-label="عملیات">
        <div className="report-list-actions">
          <a className="report-list-action report-list-action--view" href={`/dashboard/reports/${item.id}`} title="ویرایش گزارش">
            <FileText size={16} />
          </a>
          {item.request && (
            <a className="report-list-action report-list-action--patient" href={`/dashboard/patients/${item.request.id}`} title="پرونده بیمار">
              <UsersRound size={16} />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}

function ReportPagination({ page, pages, onPageChange }: { page: number; pages: number; onPageChange: (page: number) => void }) {
  const numbers = Array.from({ length: Math.min(pages, 5) }, (_, index) => index + 1);
  return (
    <div className="reports-list-pagination">
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
