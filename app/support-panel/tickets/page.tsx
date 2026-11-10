'use client';

import Link from 'next/link';
import { Search, Ticket, Trash2, Eye } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { PageTitle, StatusBadge } from '@/components/support-panel/support-shell';
import { supportDelete, supportGet } from '@/lib/support-api';
import { toast } from 'sonner';

type TicketRow = {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
  user?: { fullName: string; email: string };
  expert?: { fullName: string };
};

type Result = { items: TicketRow[]; total: number };

export default function TicketsPage() {
  const [rows, setRows] = useState<TicketRow[]>([]);
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const query = new URLSearchParams({
      ...(status !== 'all' ? { status } : {}),
      ...(priority !== 'all' ? { priority } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    });
    supportGet<Result>(`/support/tickets?${query}`)
      .then((data) => {
        setRows(Array.isArray(data?.items) ? data.items : []);
        setError('');
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, priority, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string, subject: string) {
    if (!confirm(`آیا از حذف تیکت «${subject}» اطمینان دارید؟`)) return;
    setDeletingId(id);
    try {
      await supportDelete(`/support/tickets/${id}`);
      toast.success('تیکت با موفقیت حذف شد.');
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast.error(err?.message || 'خطا در حذف تیکت');
    } finally {
      setDeletingId(null);
    }
  }

  function formatDateTime(val?: string) {
    if (!val) return '—';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('fa-IR');
    } catch {
      return '—';
    }
  }

  return (
    <section className="support-page">
      <PageTitle
        eyebrow="ماژول تیکت‌ها"
        title="مدیریت تیکت‌ها"
        description="تمام درخواست‌ها و پیام‌های کاربران را بررسی، پاسخ یا حذف نمایید."
        action={
          <button className="support-button" onClick={load} type="button">
            <Search size={16} /> جستجو و تازه‌سازی
          </button>
        }
      />
      <div className="support-card">
        <div className="support-filters">
          <input
            className="support-input"
            placeholder="جستجو در موضوع، متن یا نام کاربر..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="support-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">همه وضعیت‌ها</option>
            <option value="open">باز</option>
            <option value="pending">در انتظار بررسی</option>
            <option value="waiting_user">در انتظار پاسخ کاربر</option>
            <option value="closed">بسته</option>
            <option value="resolved">حل‌شده</option>
          </select>
          <select className="support-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="all">همه اولویت‌ها</option>
            <option value="urgent">فوری</option>
            <option value="high">زیاد</option>
            <option value="medium">متوسط</option>
            <option value="low">کم</option>
          </select>
        </div>

        {error && <div className="support-error">{error}</div>}

        <div className="support-table-wrap">
          <table className="support-table">
            <thead>
              <tr>
                <th>موضوع</th>
                <th>کاربر ارسال‌کننده</th>
                <th>اولویت</th>
                <th>وضعیت</th>
                <th>کارشناس مسئول</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    در حال دریافت تیکت‌ها...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="support-empty" style={{ padding: '32px 0' }}>
                      <Ticket size={34} />
                      <p>تیکتی برای نمایش وجود ندارد.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.subject}</strong>
                      <small style={{ display: 'block', color: '#64748b', fontSize: '11px', marginTop: 2 }}>
                        {formatDateTime(row.createdAt)}
                      </small>
                    </td>
                    <td>
                      <div>{row.user?.fullName ?? 'کاربر مهمان'}</div>
                      {row.user?.email && (
                        <small style={{ color: '#94a3b8', fontSize: '11px' }}>{row.user.email}</small>
                      )}
                    </td>
                    <td>
                      <StatusBadge value={row.priority} />
                    </td>
                    <td>
                      <StatusBadge value={row.status} />
                    </td>
                    <td>{row.expert?.fullName ?? 'اختصاص داده نشده'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Link className="support-button secondary" href={`/support-panel/tickets/${row.id}`} title="مشاهده و چت">
                          <Eye size={14} /> مشاهده
                        </Link>
                        <button
                          type="button"
                          className="support-button danger"
                          onClick={() => void handleDelete(row.id, row.subject)}
                          disabled={deletingId === row.id}
                          title="حذف تیکت"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        >
                          <Trash2 size={14} /> {deletingId === row.id ? '...' : 'حذف'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

