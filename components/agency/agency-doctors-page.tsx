'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Edit3, Eye, Filter, Plus, Search, ShieldCheck, Stethoscope, Trash2, X,
} from 'lucide-react';
import { formatDate } from '@/lib/agency-nav';

type Doctor = {
  id: string; agency_id: string; full_name: string; email: string; phone: string;
  specialty: string; sub_specialty: string; license_number: string;
  permissions: Record<string, boolean>; status: string;
  created_at: string; updated_at: string;
};

type FormState = {
  full_name: string; email: string; phone: string; specialty: string;
  sub_specialty: string; license_number: string; status: string;
};

const emptyForm: FormState = {
  full_name: '', email: '', phone: '', specialty: '', sub_specialty: '', license_number: '', status: 'active',
};

const statusLabels: Record<string, string> = { active: 'فعال', inactive: 'غیرفعال', suspended: 'معلق' };
const statusClasses: Record<string, string> = { active: 'is-active', inactive: 'is-inactive', suspended: 'is-suspended' };

const permissionLabels: Record<string, string> = {
  can_view_reports: 'مشاهده گزارش‌ها',
  can_edit_reports: 'ویرایش گزارش‌ها',
  can_sign_reports: 'امضای گزارش‌ها',
  can_manage_patients: 'مدیریت بیماران',
  can_view_orders: 'مشاهده درخواست‌ها',
  can_view_finance: 'مشاهده امور مالی',
  can_tele_report: 'تله‌ریپورت',
};

