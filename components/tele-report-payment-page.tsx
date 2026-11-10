'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

type Gateway = { id: string; name: string; description: string; logoText?: string };
type PaymentConfig = {
  country: string;
  countryCode?: string;
  currency: string;
  currencyLabel: string;
  amount: number;
  formattedAmount?: string;
  aiAnalysisEnabled?: boolean;
  aiPricingEnabled?: boolean;
  aiSuggestedPrice?: number | null;
  gateways: Gateway[];
};

type PaymentPageProps = { requestNumber: string; countryCode: string; imagingType: string };

const fallbackConfig: PaymentConfig = {
  country: 'ایران',
  countryCode: 'IR',
  currency: 'IRR',
  currencyLabel: 'تومان',
  amount: 950000,
  formattedAmount: '۹۵۰,۰۰۰',
  gateways: [
    {
      id: 'zarinpal_sandbox',
      name: 'درگاه آزمایشی زرین‌پال (شاپرک)',
      description: 'پرداخت آزمایشی آنلاین و ثبت نهایی درخواست در صف بررسی رادینت',
      logoText: 'Z',
    },
    {
      id: 'saman_sandbox',
      name: 'درگاه آزمایشی بانک سامان (سپ)',
      description: 'تراکنش آزمایشی شبیه‌سازی‌شده شاپرک',
      logoText: 'S',
    },
  ],
};

function getInitials(gateway: Gateway): string {
  if (gateway.logoText) return gateway.logoText;
  return gateway.name ? gateway.name.charAt(0).toUpperCase() : 'P';
}

