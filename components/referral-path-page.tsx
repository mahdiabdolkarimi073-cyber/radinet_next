'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Send,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import type { FooterSettings } from '@/lib/home-data';

type ReferralPathPageProps = { footer: FooterSettings };

type PathOption = {
  id: string;
  title: string;
  description: string;
  activeDescription: string;
  icon: typeof Zap;
  available: boolean;
  badge: string;
};

const pathOptions: PathOption[] = [
  {
    id: 'auto',
    title: 'ارجاع خودکار توسط تیم رادینت',
    description: 'درخواست شما به‌صورت خودکار به تیم متخصص رادینت ارجاع داده می‌شود و در سریع‌ترین زمان گزارش شما آماده خواهد شد.',
    activeDescription: 'این مسیر انتخاب شد. درخواست شما به تیم متخصص رادینت ارجاع داده می‌شود.',
    icon: Zap,
    available: true,
    badge: 'فعال',
  },
  {
    id: 'smart',
    title: 'ارجاع هوشمند بر اساس تخصص و بار کاری',
    description: 'سیستم به‌صورت هوشمند بر اساس تخصص و بار کاری پزشکان، بهترین متخصص را برای درخواست شما انتخاب می‌کند.',
    activeDescription: 'این قابلیت در توسعه آینده ارائه خواهد شد.',
    icon: Sparkles,
    available: false,
    badge: 'در توسعه آینده',
  },
  {
    id: 'manual',
    title: 'انتخاب مستقیم پزشک از بین پزشکان دارای رزومه',
    description: 'می‌توانید از بین پزشکان متخصص دارای رزومه، پزشک مورد نظر خود را انتخاب کنید.',
    activeDescription: 'این قابلیت در توسعه آینده ارائه خواهد شد.',
    icon: Stethoscope,
    available: false,
    badge: 'در توسعه آینده',
  },
];

export function ReferralPathPage({ footer }: ReferralPathPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestNumber = searchParams.get('requestNumber') ?? '';

  const [selectedPath, setSelectedPath] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<{ requestNumber: string; message: string } | null>(null);
  const [helpOpen, setHelpOpen] = useState<string | null>(null);

  function selectPath(path: PathOption) {
    if (!path.available) return;
    setSelectedPath(path.id);
    setSubmitError('');
  }

  async function handleSubmit() {
    if (!selectedPath) {
      setSubmitError('لطفاً یک مسیر ارجاع را انتخاب کنید');
      return;
    }
    if (!requestNumber) {
      setSubmitError('کد پیگیری درخواست یافت نشد. لطفاً از ابتدا اقدام کنید.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/tele-report/requests/${encodeURIComponent(requestNumber)}/referral-path`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralPath: selectedPath }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'ثبت مسیر ارجاع ناموفق بود');
      }

      const data = await response.json();
      setResult({ requestNumber: data.requestNumber, message: data.message });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'ثبت مسیر ارجاع ناموفق بود. دوباره تلاش کنید.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <main className="trr-page">
        <SiteHeader activePath="/tele-report/new" />
        <section className="trr-success">
          <div className="container">
            <div className="trr-success__card">
              <div className="trr-success__icon"><CheckCircle2 size={56} /></div>
              <h1>ارجاع با موفقیت ثبت شد</h1>
              <p>کد پیگیری درخواست شما:</p>
              <div className="trr-success__code">{result.requestNumber}</div>
              <p className="trr-success__note">{result.message}</p>
              <div className="trr-success__actions">
                <a className="trr-btn trr-btn--primary" href={`/tele-report/payment?requestNumber=${encodeURIComponent(result.requestNumber)}`}>پرداخت هزینه خدمت</a>
                <a className="trr-btn trr-btn--secondary" href="/tele-report">بازگشت به تله‌ریپورت</a>
              </div>
            </div>
          </div>
        </section>
        <SiteFooter footer={footer} />
      </main>
    );
  }

  return (
    <main className="trr-page">
      <SiteHeader activePath="/tele-report/new" />

      <div className="trr-header-bar">
        <div className="container trr-header-bar__inner">
          <a className="trr-logo" href="/">
            <span className="trr-logo__mark">◈</span>
            <span className="trr-logo__text">رادینت</span>
          </a>
          <h1 className="trr-header-bar__title">ثبت درخواست جدید (فرم چندمرحله‌ای)</h1>
        </div>
      </div>

      <div className="container trr-body">
        <div className="trr-stepper">
          {[
            { number: 1, label: 'کشور و زبان' },
            { number: 2, label: 'اطلاعات بیمار' },
            { number: 3, label: 'اطلاعات بالینی' },
            { number: 4, label: 'بارگذاری تصاویر' },
            { number: 5, label: 'تأیید و ارسال' },
          ].map((step, index) => (
            <div className="trr-stepper__item" key={step.number}>
              <div className="trr-stepper__circle is-active is-done">
                <CheckCircle2 size={16} />
              </div>
              <span className="trr-stepper__label">{step.label}</span>
              {index < 4 && <div className="trr-stepper__line is-active" />}
            </div>
          ))}
        </div>

        <div className="referral-page">
          <h2 className="referral-page__title">لطفاً مسیر ارسال مورد نظر خود را انتخاب کنید</h2>

          <div className="referral-cards">
            {pathOptions.map((path) => {
              const Icon = path.icon;
              const isSelected = selectedPath === path.id;
              const isHelpOpen = helpOpen === path.id;
              return (
                <div
                  className={`referral-card ${isSelected ? 'is-selected' : ''} ${!path.available ? 'is-disabled' : ''}`}
                  key={path.id}
                  onClick={() => selectPath(path)}
                  role="button"
                  tabIndex={path.available ? 0 : -1}
                >
                  <button
                    className="referral-card__help"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHelpOpen(isHelpOpen ? null : path.id);
                    }}
                    aria-label="راهنما"
                  >
                    {isSelected ? <HelpCircle size={16} /> : <HelpCircle size={16} />}
                  </button>

                  {isHelpOpen && (
                    <div className="referral-card__tooltip" onClick={(e) => e.stopPropagation()}>
                      {path.description}
                    </div>
                  )}

                  <div className={`referral-card__icon ${isSelected ? 'is-active' : ''}`}>
                    <Icon size={50} />
                  </div>

                  <h3 className="referral-card__title">{path.title}</h3>

                  <p className={`referral-card__desc ${isSelected ? 'is-active' : ''}`}>
                    {isSelected ? path.activeDescription : path.description}
                  </p>

                  {!path.available && (
                    <span className="referral-card__badge">{path.badge}</span>
                  )}

                  {path.available && (
                    <a
                      className="referral-card__link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setHelpOpen(isHelpOpen ? null : path.id);
                      }}
                    >
                      مشاهده
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {submitError && <div className="trr-submit-error">{submitError}</div>}

          <div className="referral-actions">
            <button
              className="trr-btn trr-btn--primary referral-continue-btn"
              onClick={handleSubmit}
              disabled={submitting || !selectedPath}
              type="button"
            >
              {submitting ? <><Loader2 size={18} className="trr-spin" /> در حال ارجاع...</> : <>مرحله بعد <ArrowLeft size={18} /></>}
            </button>
          </div>
        </div>
      </div>

      <SiteFooter footer={footer} />
    </main>
  );
}
