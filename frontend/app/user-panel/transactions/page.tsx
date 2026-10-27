'use client';

import { CreditCard, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UpStatusBadge } from '@/components/user-panel/user-shell';
import { userGet, type PanelTransaction } from '@/lib/user-panel-api';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

const typeLabels: Record<string, string> = {
  shop: 'فروشگاه', telereport: 'تله‌ریپورت', other: 'سایر',
};

export default function UserTransactionsPage() {
  const [items, setItems] = useState<PanelTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userGet<{ items: PanelTransaction[] }>('/panel/transactions')
      .then((data) => setItems(data.items))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = items.filter((t) => t.status === 'paid').reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <section className="up-page">
      <div className="up-page-title">
        <span>مالی</span>
        <h2>تراکنش‌ها و پرداخت‌ها</h2>
        <p>تاریخچه پرداخت‌ها و فاکتورهای شما.</p>
      </div>

      {error && <div className="up-error">{error}</div>}

      {loading ? (
        <div className="up-empty"><CreditCard size={28} className="up-spin" /> در حال بارگذاری...</div>
      ) : items.length === 0 ? (
        <div className="up-card"><div className="up-empty"><CreditCard size={32} /> تراکنشی ثبت نشده است</div></div>
      ) : (
        <>
          <div className="up-grid" style={{ gridTemplateColumns: '1fr', marginBottom: 18 }}>
            <div className="up-stat">
              <div className="up-stat-icon"><CreditCard size={21} /></div>
              <div><span>مجموع پرداخت‌ها</span><strong>{totalPaid.toLocaleString('fa-IR')} ریال</strong></div>
            </div>
          </div>

          <div className="up-card" style={{ padding: 0 }}>
            <div className="up-table-wrap">
              <table className="up-table">
                <thead>
                  <tr><th>مبلغ</th><th>نوع</th><th>وضعیت</th><th>مرجع فاکتور</th><th>توضیحات</th><th>تاریخ</th><th></th></tr>
                </thead>
                <tbody>
                  {items.map((tx) => (
                    <tr key={tx.id}>
                      <td>{Number(tx.amount).toLocaleString('fa-IR')} ریال</td>
                      <td>{typeLabels[tx.type] ?? tx.type}</td>
                      <td><UpStatusBadge value={tx.status} /></td>
                      <td dir="ltr">{tx.invoiceRef ?? '—'}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.description || '—'}</td>
                      <td>{new Date(tx.createdAt).toLocaleDateString('fa-IR')}</td>
                      <td>
                        <a href={`${BACKEND_URL}/panel/transactions/${tx.id}`} target="_blank" rel="noreferrer" className="up-icon-btn" title="دانلود فاکتور">
                          <Download size={16} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
