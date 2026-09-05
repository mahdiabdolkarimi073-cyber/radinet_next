'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  Building2,
  ShoppingCart,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type RequestItem = {
  id: string;
  requestNumber: string;
  patientFirstName: string;
  patientLastName: string;
  phone: string;
  nationalId: string | null;
  imagingType: string;
  city: string;
  status: string;
  createdAt: string;
  attachments: { id: string; originalName: string; mimeType: string; size: number }[];
  reports: { id: string; status: string; signed: boolean; authorId: string; author: { id: string; fullName: string } }[];
  _count: { infoRequests: number };
};

type RequestResponse = {
  items: RequestItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type DoctorItem = {
  id: string;
  fullName: string;
  specialty: string;
};

type Tariff = {
  id: string;
  name: string;
  imagingType: string;
  description: string;
  price: number;
  currency: string;
  aiAnalysisEnabled: boolean;
  aiAnalysisPrice: number;
  rushEnabled: boolean;
  rushPrice: number;
  isActive: boolean;
  displayOrder: number;
};

type FilterValues = {
  status: string;
  imagingType: string;
  search: string;
};

const initialFilters: FilterValues = { status: 'all', imagingType: 'all', search: '' };

const navItems = [
  { label: 'داشبورد', href: '/admin', icon: LayoutDashboard },
  { label: 'کاربران', href: '/admin/users', icon: Users },
  { label: 'پزشکان', href: '/admin/doctors', icon: Stethoscope },
  { label: 'مراکز تصویربرداری', href: '/admin/imaging-centers', icon: Building2 },
  { label: 'سازمان‌ها', href: '/admin/organizations', icon: Building2 },
  { label: 'محصولات فروشگاه', href: '/admin/shop-products', icon: Package },
  { label: 'سفارش‌های فروشگاه', href: '/admin/shop-orders', icon: ShoppingCart },
  { label: 'درخواست‌های تله‌ریپورت', href: '/admin/tele-reports', icon: FileText, active: true },
];

const statusLabels: Record<string, string> = {
  new: 'جدید',
  assigned: 'اختصاص‌یافته',
  in_progress: 'در حال انجام',
  completed: 'تکمیل‌شده',
  cancelled: 'لغوشده',
};

const statusColors: Record<string, string> = {
  new: '#C9973E',
  assigned: '#1456c3',
  in_progress: '#7c3aed',
  completed: '#168a68',
  cancelled: '#dc2626',
};

const imagingTypeLabels: Record<string, string> = {
  MRI: 'MRI',
  CT: 'CT Scan',
  'CT-Scan': 'CT Scan',
  'X-Ray': 'X-Ray',
  Ultrasound: 'سونوگرافی',
  Mammography: 'ماموگرافی',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

function formatToman(n: number): string {
  return n.toLocaleString('fa-IR');
}

export function AdminTeleReportsPage() {
  const { user, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<RequestResponse | null>(null);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailData, setDetailData] = useState<RequestItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [assignRequest, setAssignRequest] = useState<RequestItem | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
    });
    return params.toString();
  }, [filters, page]);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/tele-reports?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت درخواست‌ها ناموفق بود.');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const loadDoctors = useCallback(async () => {
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/admin/doctors?limit=50&status=approved', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (response.ok) {
        const result = await response.json();
        const items = Array.isArray(result) ? result : result.items ?? [];
        setDoctors(items.map((d: any) => ({ id: d.id, fullName: d.fullName, specialty: d.specialty ?? '' })));
      }
    } catch {
      // silent
    }
  }, []);

  const loadTariffs = useCallback(async () => {
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/admin/tele-reports/tariffs', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (response.ok) {
        const result = await response.json();
        setTariffs(Array.isArray(result) ? result : []);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    void loadDoctors();
    void loadTariffs();
  }, [loadDoctors, loadTariffs]);

  function updateFilter(key: keyof FilterValues, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function loadRequestDetail(id: string) {
    setDetailLoading(true);
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/tele-reports/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت اطلاعات درخواست ناموفق بود.');
      const result = await response.json();
      setDetailData(result);
    } catch {
      setError('دریافت اطلاعات درخواست ناموفق بود.');
    } finally {
      setDetailLoading(false);
    }
  }

  async function toggleAiTariff(tariff: Tariff, approve: boolean) {
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const url = `/api/admin/tele-reports/tariffs/${tariff.id}?action=${approve ? 'approve-ai' : 'reject-ai'}`;
      await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
        cache: 'no-store',
      });
      void loadTariffs();
    } catch {
      // silent
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
              <FileText size={26} strokeWidth={1.7} />
              <span>مدیریت درخواست‌های تله‌ریپورت</span>
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
                <h2>مدیریت درخواست‌های تله‌ریپورت</h2>
                <p>مشاهده، فیلتر و اختصاص پزشک به درخواست‌های تله‌ریپورت</p>
              </div>
            </div>

            <section className="admin-page-filter-card">
              <div className="admin-page-filter-row">
                <label>
                  <span>وضعیت</span>
                  <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="new">جدید</option>
                    <option value="assigned">اختصاص‌یافته</option>
                    <option value="in_progress">در حال انجام</option>
                    <option value="completed">تکمیل‌شده</option>
                    <option value="cancelled">لغوشده</option>
                  </select>
                </label>
                <label>
                  <span>نوع تصویربرداری</span>
                  <select value={filters.imagingType} onChange={(e) => updateFilter('imagingType', e.target.value)}>
                    <option value="all">همه انواع</option>
                    <option value="MRI">MRI</option>
                    <option value="CT">CT Scan</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="Ultrasound">سونوگرافی</option>
                    <option value="Mammography">ماموگرافی</option>
                  </select>
                </label>
              </div>
              <div className="admin-page-search">
                <Search size={18} />
                <input
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="جستجو بر اساس شماره درخواست، نام بیمار، تلفن..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="admin-page-error">{error}</div>}

            <section className="admin-page-table-card">
              <div className="admin-page-table-meta">
                <strong>فهرست درخواست‌ها</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} درخواست</span>
              </div>
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>شماره درخواست</th>
                      <th>بیمار</th>
                      <th>نوع تصویربرداری</th>
                      <th>شهر</th>
                      <th>تلفن</th>
                      <th>پزشک مسئول</th>
                      <th>وضعیت</th>
                      <th>تاریخ</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td colSpan={9} className="admin-page-empty">در حال دریافت درخواست‌ها…</td></tr>
                    )}
                    {!isLoading && data?.items.map((item) => (
                      <tr key={item.id}>
                        <td data-label="شماره درخواست"><strong>{item.requestNumber}</strong></td>
                        <td data-label="بیمار">{item.patientFirstName} {item.patientLastName}</td>
                        <td data-label="نوع تصویربرداری">{imagingTypeLabels[item.imagingType] ?? item.imagingType}</td>
                        <td data-label="شهر">{item.city || '—'}</td>
                        <td data-label="تلفن">{item.phone}</td>
                        <td data-label="پزشک مسئول">{item.reports[0]?.author?.fullName ?? '—'}</td>
                        <td data-label="وضعیت">
                          <span className="admin-status-badge" style={{ background: `${statusColors[item.status] ?? '#718198'}15`, color: statusColors[item.status] ?? '#718198', border: `1px solid ${statusColors[item.status] ?? '#718198'}30` }}>
                            {statusLabels[item.status] ?? item.status}
                          </span>
                        </td>
                        <td data-label="تاریخ">{formatDate(item.createdAt)}</td>
                        <td data-label="عملیات">
                          <div className="admin-page-actions">
                            <button className="admin-page-action admin-page-action--view" onClick={() => loadRequestDetail(item.id)} title="مشاهده">
                              <Eye size={16} />
                            </button>
                            <button className="admin-page-action admin-page-action--edit" onClick={() => setAssignRequest(item)} title="اختصاص پزشک">
                              <Stethoscope size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && data?.items.length === 0 && (
                      <tr><td colSpan={9} className="admin-page-empty">درخواستی با این فیلترها پیدا نشد.</td></tr>
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

            {tariffs.length > 0 && (
              <section className="admin-page-table-card" style={{ marginTop: 24 }}>
                <div className="admin-page-table-meta">
                  <strong>تعرفه‌های تله‌ریپورت</strong>
                  <span>{tariffs.length.toLocaleString('fa-IR')} تعرفه</span>
                </div>
                <div className="admin-page-table-wrap">
                  <table className="admin-page-table">
                    <thead>
                      <tr>
                        <th>نام</th>
                        <th>نوع</th>
                        <th>قیمت</th>
                        <th>تحلیل AI</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tariffs.map((t) => (
                        <tr key={t.id}>
                          <td data-label="نام"><strong>{t.name}</strong></td>
                          <td data-label="نوع">{imagingTypeLabels[t.imagingType] ?? t.imagingType}</td>
                          <td data-label="قیمت">{formatToman(t.price)} تومان</td>
                          <td data-label="تحلیل AI">
                            <span className="admin-status-badge" style={{ background: t.aiAnalysisEnabled ? '#e8f6f3' : '#f1f5fa', color: t.aiAnalysisEnabled ? '#168a68' : '#718198', border: `1px solid ${t.aiAnalysisEnabled ? '#168a6830' : '#e0e6f0'}` }}>
                              {t.aiAnalysisEnabled ? 'فعال' : 'غیرفعال'}
                            </span>
                          </td>
                          <td data-label="وضعیت">
                            <span className={`admin-status-badge ${t.isActive ? 'is-active' : 'is-inactive'}`}>
                              {t.isActive ? 'فعال' : 'غیرفعال'}
                            </span>
                          </td>
                          <td data-label="عملیات">
                            <div className="admin-page-actions">
                              <button className="admin-page-action admin-page-action--view" onClick={() => void toggleAiTariff(t, true)} title="تأیید تحلیل AI" style={{ color: '#168a68' }}>
                                <Check size={16} />
                              </button>
                              <button className="admin-page-action admin-page-action--delete" onClick={() => void toggleAiTariff(t, false)} title="رد تحلیل AI">
                                <XCircle size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {detailData && (
        <RequestDetailModal data={detailData} loading={detailLoading} onClose={() => setDetailData(null)} />
      )}
      {assignRequest && (
        <AssignDoctorModal request={assignRequest} doctors={doctors} onClose={() => setAssignRequest(null)} onSaved={() => { setAssignRequest(null); void loadRequests(); }} />
      )}
    </div>
  );
}

function RequestDetailModal({ data, loading, onClose }: { data: RequestItem | null; loading: boolean; onClose: () => void }) {
  if (loading || !data) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>جزئیات درخواست {data.requestNumber}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="admin-modal__body">
          <div className="admin-detail-section">
            <h4>اطلاعات بیمار</h4>
            <div className="admin-detail-grid">
              <div><span>نام</span><strong>{data.patientFirstName} {data.patientLastName}</strong></div>
              <div><span>تلفن</span><strong>{data.phone}</strong></div>
              <div><span>کد ملی</span><strong>{data.nationalId ?? '—'}</strong></div>
              <div><span>شهر</span><strong>{data.city || '—'}</strong></div>
              <div><span>نوع تصویربرداری</span><strong>{imagingTypeLabels[data.imagingType] ?? data.imagingType}</strong></div>
              <div><span>تاریخ</span><strong>{formatDate(data.createdAt)}</strong></div>
            </div>
          </div>

          <div className="admin-detail-section">
            <h4>وضعیت</h4>
            <div className="admin-detail-grid">
              <div><span>وضعیت</span><strong>{statusLabels[data.status] ?? data.status}</strong></div>
              <div><span>پیوست‌ها</span><strong>{data.attachments.length.toLocaleString('fa-IR')}</strong></div>
              <div><span>گزارش‌ها</span><strong>{data.reports.length.toLocaleString('fa-IR')}</strong></div>
            </div>
          </div>

          {data.attachments.length > 0 && (
            <div className="admin-detail-section">
              <h4>پیوست‌ها</h4>
              <ul className="admin-detail-list">
                {data.attachments.map((a) => (
                  <li key={a.id}>
                    <span className="admin-detail-list__dot" style={{ background: '#1456c3' }} />
                    <div>
                      <strong>{a.originalName}</strong>
                      <span>{(a.size / 1024).toFixed(1)} کیلوبایت</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.reports.length > 0 && (
            <div className="admin-detail-section">
              <h4>گزارش‌ها</h4>
              <ul className="admin-detail-list">
                {data.reports.map((r) => (
                  <li key={r.id}>
                    <span className="admin-detail-list__dot" style={{ background: r.signed ? '#168A68' : '#C9973E' }} />
                    <div>
                      <strong>{r.author?.fullName ?? '—'}</strong>
                      <span>{r.signed ? 'امضاشده' : 'پیش‌نویس'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AssignDoctorModal({ request, doctors, onClose, onSaved }: { request: RequestItem; doctors: DoctorItem[]; onClose: () => void; onSaved: () => void }) {
  const [doctorId, setDoctorId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!doctorId) {
      setError('لطفاً یک پزشک انتخاب کنید.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/tele-reports/${request.id}/assign-doctor`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ doctorId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'اختصاص پزشک ناموفق بود.');
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
          <h3>اختصاص پزشک به درخواست {request.requestNumber}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <label>
            <span>پزشک</span>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
              <option value="">انتخاب پزشک...</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName}{d.specialty ? ` - ${d.specialty}` : ''}
                </option>
              ))}
            </select>
          </label>
          {doctors.length === 0 && (
            <p style={{ color: '#8795a9', fontSize: 13 }}>پزشک تأییدشده‌ای موجود نیست.</p>
          )}
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button>
            <button type="submit" disabled={saving || doctors.length === 0} className="admin-modal__save">
              {saving ? 'در حال اختصاص…' : 'اختصاص پزشک'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
