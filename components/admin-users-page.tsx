'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Edit3,
  Eye,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type UserItem = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  _count?: { reports: number; infoRequests: number };
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

const navItems = [
  { label: 'داشبورد', href: '/admin', icon: LayoutDashboard },
  { label: 'کاربران', href: '/admin/users', icon: Users, active: true },
  { label: 'پزشکان', href: '/admin/doctors', icon: Stethoscope },
  { label: 'گزارش‌ها', href: '/admin', icon: ShieldCheck },
];

const roleLabels: Record<string, string> = {
  admin: 'مدیر',
  radiologist: 'رادیولوژیست',
  user: 'کاربر',
};

const roleClasses: Record<string, string> = {
  admin: 'is-admin',
  radiologist: 'is-doctor',
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

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

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
  const [detailData, setDetailData] = useState<{ user: UserItem; activity: { reports: any[]; infoRequests: any[] } } | null>(null);
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
              <Users size={26} strokeWidth={1.7} />
              <span>مدیریت کاربران</span>
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
                <h2>مدیریت کاربران</h2>
                <p>مشاهده، فیلتر، افزودن، ویرایش و حذف کاربران سیستم</p>
              </div>
              <button className="admin-page-add-btn" onClick={() => setShowAddModal(true)}>
                <UserPlus size={18} /> افزودن کاربر
              </button>
            </div>

            <section className="admin-page-filter-card">
              <div className="admin-page-filter-row">
                <label>
                  <span>نقش</span>
                  <select value={filters.role} onChange={(e) => updateFilter('role', e.target.value)}>
                    <option value="all">همه نقش‌ها</option>
                    <option value="admin">مدیر</option>
                    <option value="radiologist">رادیولوژیست</option>
                    <option value="user">کاربر</option>
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
                  </select>
                </label>
                <label>
                  <span>وضعیت</span>
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
                <strong>فهرست کاربران</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} کاربر</span>
              </div>
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>نام</th>
                      <th>ایمیل</th>
                      <th>نقش</th>
                      <th>کشور</th>
                      <th>گزارش‌ها</th>
                      <th>وضعیت</th>
                      <th>تاریخ ثبت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td colSpan={8} className="admin-page-empty">در حال دریافت کاربران…</td></tr>
                    )}
                    {!isLoading && data?.items.map((item) => (
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
                            <button className="admin-page-action admin-page-action--view" onClick={() => loadUserDetail(item.id)} title="مشاهده">
                              <Eye size={16} />
                            </button>
                            <button className="admin-page-action admin-page-action--edit" onClick={() => { setShowEditModal(item); }} title="ویرایش">
                              <Edit3 size={16} />
                            </button>
                            <button
                              className="admin-page-action admin-page-action--delete"
                              onClick={async () => {
                                if (!confirm('آیا از حذف این کاربر مطمئن هستید؟')) return;
                                const token = window.localStorage.getItem('radinet_auth_token');
                                await fetch(`/api/admin/users/${item.id}`, {
                                  method: 'DELETE',
                                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                                });
                                void loadUsers();
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
                      <tr><td colSpan={8} className="admin-page-empty">کاربری با این فیلترها پیدا نشد.</td></tr>
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
        <AddUserModal onClose={() => setShowAddModal(false)} onSaved={() => { setShowAddModal(false); void loadUsers(); }} />
      )}
      {showEditModal && (
        <EditUserModal user={showEditModal} onClose={() => setShowEditModal(null)} onSaved={() => { setShowEditModal(null); void loadUsers(); }} />
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
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fullName, email, password, role, country }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'افزودن کاربر ناموفق بود.');
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
          <h3>افزودن کاربر جدید</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <label>
            <span>نام و نام خانوادگی</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="مثال: علی محمدی" />
          </label>
          <label>
            <span>ایمیل</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" />
          </label>
          <label>
            <span>رمز عبور</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="حداقل ۶ کاراکتر" />
          </label>
          <div className="admin-modal__row">
            <label>
              <span>نقش</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">کاربر</option>
                <option value="radiologist">رادیولوژیست</option>
                <option value="admin">مدیر</option>
              </select>
            </label>
            <label>
              <span>کشور</span>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="IR">ایران</option>
                <option value="IQ">عراق</option>
                <option value="AF">افغانستان</option>
                <option value="TR">ترکیه</option>
              </select>
            </label>
          </div>
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

function EditUserModal({ user, onClose, onSaved }: { user: UserItem; onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [role, setRole] = useState(user.role);
  const [country, setCountry] = useState(user.country ?? 'IR');
  const [status, setStatus] = useState(user.status ?? 'active');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fullName, role, country, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'ویرایش کاربر ناموفق بود.');
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
          <h3>ویرایش کاربر</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <label>
            <span>نام و نام خانوادگی</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <div className="admin-modal__row">
            <label>
              <span>نقش</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">کاربر</option>
                <option value="radiologist">رادیولوژیست</option>
                <option value="admin">مدیر</option>
              </select>
            </label>
            <label>
              <span>کشور</span>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="IR">ایران</option>
                <option value="IQ">عراق</option>
                <option value="AF">افغانستان</option>
                <option value="TR">ترکیه</option>
              </select>
            </label>
          </div>
          <label>
            <span>وضعیت</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
              <option value="suspended">معلق</option>
            </select>
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

function UserDetailModal({ data, loading, onClose }: { data: { user: UserItem; activity: { reports: any[]; infoRequests: any[] } } | null; loading: boolean; onClose: () => void }) {
  if (loading || !data) return null;
  const { user, activity } = data;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>جزئیات کاربر</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="admin-modal__body">
          <div className="admin-detail-section">
            <h4>اطلاعات کاربر</h4>
            <div className="admin-detail-grid">
              <div><span>نام</span><strong>{user.fullName}</strong></div>
              <div><span>ایمیل</span><strong>{user.email}</strong></div>
              <div><span>نقش</span><strong>{roleLabels[user.role] ?? user.role}</strong></div>
              <div><span>وضعیت</span><strong>{statusLabels[user.status] ?? user.status}</strong></div>
              <div><span>کشور</span><strong>{user.country ?? '—'}</strong></div>
              <div><span>تاریخ ثبت</span><strong>{formatDate(user.createdAt)}</strong></div>
            </div>
          </div>

          <div className="admin-detail-section">
            <h4>آمار فعالیت</h4>
            <div className="admin-detail-stats">
              <div className="admin-detail-stat">
                <Activity size={20} />
                <strong>{(user._count?.reports ?? 0).toLocaleString('fa-IR')}</strong>
                <span>گزارش‌ها</span>
              </div>
              <div className="admin-detail-stat">
                <Filter size={20} />
                <strong>{(user._count?.infoRequests ?? 0).toLocaleString('fa-IR')}</strong>
                <span>درخواست‌های اطلاعاتی</span>
              </div>
            </div>
          </div>

          {activity.reports.length > 0 && (
            <div className="admin-detail-section">
              <h4>گزارش‌های اخیر</h4>
              <ul className="admin-detail-list">
                {activity.reports.map((r) => (
                  <li key={r.id}>
                    <span className="admin-detail-list__dot" style={{ background: r.signed ? '#168A68' : '#C9973E' }} />
                    <div>
                      <strong>{r.request?.requestNumber ?? '—'}</strong>
                      <span>{r.request?.patientFirstName} {r.request?.patientLastName}</span>
                    </div>
                    <time>{formatDate(r.createdAt)}</time>
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