export function TeleReportPaymentPage({
  requestNumber,
  countryCode,
  imagingType,
}: PaymentPageProps) {
  const [config, setConfig] = useState<PaymentConfig>(fallbackConfig);
  const [selectedGateway, setSelectedGateway] = useState('zarinpal_sandbox');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [paidResult, setPaidResult] = useState<{
    requestNumber: string;
    paymentReference: string;
    status: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadConfigAndRequest() {
      try {
        const [cfgRes, reqRes] = await Promise.all([
          fetch(
            `/api/tele-report/payments/config?country=${encodeURIComponent(countryCode || 'IR')}`,
            { cache: 'no-store' },
          ),
          requestNumber
            ? fetch(`/api/tele-report/requests/${encodeURIComponent(requestNumber)}`, {
                cache: 'no-store',
              })
            : Promise.resolve(null),
        ]);

        if (cfgRes.ok) {
          const data = (await cfgRes.json()) as PaymentConfig;
          if (!cancelled && data.gateways?.length) {
            setConfig({
              ...data,
              formattedAmount: (data.amount || 950000).toLocaleString('fa-IR'),
            });
            setSelectedGateway(data.gateways[0].id);
          }
        }

        if (reqRes && reqRes.ok) {
          const reqData = await reqRes.json();
          if (!cancelled && reqData.paymentStatus === 'paid') {
            setPaidResult({
              requestNumber: reqData.requestNumber,
              paymentReference: reqData.paymentReference || 'EXP-PAID',
              status: reqData.status,
              amount: Number(reqData.paymentAmount) || 950000,
            });
          }
        }
      } catch {
        // Keep fallback config if offline
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadConfigAndRequest();
    return () => {
      cancelled = true;
    };
  }, [countryCode, requestNumber]);

  const selected = useMemo(
    () => config.gateways.find((gateway) => gateway.id === selectedGateway),
    [config.gateways, selectedGateway],
  );

  async function handlePayment() {
    if (!requestNumber) {
      setError('شماره درخواست تله‌ریپورت مشخص نیست. لطفاً ابتدا فرم درخواست را ثبت کنید.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      // ۱. شروع تراکنش آزمایشی در سمت سرور
      const startRes = await fetch('/api/tele-report/payments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestNumber,
          gateway: selectedGateway,
        }),
      });
      const startData = await startRes.json().catch(() => ({}));
      if (!startRes.ok) {
        throw new Error(startData.message || 'شروع پرداخت آزمایشی ناموفق بود.');
      }

      // ۲. تأیید تراکنش آزمایشی در سمت سرور و ثبت درخواست در صف بررسی ادمین و پشتیبانی
      const verifyRes = await fetch('/api/tele-report/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestNumber,
          paymentToken: startData.paymentToken || startData.paymentReference,
          gateway: selectedGateway,
        }),
      });
      const verifyData = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) {
        throw new Error(verifyData.message || 'تأیید پرداخت آزمایشی در سرور انجام نشد.');
      }

      const verifiedReq = verifyData.request || {};
      setPaidResult({
        requestNumber: verifiedReq.requestNumber || requestNumber,
        paymentReference:
          verifiedReq.paymentReference || startData.paymentReference || 'EXP-REF-OK',
        status: verifiedReq.status || 'pending_review',
        amount: Number(verifiedReq.paymentAmount) || config.amount,
      });
      setMessage(
        'پرداخت آزمایشی با موفقیت در سرور تأیید شد و درخواست شما در صف بررسی مدیر و پشتیبانی قرار گرفت.',
      );
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'فرآیند پرداخت آزمایشی ناموفق بود. دوباره تلاش کنید.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="tele-payment-page">
      <header className="tele-payment-header">
        <a className="tele-payment-brand" href="/" aria-label="رادینت">
          <span>رادینت</span>
          <small>RADINAT</small>
        </a>
        <h1>پرداخت آزمایشی هزینه خدمت تله‌ریپورت</h1>
        <a className="tele-payment-back" href="/tele-report">
          بازگشت به تله‌ریپورت
        </a>
      </header>

      {paidResult ? (
        <section className="tele-payment-shell" style={{ maxWidth: '720px', margin: '32px auto' }}>
          <div className="tele-payment-card" style={{ width: '100%', textAlign: 'center', padding: '36px 28px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ margin: '0 0 8px', color: '#0f172a' }}>
              پرداخت آزمایشی تأیید شد و درخواست ثبت نهایی گردید
            </h2>
            <p style={{ color: '#475569', marginBottom: '20px' }}>
              درخواست تله‌ریپورت شما به همراه اطلاعات بیمار، تصاویر و شرح حال بالینی در صف بررسی
              مدیر و پشتیبانی رادینت قرار گرفت.
            </p>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'right',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: '#64748b' }}>شماره پیگیری درخواست:</span>
                <strong style={{ direction: 'ltr' }}>{paidResult.requestNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: '#64748b' }}>شناسه پیگیری پرداخت آزمایشی:</span>
                <strong style={{ direction: 'ltr' }}>{paidResult.paymentReference}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: '#64748b' }}>وضعیت فعلی درخواست:</span>
                <strong style={{ color: '#0369a1' }}>ثبت‌شده و در انتظار بررسی / ارجاع به رادیولوژیست</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: '#64748b' }}>مبلغ ثبت‌شده:</span>
                <strong>{paidResult.amount.toLocaleString('fa-IR')} تومان</strong>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <a className="button button--primary" href="/user-panel/telereports">
                مشاهده در پنل کاربری بیمار
              </a>
              <a className="button button--outline" href="/tele-report">
                بازگشت به صفحه تله‌ریپورت
              </a>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="tele-payment-shell">
            <div className="tele-payment-methods tele-payment-card">
              <div className="tele-payment-card__heading">
                <div>
                  <span className="tele-payment-kicker">مرحله نهایی</span>
                  <h2>انتخاب درگاه پرداخت آزمایشی</h2>
                </div>
                <ShieldCheck size={22} />
              </div>
              <p className="tele-payment-intro">
                درگاه آزمایشی مورد نظر را انتخاب کنید. پس از تأیید پرداخت در سرور، درخواست شما مستقیماً
                برای مدیر و پشتیبانی ارسال می‌شود تا به پزشک رادیولوژیست ارجاع گردد.
              </p>
              <div className="tele-gateway-list">
                {config.gateways.map((gateway) => (
                  <label
                    className={`tele-gateway ${selectedGateway === gateway.id ? 'is-selected' : ''}`}
                    key={gateway.id}
                  >
                    <input
                      type="radio"
                      name="payment-gateway"
                      value={gateway.id}
                      checked={selectedGateway === gateway.id}
                      onChange={() => {
                        setSelectedGateway(gateway.id);
                        setMessage('');
                      }}
                    />
                    <span className={`tele-gateway__logo tele-gateway__logo--${gateway.id}`}>
                      {getInitials(gateway)}
                    </span>
                    <span className="tele-gateway__copy">
                      <strong>{gateway.name}</strong>
                      <small>{gateway.description}</small>
                    </span>
                    <span className="tele-gateway__radio" aria-hidden="true" />
                  </label>
                ))}
              </div>
              {loading && (
                <div className="tele-payment-loading">
                  <Loader2 size={16} className="tele-payment-spin" /> در حال دریافت تعرفه خدمت...
                </div>
              )}
            </div>

            <aside className="tele-payment-summary tele-payment-card">
              <span className="tele-payment-kicker">خلاصه درخواست</span>
              <h2>جزئیات ثبت و پرداخت</h2>
              <dl className="tele-payment-details">
                <div>
                  <dt>نوع درخواست</dt>
                  <dd>{imagingType || 'گزارش تصویربرداری پزشکی'}</dd>
                </div>
                <div>
                  <dt>شماره درخواست</dt>
                  <dd style={{ direction: 'ltr' }}>{requestNumber || '—'}</dd>
                </div>
                <div>
                  <dt>کشور</dt>
                  <dd>{config.country}</dd>
                </div>
                <div>
                  <dt>درگاه انتخابی</dt>
                  <dd>{selected?.name ?? '—'}</dd>
                </div>
              </dl>
              <div className="tele-payment-total">
                <span>مبلغ قابل پرداخت (آزمایشی)</span>
                <strong>
                  {(config.amount || 950000).toLocaleString('fa-IR')}
                  <small> {config.currencyLabel || 'تومان'}</small>
                </strong>
              </div>
            </aside>
          </section>

          <section className="tele-payment-actions">
            <div className="tele-payment-notice">
              <CheckCircle2 size={18} /> پس از تکمیل پرداخت آزمایشی، درخواست در پنل مدیریت و پشتیبانی
              ثبت می‌شود.
            </div>
            <button
              className="tele-payment-button"
              type="button"
              onClick={() => void handlePayment()}
              disabled={submitting || !selectedGateway}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="tele-payment-spin" /> در حال تأیید پرداخت در سرور...
                </>
              ) : (
                <>
                  تأیید و پرداخت آزمایشی <span>←</span>
                </>
              )}
            </button>
          </section>
          {(message || error) && (
            <p className={`tele-payment-feedback ${error ? 'is-error' : 'is-success'}`}>
              {error || message}
            </p>
          )}
        </>
      )}
    </main>
  );
}
