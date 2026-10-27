'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Archive,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Filter,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { adminNavItems, formatDate, formatToman } from '@/lib/admin-nav';

type UserItem = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  country: string;
  organizationId?: string | null;
  imagingCenterId?: string | null;
  organization?: { id: string; name: string; slug: string } | null;
  imagingCenter?: { id: string; name: string; slug: string } | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    reports: number;
    infoRequests: number;
    shopOrders?: number;
    teleReportRequests?: number;
    tickets?: number;
  };
  doctorProfile?: { specialty: string; workplace: string } | null;
};

type UserResponse = {
  items: UserItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type FilterValues = {
  role: string;
  country: string;
  status: string;
  search: string;
};

const initialFilters: FilterValues = { role: 'all', country: 'all', status: 'all', search: '' };

const roleLabels: Record<string, string> = {
  admin: 'مدیر کل',
  radiologist: 'رادیولوژیست',
  doctor: 'پزشک متخصص',
  support_expert: 'کارشناس پشتیبانی',
  SUPPORT_EXPERT: 'کارشناس پشتیبانی',
  ORG_ADMIN: 'مدیر سازمان',
  ORG_STAFF: 'پرسنل سازمان',
  user: 'کاربر عادی',
};

const roleClasses: Record<string, string> = {
  admin: 'is-admin',
  radiologist: 'is-doctor',
  doctor: 'is-doctor',
  support_expert: 'is-support',
  SUPPORT_EXPERT: 'is-support',
  ORG_ADMIN: 'is-org',
  ORG_STAFF: 'is-org',
  user: 'is-user',
};

const statusLabels: Record<string, string> = {
  active: 'فعال',
  inactive: 'غیرفعال',
  suspended: 'معلق',
};

const statusClasses: Record<string, string> = {
  active: 'is-active',
  inactive: 'is-inactive',
  suspended: 'is-suspended',
};

export function AdminUsersPage() {
  const { user, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<UserResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<UserItem | null>(null);
  const [detailData, setDetailData] = useState<{
    user: UserItem;
    activity: {
      reports?: any[];
      infoRequests?: any[];
      orders?: any[];
      requests?: any[];
      tickets?: any[];
    };
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters, page]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/users?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت کاربران ناموفق بود.');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function updateFilter(key: keyof FilterValues, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function loadUserDetail(id: string) {
    setDetailLoading(true);
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/users/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت اطلاعات کاربر ناموفق بود.');
      const result = await response.json();
      setDetailData(result);
    } catch {
      setError('دریافت اطلاعات کاربر ناموفق بود.');
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="admin-page-root">
      <div className="admin-page-shell">
        <aside className={`admin-page-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-page-brand">
            <div className="admin-page-brand__mark">
              <ShieldCheck size={28} strokeWidth={1.7} />
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
              const isActive = item.href === '/admin/users';
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
              <Users size={26} strokeWidth={1.7} />
              <span>مدیریت کاربران و سطوح دسترسی</span>
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
            <div className="admin-page-title">
              <div>
                <h2>فهرست کاربران سامانه</h2>
                <p>جستجو، فیلتر نقش و وضعیت، افزودن کاربر جدید، مدیریت دسترسی‌ها و تاریخچه فعالیت</p>
              </div>
              <button className="admin-page-add-btn" onClick={() => setShowAddModal(true)}>
                <UserPlus size={18} /> افزودن کاربر جدید
              </button>
            </div>

            <section className="admin-page-filter-card">
              <div className="admin-page-filter-row">
                <label>
                  <span>نقش کاربری</span>
                  <select value={filters.role} onChange={(e) => updateFilter('role', e.target.value)}>
                    <option value="all">همه نقش‌ها</option>
                    <option value="admin">مدیر کل</option>
                    <option value="radiologist">رادیولوژیست</option>
                    <option value="doctor">پزشک متخصص</option>
                    <option value="support_expert">کارشناس پشتیبانی</option>
                    <option value="ORG_ADMIN">مدیر سازمان</option>
                    <option value="ORG_STAFF">پرسنل سازمان</option>
                    <option value="user">کاربر عادی</option>
                  </select>
                </label>
                <label>
                  <span>کشور</span>
                  <select value={filters.country} onChange={(e) => updateFilter('country', e.target.value)}>
                    <option value="all">همه کشورها</option>
                    <option value="IR">ایران</option>
                    <option value="IQ">عراق</option>
                    <option value="AF">افغانستان</option>
                    <option value="TR">ترکیه</option>
                    <option value="AE">امارات</option>
                  </select>
                </label>
                <label>
                  <span>وضعیت حساب</span>
                  <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                    <option value="suspended">معلق</option>
                  </select>
                </label>
              </div>
              <div className="admin-page-search">
                <Search size={18} />
                <input
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="جستجو بر اساس نام یا ایمیل..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="admin-page-error">{error}</div>}

            <section className="admin-page-table-card">
              <div className="admin-page-table-meta">
                <strong>کاربران ثبت‌شده</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} کاربر</span>
              </div>
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>نام کاربر</th>
                      <th>ایمیل</th>
                      <th>نقش</th>
                      <th>کشور</th>
                      <th>گزارش‌ها</th>
                      <th>وضعیت</th>
                      <th>تاریخ عضویت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={8} className="admin-page-empty">
                          در حال دریافت اطلاعات کاربران…
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      data?.items.map((item) => (
                        <tr key={item.id}>
                          <td data-label="نام" className="admin-page-user-cell">
                            <strong>{item.fullName}</strong>
                            {item.doctorProfile?.specialty && <small>{item.doctorProfile.specialty}</small>}
                          </td>
                          <td data-label="ایمیل">{item.email}</td>
                          <td data-label="نقش">
                            <span className={`admin-role-badge ${roleClasses[item.role] ?? 'is-user'}`}>
                              {roleLabels[item.role] ?? item.role}
                            </span>
                          </td>
                          <td data-label="کشور">{item.country ?? '—'}</td>
                          <td data-label="گزارش‌ها">{(item._count?.reports ?? 0).toLocaleString('fa-IR')}</td>
                          <td data-label="وضعیت">
                            <span className={`admin-status-badge ${statusClasses[item.status] ?? 'is-active'}`}>
                              {statusLabels[item.status] ?? item.status}
                            </span>
                          </td>
                          <td data-label="تاریخ ثبت">{formatDate(item.createdAt)}</td>
                          <td data-label="عملیات">
                            <div className="admin-page-actions">
                              <button
                                className="admin-page-action admin-page-action--view"
                                onClick={() => loadUserDetail(item.id)}
                                title="مشاهده جزئیات و تاریخچه"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="admin-page-action admin-page-action--edit"
                                onClick={() => setShowEditModal(item)}
                                title="ویرایش اطلاعات و دسترسی"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                className="admin-page-action admin-page-action--delete"
                                onClick={async () => {
                                  if (!confirm(`آیا از حذف کاربر «${item.fullName}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`))
                                    return;
                                  const token = window.localStorage.getItem('radinet_auth_token');
                                  const res = await fetch(`/api/admin/users/${item.id}`, {
                                    method: 'DELETE',
                                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                                  });
                                  if (!res.ok) {
                                    const errRes = await res.json().catch(() => ({}));
                                    alert(errRes.error ?? 'حذف کاربر با خطا مواجه شد.');
                                  } else {
                                    void loadUsers();
                                  }
                                }}
                                title="حذف کاربر"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {!isLoading && (!data?.items || data.items.length === 0) && (
                      <tr>
                        <td colSpan={8} className="admin-page-empty">
                          کاربری با فیلترهای مشخص‌شده یافت نشد.
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
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            void loadUsers();
          }}
        />
      )}
      {showEditModal && (
        <EditUserModal
          user={showEditModal}
          onClose={() => setShowEditModal(null)}
          onSaved={() => {
            setShowEditModal(null);
            void loadUsers();
          }}
        />
      )}
      {detailData && (
        <UserDetailModal data={detailData} loading={detailLoading} onClose={() => setDetailData(null)} />
      )}
    </div>
  );
}

function AddUserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [country, setCountry] = useState('IR');
  const [organizationId, setOrganizationId] = useState('');
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('radinet_auth_token');
    fetch('/api/admin/organizations?limit=50', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.items && Array.isArray(res.items)) {
          setOrganizations(res.items);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const payload: Record<string, string> = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        country,
      };
      if ((role === 'ORG_ADMIN' || role === 'ORG_STAFF') && organizationId) {
        payload.organizationId = organizationId;
      }
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message.join('، ')
          : (data.message ?? data.error ?? 'افزودن کاربر ناموفق بود.');
        throw new Error(msg);
      }
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
          <h3>افزودن کاربر جدید به سامانه</h3>
          <button onClick={onClose} aria-label="بستن">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <label>
            <span>نام و نام خانوادگی</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="مثال: دکتر علیرضا رضایی" />
          </label>
          <label>
            <span>ایمیل کاربری</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" dir="ltr" />
          </label>
          <label>
            <span>رمز عبور اولیه</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="حداقل ۶ کاراکتر"
              dir="ltr"
            />
          </label>
          <div className="admin-modal__row">
            <label>
              <span>نقش کاربری</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">کاربر عادی</option>
                <option value="radiologist">رادیولوژیست</option>
                <option value="doctor">پزشک متخصص</option>
                <option value="support_expert">کارشناس پشتیبانی</option>
                <option value="ORG_ADMIN">مدیر سازمان</option>
                <option value="ORG_STAFF">پرسنل سازمان</option>
                <option value="admin">مدیر کل</option>
              </select>
            </label>
            <label>
              <span>کشور</span>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="IR">ایران</option>
                <option value="IQ">عراق</option>
                <option value="AF">افغانستان</option>
                <option value="TR">ترکیه</option>
                <option value="AE">امارات</option>
              </select>
            </label>
          </div>
          {(role === 'ORG_ADMIN' || role === 'ORG_STAFF') && (
            <label>
              <span>سازمان مرتبط</span>
              <select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
                <option value="">ایجاد / اتصال خودکار سازمان</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">
              انصراف
            </button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ثبت…' : 'افزودن کاربر'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSaved }: { user: UserItem; onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user.role);
  const [country, setCountry] = useState(user.country ?? 'IR');
  const [status, setStatus] = useState(user.status ?? 'active');
  const [organizationId, setOrganizationId] = useState(user.organizationId ?? '');
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('radinet_auth_token');
    fetch('/api/admin/organizations?limit=50', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.items && Array.isArray(res.items)) {
          setOrganizations(res.items);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const payload: Record<string, string> = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
        country,
        status,
      };
      if (password.trim()) {
        payload.password = password;
      }
      if ((role === 'ORG_ADMIN' || role === 'ORG_STAFF') && organizationId) {
        payload.organizationId = organizationId;
      }
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message.join('، ')
          : (data.message ?? data.error ?? 'ویرایش کاربر ناموفق بود.');
        throw new Error(msg);
      }
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
          <h3>ویرایش مشخصات و سطح دسترسی: {user.fullName}</h3>
          <button onClick={onClose} aria-label="بستن">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <label>
            <span>نام و نام خانوادگی</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label>
            <span>ایمیل کاربری</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
          </label>
          <label>
            <span>رمز عبور جدید (اختیاری)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              placeholder="در صورت عدم تغییر خالی بگذارید"
              dir="ltr"
            />
          </label>
          <div className="admin-modal__row">
            <label>
              <span>نقش کاربری</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">کاربر عادی</option>
                <option value="radiologist">رادیولوژیست</option>
                <option value="doctor">پزشک متخصص</option>
                <option value="support_expert">کارشناس پشتیبانی</option>
                <option value="ORG_ADMIN">مدیر سازمان</option>
                <option value="ORG_STAFF">پرسنل سازمان</option>
                <option value="admin">مدیر کل</option>
              </select>
            </label>
            <label>
              <span>کشور</span>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="IR">ایران</option>
                <option value="IQ">عراق</option>
                <option value="AF">افغانستان</option>
                <option value="TR">ترکیه</option>
                <option value="AE">امارات</option>
              </select>
            </label>
          </div>
          {(role === 'ORG_ADMIN' || role === 'ORG_STAFF') && (
            <label>
              <span>سازمان مرتبط</span>
              <select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
                <option value="">ایجاد / اتصال خودکار سازمان</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            <span>وضعیت حساب کاربری</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
              <option value="suspended">معلق</option>
            </select>
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

function UserDetailModal({
  data,
  loading,
  onClose,
}: {
  data: {
    user: UserItem;
    activity: {
      reports?: any[];
      infoRequests?: any[];
      orders?: any[];
      requests?: any[];
      tickets?: any[];
    };
  } | null;
  loading: boolean;
  onClose: () => void;
}) {
  if (loading || !data) return null;
  const { user, activity } = data;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>جزئیات و پرونده کاربر: {user.fullName}</h3>
          <button onClick={onClose} aria-label="بستن">
            <X size={20} />
          </button>
        </div>
        <div className="admin-modal__body">
          <div className="admin-detail-section">
            <h4>مشخصات اصلی</h4>
            <div className="admin-detail-grid">
              <div>
                <span>نام و نام خانوادگی</span>
                <strong>{user.fullName}</strong>
              </div>
              <div>
                <span>ایمیل</span>
                <strong>{user.email}</strong>
              </div>
              <div>
                <span>نقش</span>
                <strong>{roleLabels[user.role] ?? user.role}</strong>
              </div>
              <div>
                <span>وضعیت حساب</span>
                <strong>{statusLabels[user.status] ?? user.status}</strong>
              </div>
              <div>
                <span>کشور</span>
                <strong>{user.country ?? '—'}</strong>
              </div>
              <div>
                <span>سازمان متصل</span>
                <strong>{user.organization?.name ?? '—'}</strong>
              </div>
              <div>
                <span>مرکز تصویربرداری</span>
                <strong>{user.imagingCenter?.name ?? '—'}</strong>
              </div>
              <div>
                <span>تاریخ ثبت نام</span>
                <strong>{formatDate(user.createdAt)}</strong>
              </div>
            </div>
          </div>

          <div className="admin-detail-section">
            <h4>آمار فعالیت‌های ثبت‌شده در سامانه</h4>
            <div className="admin-detail-stats">
              <div className="admin-detail-stat">
                <Archive size={20} />
                <strong>{(user._count?.reports ?? 0).toLocaleString('fa-IR')}</strong>
                <span>گزارش‌های تشخیصی</span>
              </div>
              <div className="admin-detail-stat">
                <Filter size={20} />
                <strong>{(user._count?.infoRequests ?? 0).toLocaleString('fa-IR')}</strong>
                <span>درخواست‌های تکمیلی</span>
              </div>
              <div className="admin-detail-stat">
                <ShoppingCart size={20} />
                <strong>{(user._count?.shopOrders ?? 0).toLocaleString('fa-IR')}</strong>
                <span>سفارش‌های خرید</span>
              </div>
              <div className="admin-detail-stat">
                <Activity size={20} />
                <strong>{(user._count?.teleReportRequests ?? 0).toLocaleString('fa-IR')}</strong>
                <span>درخواست‌های تله‌ریپورت</span>
              </div>
            </div>
          </div>

          {/* گزارش‌های تشخیصی */}
          {activity.reports && activity.reports.length > 0 && (
            <div className="admin-detail-section">
              <h4>گزارش‌های رادیولوژی اخیر</h4>
              <ul className="admin-detail-list">
                {activity.reports.map((r) => (
                  <li key={r.id}>
                    <span className="admin-detail-list__dot" style={{ background: r.signed ? '#168A68' : '#C9973E' }} />
                    <div>
                      <strong>درخواست {r.request?.requestNumber ?? '—'}</strong>
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

          {/* سفارش‌های فروشگاه */}
          {activity.orders && activity.orders.length > 0 && (
            <div className="admin-detail-section">
              <h4>سفارش‌های فروشگاه</h4>
              <ul className="admin-detail-list">
                {activity.orders.map((o) => (
                  <li key={o.id}>
                    <span className="admin-detail-list__dot" style={{ background: '#2563eb' }} />
                    <div>
                      <strong>سفارش {o.orderNumber}</strong>
                      <span>مبلغ: {formatToman(Number(o.total))} تومان · وضعیت: {o.status}</span>
                    </div>
                    <time>{formatDate(o.createdAt)}</time>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* تیکت‌های پشتیبانی */}
          {activity.tickets && activity.tickets.length > 0 && (
            <div className="admin-detail-section">
              <h4>تیکت‌های پشتیبانی</h4>
              <ul className="admin-detail-list">
                {activity.tickets.map((t) => (
                  <li key={t.id}>
                    <span className="admin-detail-list__dot" style={{ background: '#9333ea' }} />
                    <div>
                      <strong>{t.subject}</strong>
                      <span>اولویت: {t.priority} · وضعیت: {t.status}</span>
                    </div>
                    <time>{formatDate(t.createdAt)}</time>
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
