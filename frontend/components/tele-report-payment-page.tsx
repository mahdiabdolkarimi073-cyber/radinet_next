'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

type Gateway = { id: string; name: string; description: string; logoText: string };
type PaymentConfig = {
  country: string;
  countryCode: string;
  currency: string;
  currencyLabel: string;
  amount: number;
  formattedAmount: string;
  gateways: Gateway[];
};

type PaymentPageProps = { requestNumber: string; countryCode: string; imagingType: string };

const fallbackConfig: PaymentConfig = {
  country: 'ایران', countryCode: 'IR', currency: 'IRR', currencyLabel: 'تومان', amount: 39000000,
  formattedAmount: '۳۹,۰۰۰,۰۰۰',
  gateways: [
    { id: 'zarinpal', name: 'زرین‌پال', description: 'پرداخت ریالی ایران', logoText: 'Z' },
    { id: 'qi-card', name: 'Qi Card', description: 'پرداخت محلی عراق', logoText: 'Q' },
    { id: 'm-paisa', name: 'M-Paisa', description: 'پرداخت محلی افغانستان', logoText: 'M' },
    { id: 'stripe', name: 'Stripe', description: 'پرداخت بین‌المللی', logoText: 'S' },
  ],
};

function getInitials(gateway: Gateway): string { return gateway.logoText; }

export function TeleReportPaymentPage({ requestNumber, countryCode, imagingType }: PaymentPageProps) {
  const [config, setConfig] = useState<PaymentConfig>(fallbackConfig);
  const [selectedGateway, setSelectedGateway] = useState('zarinpal');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/tele-report/payments/config?country=${encodeURIComponent(countryCode)}`);
        if (!response.ok) throw new Error('config');
        const data = await response.json() as PaymentConfig;
        if (!cancelled && data.gateways?.length) {
          setConfig(data);
          setSelectedGateway(data.gateways[0].id);
        }
      } catch {
        if (!cancelled) setError('تعرفه فعلی نمایش داده شد؛ اتصال به سرویس قیمت‌گذاری در دسترس نیست.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadConfig();
    return () => { cancelled = true; };
  }, [countryCode]);

  const selected = useMemo(() => config.gateways.find((gateway) => gateway.id === selectedGateway), [config.gateways, selectedGateway]);

  async function handlePayment() {
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/tele-report/payments/start`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestNumber: requestNumber || 'TR-PREVIEW', country: config.countryCode, paymentMethod: selectedGateway }),
      });
      const data = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? 'شروع پرداخت ناموفق بود');
      setMessage(data.message ?? 'درخواست پرداخت ثبت شد.');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'شروع پرداخت ناموفق بود. دوباره تلاش کنید.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="tele-payment-page">
      <header className="tele-payment-header">
        <a className="tele-payment-brand" href="/" aria-label="رادینت"><span>رادینت</span><small>RADINAT</small></a>
        <h1>پرداخت هزینه خدمت</h1>
        <a className="tele-payment-back" href="/tele-report">بازگشت به تله‌ریپورت</a>
      </header>

      <section className="tele-payment-shell">
        <div className="tele-payment-methods tele-payment-card">
          <div className="tele-payment-card__heading"><div><span className="tele-payment-kicker">مرحله نهایی</span><h2>روش پرداخت</h2></div><ShieldCheck size={22} /></div>
          <p className="tele-payment-intro">درگاه مناسب کشور خود را انتخاب کنید. پرداخت واقعی پس از اتصال کلیدهای درگاه فعال می‌شود.</p>
          <div className="tele-gateway-list">
            {config.gateways.map((gateway) => (
              <label className={`tele-gateway ${selectedGateway === gateway.id ? 'is-selected' : ''}`} key={gateway.id}>
                <input type="radio" name="payment-gateway" value={gateway.id} checked={selectedGateway === gateway.id} onChange={() => { setSelectedGateway(gateway.id); setMessage(''); }} />
                <span className={`tele-gateway__logo tele-gateway__logo--${gateway.id}`}>{getInitials(gateway)}</span>
                <span className="tele-gateway__copy"><strong>{gateway.name}</strong><small>{gateway.description}</small></span>
                <span className="tele-gateway__radio" aria-hidden="true" />
              </label>
            ))}
          </div>
          {loading && <div className="tele-payment-loading"><Loader2 size={16} className="tele-payment-spin" /> در حال دریافت تعرفه کشور...</div>}
        </div>

        <aside className="tele-payment-summary tele-payment-card">
          <span className="tele-payment-kicker">خلاصه سفارش</span><h2>جزئیات سفارش</h2>
          <dl className="tele-payment-details">
            <div><dt>نوع درخواست</dt><dd>{imagingType || 'گزارش تصویربرداری پزشکی'}</dd></div>
            <div><dt>شماره درخواست</dt><dd>{requestNumber || 'TR-2024-0524'}</dd></div>
            <div><dt>کشور</dt><dd>{config.country}</dd></div>
            <div><dt>درگاه انتخابی</dt><dd>{selected?.name ?? '—'}</dd></div>
          </dl>
          <div className="tele-payment-total"><span>مبلغ قابل پرداخت</span><strong>{config.formattedAmount}<small> {config.currencyLabel}</small></strong></div>
        </aside>
      </section>

      <section className="tele-payment-actions">
        <div className="tele-payment-notice"> <CheckCircle2 size={18} /> سود خرید شما با کمک کد تخفیف اعمال شد.</div>
        <button className="tele-payment-button" type="button" onClick={handlePayment} disabled={submitting || !selectedGateway}>{submitting ? <><Loader2 size={18} className="tele-payment-spin" /> در حال آماده‌سازی...</> : <>انتقال به درگاه پرداخت <span>←</span></>}</button>
      </section>
      {(message || error) && <p className={`tele-payment-feedback ${error ? 'is-error' : 'is-success'}`}>{error || message}</p>}
      <p className="tele-payment-footnote">انتخاب شما: {selected?.name ?? '—'} <span>•</span> مبلغ بر اساس تعرفه کشور {config.country} محاسبه شد.</p>
    </main>
  );
}
