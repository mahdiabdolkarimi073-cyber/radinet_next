'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  CreditCard,
  Eye,
  FileText,
  Receipt,
  Wallet,
  X,
} from 'lucide-react';
import {
  orgGet,
  orgPost,
  type OrgContract,
  type OrgInvoice,
  type OrgPayment,
} from '@/lib/org-api';
import { OrgStatusBadge } from '@/components/org/status-badge';

type Tab = 'contracts' | 'invoices' | 'payments';

function formatRial(value: string | number | undefined | null): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '۰ ریال';
  return `${num.toLocaleString('fa-IR')} ریال`;
}

export default function OrgContractsPage() {
  const [tab, setTab] = useState<Tab>('contracts');
  const [contracts, setContracts] = useState<OrgContract[]>([]);
  const [invoices, setInvoices] = useState<OrgInvoice[]>([]);
  const [payments, setPayments] = useState<OrgPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected invoice modal (details + payment action)
  const [selectedInvoice, setSelectedInvoice] = useState<OrgInvoice | null>(null);
  const [payMethod, setPayMethod] = useState('online_gateway');
  const [payReference, setPayReference] = useState('');
  const [paying, setPaying] = useState(false);

  // Selected contract modal
  const [selectedContract, setSelectedContract] = useState<OrgContract | null>(null);

  function loadAll() {
    setLoading(true);
    setError('');
    Promise.all([
      orgGet<OrgContract[]>('/contracts'),
      orgGet<OrgInvoice[]>('/contracts/invoices'),
      orgGet<OrgPayment[]>('/contracts/payments'),
    ])
      .then(([c, inv, pay]) => {
        setContracts(c);
        setInvoices(inv);
        setPayments(pay);
        if (selectedInvoice) {
          const updatedInv = inv.find((item) => item.id === selectedInvoice.id) || null;
          setSelectedInvoice(updatedInv);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handlePayInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedInvoice) return;
    setPaying(true);
    setError('');
    setSuccess('');
    try {
      await orgPost(`/contracts/invoices/${selectedInvoice.id}/pay`, {
        method: payMethod,
        reference: payReference.trim() || undefined,
      });
      setPayReference('');
      setSuccess(
        `پرداخت صورت‌حساب «${selectedInvoice.invoiceNumber}» با موفقیت در دیتابیس ثبت و تسویه شد`,
      );
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت پرداخت صورت‌حساب');
    } finally {
      setPaying(false);
    }
  }

  // Real financial summary calculated strictly from database records
  const totalInvoiced = invoices.reduce((s, inv) => s + Number(inv.amount ?? 0), 0);
  const totalPaid = invoices.reduce((s, inv) => s + Number(inv.paidAmount ?? 0), 0);
  const totalRemainingDebt = invoices.reduce(
    (s, inv) => s + Number(inv.remainingAmount ?? 0),
    0,
  );
  const activeContractsCount = contracts.filter((c) => c.status === 'active').length;

  return (
    <div className="org-page">
      <div className="org-page-title">
        <span>قراردادها و پرداخت‌ها</span>
        <h2>مدیریت قراردادها، صورت‌حساب‌ها و سوابق مالی سازمان</h2>
        <p>
          مشاهده وضعیت قراردادهای فعال، بررسی صورت‌حساب‌های صادرشده، مانده بدهی‌ها و ثبت پرداخت
        </p>
      </div>

      {/* خلاصه مالی واقعی سازمان */}
      <div className="org-grid-4" style={{ marginBottom: 20 }}>
        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#eaf3ff', color: '#2877d4' }}>
            <FileText size={22} />
          </div>
          <div>
            <span>قراردادهای سازمان</span>
            <strong>{contracts.length.toLocaleString('fa-IR')}</strong>
            <small className="org-muted" style={{ display: 'block', marginTop: 2 }}>
              {activeContractsCount.toLocaleString('fa-IR')} قرارداد فعال
            </small>
          </div>
        </div>

        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#fff7e5', color: '#bf8b2b' }}>
            <Receipt size={22} />
          </div>
          <div>
            <span>مجموع صورت‌حساب‌ها</span>
            <strong style={{ fontSize: 19 }}>{formatRial(totalInvoiced)}</strong>
            <small className="org-muted" style={{ display: 'block', marginTop: 2 }}>
              {invoices.length.toLocaleString('fa-IR')} فاکتور ثبت‌شده
            </small>
          </div>
        </div>

        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#e9fbf4', color: '#2f855a' }}>
            <CreditCard size={22} />
          </div>
          <div>
            <span>مجموع پرداخت‌شده</span>
            <strong style={{ fontSize: 19, color: '#2f855a' }}>{formatRial(totalPaid)}</strong>
            <small className="org-muted" style={{ display: 'block', marginTop: 2 }}>
              {payments.length.toLocaleString('fa-IR')} تراکنش پرداخت
            </small>
          </div>
        </div>

        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#fff0f0', color: '#c54b50' }}>
            <Wallet size={22} />
          </div>
          <div>
            <span>مانده بدهی تسویه‌نشده</span>
            <strong
              style={{
                fontSize: 19,
                color: totalRemainingDebt > 0 ? '#c54b50' : '#172e50',
              }}
            >
              {formatRial(totalRemainingDebt)}
            </strong>
          </div>
        </div>
      </div>

      {error && <div className="org-error">{error}</div>}
      {success && <div className="org-success">{success}</div>}

      <div className="org-tabs">
        <button
          className={`org-tab ${tab === 'contracts' ? 'is-active' : ''}`}
          onClick={() => setTab('contracts')}
        >
          قراردادهای سازمان ({contracts.length.toLocaleString('fa-IR')})
        </button>
        <button
          className={`org-tab ${tab === 'invoices' ? 'is-active' : ''}`}
          onClick={() => setTab('invoices')}
        >
          صورت‌حساب‌ها ({invoices.length.toLocaleString('fa-IR')})
        </button>
        <button
          className={`org-tab ${tab === 'payments' ? 'is-active' : ''}`}
          onClick={() => setTab('payments')}
        >
          تاریخچه پرداخت‌ها ({payments.length.toLocaleString('fa-IR')})
        </button>
      </div>

      {loading ? (
        <div className="org-loading" style={{ minHeight: 280 }}>
          <Activity size={24} className="org-spin" /> در حال دریافت اطلاعات مالی و قراردادها...
        </div>
      ) : (
        <div className="org-card">
          {/* تب ۱: قراردادها */}
          {tab === 'contracts' && (
            <div className="org-table-wrap">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>شماره قرارداد</th>
                    <th>عنوان قرارداد</th>
                    <th>نوع</th>
                    <th>مرکز تصویربرداری</th>
                    <th>تخفیف</th>
                    <th>سقف اعتبار</th>
                    <th>شروع اعتبار</th>
                    <th>پایان اعتبار</th>
                    <th>تعداد فاکتور</th>
                    <th>وضعیت</th>
                    <th>جزئیات</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.length === 0 && (
                    <tr>
                      <td colSpan={11} className="org-empty">
                        هیچ قراردادی برای این سازمان در دیتابیس ثبت نشده است
                      </td>
                    </tr>
                  )}
                  {contracts.map((c) => (
                    <tr key={c.id}>
                      <td dir="ltr">
                        <strong>{c.contractNumber}</strong>
                      </td>
                      <td>{c.title}</td>
                      <td>
                        <OrgStatusBadge value={c.type} />
                      </td>
                      <td>{c.center?.name ?? 'سراسری رادینت'}</td>
                      <td>{c.discountPercent.toLocaleString('fa-IR')}%</td>
                      <td>{c.creditLimit ? formatRial(c.creditLimit) : 'بدون محدودیت'}</td>
                      <td>{new Date(c.startDate).toLocaleDateString('fa-IR')}</td>
                      <td>
                        {c.endDate ? new Date(c.endDate).toLocaleDateString('fa-IR') : 'نامحدود'}
                      </td>
                      <td>{c._count.invoices.toLocaleString('fa-IR')}</td>
                      <td>
                        <OrgStatusBadge value={c.status} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="org-icon-btn"
                          onClick={() => setSelectedContract(c)}
                          title="مشاهده جزئیات قرارداد"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* تب ۲: صورت‌حساب‌ها */}
          {tab === 'invoices' && (
            <div className="org-table-wrap">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>شماره صورت‌حساب</th>
                    <th>قرارداد مرتبط</th>
                    <th>مبلغ کل</th>
                    <th>مبلغ پرداخت‌شده</th>
                    <th>مانده بدهی</th>
                    <th>تاریخ سررسید</th>
                    <th>وضعیت پرداخت</th>
                    <th>عملیات / جزئیات</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={8} className="org-empty">
                        هیچ صورت‌حسابی برای این سازمان ثبت نشده است
                      </td>
                    </tr>
                  )}
                  {invoices.map((inv) => {
                    const isUnpaid = inv.status !== 'paid';
                    return (
                      <tr key={inv.id}>
                        <td dir="ltr">
                          <strong>{inv.invoiceNumber}</strong>
                        </td>
                        <td>
                          {inv.contract.title} ({inv.contract.contractNumber})
                        </td>
                        <td>{formatRial(inv.amount)}</td>
                        <td style={{ color: '#2f855a' }}>{formatRial(inv.paidAmount)}</td>
                        <td
                          style={{
                            color: Number(inv.remainingAmount) > 0 ? '#c54b50' : '#38516e',
                            fontWeight: Number(inv.remainingAmount) > 0 ? 700 : 400,
                          }}
                        >
                          {formatRial(inv.remainingAmount)}
                        </td>
                        <td>{new Date(inv.dueDate).toLocaleDateString('fa-IR')}</td>
                        <td>
                          <OrgStatusBadge value={inv.status} />
                        </td>
                        <td>
                          <div className="org-row-actions">
                            <button
                              type="button"
                              className="org-button secondary"
                              style={{ padding: '6px 12px', fontSize: 12 }}
                              onClick={() => setSelectedInvoice(inv)}
                            >
                              <Eye size={14} />{' '}
                              {isUnpaid ? 'جزئیات و پرداخت' : 'مشاهده جزئیات'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* تب ۳: تاریخچه پرداخت‌ها */}
          {tab === 'payments' && (
            <div className="org-table-wrap">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>شماره صورت‌حساب</th>
                    <th>شماره قرارداد</th>
                    <th>مبلغ پرداخت‌شده</th>
                    <th>روش پرداخت</th>
                    <th>کد پیگیری / مرجع</th>
                    <th>تاریخ و زمان پرداخت</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="org-empty">
                        هنوز هیچ پرداختی برای صورت‌حساب‌های این سازمان ثبت نشده است
                      </td>
                    </tr>
                  )}
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td dir="ltr">
                        <strong>{p.invoice.invoiceNumber}</strong>
                      </td>
                      <td dir="ltr">{p.invoice.contract.contractNumber}</td>
                      <td style={{ color: '#2f855a', fontWeight: 700 }}>
                        {formatRial(p.amount)}
                      </td>
                      <td>
                        <OrgStatusBadge value={p.method} />
                      </td>
                      <td dir="ltr">{p.reference || '—'}</td>
                      <td>{new Date(p.paidAt).toLocaleString('fa-IR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* مدال جزئیات قرارداد */}
      {selectedContract && (
        <div className="org-modal-overlay" onClick={() => setSelectedContract(null)}>
          <div className="org-modal" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <h3 style={{ margin: 0 }}>جزئیات قرارداد {selectedContract.contractNumber}</h3>
              <button
                type="button"
                className="org-icon-btn"
                onClick={() => setSelectedContract(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="org-muted">عنوان قرارداد:</span>
                <strong>{selectedContract.title}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="org-muted">وضعیت قرارداد:</span>
                <OrgStatusBadge value={selectedContract.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="org-muted">مرکز طرف قرارداد:</span>
                <span>{selectedContract.center?.name ?? 'سراسری رادینت'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="org-muted">درصد تخفیف سازمانی:</span>
                <span>{selectedContract.discountPercent.toLocaleString('fa-IR')}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="org-muted">سقف اعتبار:</span>
                <span>
                  {selectedContract.creditLimit
                    ? formatRial(selectedContract.creditLimit)
                    : 'نامحدود'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="org-muted">بازه اعتبار:</span>
                <span>
                  {new Date(selectedContract.startDate).toLocaleDateString('fa-IR')} تا{' '}
                  {selectedContract.endDate
                    ? new Date(selectedContract.endDate).toLocaleDateString('fa-IR')
                    : 'نامحدود'}
                </span>
              </div>
              {selectedContract.signedBy && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="org-muted">امضاکننده:</span>
                  <span>{selectedContract.signedBy}</span>
                </div>
              )}
              {selectedContract.terms && (
                <div style={{ marginTop: 8 }}>
                  <span className="org-muted" style={{ display: 'block', marginBottom: 4 }}>
                    مفاد و شرایط قرارداد:
                  </span>
                  <p style={{ margin: 0, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                    {selectedContract.terms}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* مدال جزئیات صورت‌حساب و ثبت پرداخت */}
      {selectedInvoice && (
        <div className="org-modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="org-modal" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>
                  جزئیات صورت‌حساب {selectedInvoice.invoiceNumber}
                </h3>
                <small className="org-muted">
                  قرارداد: {selectedInvoice.contract.title} ({selectedInvoice.contract.contractNumber})
                </small>
              </div>
              <button
                type="button"
                className="org-icon-btn"
                onClick={() => setSelectedInvoice(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                background: '#f8fafc',
                padding: 14,
                borderRadius: 10,
                marginBottom: 18,
                fontSize: 13,
              }}
            >
              <div>
                <span className="org-muted" style={{ display: 'block' }}>
                  مبلغ کل فاکتور
                </span>
                <strong style={{ fontSize: 15 }}>{formatRial(selectedInvoice.amount)}</strong>
              </div>
              <div>
                <span className="org-muted" style={{ display: 'block' }}>
                  پرداخت‌شده
                </span>
                <strong style={{ fontSize: 15, color: '#2f855a' }}>
                  {formatRial(selectedInvoice.paidAmount)}
                </strong>
              </div>
              <div>
                <span className="org-muted" style={{ display: 'block' }}>
                  مانده قابل پرداخت
                </span>
                <strong style={{ fontSize: 15, color: '#c54b50' }}>
                  {formatRial(selectedInvoice.remainingAmount)}
                </strong>
              </div>
            </div>

            {/* لیست پرداخت‌های این صورت‌حساب */}
            <h4 style={{ margin: '0 0 10px', fontSize: 14, color: '#173252' }}>
              سوابق پرداخت این صورت‌حساب
            </h4>
            {!selectedInvoice.payments || selectedInvoice.payments.length === 0 ? (
              <p className="org-muted" style={{ fontSize: 13, marginBottom: 18 }}>
                تراکنش پرداختی برای این صورت‌حساب ثبت نشده است.
              </p>
            ) : (
              <div className="org-table-wrap" style={{ marginBottom: 18 }}>
                <table className="org-table" style={{ minWidth: 380 }}>
                  <thead>
                    <tr>
                      <th>مبلغ</th>
                      <th>روش</th>
                      <th>شماره مرجع</th>
                      <th>تاریخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.payments.map((p) => (
                      <tr key={p.id}>
                        <td>{formatRial(p.amount)}</td>
                        <td>
                          <OrgStatusBadge value={p.method} />
                        </td>
                        <td dir="ltr">{p.reference || '—'}</td>
                        <td>{new Date(p.paidAt).toLocaleDateString('fa-IR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* فرم ثبت پرداخت در صورت تسویه‌نشدن */}
            {selectedInvoice.status !== 'paid' && (
              <form
                onSubmit={handlePayInvoice}
                style={{
                  borderTop: '1px solid #edf1f6',
                  paddingTop: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <h4 style={{ margin: 0, fontSize: 15, color: '#102d53' }}>
                  تسویه و ثبت پرداخت صورت‌حساب
                </h4>
                <div className="org-grid-2">
                  <div className="org-field">
                    <label>روش پرداخت</label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                    >
                      <option value="online_gateway">درگاه پرداخت آنلاین</option>
                      <option value="bank_transfer">حواله / انتقال بانکی</option>
                      <option value="cheque">چک سازمانی</option>
                    </select>
                  </div>
                  <div className="org-field">
                    <label>شماره پیگیری / شناسه مرجع (اختیاری)</label>
                    <input
                      dir="ltr"
                      value={payReference}
                      onChange={(e) => setPayReference(e.target.value)}
                      placeholder="TRX-984512..."
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="org-button secondary"
                    onClick={() => setSelectedInvoice(null)}
                  >
                    بستن
                  </button>
                  <button type="submit" className="org-button" disabled={paying}>
                    <CheckCircle2 size={16} />{' '}
                    {paying
                      ? 'در حال ثبت پرداخت...'
                      : `ثبت پرداخت و تسویه (${formatRial(selectedInvoice.remainingAmount)})`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
