'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2, ChevronLeft, ChevronRight, Edit3, Eye, Filter, Plus, Search, Trash2, X,
} from 'lucide-react';
import { formatDate } from '@/lib/agency-nav';

type Center = {
  id: string; agency_id: string; name: string; address: string; phone: string;
  email: string; manager_name: string; city: string; province: string;
  status: string; created_at: string; updated_at: string;
};

type FormState = {
  name: string; address: string; phone: string; email: string;
  manager_name: string; city: string; province: string; status: string;
};

const emptyForm: FormState = {
  name: '', address: '', phone: '', email: '', manager_name: '', city: '', province: '', status: 'active',
};

const statusLabels: Record<string, string> = { active: 'فعال', inactive: 'غیرفعال', suspended: 'معلق' };
const statusClasses: Record<string, string> = { active: 'is-active', inactive: 'is-inactive', suspended: 'is-suspended' };

export function AgencyCentersPage() {
  const [items, setItems] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Center | null>(null);
  const [viewItem, setViewItem] = useState<Center | null>(null);
  const [deleteItem, setDeleteItem] = useState<Center | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/agency/centers', { headers, cache: 'no-store' });
      if (!res.ok) throw new Error('دریافت مراکز ناموفق بود.');
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
    return items.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.manager_name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPages = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openAdd() { setEditItem(null); setForm(emptyForm); setFormError(''); setShowModal(true); }
  function openEdit(c: Center) { setEditItem(c); setForm({ name: c.name, address: c.address, phone: c.phone, email: c.email, manager_name: c.manager_name, city: c.city, province: c.province, status: c.status }); setFormError(''); setShowModal(true); }

  async function handleSave() {
    if (!form.name.trim()) { setFormError('نام مرکز الزامی است.'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await fetch(`/api/agency/centers/${editItem.id}`, { method: 'PUT', headers, body: JSON.stringify(form) });
      } else {
        await fetch('/api/agency/centers', { method: 'POST', headers, body: JSON.stringify(form) });
      }
      setShowModal(false);
      void load();
    } catch {
      setFormError('خطا در ذخیره‌سازی.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteItem) return;
    try {
      await fetch(`/api/agency/centers/${deleteItem.id}`, { method: 'DELETE', headers });
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
          <h2>مدیریت مراکز زیرمجموعه</h2>
          <p>افزودن، ویرایش، مشاهده و حذف مراکز تصویربرداری زیرمجموعه نمایندگی</p>
        </div>
        <button className="agency-page-add-btn" onClick={openAdd}><Plus size={20} /> افزودن مرکز</button>
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
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="جستجو بر اساس نام، شهر یا مدیر..." />
          <Filter size={18} />
        </div>
      </section>

      {error && <div className="agency-page-error">{error}</div>}

      <section className="agency-page-table-card">
        <div className="agency-page-table-meta">
          <strong>فهرست مراکز</strong>
          <span>{filtered.length.toLocaleString('fa-IR')} مرکز</span>
        </div>
        <div className="agency-page-table-wrap">
          <table className="agency-page-table">
            <thead>
              <tr>
                <th>نام مرکز</th><th>شهر</th><th>استان</th><th>مدیر</th><th>تلفن</th><th>وضعیت</th><th>تاریخ ثبت</th><th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="agency-page-empty">در حال دریافت...</td></tr>}
              {!loading && currentPages.length === 0 && <tr><td colSpan={8} className="agency-page-empty">مرکزی یافت نشد.</td></tr>}
              {!loading && currentPages.map((c) => (
                <tr key={c.id}>
                  <td data-label="نام مرکز" className="agency-page-user-cell"><strong>{c.name}</strong><small>{c.email || '—'}</small></td>
                  <td data-label="شهر">{c.city || '—'}</td>
                  <td data-label="استان">{c.province || '—'}</td>
                  <td data-label="مدیر">{c.manager_name || '—'}</td>
                  <td data-label="تلفن">{c.phone || '—'}</td>
                  <td data-label="وضعیت"><span className={`agency-status-badge ${statusClasses[c.status] ?? 'is-inactive'}`}>{statusLabels[c.status] ?? c.status}</span></td>
                  <td data-label="تاریخ ثبت">{formatDate(c.created_at)}</td>
                  <td data-label="عملیات">
                    <div className="agency-page-actions">
                      <button className="agency-page-action agency-page-action--view" onClick={() => setViewItem(c)} title="مشاهده"><Eye size={16} /></button>
                      <button className="agency-page-action agency-page-action--edit" onClick={() => openEdit(c)} title="ویرایش"><Edit3 size={16} /></button>
                      <button className="agency-page-action agency-page-action--delete" onClick={() => setDeleteItem(c)} title="حذف"><Trash2 size={16} /></button>
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
              <h3>{editItem ? 'ویرایش مرکز' : 'افزودن مرکز جدید'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="agency-modal__form">
              {formError && <div className="agency-modal__error">{formError}</div>}
              <label><span>نام مرکز *</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <div className="agency-modal__row">
                <label><span>شهر</span><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
                <label><span>استان</span><input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} /></label>
              </div>
              <div className="agency-modal__row">
                <label><span>نام مدیر</span><input value={form.manager_name} onChange={(e) => setForm({ ...form, manager_name: e.target.value })} /></label>
                <label><span>تلفن</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              </div>
              <label><span>ایمیل</span><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              <label><span>آدرس</span><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
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
              <h3>جزئیات مرکز</h3>
              <button onClick={() => setViewItem(null)}><X size={18} /></button>
            </div>
            <div className="agency-modal__body">
              <div className="agency-detail-section">
                <h4>اطلاعات مرکز</h4>
                <div className="agency-detail-grid">
                  <div><span>نام مرکز</span><strong>{viewItem.name}</strong></div>
                  <div><span>مدیر</span><strong>{viewItem.manager_name || '—'}</strong></div>
                  <div><span>شهر</span><strong>{viewItem.city || '—'}</strong></div>
                  <div><span>استان</span><strong>{viewItem.province || '—'}</strong></div>
                  <div><span>تلفن</span><strong>{viewItem.phone || '—'}</strong></div>
                  <div><span>ایمیل</span><strong>{viewItem.email || '—'}</strong></div>
                  <div><span>آدرس</span><strong>{viewItem.address || '—'}</strong></div>
                  <div><span>وضعیت</span><strong>{statusLabels[viewItem.status] ?? viewItem.status}</strong></div>
                  <div><span>تاریخ ثبت</span><strong>{formatDate(viewItem.created_at)}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteItem && (
        <div className="agency-modal-overlay" onClick={() => setDeleteItem(null)}>
          <div className="agency-modal" onClick={(e) => e.stopPropagation()}>
            <div className="agency-modal__head">
              <h3>حذف مرکز</h3>
              <button onClick={() => setDeleteItem(null)}><X size={18} /></button>
            </div>
            <div className="agency-modal__form">
              <p style={{ fontSize: '14px', color: '#254064', lineHeight: 1.7 }}>آیا از حذف مرکز «{deleteItem.name}» اطمینان دارید؟ این عملیات قابل بازگشت نیست.</p>
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