export function AgencyDoctorsPage() {
  const [items, setItems] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Doctor | null>(null);
  const [viewItem, setViewItem] = useState<Doctor | null>(null);
  const [deleteItem, setDeleteItem] = useState<Doctor | null>(null);
  const [permsItem, setPermsItem] = useState<Doctor | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [permsSaving, setPermsSaving] = useState(false);

  const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/agency/doctors', { headers, cache: 'no-store' });
      if (!res.ok) throw new Error('دریافت پزشکان ناموفق بود.');
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    return items.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return d.full_name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPages = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openAdd() { setEditItem(null); setForm(emptyForm); setFormError(''); setShowModal(true); }
  function openEdit(d: Doctor) { setEditItem(d); setForm({ full_name: d.full_name, email: d.email, phone: d.phone, specialty: d.specialty, sub_specialty: d.sub_specialty, license_number: d.license_number, status: d.status }); setFormError(''); setShowModal(true); }
  function openPerms(d: Doctor) { setPermsItem(d); setPerms(d.permissions ?? {}); }

  async function handleSave() {
    if (!form.full_name.trim()) { setFormError('نام پزشک الزامی است.'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await fetch(`/api/agency/doctors/${editItem.id}`, { method: 'PUT', headers, body: JSON.stringify({ ...form, permissions: editItem.permissions }) });
      } else {
        await fetch('/api/agency/doctors', { method: 'POST', headers, body: JSON.stringify(form) });
      }
      setShowModal(false);
      void load();
    } catch {
      setFormError('خطا در ذخیره‌سازی.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePerms() {
    if (!permsItem) return;
    setPermsSaving(true);
    try {
      await fetch(`/api/agency/doctors/${permsItem.id}`, { method: 'PUT', headers, body: JSON.stringify({ ...permsItem, permissions: perms, full_name: permsItem.full_name, email: permsItem.email, phone: permsItem.phone, specialty: permsItem.specialty, sub_specialty: permsItem.sub_specialty, license_number: permsItem.license_number, status: permsItem.status }) });
      setPermsItem(null);
      void load();
    } catch {
      setError('ذخیره مجوزها ناموفق بود.');
    } finally {
      setPermsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteItem) return;
    try {
      await fetch(`/api/agency/doctors/${deleteItem.id}`, { method: 'DELETE', headers });
      setDeleteItem(null);
      void load();
    } catch {
      setError('حذف ناموفق بود.');
    }
  }

  return (
    <>
      <div className="agency-page-title">
        <div>
          <h2>مدیریت پزشکان زیرمجموعه</h2>
          <p>افزودن، ویرایش، مدیریت مجوزها و حذف پزشکان رادیولوژیست زیرمجموعه</p>
        </div>
        <button className="agency-page-add-btn" onClick={openAdd}><Plus size={20} /> افزودن پزشک</button>
      </div>

      <section className="agency-page-filter-card">
        <div className="agency-page-filter-row">
          <label>
            <span>وضعیت</span>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">همه</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
              <option value="suspended">معلق</option>
            </select>
          </label>
        </div>
        <div className="agency-page-search">
          <Search size={18} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="جستجو بر اساس نام، تخصص یا ایمیل..." />
          <Filter size={18} />
        </div>
      </section>

      {error && <div className="agency-page-error">{error}</div>}

      <section className="agency-page-table-card">
        <div className="agency-page-table-meta">
          <strong>فهرست پزشکان</strong>
          <span>{filtered.length.toLocaleString('fa-IR')} پزشک</span>
        </div>
        <div className="agency-page-table-wrap">
          <table className="agency-page-table">
            <thead>
              <tr>
                <th>نام پزشک</th><th>تخصص</th><th>زیرتخصص</th><th>شماره پروانه</th><th>تلفن</th><th>وضعیت</th><th>تاریخ ثبت</th><th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="agency-page-empty">در حال دریافت...</td></tr>}
              {!loading && currentPages.length === 0 && <tr><td colSpan={8} className="agency-page-empty">پزشکی یافت نشد.</td></tr>}
              {!loading && currentPages.map((d) => (
                <tr key={d.id}>
                  <td data-label="نام پزشک" className="agency-page-user-cell"><strong>{d.full_name}</strong><small>{d.email || '—'}</small></td>
                  <td data-label="تخصص">{d.specialty || '—'}</td>
                  <td data-label="زیرتخصص">{d.sub_specialty || '—'}</td>
                  <td data-label="شماره پروانه">{d.license_number || '—'}</td>
                  <td data-label="تلفن">{d.phone || '—'}</td>
                  <td data-label="وضعیت"><span className={`agency-status-badge ${statusClasses[d.status] ?? 'is-inactive'}`}>{statusLabels[d.status] ?? d.status}</span></td>
                  <td data-label="تاریخ ثبت">{formatDate(d.created_at)}</td>
                  <td data-label="عملیات">
                    <div className="agency-page-actions">
                      <button className="agency-page-action agency-page-action--view" onClick={() => setViewItem(d)} title="مشاهده"><Eye size={16} /></button>
                      <button className="agency-page-action agency-page-action--permissions" onClick={() => openPerms(d)} title="مجوزها"><ShieldCheck size={16} /></button>
                      <button className="agency-page-action agency-page-action--edit" onClick={() => openEdit(d)} title="ویرایش"><Edit3 size={16} /></button>
                      <button className="agency-page-action agency-page-action--delete" onClick={() => setDeleteItem(d)} title="حذف"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > pageSize && (
          <div className="agency-page-pagination">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronRight size={16} /> قبلی</button>
            <div>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={page === i + 1 ? 'is-current' : ''} onClick={() => setPage(i + 1)}>{(i + 1).toLocaleString('fa-IR')}</button>
              ))}
            </div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>بعدی <ChevronLeft size={16} /></button>
          </div>
        )}
      </section>

      {showModal && (
        <div className="agency-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="agency-modal agency-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="agency-modal__head">
              <h3>{editItem ? 'ویرایش پزشک' : 'افزودن پزشک جدید'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="agency-modal__form">
              {formError && <div className="agency-modal__error">{formError}</div>}
              <label><span>نام و نام خانوادگی *</span><input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label>
              <div className="agency-modal__row">
                <label><span>تخصص</span><input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} /></label>
                <label><span>زیرتخصص</span><input value={form.sub_specialty} onChange={(e) => setForm({ ...form, sub_specialty: e.target.value })} /></label>
              </div>
              <div className="agency-modal__row">
                <label><span>شماره پروانه</span><input value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} /></label>
                <label><span>تلفن</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              </div>
              <label><span>ایمیل</span><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              <label><span>وضعیت</span>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">فعال</option>
                  <option value="inactive">غیرفعال</option>
                  <option value="suspended">معلق</option>
                </select>
              </label>
              <div className="agency-modal__actions">
                <button className="agency-modal__cancel" onClick={() => setShowModal(false)}>انصراف</button>
                <button className="agency-modal__save" onClick={handleSave} disabled={saving}>{saving ? 'در حال ذخیره...' : 'ذخیره'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewItem && (
        <div className="agency-modal-overlay" onClick={() => setViewItem(null)}>
          <div className="agency-modal agency-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="agency-modal__head">
              <h3>جزئیات پزشک</h3>
              <button onClick={() => setViewItem(null)}><X size={18} /></button>
            </div>
            <div className="agency-modal__body">
              <div className="agency-detail-section">
                <h4>اطلاعات پزشک</h4>
                <div className="agency-detail-grid">
                  <div><span>نام</span><strong>{viewItem.full_name}</strong></div>
                  <div><span>تخصص</span><strong>{viewItem.specialty || '—'}</strong></div>
                  <div><span>زیرتخصص</span><strong>{viewItem.sub_specialty || '—'}</strong></div>
                  <div><span>شماره پروانه</span><strong>{viewItem.license_number || '—'}</strong></div>
                  <div><span>تلفن</span><strong>{viewItem.phone || '—'}</strong></div>
                  <div><span>ایمیل</span><strong>{viewItem.email || '—'}</strong></div>
                  <div><span>وضعیت</span><strong>{statusLabels[viewItem.status] ?? viewItem.status}</strong></div>
                  <div><span>تاریخ ثبت</span><strong>{formatDate(viewItem.created_at)}</strong></div>
                </div>
              </div>
              <div className="agency-detail-section">
                <h4>مجوزها</h4>
                <div className="agency-detail-grid">
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <div key={key}><span>{label}</span><strong>{viewItem.permissions?.[key] ? 'دارد' : 'ندارد'}</strong></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {permsItem && (
        <div className="agency-modal-overlay" onClick={() => setPermsItem(null)}>
          <div className="agency-modal agency-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="agency-modal__head">
              <h3>مدیریت مجوزهای {permsItem.full_name}</h3>
              <button onClick={() => setPermsItem(null)}><X size={18} /></button>
            </div>
            <div className="agency-modal__form">
              <div className="agency-perms-grid">
                {Object.entries(permissionLabels).map(([key, label]) => (
                  <label key={key} className="agency-modal__checkbox">
                    <input type="checkbox" checked={perms[key] ?? false} onChange={(e) => setPerms({ ...perms, [key]: e.target.checked })} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="agency-modal__actions">
                <button className="agency-modal__cancel" onClick={() => setPermsItem(null)}>انصراف</button>
                <button className="agency-modal__save" onClick={handleSavePerms} disabled={permsSaving}>{permsSaving ? 'در حال ذخیره...' : 'ذخیره مجوزها'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteItem && (
        <div className="agency-modal-overlay" onClick={() => setDeleteItem(null)}>
          <div className="agency-modal" onClick={(e) => e.stopPropagation()}>
            <div className="agency-modal__head">
              <h3>حذف پزشک</h3>
              <button onClick={() => setDeleteItem(null)}><X size={18} /></button>
            </div>
            <div className="agency-modal__form">
              <p style={{ fontSize: '14px', color: '#254064', lineHeight: 1.7 }}>آیا از حذف پزشک «{deleteItem.full_name}» اطمینان دارید؟ این عملیات قابل بازگشت نیست.</p>
              <div className="agency-modal__actions">
                <button className="agency-modal__cancel" onClick={() => setDeleteItem(null)}>انصراف</button>
                <button className="agency-modal__save" onClick={handleDelete}>حذف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
