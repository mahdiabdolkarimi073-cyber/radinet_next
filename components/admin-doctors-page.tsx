'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  UserCog,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type DoctorItem = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  specialty: string;
  subSpecialty: string | null;
  licenseNumber: string | null;
  workplace: string;
  experienceYears: number;
  maxDailyReports: number;
  tariff: number;
  isActive: boolean;
  collaborationStatus: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; role: string; status: string; country: string };
  stats: {
    totalReports: number;
    signedReports: number;
    completedReports: number;
    avgResponseHours: number | null;
  };
};

type DoctorResponse = {
  items: DoctorItem[];
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
  { label: 'داشبورد', href: '/admin', icon: LayoutDashboard },
  { label: 'کاربران', href: '/admin/users', icon: Activity },
  { label: 'پزشکان', href: '/admin/doctors', icon: Stethoscope, active: true },
  { label: 'گزارش‌ها', href: '/admin', icon: ShieldCheck },
];

const collabLabels: Record<string, string> = {
  approved: 'تأییدشده',
  pending: 'در انتظار',
  rejected: 'ردشده',
};

const collabClasses: Record<string, string> = {
  approved: 'is-approved',
  pending: 'is-pending',
  rejected: 'is-rejected',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function AdminDoctorsPage() {
  const { user, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<DoctorResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<DoctorItem | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters, page]);

  const loadDoctors = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/doctors?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت پزشکان ناموفق بود.');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadDoctors();
  }, [loadDoctors]);

  function updateFilter(key: keyof FilterValues, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      await fetch(`/api/admin/doctors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action }),
      });
      void loadDoctors();
    } catch {
      setError('عملیات ناموفق بود.');
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
              <Stethoscope size={26} strokeWidth={1.7} />
              <span>مدیریت پزشکان</span>
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
                <h2>مدیریت پزشکان</h2>
                <p>مشاهده فهرست پزشکان، تأیید یا رد همکاری، مدیریت پروفایل، تعرفه و بار کاری</p>
              </div>
            </div>

            <section className="admin-page-filter-card">
              <div className="admin-page-filter-row">
                <label>
                  <span>وضعیت همکاری</span>
                  <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
                    <option value="all">همه</option>
                    <option value="pending">در انتظار تأیید</option>
                    <option value="approved">تأییدشده</option>
                    <option value="rejected">ردشده</option>
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
                  placeholder="جستجو بر اساس نام، تخصص یا محل کار..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="admin-page-error">{error}</div>}

            <section className="admin-page-table-card">
              <div className="admin-page-table-meta">
                <strong>فهرست پزشکان</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} پزشک</span>
              </div>
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>نام پزشک</th>
                      <th>تخصص</th>
                      <th>محل کار</th>
                      <th>گزارش‌ها</th>
                      <th>میانگین پاسخ</th>
                      <th>بار روزانه</th>
                      <th>تعرفه</th>
                      <th>وضعیت همکاری</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td colSpan={9} className="admin-page-empty">در حال دریافت پزشکان…</td></tr>
                    )}
                    {!isLoading && data?.items.map((doc) => (
                      <tr key={doc.id}>
                        <td data-label="نام پزشک" className="admin-page-user-cell">
                          <strong>{doc.fullName}</strong>
                          <small>{doc.email}</small>
                        </td>
                        <td data-label="تخصص">{doc.specialty || '—'}</td>
                        <td data-label="محل کار">{doc.workplace || '—'}</td>
                        <td data-label="گزارش‌ها">{doc.stats.totalReports.toLocaleString('fa-IR')}</td>
                        <td data-label="میانگین پاسخ">
                          {doc.stats.avgResponseHours !== null ? `${doc.stats.avgResponseHours.toLocaleString('fa-IR')} ساعت` : '—'}
                        </td>
                        <td data-label="بار روزانه">{doc.maxDailyReports.toLocaleString('fa-IR')}</td>
                        <td data-label="تعرفه">{doc.tariff ? doc.tariff.toLocaleString('fa-IR') : '—'}</td>
                        <td data-label="وضعیت همکاری">
                          <span className={`admin-collab-badge ${collabClasses[doc.collaborationStatus] ?? 'is-pending'}`}>
                            {collabLabels[doc.collaborationStatus] ?? doc.collaborationStatus}
                          </span>
                        </td>
                        <td data-label="عملیات">
                          <div className="admin-page-actions">
                            {doc.collaborationStatus === 'pending' && (
                              <>
                                <button className="admin-page-action admin-page-action--approve" onClick={() => handleAction(doc.id, 'approve')} title="تأیید">
                                  <Check size={16} />
                                </button>
                                <button className="admin-page-action admin-page-action--reject" onClick={() => handleAction(doc.id, 'reject')} title="رد">
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            <button className="admin-page-action admin-page-action--edit" onClick={() => setEditDoctor(doc)} title="ویرایش">
                              <Edit3 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && data?.items.length === 0 && (
                      <tr><td colSpan={9} className="admin-page-empty">پزشکی با این فیلترها پیدا نشد.</td></tr>
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

      {editDoctor && (
        <EditDoctorModal doctor={editDoctor} onClose={() => setEditDoctor(null)} onSaved={() => { setEditDoctor(null); void loadDoctors(); }} />
      )}
    </div>
  );
}

function EditDoctorModal({ doctor, onClose, onSaved }: { doctor: DoctorItem; onClose: () => void; onSaved: () => void }) {
  const [specialty, setSpecialty] = useState(doctor.specialty);
  const [licenseNumber, setLicenseNumber] = useState(doctor.licenseNumber ?? '');
  const [workplace, setWorkplace] = useState(doctor.workplace);
  const [maxDailyReports, setMaxDailyReports] = useState(doctor.maxDailyReports);
  const [tariff, setTariff] = useState(doctor.tariff);
  const [isActive, setIsActive] = useState(doctor.isActive);
  const [collaborationStatus, setCollaborationStatus] = useState(doctor.collaborationStatus);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/doctors/${doctor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          specialty,
          licenseNumber,
          workplace,
          maxDailyReports: Number(maxDailyReports),
          tariff: Number(tariff),
          isActive,
          collaborationStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'ویرایش پزشک ناموفق بود.');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>ویرایش پزشک: {doctor.fullName}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <div className="admin-modal__row">
            <label>
              <span>تخصص</span>
              <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="مثال: رادیولوژی" />
            </label>
            <label>
              <span>شماره پروانه</span>
              <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="شماره پروانه طب" />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>محل کار</span>
              <input value={workplace} onChange={(e) => setWorkplace(e.target.value)} placeholder="بیمارستان یا مرکز" />
            </label>
            <label>
              <span>حداکثر گزارش روزانه</span>
              <input type="number" min={1} max={100} value={maxDailyReports} onChange={(e) => setMaxDailyReports(Number(e.target.value))} />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>تعرفه (تومان)</span>
              <input type="number" min={0} value={tariff} onChange={(e) => setTariff(Number(e.target.value))} />
            </label>
            <label>
              <span>وضعیت همکاری</span>
              <select value={collaborationStatus} onChange={(e) => setCollaborationStatus(e.target.value)}>
                <option value="pending">در انتظار</option>
                <option value="approved">تأییدشده</option>
                <option value="rejected">ردشده</option>
              </select>
            </label>
          </div>
          <label className="admin-modal__checkbox">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>پزشک فعال است</span>
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
