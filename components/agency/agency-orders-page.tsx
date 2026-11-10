'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Download, Eye, FileText, Filter, Search, X,
} from 'lucide-react';
import { formatDate, formatToman } from '@/lib/agency-nav';

type Order = {
  id: string; agency_id: string; order_number: string; center_name: string;
  doctor_name: string; status: string; amount: number; type: string; created_at: string;
};

const statusLabels: Record<string, string> = {
  new: 'جدید', pending: 'در انتظار', in_progress: 'در حال بررسی', completed: 'تکمیل‌شده', rejected: 'ردشده', cancelled: 'لغوشده',
};
const statusClasses: Record<string, string> = {
  new: 'is-new', pending: 'is-pending', in_progress: 'is-in_progress', completed: 'is-completed', rejected: 'is-rejected', cancelled: 'is-inactive',
};
const typeLabels: Record<string, string> = { telereport: 'تله‌ریپورت', shop: 'فروشگاه', other: 'سایر' };

export function AgencyOrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [viewItem, setViewItem] = useState<Order | null>(null);

  const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
  const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/agency/orders', { headers, cache: 'no-store' });
      if (!res.ok) throw new Error('دریافت درخواست‌ها ناموفق بود.');
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
    return items.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (typeFilter !== 'all' && o.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return o.order_number.toLowerCase().includes(q) || o.center_name.toLowerCase().includes(q) || o.doctor_name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPages = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportCSV() {
    const rows = [['شماره درخواست', 'مرکز', 'پزشک', 'نوع', 'وضعیت', 'مبلغ', 'تاریخ'], ...filtered.map((o) => [o.order_number, o.center_name, o.doctor_name, typeLabels[o.type] ?? o.type, statusLabels[o.status] ?? o.status, String(o.amount), formatDate(o.created_at)])];
    const csv = '\uFEFF' + rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'agency-orders.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html dir="rtl"><head><title>گزارش درخواست‌ها</title><style>body{font-family:Tahoma,sans-serif;padding:30px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f0f4fa}</style></head><body>`);
    win.document.write('<h2>گزارش درخواست‌ها و سفارش‌ها</h2>');
    win.document.write('<table><thead><tr><th>شماره</th><th>مرکز</th><th>پزشک</th><th>نوع</th><th>وضعیت</th><th>مبلغ</th><th>تاریخ</th></tr></thead><tbody>');
    filtered.forEach((o) => { win.document.write(`<tr><td>${o.order_number}</td><td>${o.center_name}</td><td>${o.doctor_name}</td><td>${typeLabels[o.type] ?? o.type}</td><td>${statusLabels[o.status] ?? o.status}</td><td>${formatToman(o.amount)}</td><td>${formatDate(o.created_at)}</td></tr>`); });
    win.document.write('</tbody></table></body></html>');
    win.document.close();
    win.print();
  }

  return (
    <>
      <div className="agency-page-title">
        <div>
          <h2>درخواست‌ها و سفارش‌ها</h2>
          <p>مشاهده تمام درخواست‌ها و سفارش‌های ثبت‌شده در محدوده جغرافیایی نمایندگی</p>
        </div>
        <div className="agency-export-bar">
          <button className="agency-export-btn agency-export-btn--excel" onClick={exportCSV}><Download size={16} /> خروجی Excel</button>
          <button className="agency-export-btn agency-export-btn--pdf" onClick={exportPDF}><Download size={16} /> خروجی PDF</button>
        </div>
      </div>

      <section className="agency-page-filter-card">
        <div className="agency-page-filter-row">
          <label>
            <span>وضعیت</span>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">همه</option>
              <option value="new">جدید</option>
              <option value="pending">در انتظار</option>
              <option value="in_progress">در حال بررسی</option>
              <option value="completed">تکمیل‌شده</option>
              <option value="rejected">ردشده</option>
              <option value="cancelled">لغوشده</option>
            </select>
          </label>
          <label>
            <span>نوع</span>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
              <option value="all">همه</option>
              <option value="telereport">تله‌ریپورت</option>
              <option value="shop">فروشگاه</option>
              <option value="other">سایر</option>
            </select>
          </label>
        </div>
        <div className="agency-page-search">
          <Search size={18} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="جستجو بر اساس شماره، مرکز یا پزشک..." />
          <Filter size={18} />
        </div>
      </section>

      {error && <div className="agency-page-error">{error}</div>}

      <section className="agency-page-table-card">
        <div className="agency-page-table-meta">
          <strong>فهرست درخواست‌ها</strong>
          <span>{filtered.length.toLocaleString('fa-IR')} درخواست</span>
        </div>
        <div className="agency-page-table-wrap">
          <table className="agency-page-table">
            <thead>
              <tr>
                <th>شماره درخواست</th><th>مرکز</th><th>پزشک</th><th>نوع</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th><th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="agency-page-empty">در حال دریافت...</td></tr>}
              {!loading && currentPages.length === 0 && <tr><td colSpan={8} className="agency-page-empty">درخواستی یافت نشد.</td></tr>}
              {!loading && currentPages.map((o) => (
                <tr key={o.id}>
                  <td data-label="شماره درخواست" className="agency-page-user-cell"><strong>{o.order_number}</strong></td>
                  <td data-label="مرکز">{o.center_name || '—'}</td>
                  <td data-label="پزشک">{o.doctor_name || '—'}</td>
                  <td data-label="نوع">{typeLabels[o.type] ?? o.type}</td>
                  <td data-label="مبلغ">{formatToman(o.amount)}</td>
                  <td data-label="وضعیت"><span className={`agency-status-badge ${statusClasses[o.status] ?? 'is-pending'}`}>{statusLabels[o.status] ?? o.status}</span></td>
                  <td data-label="تاریخ">{formatDate(o.created_at)}</td>
                  <td data-label="عملیات">
                    <div className="agency-page-actions">
                      <button className="agency-page-action agency-page-action--view" onClick={() => setViewItem(o)} title="مشاهده"><Eye size={16} /></button>
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

      {viewItem && (
        <div className="agency-modal-overlay" onClick={() => setViewItem(null)}>
          <div className="agency-modal agency-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="agency-modal__head">
              <h3>جزئیات درخواست</h3>
              <button onClick={() => setViewItem(null)}><X size={18} /></button>
            </div>
            <div className="agency-modal__body">
              <div className="agency-detail-section">
                <h4>اطلاعات درخواست</h4>
                <div className="agency-detail-grid">
                  <div><span>شماره درخواست</span><strong>{viewItem.order_number}</strong></div>
                  <div><span>مرکز</span><strong>{viewItem.center_name || '—'}</strong></div>
                  <div><span>پزشک</span><strong>{viewItem.doctor_name || '—'}</strong></div>
                  <div><span>نوع</span><strong>{typeLabels[viewItem.type] ?? viewItem.type}</strong></div>
                  <div><span>مبلغ</span><strong>{formatToman(viewItem.amount)} تومان</strong></div>
                  <div><span>وضعیت</span><strong>{statusLabels[viewItem.status] ?? viewItem.status}</strong></div>
                  <div><span>تاریخ ثبت</span><strong>{formatDate(viewItem.created_at)}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
