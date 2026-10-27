'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Search, ChevronLeft } from 'lucide-react';
import { orgGet, type OrgRequest } from '@/lib/org-api';
import { OrgStatusBadge } from '@/components/org/status-badge';

const statusOptions = [
  { value: 'all', label: 'همه وضعیت‌ها' },
  { value: 'new', label: 'جدید' },
  { value: 'pending', label: 'در انتظار' },
  { value: 'processing', label: 'در حال پردازش' },
  { value: 'completed', label: 'تکمیل شده' },
];

const typeOptions = [
  { value: 'all', label: 'همه انواع' },
  { value: 'MRI', label: 'MRI' },
  { value: 'CT Scan', label: 'CT Scan' },
  { value: 'X-Ray', label: 'X-Ray' },
  { value: 'Ultrasound', label: 'Ultrasound' },
];

export default function OrgRequestsPage() {
  const [requests, setRequests] = useState<OrgRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: 'all', type: 'all' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.type !== 'all') params.set('type', filters.type);
    params.set('page', String(page));
    orgGet<{ items: OrgRequest[]; total: number; pages: number }>(`/requests?${params}`)
      .then((d) => {
        setRequests(d.items);
        setTotal(d.total);
        setPages(d.pages);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [filters, page]);

  return (
    <div className="org-page">
      <div className="org-page-title">
        <span>پیگیری درخواست‌ها</span>
        <h2>لیست درخواست‌های تله‌ریپورت</h2>
        <p>مشاهده و پیگیری تمامی درخواست‌های ثبت شده ({total} درخواست)</p>
      </div>

      {error && <div className="org-error">{error}</div>}

      <div className="org-search-bar">
        <div className="org-search-input">
          <Search size={18} />
          <input placeholder="جستجو..." />
        </div>
        <select className="org-select" value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}>
          {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="org-select" value={filters.type} onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}>
          {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="org-card">
        {loading ? (
          <div className="org-loading" style={{ minHeight: 200 }}><Activity size={24} className="org-spin" /> در حال بارگذاری...</div>
        ) : requests.length > 0 ? (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>شماره درخواست</th>
                  <th>بیمار</th>
                  <th>نوع تصویربرداری</th>
                  <th>ثبت‌کننده</th>
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.requestNumber}</td>
                    <td>{req.patientFirstName} {req.patientLastName}</td>
                    <td>{req.imagingType}</td>
                    <td>{req.user?.fullName ?? '-'}</td>
                    <td><OrgStatusBadge value={req.status} /></td>
                    <td>{new Date(req.createdAt).toLocaleDateString('fa-IR')}</td>
                    <td>
                      <Link href={`/org/requests/${req.id}`} className="org-link">
                        مشاهده <ChevronLeft size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="org-empty">هیچ درخواستی یافت نشد</div>
        )}

        {pages > 1 && (
          <div className="org-pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>قبلی</button>
            {Array.from({ length: pages }, (_, i) => i + 1).slice(0, 5).map((p) => (
              <button key={p} className={p === page ? 'is-active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button disabled={page >= pages} onClick={() => setPage(page + 1)}>بعدی</button>
          </div>
        )}
      </div>
    </div>
  );
}
