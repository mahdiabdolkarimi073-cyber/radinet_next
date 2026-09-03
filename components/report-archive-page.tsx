'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Search,
  Settings,
  Stethoscope,
  UsersRound,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type ArchiveReport = {
  id: string;
  status: string;
  signed: boolean;
  signatureName: string | null;
  signedAt: string | null;
  findings: string;
  conclusion: string;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; fullName: string } | null;
  images?: Array<{ id: string; originalName: string; storedName: string; mimeType: string }>;
  request?: {
    id: string;
    requestNumber: string;
    patientFirstName: string;
    patientLastName: string;
    imagingType: string;
    imagingArea: string;
    status: string;
    createdAt: string;
  } | null;
};

type ArchiveResponse = {
  items: ArchiveReport[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  stats: {
    total: number;
    draft: number;
    final: number;
    signed: number;
  };
};

type FilterValues = {
  status: string;
  search: string;
  from: string;
  to: string;
};

const initialFilters: FilterValues = { status: 'all', search: '', from: '', to: '' };

const navItems = [
  { label: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { label: 'درخواست‌های ارجاعی', href: '/dashboard/referrals', icon: ClipboardList },
  { label: 'گزارش‌ها', href: '/dashboard/reports', icon: FileText },
  { label: 'بیماران', href: '/dashboard/patients', icon: UsersRound },
  { label: 'درخواست اطلاعات تکمیلی', href: '/dashboard/info-requests', icon: MessageCircleQuestion },
  { label: 'آرشیو گزارش‌ها', href: '/dashboard/report-archive', icon: Archive, active: true },
  { label: 'پروفایل تخصصی', href: '/dashboard/doctor-profile', icon: Settings },
];

const statusLabels: Record<string, string> = {
  draft: 'پیش‌نویس',
  final: 'نهایی شده',
};

const statusClasses: Record<string, string> = {
  draft: 'is-draft',
  final: 'is-final',
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function ReportArchivePage() {
  const { user, loading, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<ArchiveResponse | null>(null);
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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/dashboard/report-archive?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت آرشیو گزارش‌ها ناموفق بود.');
      const result = (await response.json()) as ArchiveResponse;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function updateFilter(key: keyof FilterValues, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const stats = [
    { label: 'کل گزارش‌ها', value: data?.stats.total ?? 0, tone: 'total', icon: FileText },
    { label: 'پیش‌نویس', value: data?.stats.draft ?? 0, tone: 'draft', icon: FileText },
    { label: 'نهایی شده', value: data?.stats.final ?? 0, tone: 'final', icon: FileText },
    { label: 'امضا شده', value: data?.stats.signed ?? 0, tone: 'signed', icon: FileText },
  ];

  return (
    <div className="report-archive-root">
      <div className="report-archive-shell">
        <aside className={`report-archive-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="report-archive-brand">
            <div className="report-archive-brand__mark"><Stethoscope size={29} strokeWidth={1.7} /></div>
            <div>
              <strong>داشبورد</strong>
              <span>سامانه مدیریت خدمات پزشکی</span>
            </div>
          </div>
          <nav className="report-archive-nav" aria-label="منوی داشبورد">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className={`report-archive-nav-item ${item.active ? 'is-active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="report-archive-nav-item--logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج از حساب</span>
          </button>
        </aside>

        {sidebarOpen && <div className="report-archive-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="report-archive-content">
          <header className="report-archive-header">
            <button className="report-archive-burger" onClick={() => setSidebarOpen((open) => !open)} aria-label="باز کردن منو">
              {sidebarOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
            <div className="report-archive-profile">
              <div className="report-archive-avatar">{user?.fullName?.charAt(0) ?? 'م'}</div>
              <div>
                <strong>{loading ? 'در حال بارگذاری…' : user?.fullName ?? 'مهدی عبدالكریمی'}</strong>
                <span>مدیریت هوشمند خدمات پزشکی</span>
              </div>
              <ChevronDown className="report-archive-profile__chevron" size={17} />
            </div>
            <div className="report-archive-header__actions">
              <button className="report-archive-header__icon report-archive-header__icon--notification" aria-label="اعلان‌ها">
                <Bell size={25} strokeWidth={1.7} />
                <span>۳</span>
              </button>
              <span className="report-archive-header__divider" />
              <button className="report-archive-header__icon" aria-label="تقویم"><CalendarDays size={25} strokeWidth={1.7} /></button>
            </div>
          </header>

          <main className="report-archive-main">
            <div className="report-archive-title">
              <div>
                <h2>آرشیو گزارش‌های قبلی</h2>
                <p>مشاهده، جستجو و مدیریت تمامی گزارش‌های ثبت‌شده توسط شما</p>
              </div>
              <a href="/dashboard" className="report-archive-back-dashboard">
                <ChevronRight size={16} /> بازگشت به داشبورد
              </a>
            </div>

            <section className="report-archive-stats">
              {stats.map((stat) => (
                <article className={`report-archive-stat report-archive-stat--${stat.tone}`} key={stat.label}>
                  <div className="report-archive-stat__top">
                    <span>{stat.label}</span>
                    <div className="report-archive-stat__icon"><stat.icon size={24} strokeWidth={1.8} /></div>
                  </div>
                  <strong>{stat.value.toLocaleString('fa-IR')}</strong>
                </article>
              ))}
            </section>

            <section className="report-archive-filter-card">
              <div className="report-archive-filter-row">
                <label>
                  <span>وضعیت گزارش</span>
                  <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="draft">پیش‌نویس</option>
                    <option value="final">نهایی شده</option>
                  </select>
                </label>
                <label>
                  <span>از تاریخ</span>
                  <div className="report-archive-date-input">
                    <CalendarDays size={18} />
                    <input type="date" value={filters.from} onChange={(event) => updateFilter('from', event.target.value)} />
                  </div>
                </label>
                <label>
                  <span>تا تاریخ</span>
                  <div className="report-archive-date-input">
                    <CalendarDays size={18} />
                    <input type="date" value={filters.to} onChange={(event) => updateFilter('to', event.target.value)} />
                  </div>
                </label>
              </div>
              <div className="report-archive-search">
                <Search size={18} />
                <input
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="جستجو بر اساس کد درخواست، نام بیمار، یافته‌ها یا نتیجه‌گیری..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="report-archive-error">{error}</div>}

            <section className="report-archive-table-card">
              <div className="report-archive-table-meta">
                <strong>فهرست آرشیو گزارش‌ها</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} گزارش ثبت‌شده</span>
              </div>
              <div className="report-archive-table-wrap">
                <table className="report-archive-table">
                  <thead>
                    <tr>
                      <th>کد درخواست</th>
                      <th>بیمار</th>
                      <th>نوع تصویربرداری</th>
                      <th>تاریخ ایجاد</th>
                      <th>تاریخ به‌روزرسانی</th>
                      <th>وضعیت</th>
                      <th>امضا</th>
                      <th>تصاویر</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td colSpan={9} className="report-archive-empty">در حال دریافت گزارش‌ها…</td></tr>
                    )}
                    {!isLoading && data?.items.map((item) => (
                      <ArchiveRow key={item.id} item={item} />
                    ))}
                    {!isLoading && data?.items.length === 0 && (
                      <tr><td colSpan={9} className="report-archive-empty">گزارشی با این فیلترها پیدا نشد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && data && <ArchivePagination page={data.page} pages={data.pages} onPageChange={setPage} />}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function ArchiveRow({ item }: { item: ArchiveReport }) {
  const patientName = item.request
    ? `${item.request.patientFirstName} ${item.request.patientLastName}`
    : '—';

  return (
    <tr>
      <td data-label="کد درخواست" className="archive-code">{item.request?.requestNumber ?? '—'}</td>
      <td data-label="بیمار">
        <strong>{patientName}</strong>
        <small>{item.request?.imagingArea ?? '—'}</small>
      </td>
      <td data-label="نوع تصویربرداری">{item.request?.imagingType ?? '—'}</td>
      <td data-label="تاریخ ایجاد">{formatDateTime(item.createdAt)}</td>
      <td data-label="تاریخ به‌روزرسانی">{formatDateTime(item.updatedAt)}</td>
      <td data-label="وضعیت">
        <span className={`archive-status ${statusClasses[item.status] ?? 'is-draft'}`}>
          {statusLabels[item.status] ?? item.status}
        </span>
      </td>
      <td data-label="امضا">
        {item.signed ? (
          <span className="archive-signed-badge">امضا شده</span>
        ) : (
          <span className="archive-unsigned-badge">بدون امضا</span>
        )}
      </td>
      <td data-label="تصاویر">
        {item.images && item.images.length > 0 ? `${item.images.length} تصویر` : '—'}
      </td>
      <td data-label="عملیات">
        <div className="archive-actions">
          <a className="archive-action archive-action--view" href={`/dashboard/reports/${item.id}`} title="مشاهده گزارش">
            <FileText size={16} />
          </a>
          {item.request && (
            <a className="archive-action archive-action--patient" href={`/dashboard/patients/${item.request.id}`} title="پرونده بیمار">
              <UsersRound size={16} />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}

function ArchivePagination({ page, pages, onPageChange }: { page: number; pages: number; onPageChange: (page: number) => void }) {
  const numbers = Array.from({ length: Math.min(pages, 5) }, (_, index) => index + 1);
  return (
    <div className="report-archive-pagination">
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
