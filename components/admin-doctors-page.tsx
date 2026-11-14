'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Award,
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
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2,
  TrendingUp,
  UserCog,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { adminNavItems, formatDate, formatToman } from '@/lib/admin-nav';

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
  biography?: string;
  education?: string;
  certifications?: string;
  languages?: string;
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

const collabLabels: Record<string, string> = {
  approved: 'تأییدشده',
  pending: 'در انتظار بررسی',
  rejected: 'ردشده',
};

const collabClasses: Record<string, string> = {
  approved: 'is-approved',
  pending: 'is-pending',
  rejected: 'is-rejected',
};

export function AdminDoctorsPage() {
  const { user, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<DoctorResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<DoctorItem | null>(null);
  const [detailDoctor, setDetailDoctor] = useState<{ doctor: DoctorItem; stats: any; recentReports: any[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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
      if (!response.ok) throw new Error('دریافت اطلاعات پزشکان ناموفق بود.');
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

  async function loadDoctorDetail(id: string) {
    setDetailLoading(true);
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/doctors/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت جزئیات پزشک ناموفق بود.');
      const result = await response.json();
      setDetailDoctor(result);
    } catch {
      setError('دریافت جزئیات پزشک ناموفق بود.');
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/doctors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? 'عملیات ناموفق بود.');
      } else {
        void loadDoctors();
      }
    } catch {
      setError('عملیات ناموفق بود.');
    }
  }

  async function handleDeleteDoctor(id: string, name: string) {
    if (!window.confirm(`آیا از حذف پزشک «${name}» از سامانه اطمینان دارید؟`)) return;
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/doctors/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? 'حذف پزشک ناموفق بود.');
      } else {
        void loadDoctors();
      }
    } catch {
      setError('خطا در حذف پزشک.');
    }
  }

  return (
    <div className="admin-page-root">
      <div className="admin-page-shell">
        <aside className={`admin-page-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-page-brand">
            <div className="admin-page-brand__mark">
              <Stethoscope size={28} strokeWidth={1.7} />
            </div>
            <div>
              <strong>رادینت</strong>
              <span>پنل مدیریت مرکزی</span>
            </div>
            <button
              className="admin-page-sidebar__close"
              onClick={() => setSidebarOpen(false)}
              style={{ display: sidebarOpen ? 'grid' : 'none' }}
              aria-label="بستن منو"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="admin-page-nav">
            {adminNavItems.map((item) => {
              const isActive = item.href === '/admin/doctors';
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`admin-page-nav__item ${isActive ? 'is-active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={20} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
          <button className="admin-page-nav__logout" onClick={() => void signOut()}>
            <LogOut size={20} strokeWidth={1.8} />
            <span>خروج از حساب</span>
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
              <Stethoscope size={26} strokeWidth={1.7} />
              <span>مدیریت پزشکان و رادیولوژیست‌ها</span>
            </div>
            <div className="admin-page-profile">
              <div className="admin-page-avatar">{user?.fullName?.charAt(0) ?? 'A'}</div>
              <div className="admin-page-user">
                <strong>{user?.fullName ?? 'مدیر سیستم'}</strong>
                <span>مدیر ارشد سامانه</span>
              </div>
              <ChevronDown className="admin-page-profile__chevron" size={17} />
            </div>
            <button className="admin-page-burger" onClick={() => setSidebarOpen(true)} aria-label="منو">
              <Menu size={26} strokeWidth={1.7} />
            </button>
          </header>

          <main className="admin-page-main">
            <div className="admin-page-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2>فهرست پزشکان سامانه</h2>
                <p>بررسی درخواست‌های همکاری، تأیید و رد صلاحیت، تنظیم تعرفه، سقف بار کاری و عملکرد پاسخ‌دهی</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                }}
              >
                <Plus size={18} />
                <span>افزودن پزشک رادیولوژیست</span>
              </button>
            </div>

            <section className="admin-page-filter-card">
              <div className="admin-page-filter-row">
                <label>
                  <span>وضعیت همکاری</span>
                  <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="pending">در انتظار بررسی و تأیید</option>
                    <option value="approved">تأییدشده</option>
                    <option value="rejected">ردشده</option>
                    <option value="active">فعال در چرخه گزارش</option>
                    <option value="inactive">غیرفعال</option>
                  </select>
                </label>
              </div>
              <div className="admin-page-search">
                <Search size={18} />
                <input
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="جستجو بر اساس نام، تخصص، شماره پروانه یا محل کار..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="admin-page-error">{error}</div>}

            <section className="admin-page-table-card">
              <div className="admin-page-table-meta">
                <strong>پزشکان و رادیولوژیست‌ها</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} پزشک</span>
              </div>
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>نام پزشک</th>
                      <th>تخصص</th>
                      <th>محل کار</th>
                      <th>کل گزارش‌ها</th>
                      <th>میانگین پاسخ</th>
                      <th>بار روزانه</th>
                      <th>تعرفه گزارش</th>
                      <th>وضعیت همکاری</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={9} className="admin-page-empty">
                          در حال بارگذاری اطلاعات پزشکان…
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      data &&
                      Array.isArray(data.items) &&
                      data.items.map((doc) => (
                        <tr key={doc.id}>
                          <td data-label="نام پزشک" className="admin-page-user-cell">
                            <strong>{doc.fullName}</strong>
                            <small>{doc.email}</small>
                          </td>
                          <td data-label="تخصص">
                            <span>{doc.specialty || '—'}</span>
                            {doc.subSpecialty && <small style={{ display: 'block', color: '#64748b' }}>{doc.subSpecialty}</small>}
                          </td>
                          <td data-label="محل کار">{doc.workplace || '—'}</td>
                          <td data-label="کل گزارش‌ها">{(doc.stats?.totalReports ?? 0).toLocaleString('fa-IR')}</td>
                          <td data-label="میانگین پاسخ">
                            {doc.stats?.avgResponseHours != null ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#168A68' }}>
                                <Clock size={14} />
                                {Number(doc.stats.avgResponseHours).toLocaleString('fa-IR')} ساعت
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td data-label="بار روزانه">{(doc.maxDailyReports ?? 0).toLocaleString('fa-IR')} گزارش</td>
                          <td data-label="تعرفه">{doc.tariff ? `${formatToman(doc.tariff)} تومان` : '—'}</td>
                          <td data-label="وضعیت همکاری">
                            <span className={`admin-collab-badge ${collabClasses[doc.collaborationStatus] ?? 'is-pending'}`}>
                              {collabLabels[doc.collaborationStatus] ?? doc.collaborationStatus}
                            </span>
                          </td>
                          <td data-label="عملیات">
                            <div className="admin-page-actions">
                              <button
                                className="admin-page-action admin-page-action--view"
                                onClick={() => loadDoctorDetail(doc.id)}
                                title="مشاهده پروفایل و سوابق"
                              >
                                <Eye size={16} />
                              </button>
                              {doc.collaborationStatus === 'pending' && (
                                <>
                                  <button
                                    className="admin-page-action admin-page-action--approve"
                                    onClick={() => handleAction(doc.id, 'approve')}
                                    title="تأیید درخواست همکاری"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    className="admin-page-action admin-page-action--reject"
                                    onClick={() => handleAction(doc.id, 'reject')}
                                    title="رد درخواست همکاری"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                              <button
                                className="admin-page-action admin-page-action--edit"
                                onClick={() => setEditDoctor(doc)}
                                title="تنظیم تعرفه، ظرفیت و پروفایل"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                className="admin-page-action admin-page-action--delete"
                                onClick={() => void handleDeleteDoctor(doc.id, doc.fullName)}
                                title="حذف پزشک"
                                style={{ color: '#ef4444' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {!isLoading && (!data?.items || data.items.length === 0) && (
                      <tr>
                        <td colSpan={9} className="admin-page-empty" style={{ padding: '48px 24px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <Stethoscope size={42} strokeWidth={1.5} style={{ color: '#94a3b8' }} />
                            <p style={{ margin: 0, fontWeight: 500, color: '#64748b' }}>
                              هیچ پزشک رادیولوژیستی با فیلترهای مشخص‌شده یافت نشد.
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowAddModal(true)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                background: '#0284c7',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: 'pointer',
                                marginTop: '4px',
                              }}
                            >
                              <Plus size={16} />
                              <span>افزودن پزشک رادیولوژیست جدید</span>
                            </button>
                          </div>
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

      {showAddModal && (
        <AddDoctorModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            void loadDoctors();
          }}
        />
      )}

      {editDoctor && (
        <EditDoctorModal
          doctor={editDoctor}
          onClose={() => setEditDoctor(null)}
          onSaved={() => {
            setEditDoctor(null);
            void loadDoctors();
          }}
        />
      )}

      {detailDoctor && (
        <DoctorDetailModal
          data={detailDoctor}
          loading={detailLoading}
          onClose={() => setDetailDoctor(null)}
          onApprove={() => {
            void handleAction(detailDoctor.doctor.id, 'approve');
            setDetailDoctor(null);
          }}
          onReject={() => {
            void handleAction(detailDoctor.doctor.id, 'reject');
            setDetailDoctor(null);
          }}
        />
      )}
    </div>
  );
}

function EditDoctorModal({
  doctor,
  onClose,
  onSaved,
}: {
  doctor: DoctorItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState(doctor.fullName ?? '');
  const [email, setEmail] = useState(doctor.email ?? '');
  const [specialty, setSpecialty] = useState(doctor.specialty);
  const [subSpecialty, setSubSpecialty] = useState(doctor.subSpecialty ?? '');
  const [licenseNumber, setLicenseNumber] = useState(doctor.licenseNumber ?? '');
  const [workplace, setWorkplace] = useState(doctor.workplace);
  const [experienceYears, setExperienceYears] = useState(doctor.experienceYears ?? 0);
  const [maxDailyReports, setMaxDailyReports] = useState(doctor.maxDailyReports);
  const [tariff, setTariff] = useState(doctor.tariff);
  const [biography, setBiography] = useState(doctor.biography ?? '');
  const [education, setEducation] = useState(doctor.education ?? '');
  const [certifications, setCertifications] = useState(doctor.certifications ?? '');
  const [languages, setLanguages] = useState(doctor.languages ?? '');
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
          fullName: fullName.trim() || undefined,
          email: email.trim() || undefined,
          specialty,
          subSpecialty: subSpecialty || null,
          licenseNumber: licenseNumber || null,
          workplace,
          experienceYears: Number(experienceYears),
          maxDailyReports: Number(maxDailyReports),
          tariff: Number(tariff),
          biography,
          education,
          certifications,
          languages,
          isActive,
          collaborationStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'ویرایش مشخصات پزشک ناموفق بود.');
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
          <h3>ویرایش پروفایل و تنظیمات پزشک: {doctor.fullName}</h3>
          <button onClick={onClose} aria-label="بستن">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <div className="admin-modal__row">
            <label>
              <span>نام و نام خانوادگی پزشک</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="نام پزشک" />
            </label>
            <label>
              <span>آدرس ایمیل</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ایمیل پزشک" />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>تخصص اصلی</span>
              <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} required placeholder="مثال: رادیولوژی فک و صورت" />
            </label>
            <label>
              <span>فوق تخصص / فلوشیپ</span>
              <input value={subSpecialty} onChange={(e) => setSubSpecialty(e.target.value)} placeholder="مثال: نورورادیولوژی" />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>شماره پروانه نظام پزشکی</span>
              <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="مثال: ۱۲۳۴۵۶" />
            </label>
            <label>
              <span>سابقه طبابت (سال)</span>
              <input
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>محل کار / بیمارستان</span>
              <input value={workplace} onChange={(e) => setWorkplace(e.target.value)} placeholder="مرکز درمانی یا دانشگاه" />
            </label>
            <label>
              <span>سقف گزارش روزانه (بار کاری)</span>
              <input
                type="number"
                min={1}
                max={100}
                value={maxDailyReports}
                onChange={(e) => setMaxDailyReports(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>تعرفه پرداختی به ازای هر گزارش (تومان)</span>
              <input
                type="number"
                min={0}
                value={tariff}
                onChange={(e) => setTariff(Number(e.target.value))}
              />
            </label>
            <label>
              <span>وضعیت همکاری</span>
              <select value={collaborationStatus} onChange={(e) => setCollaborationStatus(e.target.value)}>
                <option value="pending">در انتظار بررسی و تصمیم‌گیری</option>
                <option value="approved">تأییدشده</option>
                <option value="rejected">ردشده</option>
              </select>
            </label>
          </div>
          <label>
            <span>سوابق تحصیلی و دانشگاهی</span>
            <input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="مدارک تحصیلی و دانشگاه محل اخذ" />
          </label>
          <label>
            <span>گواهینامه‌ها و دوره‌های تخصصی</span>
            <input value={certifications} onChange={(e) => setCertifications(e.target.value)} placeholder="مدارک علمی و سرتیفیکیت‌ها" />
          </label>
          <label>
            <span>شرح حال تخصصی و بیوگرافی</span>
            <textarea
              rows={3}
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="خلاصه سوابق حرفه‌ای پزشک..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </label>
          <label className="admin-modal__checkbox">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>پزشک فعال است (مجاز به دریافت و ارجاع کیس)</span>
          </label>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">
              انصراف
            </button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DoctorDetailModal({
  data,
  loading,
  onClose,
  onApprove,
  onReject,
}: {
  data: { doctor: DoctorItem; stats: any; recentReports: any[] };
  loading: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (loading || !data) return null;
  const { doctor, stats, recentReports } = data;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>پرونده تخصصی پزشک: {doctor.fullName}</h3>
          <button onClick={onClose} aria-label="بستن">
            <X size={20} />
          </button>
        </div>
        <div className="admin-modal__body">
          <div className="admin-detail-section">
            <h4>اطلاعات هویتی و پروانه طبابت</h4>
            <div className="admin-detail-grid">
              <div>
                <span>نام و نام خانوادگی</span>
                <strong>{doctor.fullName}</strong>
              </div>
              <div>
                <span>ایمیل</span>
                <strong>{doctor.email}</strong>
              </div>
              <div>
                <span>تخصص</span>
                <strong>{doctor.specialty || '—'}</strong>
              </div>
              <div>
                <span>فوق تخصص</span>
                <strong>{doctor.subSpecialty || '—'}</strong>
              </div>
              <div>
                <span>شماره پروانه</span>
                <strong>{doctor.licenseNumber || '—'}</strong>
              </div>
              <div>
                <span>محل کار</span>
                <strong>{doctor.workplace || '—'}</strong>
              </div>
              <div>
                <span>وضعیت همکاری</span>
                <span className={`admin-collab-badge ${collabClasses[doctor.collaborationStatus] ?? 'is-pending'}`}>
                  {collabLabels[doctor.collaborationStatus] ?? doctor.collaborationStatus}
                </span>
              </div>
              <div>
                <span>تعرفه مصوب</span>
                <strong>{doctor.tariff ? `${formatToman(doctor.tariff)} تومان` : 'تعیین‌نشده'}</strong>
              </div>
            </div>
          </div>

          <div className="admin-detail-section">
            <h4>شاخص‌های عملکردی واقعی</h4>
            <div className="admin-detail-stats">
              <div className="admin-detail-stat">
                <FileText size={20} />
                <strong>{(stats?.totalReports ?? 0).toLocaleString('fa-IR')}</strong>
                <span>کل گزارش‌ها</span>
              </div>
              <div className="admin-detail-stat">
                <Check size={20} />
                <strong>{(stats?.signedReports ?? 0).toLocaleString('fa-IR')}</strong>
                <span>امضاشده</span>
              </div>
              <div className="admin-detail-stat">
                <Clock size={20} />
                <strong>{(doctor.maxDailyReports ?? 0).toLocaleString('fa-IR')}</strong>
                <span>ظرفیت روزانه</span>
              </div>
            </div>
          </div>

          {(doctor.education || doctor.certifications || doctor.biography) && (
            <div className="admin-detail-section">
              <h4>مدارک، تحصیلات و سوابق</h4>
              {doctor.education && (
                <p style={{ margin: '4px 0', fontSize: '13px' }}>
                  <strong>تحصیلات:</strong> {doctor.education}
                </p>
              )}
              {doctor.certifications && (
                <p style={{ margin: '4px 0', fontSize: '13px' }}>
                  <strong>گواهینامه‌ها:</strong> {doctor.certifications}
                </p>
              )}
              {doctor.biography && (
                <p style={{ margin: '6px 0', fontSize: '13px', color: '#475569' }}>
                  {doctor.biography}
                </p>
              )}
            </div>
          )}

          {recentReports && recentReports.length > 0 && (
            <div className="admin-detail-section">
              <h4>آخرین گزارش‌های ارائه‌شده</h4>
              <ul className="admin-detail-list">
                {recentReports.map((r: any) => (
                  <li key={r.id}>
                    <span className="admin-detail-list__dot" style={{ background: r.signed ? '#168A68' : '#C9973E' }} />
                    <div>
                      <strong>درخواست {r.request?.requestNumber ?? '—'} ({r.request?.imagingType ?? ''})</strong>
                      <span>
                        بیمار: {r.request?.patientFirstName} {r.request?.patientLastName} · {r.signed ? 'امضاشده' : 'پیش‌نویس'}
                      </span>
                    </div>
                    <time>{formatDate(r.createdAt)}</time>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {doctor.collaborationStatus === 'pending' && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onReject}
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                رد درخواست همکاری
              </button>
              <button
                type="button"
                onClick={onApprove}
                style={{
                  background: '#168A68',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                تأیید صلاحیت و شروع همکاری
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddDoctorModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('متخصص رادیولوژی و تله‌ریپورت');
  const [subSpecialty, setSubSpecialty] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [workplace, setWorkplace] = useState('مرکز تله‌رادیولوژی رادینت');
  const [experienceYears, setExperienceYears] = useState(5);
  const [maxDailyReports, setMaxDailyReports] = useState(20);
  const [tariff, setTariff] = useState(950000);
  const [biography, setBiography] = useState('');
  const [education, setEducation] = useState('');
  const [certifications, setCertifications] = useState('');
  const [languages, setLanguages] = useState('فارسی');
  const [isActive, setIsActive] = useState(true);
  const [collaborationStatus, setCollaborationStatus] = useState('approved');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('نام و نام خانوادگی الزامی است.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim() || undefined,
          specialty: specialty.trim(),
          subSpecialty: subSpecialty.trim() || null,
          licenseNumber: licenseNumber.trim() || null,
          workplace: workplace.trim(),
          experienceYears: Number(experienceYears),
          maxDailyReports: Number(maxDailyReports),
          tariff: Number(tariff),
          biography: biography.trim(),
          education: education.trim(),
          certifications: certifications.trim(),
          languages: languages.trim(),
          isActive,
          collaborationStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'ثبت مشخصات پزشک ناموفق بود.');
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
          <h3>افزودن پزشک رادیولوژیست جدید</h3>
          <button onClick={onClose} aria-label="بستن">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <div className="admin-modal__row">
            <label>
              <span>نام و نام خانوادگی پزشک *</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="مثال: دکتر مهدی عبدالکریمی"
              />
            </label>
            <label>
              <span>آدرس ایمیل</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="مثال: dr.karimi@example.com"
              />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>تخصص اصلی *</span>
              <input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
                placeholder="مثال: متخصص رادیولوژی و تله‌ریپورت"
              />
            </label>
            <label>
              <span>فوق تخصص / فلوشیپ</span>
              <input
                value={subSpecialty}
                onChange={(e) => setSubSpecialty(e.target.value)}
                placeholder="مثال: نورورادیولوژی، ماسکولواسکلتال"
              />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>شماره نظام پزشکی</span>
              <input
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="مثال: ۱۲۳۴۵۶"
              />
            </label>
            <label>
              <span>سابقه طبابت (سال)</span>
              <input
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>محل خدمت / بیمارستان</span>
              <input
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value)}
                placeholder="مثال: مرکز تله‌رادیولوژی رادینت"
              />
            </label>
            <label>
              <span>سقف گزارش روزانه (بار کاری)</span>
              <input
                type="number"
                min={1}
                max={100}
                value={maxDailyReports}
                onChange={(e) => setMaxDailyReports(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>تعرفه به ازای هر گزارش (تومان)</span>
              <input
                type="number"
                min={0}
                value={tariff}
                onChange={(e) => setTariff(Number(e.target.value))}
              />
            </label>
            <label>
              <span>وضعیت همکاری</span>
              <select value={collaborationStatus} onChange={(e) => setCollaborationStatus(e.target.value)}>
                <option value="approved">تأییدشده و فعال در چرخه ارجاع</option>
                <option value="pending">در انتظار بررسی</option>
                <option value="rejected">ردشده</option>
              </select>
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>سوابق تحصیلی و دانشگاهی</span>
              <input
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="مثال: دکتری تخصصی رادیولوژی دانشگاه تهران"
              />
            </label>
            <label>
              <span>زبان‌ها</span>
              <input
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="مثال: فارسی، انگلیسی"
              />
            </label>
          </div>
          <label>
            <span>گواهینامه‌ها و دوره‌های تخصصی</span>
            <input
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              placeholder="مثال: دوره تخصصی MRI پیشرفته، بورد تخصصی رادیولوژی"
            />
          </label>
          <label>
            <span>شرح حال تخصصی و بیوگرافی</span>
            <textarea
              rows={3}
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="توضیحات و معرفی پزشک..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </label>
          <label className="admin-modal__checkbox">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>پزشک فعال است (مجاز به دریافت و ارجاع پرونده)</span>
          </label>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">
              انصراف
            </button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ثبت…' : 'افزودن و ثبت پزشک'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
