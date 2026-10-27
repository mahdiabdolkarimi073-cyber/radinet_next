'use client';

import { useEffect, useState } from 'react';
import { Activity, Plus, Trash2, Edit, X } from 'lucide-react';
import { orgGet, orgPost, orgPut, orgDelete, type OrgStaff } from '@/lib/org-api';
import { OrgStatusBadge } from '@/components/org/status-badge';

export default function OrgUsersPage() {
  const [users, setUsers] = useState<OrgStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', status: 'active' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    orgGet<{ items: OrgStaff[] }>('/users')
      .then((d) => setUsers(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm({ fullName: '', email: '', password: '', status: 'active' });
    setEditingId(null);
    setFormError('');
    setShowModal(true);
  }

  function openEdit(u: OrgStaff) {
    setForm({ fullName: u.fullName, email: u.email, password: '', status: u.status });
    setEditingId(u.id);
    setFormError('');
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.fullName.trim() || !form.email.trim()) {
      setFormError('نام و ایمیل الزامی است');
      return;
    }
    if (!editingId && form.password.length < 6) {
      setFormError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const body: Record<string, string> = { fullName: form.fullName, email: form.email, status: form.status };
        if (form.password) body.password = form.password;
        await orgPut(`/users/${editingId}`, body);
      } else {
        await orgPost('/users', { fullName: form.fullName, email: form.email, password: form.password });
      }
      setShowModal(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'خطا در ذخیره‌سازی');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;
    try {
      await orgDelete(`/users/${id}`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف');
    }
  }

  if (loading)
    return (
      <div className="org-page">
        <div className="org-loading" style={{ minHeight: 400 }}>
          <Activity size={24} className="org-spin" /> در حال بارگذاری...
        </div>
      </div>
    );

  return (
    <div className="org-page">
      <div className="org-page-title">
        <span>مدیریت کاربران</span>
        <h2>کاربران سازمان</h2>
        <p>مدیریت کارشناسان و مدیران سازمان — افزودن، ویرایش و حذف</p>
      </div>

      {error && <div className="org-error">{error}</div>}

      <div style={{ marginBottom: 16 }}>
        <button className="org-button" onClick={openAdd}>
          <Plus size={18} /> افزودن کاربر جدید
        </button>
      </div>

      <div className="org-card">
        <h3>لیست کاربران ({users.length})</h3>
        {users.length > 0 ? (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>نام و نام خانوادگی</th>
                  <th>ایمیل</th>
                  <th>نقش</th>
                  <th>وضعیت</th>
                  <th>تاریخ عضویت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullName}</td>
                    <td dir="ltr">{u.email}</td>
                    <td>{u.role === 'ORG_ADMIN' ? 'مدیر سازمان' : 'کارشناس سازمان'}</td>
                    <td><OrgStatusBadge value={u.status} /></td>
                    <td>{new Date(u.createdAt).toLocaleDateString('fa-IR')}</td>
                    <td>
                      <div className="org-row-actions">
                        <button className="org-icon-btn" onClick={() => openEdit(u)} title="ویرایش">
                          <Edit size={16} />
                        </button>
                        {u.role !== 'ORG_ADMIN' && (
                          <button className="org-icon-btn" onClick={() => handleDelete(u.id)} title="حذف">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="org-empty">هنوز کاربری ثبت نشده است</div>
        )}
      </div>

      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center', zIndex: 1000 }}
          onClick={() => setShowModal(false)}
        >
          <div className="org-card" style={{ width: '90%', maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{editingId ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}</h3>
              <button className="org-icon-btn" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            {formError && <div className="org-error">{formError}</div>}
            <form className="org-form" onSubmit={handleSubmit}>
              <div className="org-field">
                <label>نام و نام خانوادگی</label>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="org-field">
                <label>ایمیل</label>
                <input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="org-field">
                <label>رمز عبور {editingId && '(در صورت تغییر وارد کنید)'}</label>
                <input type="password" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              {editingId && (
                <div className="org-field">
                  <label>وضعیت</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                  </select>
                </div>
              )}
              <button className="org-button" type="submit" disabled={saving}>
                {saving ? 'در حال ذخیره...' : editingId ? 'ذخیره تغییرات' : 'افزودن کاربر'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
