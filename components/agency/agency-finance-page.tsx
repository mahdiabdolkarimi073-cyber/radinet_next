'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Download, DollarSign, Eye, Filter, Wallet, X,
} from 'lucide-react';
import { formatDate, formatToman } from '@/lib/agency-nav';

type Transaction = {
  id: string; agency_id: string; type: string; amount: number;
  description: string; status: string; reference_id: string | null; created_at: string;
};

const statusLabels: Record<string, string> = { paid: 'پرداخت‌شده', unpaid: 'پرداخت‌نشده', pending: 'در انتظار', refunded: 'بازگشت‌شده' };
const statusClasses: Record<string, string> = { paid: 'is-paid', unpaid: 'is-unpaid', pending: 'is-pending', refunded: 'is-inactive' };
const typeLabels: Record<string, string> = { invoice: 'صورت‌حساب', commission: 'کارمزد', withdrawal: 'برداشت', deposit: 'واریز', other: 'سایر' };

export function AgencyFinancePage() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [viewItem, setViewItem] = useState<Transaction | null>(null);

  const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
  const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/agency/transactions', { headers, cache: 'no-store' });
      if (!res.ok) throw new Error('دریافت تراکنش‌ها ناموفق بود.');
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
    return items.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      return true;
    });
  }, [items, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPages = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totalRevenue = filtered.filter((t) => t.status === 'paid' && (t.type === 'commission' || t.type === 'deposit')).reduce((sum, t) => sum + Number(t.amount), 0);
  const totalCommission = filtered.filter((t) => t.type === 'commission' && t.status === 'paid').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalUnpaid = filtered.filter((t) => t.status === 'unpaid').reduce((sum, t) => sum + Number(t.amount), 0);

  function exportCSV() {
    const rows = [['نوع', 'توضیحات', 'مبلغ', 'وضعیت', 'تاریخ'], ...filtered.map((t) => [typeLabels[t.type] ?? t.type, t.description, String(t.amount), statusLabels[t.status] ?? t.status, formatDate(t.created_at)])];
    const csv = '\uFEFF' + rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'agency-finance.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html dir="rtl"><head><title>گزارش مالی</title><style>body{font-family:Tahoma,sans-serif;padding:30px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f0f4fa}</style></head><body>`);
    win.document.write('<h2>گزارش امور مالی و کارمزد</h2>');
    win.document.write('<table><thead><tr><th>نوع</th><th>توضیحات</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th></tr></thead><tbody>');
    filtered.forEach((t) => { win.document.write(`<tr><td>${typeLabels[t.type] ?? t.type}</td><td>${t.description}</td><td>${formatToman(t.amount)}</td><td>${statusLabels[t.status] ?? t.status}</td><td>${formatDate(t.created_at)}</td></tr>`); });
    win.document.write('</tbody></table></body></html>');
    win.document.close();
    win.print();
  }

  return (
    <>
      <div className="agency-page-title">
        <div>
          <h2>امور مالی و کارمزد</h2>
          <p>مشاهده صورت‌حساب‌ها، کارمزدها و تراکنش‌های مالی نمایندگی</p>
        </div>
        <div className="agency-export-bar">
          <button className="agency-export-btn agency-export-btn--excel" onClick={exportCSV}><Download size={16} /> خروجی Excel</button>
          <button className="agency-export-btn agency-export-btn--pdf" onClick={exportPDF}><Download size={16} /> خروجی PDF</button>
        </div>
      </div>

      <section className="agency-stats-grid">
        <article className="agency-stat-card">
          <div className="agency-stat-card__top">
            <span>درآمد کل</span>
            <div className="agency-stat-card__icon" style={{ background: '#e8f7f1', color: '#168A68' }}><DollarSign size={26} strokeWidth={1.8} /></div>
          </div>
          <strong>{formatToman(totalRevenue)} تومان</strong>
        </article>
        <article className="agency-stat-card">
          <div className="agency-stat-card__top">
            <span>کارمزد</span>
            <div className="agency-stat-card__icon" style={{ background: '#fff6e5', color: '#C9973E' }}><Wallet size={26} strokeWidth={1.8} /></div>
          </div>
          <strong>{formatToman(totalCommission)} تومان</strong>
        </article>
        <article className="agency-stat-card">
          <div className="agency-stat-card__top">
            <span>پرداخت‌نشده</span>
            <div className="agency-stat-card__icon" style={{ background: '#fdeaea', color: '#D94B55' }}><DollarSign size={26} strokeWidth={1.8} /></div>
          </div>
          <strong>{formatToman(totalUnpaid)} تومان</strong>
        </article>
      </section>

      <section className="agency-page-filter-card">
        <div className="agency-page-filter-row">
          <label>
            <span>نوع تراکنش</span>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
              <option value="all">همه</option>
              <option value="invoice">صورت‌حساب</option>
              <option value="commission">کارمزد</option>
              <option value="withdrawal">برداشت</option>
              <option value="deposit">واریز</option>
              <option value="other">سایر</option>
            </select>
          </label>
          <label>
            <span>وضعیت</span>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">همه</option>
              <option value="paid">پرداخت‌شده</option>
              <option value="unpaid">پرداخت‌نشده</option>
              <option value="pending">در انتظار</option>
              <option value="refunded">بازگشت‌شده</option>
            </select>
          </label>
        </div>
      </section>

      {error && <div className="agency-page-error">{error}</div>}

      <section className="agency-page-table-card">
        <div className="agency-page-table-meta">
          <strong>فهرست تراکنش‌ها</strong>
          <span>{filtered.length.toLocaleString('fa-IR')} تراکنش</span>
        </div>
        <div className="agency-page-table-wrap">
          <table className="agency-page-table">
            <thead>
              <tr>
                <th>نوع</th><th>توضیحات</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th><th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="agency-page-empty">در حال دریافت...</td></tr>}
              {!loading && currentPages.length === 0 && <tr><td colSpan={6} className="agency-page-empty">تراکنشی یافت نشد.</td></tr>}
              {!loading && currentPages.map((t) => (
                <tr key={t.id}>
                  <td data-label="نوع">{typeLabels[t.type] ?? t.type}</td>
                  <td data-label="توضیحات">{t.description || '—'}</td>
                  <td data-label="مبلغ">{formatToman(t.amount)} تومان</td>
                  <td data-label="وضعیت"><span className={`agency-status-badge ${statusClasses[t.status] ?? 'is-unpaid'}`}>{statusLabels[t.status] ?? t.status}</span></td>
                  <td data-label="تاریخ">{formatDate(t.created_at)}</td>
                  <td data-label="عملیات">
                    <div className="agency-page-actions">
                      <button className="agency-page-action agency-page-action--view" onClick={() => setViewItem(t)} title="مشاهده"><Eye size={16} /></button>
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
          <div className="agency-modal" onClick={(e) => e.stopPropagation()}>
            <div className="agency-modal__head">
              <h3>جزئیات تراکنش</h3>
              <button onClick={() => setViewItem(null)}><X size={18} /></button>
            </div>
            <div className="agency-modal__body">
              <div className="agency-detail-section">
                <h4>اطلاعات تراکنش</h4>
                <div className="agency-detail-grid">
                  <div><span>نوع</span><strong>{typeLabels[viewItem.type] ?? viewItem.type}</strong></div>
                  <div><span>مبلغ</span><strong>{formatToman(viewItem.amount)} تومان</strong></div>
                  <div><span>وضعیت</span><strong>{statusLabels[viewItem.status] ?? viewItem.status}</strong></div>
                  <div><span>تاریخ</span><strong>{formatDate(viewItem.created_at)}</strong></div>
                  <div><span>شناسه مرجع</span><strong>{viewItem.reference_id || '—'}</strong></div>
                  <div><span>توضیحات</span><strong>{viewItem.description || '—'}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
