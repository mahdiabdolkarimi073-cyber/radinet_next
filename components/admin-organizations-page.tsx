'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  Filter,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { adminNavItems, formatDate, formatToman } from '@/lib/admin-nav';

type OrgItem = {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  province: string;
  nationalId: string | null;
  economicCode: string | null;
  registrationNumber: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { contracts: number };
};

type OrgResponse = {
  items: OrgItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type FilterValues = {
  status: string;
  type: string;
  search: string;
};

const initialFilters: FilterValues = { status: 'all', type: 'all', search: '' };

const typeLabels: Record<string, string> = {
  company: 'شرکت',
  government: 'دولتی',
  insurance: 'بیمه',
  university: 'دانشگاه',
};

const typeClasses: Record<string, string> = {
  company: 'is-company',
  government: 'is-government',
  insurance: 'is-insurance',
  university: 'is-university',
};

const statusLabels: Record<string, string> = {
  active: 'فعال',
  inactive: 'غیرفعال',
};

const statusClasses: Record<string, string> = {
  active: 'is-active',
  inactive: 'is-inactive',
};

export function AdminOrganizationsPage() {
  const { user, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<OrgResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<OrgItem | null>(null);
  const [detailData, setDetailData] = useState<{ organization: OrgItem; contracts: any[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters, page]);

  const loadOrganizations = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/organizations?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت سازمان‌ها ناموفق بود.');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  function updateFilter(key: keyof FilterValues, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function loadOrgDetail(id: string) {
    setDetailLoading(true);
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/organizations/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت اطلاعات سازمان ناموفق بود.');
      const result = await response.json();
      setDetailData(result);
    } catch {
      setError('دریافت اطلاعات سازمان ناموفق بود.');
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
            {adminNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`admin-page-nav__item ${item.href === '/admin/organizations' ? 'is-active' : ''}`}
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
              <Building2 size={26} strokeWidth={1.7} />
              <span>مدیریت سازمان‌ها</span>
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
                <h2>مدیریت سازمان‌ها</h2>
                <p>مشاهده، فیلتر، افزودن، ویرایش و حذف سازمان‌های همکار سیستم</p>
              </div>
              <button className="admin-page-add-btn" onClick={() => setShowAddModal(true)}>
                <Plus size={18} /> افزودن سازمان
              </button>
            </div>

            <section className="admin-page-filter-card">
              <div className="admin-page-filter-row">
                <label>
                  <span>وضعیت</span>
                  <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                  </select>
                </label>
                <label>
                  <span>نوع</span>
                  <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)}>
                    <option value="all">همه نوع‌ها</option>
                    <option value="company">شرکت</option>
                    <option value="government">دولتی</option>
                    <option value="insurance">بیمه</option>
                    <option value="university">دانشگاه</option>
                  </select>
                </label>
              </div>
              <div className="admin-page-search">
                <Search size={18} />
                <input
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="جستجو بر اساس نام، شناسه ملی یا شهر..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="admin-page-error">{error}</div>}

            <section className="admin-page-table-card">
              <div className="admin-page-table-meta">
                <strong>فهرست سازمان‌ها</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} سازمان</span>
              </div>
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>نام سازمان</th>
                      <th>نوع</th>
                      <th>شهر</th>
                      <th>شناسه ملی</th>
                      <th>شخص رابط</th>
                      <th>قراردادها</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td colSpan={8} className="admin-page-empty">در حال دریافت سازمان‌ها…</td></tr>
                    )}
                    {!isLoading && data?.items.map((item) => (
                      <tr key={item.id}>
                        <td data-label="نام سازمان" className="admin-page-user-cell">
                          <strong>{item.name}</strong>
                          {item.email && <small>{item.email}</small>}
                        </td>
                        <td data-label="نوع">
                          <span className={`admin-role-badge ${typeClasses[item.type] ?? 'is-user'}`}>
                            {typeLabels[item.type] ?? item.type}
                          </span>
                        </td>
                        <td data-label="شهر">{item.city || '—'}</td>
                        <td data-label="شناسه ملی">{item.nationalId ?? '—'}</td>
                        <td data-label="شخص رابط">{item.contactPerson ?? '—'}</td>
                        <td data-label="قراردادها">{(item._count?.contracts ?? 0).toLocaleString('fa-IR')}</td>
                        <td data-label="وضعیت">
                          <span className={`admin-status-badge ${item.isActive ? 'is-active' : 'is-inactive'}`}>
                            {item.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td data-label="عملیات">
                          <div className="admin-page-actions">
                            <button className="admin-page-action admin-page-action--view" onClick={() => loadOrgDetail(item.id)} title="مشاهده">
                              <Eye size={16} />
                            </button>
                            <button className="admin-page-action admin-page-action--edit" onClick={() => { setShowEditModal(item); }} title="ویرایش">
                              <Edit3 size={16} />
                            </button>
                            <button
                              className="admin-page-action admin-page-action--delete"
                              onClick={async () => {
                                if (!confirm('آیا از حذف این سازمان مطمئن هستید؟')) return;
                                const token = window.localStorage.getItem('radinet_auth_token');
                                await fetch(`/api/admin/organizations/${item.id}`, {
                                  method: 'DELETE',
                                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                                });
                                void loadOrganizations();
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
                      <tr><td colSpan={8} className="admin-page-empty">سازمانی با این فیلترها پیدا نشد.</td></tr>
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
        <AddOrgModal onClose={() => setShowAddModal(false)} onSaved={() => { setShowAddModal(false); void loadOrganizations(); }} />
      )}
      {showEditModal && (
        <EditOrgModal org={showEditModal} onClose={() => setShowEditModal(null)} onSaved={() => { setShowEditModal(null); void loadOrganizations(); }} />
      )}
      {detailData && (
        <OrgDetailModal data={detailData} loading={detailLoading} onClose={() => setDetailData(null)} />
      )}
    </div>
  );
}

type OrgFormValues = {
  name: string;
  slug: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  province: string;
  nationalId: string;
  economicCode: string;
  registrationNumber: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  isActive: boolean;
};

const emptyForm: OrgFormValues = {
  name: '',
  slug: '',
  type: 'company',
  description: '',
  address: '',
  phone: '',
  email: '',
  city: '',
  province: '',
  nationalId: '',
  economicCode: '',
  registrationNumber: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  isActive: true,
};

function OrgFormFields({ values, onChange }: { values: OrgFormValues; onChange: (patch: Partial<OrgFormValues>) => void }) {
  return (
    <>
      <div className="admin-modal__row">
        <label>
          <span>نام سازمان</span>
          <input value={values.name} onChange={(e) => onChange({ name: e.target.value })} required placeholder="مثال: بیمه ایران" />
        </label>
        <label>
          <span>نامک (Slug)</span>
          <input value={values.slug} onChange={(e) => onChange({ slug: e.target.value })} required placeholder="example-org" />
        </label>
      </div>
      <div className="admin-modal__row">
        <label>
          <span>نوع سازمان</span>
          <select value={values.type} onChange={(e) => onChange({ type: e.target.value })}>
            <option value="company">شرکت</option>
            <option value="government">دولتی</option>
            <option value="insurance">بیمه</option>
            <option value="university">دانشگاه</option>
          </select>
        </label>
        <label>
          <span>شهر</span>
          <input value={values.city} onChange={(e) => onChange({ city: e.target.value })} placeholder="مثال: تهران" />
        </label>
      </div>
      <div className="admin-modal__row">
        <label>
          <span>استان</span>
          <input value={values.province} onChange={(e) => onChange({ province: e.target.value })} placeholder="مثال: تهران" />
        </label>
        <label>
          <span>تلفن</span>
          <input value={values.phone} onChange={(e) => onChange({ phone: e.target.value })} placeholder="۰۲۱-۱۲۳۴۵۶۷۸" />
        </label>
      </div>
      <label>
        <span>ایمیل</span>
        <input type="email" value={values.email} onChange={(e) => onChange({ email: e.target.value })} placeholder="email@example.com" />
      </label>
      <label>
        <span>نشانی</span>
        <input value={values.address} onChange={(e) => onChange({ address: e.target.value })} placeholder="نشانی کامل سازمان" />
      </label>
      <label>
        <span>توضیحات</span>
        <textarea value={values.description} onChange={(e) => onChange({ description: e.target.value })} rows={3} placeholder="توضیحات اختیاری درباره سازمان" />
      </label>
      <div className="admin-modal__row">
        <label>
          <span>شناسه ملی</span>
          <input value={values.nationalId} onChange={(e) => onChange({ nationalId: e.target.value })} placeholder="شناسه ملی سازمان" />
        </label>
        <label>
          <span>کد اقتصادی</span>
          <input value={values.economicCode} onChange={(e) => onChange({ economicCode: e.target.value })} placeholder="کد اقتصادی" />
        </label>
      </div>
      <div className="admin-modal__row">
        <label>
          <span>شماره ثبت</span>
          <input value={values.registrationNumber} onChange={(e) => onChange({ registrationNumber: e.target.value })} placeholder="شماره ثبت" />
        </label>
        <label>
          <span>شخص رابط</span>
          <input value={values.contactPerson} onChange={(e) => onChange({ contactPerson: e.target.value })} placeholder="نام شخص رابط" />
        </label>
      </div>
      <div className="admin-modal__row">
        <label>
          <span>تلفن رابط</span>
          <input value={values.contactPhone} onChange={(e) => onChange({ contactPhone: e.target.value })} placeholder="تلفن تماس رابط" />
        </label>
        <label>
          <span>ایمیل رابط</span>
          <input type="email" value={values.contactEmail} onChange={(e) => onChange({ contactEmail: e.target.value })} placeholder="email@example.com" />
        </label>
      </div>
      <label className="admin-modal__checkbox">
        <input type="checkbox" checked={values.isActive} onChange={(e) => onChange({ isActive: e.target.checked })} />
        <span>سازمان فعال است</span>
      </label>
    </>
  );
}

function AddOrgModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<OrgFormValues>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function update(patch: Partial<OrgFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...values,
          nationalId: values.nationalId || null,
          economicCode: values.economicCode || null,
          registrationNumber: values.registrationNumber || null,
          contactPerson: values.contactPerson || null,
          contactPhone: values.contactPhone || null,
          contactEmail: values.contactEmail || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'افزودن سازمان ناموفق بود.');
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
          <h3>افزودن سازمان جدید</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <OrgFormFields values={values} onChange={update} />
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ذخیره…' : 'افزودن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditOrgModal({ org, onClose, onSaved }: { org: OrgItem; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<OrgFormValues>({
    name: org.name,
    slug: org.slug,
    type: org.type,
    description: org.description ?? '',
    address: org.address ?? '',
    phone: org.phone ?? '',
    email: org.email ?? '',
    city: org.city ?? '',
    province: org.province ?? '',
    nationalId: org.nationalId ?? '',
    economicCode: org.economicCode ?? '',
    registrationNumber: org.registrationNumber ?? '',
    contactPerson: org.contactPerson ?? '',
    contactPhone: org.contactPhone ?? '',
    contactEmail: org.contactEmail ?? '',
    isActive: org.isActive,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function update(patch: Partial<OrgFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/organizations/${org.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...values,
          nationalId: values.nationalId || null,
          economicCode: values.economicCode || null,
          registrationNumber: values.registrationNumber || null,
          contactPerson: values.contactPerson || null,
          contactPhone: values.contactPhone || null,
          contactEmail: values.contactEmail || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'ویرایش سازمان ناموفق بود.');
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
          <h3>ویرایش سازمان: {org.name}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <OrgFormFields values={values} onChange={update} />
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

function OrgDetailModal({ data, loading, onClose }: { data: { organization: OrgItem; contracts: any[] } | null; loading: boolean; onClose: () => void }) {
  if (loading || !data) return null;
  const { organization: org, contracts } = data;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>جزئیات سازمان</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="admin-modal__body">
          <div className="admin-detail-section">
            <h4>اطلاعات سازمان</h4>
            <div className="admin-detail-grid">
              <div><span>نام</span><strong>{org.name}</strong></div>
              <div><span>نامک</span><strong>{org.slug}</strong></div>
              <div><span>نوع</span><strong>{typeLabels[org.type] ?? org.type}</strong></div>
              <div><span>وضعیت</span><strong>{org.isActive ? 'فعال' : 'غیرفعال'}</strong></div>
              <div><span>شهر</span><strong>{org.city || '—'}</strong></div>
              <div><span>استان</span><strong>{org.province || '—'}</strong></div>
              <div><span>تلفن</span><strong>{org.phone || '—'}</strong></div>
              <div><span>ایمیل</span><strong>{org.email || '—'}</strong></div>
              <div><span>شناسه ملی</span><strong>{org.nationalId ?? '—'}</strong></div>
              <div><span>کد اقتصادی</span><strong>{org.economicCode ?? '—'}</strong></div>
              <div><span>شماره ثبت</span><strong>{org.registrationNumber ?? '—'}</strong></div>
              <div><span>تاریخ ثبت</span><strong>{formatDate(org.createdAt)}</strong></div>
            </div>
          </div>

          <div className="admin-detail-section">
            <h4>اطلاعات تماس</h4>
            <div className="admin-detail-grid">
              <div><span>شخص رابط</span><strong>{org.contactPerson ?? '—'}</strong></div>
              <div><span>تلفن رابط</span><strong>{org.contactPhone ?? '—'}</strong></div>
              <div><span>ایمیل رابط</span><strong>{org.contactEmail ?? '—'}</strong></div>
              <div><span>نشانی</span><strong>{org.address || '—'}</strong></div>
            </div>
          </div>

          {org.description && (
            <div className="admin-detail-section">
              <h4>توضیحات</h4>
              <p className="admin-detail-text">{org.description}</p>
            </div>
          )}

          <div className="admin-detail-section">
            <h4>قراردادها ({(org._count?.contracts ?? 0).toLocaleString('fa-IR')})</h4>
            {contracts.length > 0 ? (
              <ul className="admin-detail-list">
                {contracts.map((c) => (
                  <li key={c.id}>
                    <span className="admin-detail-list__dot" style={{ background: c.isActive ? '#168A68' : '#C9973E' }} />
                    <div>
                      <strong>{c.title ?? c.contractNumber ?? '—'}</strong>
                      <span>{c.startDate ? formatDate(c.startDate) : '—'}{c.endDate ? ` تا ${formatDate(c.endDate)}` : ''}</span>
                    </div>
                    <time>{formatDate(c.createdAt)}</time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-detail-text">قراردادی برای این سازمان ثبت نشده است.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
