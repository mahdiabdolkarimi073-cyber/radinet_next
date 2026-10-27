'use client';

import { useEffect, useState } from 'react';
import { Activity, FileText, CreditCard } from 'lucide-react';
import { orgGet, type OrgContract, type OrgInvoice, type OrgPayment } from '@/lib/org-api';
import { OrgStatusBadge } from '@/components/org/status-badge';

export default function OrgContractsPage() {
  const [tab, setTab] = useState<'contracts' | 'invoices' | 'payments'>('contracts');
  const [contracts, setContracts] = useState<OrgContract[]>([]);
  const [invoices, setInvoices] = useState<OrgInvoice[]>([]);
  const [payments, setPayments] = useState<OrgPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      orgGet<{ items: OrgContract[] }>('/contracts'),
      orgGet<{ items: OrgInvoice[] }>('/contracts/invoices'),
      orgGet<{ items: OrgPayment[] }>('/contracts/payments'),
    ])
      .then(([c, i, p]) => {
        setContracts(c.items);
        setInvoices(i.items);
        setPayments(p.items);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="org-page">
        <div className="org-loading" style={{ minHeight: 400 }}><Activity size={24} className="org-spin" /> در حال بارگذاری...</div>
      </div>
    );
  if (error) return <div className="org-page"><div className="org-error">{error}</div></div>;

  return (
    <div className="org-page">
      <div className="org-page-title">
        <span>قراردادها و پرداخت‌ها</span>
        <h2>مدیریت مالی سازمان</h2>
        <p>مشاهده قراردادها، فاکتورها و پرداخت‌های سازمان</p>
      </div>

      <div className="org-tabs">
        <button className={`org-tab ${tab === 'contracts' ? 'is-active' : ''}`} onClick={() => setTab('contracts')}>
          قراردادها ({contracts.length})
        </button>
        <button className={`org-tab ${tab === 'invoices' ? 'is-active' : ''}`} onClick={() => setTab('invoices')}>
          فاکتورها ({invoices.length})
        </button>
        <button className={`org-tab ${tab === 'payments' ? 'is-active' : ''}`} onClick={() => setTab('payments')}>
          پرداخت‌ها ({payments.length})
        </button>
      </div>

      {tab === 'contracts' && (
        <div className="org-card">
          {contracts.length > 0 ? (
            <div className="org-table-wrap">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>شماره قرارداد</th>
                    <th>عنوان</th>
                    <th>مرکز</th>
                    <th>نوع</th>
                    <th>تخفیف</th>
                    <th>وضعیت</th>
                    <th>تاریخ شروع</th>
                    <th>تاریخ پایان</th>
                    <th>فاکتورها</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c.id}>
                      <td>{c.contractNumber}</td>
                      <td>{c.title}</td>
                      <td>{c.center?.name ?? '-'}</td>
                      <td>{c.type}</td>
                      <td>{c.discountPercent}%</td>
                      <td><OrgStatusBadge value={c.status} /></td>
                      <td>{new Date(c.startDate).toLocaleDateString('fa-IR')}</td>
                      <td>{c.endDate ? new Date(c.endDate).toLocaleDateString('fa-IR') : '-'}</td>
                      <td>{c._count.invoices}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="org-empty">قراردادی ثبت نشده است</div>
          )}
        </div>
      )}

      {tab === 'invoices' && (
        <div className="org-card">
          {invoices.length > 0 ? (
            <div className="org-table-wrap">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>شماره فاکتور</th>
                    <th>قرارداد</th>
                    <th>مبلغ</th>
                    <th>سررسید</th>
                    <th>وضعیت</th>
                    <th>پرداخت‌ها</th>
                    <th>تاریخ صدور</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.invoiceNumber}</td>
                      <td>{inv.contract.contractNumber}</td>
                      <td>{Number(inv.amount).toLocaleString('fa-IR')} ریال</td>
                      <td>{new Date(inv.dueDate).toLocaleDateString('fa-IR')}</td>
                      <td><OrgStatusBadge value={inv.status} /></td>
                      <td>{inv._count.payments}</td>
                      <td>{new Date(inv.createdAt).toLocaleDateString('fa-IR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="org-empty">فاکتوری ثبت نشده است</div>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <div className="org-card">
          {payments.length > 0 ? (
            <div className="org-table-wrap">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>فاکتور</th>
                    <th>قرارداد</th>
                    <th>مبلغ پرداخت</th>
                    <th>روش پرداخت</th>
                    <th>مرجع</th>
                    <th>تاریخ پرداخت</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.invoice.invoiceNumber}</td>
                      <td>{p.invoice.contract.contractNumber}</td>
                      <td>{Number(p.amount).toLocaleString('fa-IR')} ریال</td>
                      <td>{p.method}</td>
                      <td dir="ltr">{p.reference || '-'}</td>
                      <td>{new Date(p.paidAt).toLocaleDateString('fa-IR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="org-empty">پرداختی ثبت نشده است</div>
          )}
        </div>
      )}
    </div>
  );
}
