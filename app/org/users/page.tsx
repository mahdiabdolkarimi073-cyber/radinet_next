'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Edit2,
  Power,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  orgDelete,
  orgGet,
  orgPost,
  orgPut,
  type OrgStaffUser,
} from '@/lib/org-api';
import { OrgStatusBadge } from '@/components/org/status-badge';
import { useAuth } from '@/components/auth-provider';

export default function OrgUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<OrgStaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit Form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'ORG_STAFF',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  // Inline Delete Confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  function loadUsers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (roleFilter) params.set('role', roleFilter);
    if (statusFilter) params.set('status', statusFilter);
    const qs = params.toString();

    orgGet<OrgStaffUser[]>(`/users${qs ? `?${qs}` : ''}`)
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  function openCreate() {
    setEditId(null);
    setForm({
      fullName: '',
      email: '',
      password: '',
      role: 'ORG_STAFF',
      status: 'active',
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  }

  function openEdit(u: OrgStaffUser) {
    setEditId(u.id);
    setForm({
      fullName: u.fullName,
      email: u.email,
      password: '',
      role: u.role.toUpperCase() === 'ORG_ADMIN' ? 'ORG_ADMIN' : 'ORG_STAFF',
      status: u.status,
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (editId) {
        const body: Record<string, string> = {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          role: form.role,
          status: form.status,
        };
        if (form.password.trim()) {
          body.password = form.password.trim();
        }
        await orgPut(`/users/${editId}`, body);
        setSuccess('اطلاعات کاربر زیرمجموعه با موفقیت ویرایش شد');
      } else {
        await orgPost('/users', {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          status: form.status,
        });
        setSuccess(
          'کاربر جدید با موفقیت در سازمان ثبت شد و می‌تواند با ایمیل و رمز عبور خود وارد سامانه شود',
        );
      }
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره‌سازی اطلاعات کاربر');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(u: OrgStaffUser) {
    setError('');
    setSuccess('');
    setActionBusyId(u.id);
    const nextStatus = u.status === 'active' ? 'inactive' : 'active';
    try {
      await orgPut(`/users/${u.id}`, { status: nextStatus });
      setSuccess(
        `وضعیت حساب «${u.fullName}» به ${nextStatus === 'active' ? 'فعال' : 'غیرفعال'} تغییر یافت`,
      );
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در تغییر وضعیت کاربر');
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setError('');
    setSuccess('');
    setActionBusyId(id);
    try {
      await orgDelete(`/users/${id}`);
      setSuccess('کاربر زیرمجموعه با موفقیت از سازمان حذف شد');
      setConfirmDeleteId(null);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف کاربر');
    } finally {
      setActionBusyId(null);
    }
  }

  const activeCount = users.filter((u) => u.status === 'active').length;
  const adminCount = users.filter((u) => u.role.toUpperCase() === 'ORG_ADMIN').length;
  const staffCount = users.filter((u) => u.role.toUpperCase() === 'ORG_STAFF').length;

  return (
    <div className="org-page">
      <div
        className="org-page-title"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <span>مدیریت کاربران سازمان</span>
          <h2>کارکنان و کاربران زیرمجموعه</h2>
          <p>
            افزودن، ویرایش، تعیین نقش سازمانی، فعال/غیرفعال‌سازی و مدیریت حساب‌های کاربری متعلق به سازمان شما
          </p>
        </div>
        <button className="org-button" onClick={openCreate}>
          <UserPlus size={16} /> افزودن کاربر جدید
        </button>
      </div>

      {/* خلاصه آماری کاربران سازمان */}
      <div className="org-grid" style={{ marginBottom: 20 }}>
        <div className="org-stat">
          <div className="org-stat-icon">
            <Users size={22} />
          </div>
          <div>
            <span>کل کاربران سازمان</span>
            <strong>{users.length.toLocaleString('fa-IR')}</strong>
          </div>
        </div>
        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#e9fbf4', color: '#3f9d7b' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span>کاربران فعال</span>
            <strong>{activeCount.toLocaleString('fa-IR')}</strong>
          </div>
        </div>
        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#fff7e5', color: '#bf8b2b' }}>
            <Users size={22} />
          </div>
          <div>
            <span>ترکیب نقش‌های سازمانی</span>
            <strong style={{ fontSize: 18 }}>
              {adminCount.toLocaleString('fa-IR')} مدیر / {staffCount.toLocaleString('fa-IR')} کارشناس
            </strong>
          </div>
        </div>
      </div>

      {error && <div className="org-error">{error}</div>}
      {success && <div className="org-success">{success}</div>}

      {/* فرم ایجاد / ویرایش کاربر */}
      {showForm && (
        <div className="org-card" style={{ border: '2px solid #2877d4' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: 0 }}>
              {editId ? 'ویرایش اطلاعات کاربر سازمان' : 'افزودن کاربر جدید به سازمان'}
            </h3>
            <button
              type="button"
              className="org-icon-btn"
              onClick={() => setShowForm(false)}
              title="بستن فرم"
            >
              <X size={16} />
            </button>
          </div>
          <form
            className="org-form"
            style={{ maxWidth: '100%' }}
            onSubmit={handleSubmit}
          >
            <div className="org-grid-2">
              <div className="org-field">
                <label>نام و نام خانوادگی *</label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="مثال: سارا محمدی"
                />
              </div>

              <div className="org-field">
                <label>ایمیل (نام کاربری ورود به سامانه) *</label>
                <input
                  required
                  type="email"
                  dir="ltr"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="staff@organization.ir"
                />
              </div>

              <div className="org-field">
                <label>
                  {editId
                    ? 'رمز عبور جدید (در صورت عدم تغییر خالی بگذارید)'
                    : 'رمز عبور ورود (حداقل ۸ کاراکتر) *'}
                </label>
                <input
                  type="password"
                  dir="ltr"
                  required={!editId}
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div className="org-field">
                <label>نقش سازمانی مجاز *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="ORG_STAFF">کارشناس سازمان (ORG_STAFF)</option>
                  <option value="ORG_ADMIN">مدیر سازمان (ORG_ADMIN)</option>
                </select>
              </div>

              <div className="org-field">
                <label>وضعیت حساب کاربری *</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">فعال (مجاز به ورود و فعالیت)</option>
                  <option value="inactive">غیرفعال (مسدود موقت)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="org-button" type="submit" disabled={saving}>
                {saving
                  ? 'در حال ذخیره‌سازی...'
                  : editId
                    ? 'ذخیره تغییرات کاربر'
                    : 'ایجاد حساب کاربری در سازمان'}
              </button>
              <button
                className="org-button secondary"
                type="button"
                onClick={() => setShowForm(false)}
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* نوار جست‌وجو و فیلتر */}
      <div className="org-search-bar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadUsers();
          }}
          style={{ display: 'flex', flex: 1, gap: 10, minWidth: 240 }}
        >
          <div className="org-search-input">
            <Search size={18} />
            <input
              placeholder="جست‌وجو بر اساس نام یا ایمیل کاربر..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="org-button secondary">
            جست‌وجو
          </button>
        </form>

        <select
          className="org-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">همه نقش‌های سازمانی</option>
          <option value="ORG_ADMIN">مدیر سازمان (ORG_ADMIN)</option>
          <option value="ORG_STAFF">کارشناس سازمان (ORG_STAFF)</option>
        </select>

        <select
          className="org-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="inactive">غیرفعال</option>
        </select>
      </div>

      {/* جدول کاربران سازمان */}
      <div className="org-card">
        {loading ? (
          <div className="org-loading" style={{ minHeight: 200 }}>
            <Activity size={24} className="org-spin" /> در حال دریافت لیست کاربران سازمان...
          </div>
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>نام و نام خانوادگی</th>
                  <th>ایمیل (نام کاربری)</th>
                  <th>نقش سازمانی</th>
                  <th>وضعیت حساب</th>
                  <th>درخواست‌های ثبت‌شده</th>
                  <th>تاریخ ایجاد حساب</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="org-empty">
                      هیچ کاربری مطابق فیلترهای انتخابی در این سازمان یافت نشد
                    </td>
                  </tr>
                )}
                {users.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const isBusy = actionBusyId === u.id;
                  return (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.fullName}</strong>
                        {isSelf && (
                          <span
                            style={{
                              marginRight: 8,
                              fontSize: 11,
                              color: '#1765d1',
                              background: '#eaf3ff',
                              padding: '2px 7px',
                              borderRadius: 10,
                            }}
                          >
                            شما
                          </span>
                        )}
                      </td>
                      <td dir="ltr">{u.email}</td>
                      <td>
                        <OrgStatusBadge value={u.role} />
                      </td>
                      <td>
                        <OrgStatusBadge value={u.status} />
                      </td>
                      <td>
                        {(u.requestsCount ?? 0).toLocaleString('fa-IR')} درخواست
                      </td>
                      <td>
                        {new Date(u.createdAt).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        {confirmDeleteId === u.id ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <button
                              type="button"
                              className="org-button danger"
                              style={{ padding: '6px 12px', fontSize: 12 }}
                              disabled={isBusy}
                              onClick={() => handleDelete(u.id)}
                            >
                              تایید حذف
                            </button>
                            <button
                              type="button"
                              className="org-button secondary"
                              style={{ padding: '6px 10px', fontSize: 12 }}
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              لغو
                            </button>
                          </div>
                        ) : (
                          <div className="org-row-actions">
                            <button
                              type="button"
                              className="org-icon-btn"
                              onClick={() => openEdit(u)}
                              title="ویرایش اطلاعات و رمز عبور"
                            >
                              <Edit2 size={14} />
                            </button>
                            {!isSelf && (
                              <button
                                type="button"
                                className="org-icon-btn"
                                disabled={isBusy}
                                onClick={() => handleToggleStatus(u)}
                                title={
                                  u.status === 'active'
                                    ? 'غیرفعال‌سازی حساب کاربر'
                                    : 'فعال‌سازی حساب کاربر'
                                }
                                style={{
                                  color: u.status === 'active' ? '#bf8b2b' : '#2f855a',
                                }}
                              >
                                <Power size={14} />
                              </button>
                            )}
                            {!isSelf && (
                              <button
                                type="button"
                                className="org-icon-btn"
                                disabled={isBusy}
                                onClick={() => setConfirmDeleteId(u.id)}
                                title="حذف کاربر از سازمان"
                                style={{ color: '#c54b50' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
