'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Headphones, Mail, Phone, Target, Trophy, Users } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { fallbackData } from '@/lib/home-data';
import type { AboutData } from '@/lib/about-data';

type AboutPageProps = {
  initialData?: AboutData;
};

const defaultImage = '/assets/images/hero-radinat-radiology.png.png';

export function AboutPage({ initialData }: AboutPageProps): JSX.Element {
  const [data, setData] = useState<AboutData | null>(initialData ?? null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!initialData) {
      fetch('/api/about')
        .then((r) => r.json())
        .then((res) => {
          if (res && res.content) setData(res);
        })
        .catch((e) => console.error('Failed to load about data:', e));
    }
  }, [initialData]);

  async function submit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get('name') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      message: String(form.get('message') ?? '').trim(),
    };

    if (!payload.name || payload.name.length < 2) {
      setFormError('لطفاً نام و نام خانوادگی خود را به صورت کامل وارد کنید.');
      setIsSubmitting(false);
      return;
    }

    if (!payload.phone || payload.phone.length < 7) {
      setFormError('لطفاً یک شماره تماس معتبر وارد فرمایید.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSent(true);
        (e.target as HTMLFormElement).reset();
      } else {
        const res = await response.json();
        setFormError(res.error || 'خطا در ثبت درخواست مشاوره');
      }
    } catch {
      setFormError('خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const contentMap = new Map((data?.content ?? []).map((c) => [c.key, c]));
  const intro = contentMap.get('intro');
  const values = contentMap.get('values');
  const mission = contentMap.get('mission');
  const vision = contentMap.get('vision');

  const contactLink = data?.contactLink || '/contact';

  const valuesCards = [
    {
      icon: Trophy,
      title: values?.title || 'ارزش‌های ما',
      text: values?.body || 'اعتماد، دقت تشخیصی و همراهی مستمر با جامعه پزشکی و درمانی.',
    },
    {
      icon: Target,
      title: mission?.title || 'ماموریت شرکت',
      text: mission?.body || 'تسهیل و تسریع دسترسی عادلانه به تله‌رادیولوژی و خدمات تشخیصی باکیفیت در سراسر کشور.',
    },
    {
      icon: Users,
      title: vision?.title || 'چشم‌انداز شرکت',
      text: vision?.body || 'ساختن آینده‌ای هوشمند، دقیق و یکپارچه برای تصویربرداری پزشکی و سلامت دیجیتال.',
    },
  ];

  const team = data?.team ?? [];
  const office = data?.office ?? [];
  const certificates = data?.certificates ?? [];

  return (
    <main>
      <SiteHeader activePath="/about" />

      {/* Hero Section */}
      <section className="about-hero" id="top">
        <span>خانه / درباره ما</span>
        <h1>درباره ما</h1>
        <p>با ما بیشتر آشنا شوید</p>
      </section>

      <div className="about-container">
        {/* Intro Section */}
        <section className="about-intro">
          <img
            src={office[0]?.imageUrl || defaultImage}
            alt="دفتر مرکزی رادینت"
          />
          <div>
            <h2>{intro?.title || 'درباره شرکت رادینت'}</h2>
            <p>
              {intro?.body ||
                'رادینت با تکیه بر دانش تخصصی پزشکان رادیولوژیست و به‌کارگیری فناوری‌های هوشمند سلامت، مسیر دسترسی مراکز درمانی به خدمات تصویربرداری و تفسیر تشخیصی سریع را ساده‌تر و ایمن‌تر ساخته است.'}
            </p>

            {/* Core Values / Mission / Vision Grid */}
            <div className="about-values">
              {valuesCards.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title}>
                    <Icon size={18} />
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team & Office Images Cards */}
        <section className="about-cards">
          {/* Team Images */}
          <article>
            <h2>تیم ما</h2>
            <a href={contactLink}>
              مشاهده همه اعضا <ArrowLeft size={11} />
            </a>
            <div className="team-images">
              {team.length > 0 ? (
                team.slice(0, 3).map((member) => (
                  <img
                    key={member.id}
                    src={member.imageUrl}
                    alt={member.title}
                    title={member.title}
                  />
                ))
              ) : (
                [1, 2, 3].map((n) => (
                  <img
                    key={n}
                    src={`/assets/images/about/team-0${n}.png`}
                    alt="عضو تیم"
                  />
                ))
              )}
            </div>
          </article>

          {/* Headquarters Images */}
          <article>
            <h2>دفتر مرکزی</h2>
            <a href={contactLink}>
              مشاهده گالری و تماس <ArrowLeft size={11} />
            </a>
            <div className="office-images">
              {office.length > 0 ? (
                office.slice(0, 3).map((item) => (
                  <img
                    key={item.id}
                    src={item.imageUrl}
                    alt={item.title}
                    title={item.title}
                  />
                ))
              ) : (
                [1, 2, 3].map((n) => (
                  <img
                    key={n}
                    src={`/assets/images/about/office-0${n}.png`}
                    alt="دفتر مرکزی"
                  />
                ))
              )}
            </div>
          </article>
        </section>

        {/* Bottom Section: Certificates + Consultation Request */}
        <section className="about-bottom">
          {/* Certificates */}
          <article>
            <h2>گواهینامه‌ها و مجوزها</h2>
            <div className="certs">
              {certificates.length > 0 ? (
                certificates.map((cert) => (
                  <div key={cert.id}>
                    <img src={cert.imageUrl} alt={cert.title} />
                    <span>{cert.title}</span>
                    {cert.description && (
                      <p className="cert-desc">{cert.description}</p>
                    )}
                  </div>
                ))
              ) : (
                ['ISO 9001', 'ISO 27001', 'مجوز پزشکی', 'وزارت بهداشت'].map(
                  (x, i) => (
                    <div key={x}>
                      <img
                        src={`/assets/images/about/certificate-0${i + 1}.png`}
                        alt=""
                      />
                      <span>{x}</span>
                    </div>
                  ),
                )
              )}
            </div>
          </article>

          {/* Consultation Form */}
          <form id="consultation" onSubmit={submit}>
            <Headphones size={31} />
            <div>
              <h2>نیاز به مشاوره دارید؟</h2>
              <p>کارشناسان ما آماده پاسخگویی به سوالات شما هستند.</p>

              {formError && (
                <p style={{ color: '#e53e3e', fontSize: '13px', margin: '4px 0' }}>
                  {formError}
                </p>
              )}

              <input
                name="name"
                required
                placeholder="نام و نام خانوادگی"
                disabled={isSubmitting}
              />
              <input
                name="phone"
                required
                placeholder="شماره تماس (مثال: ۰۹۱۲۳۴۵۶۷۸۹)"
                disabled={isSubmitting}
              />
              <input
                name="message"
                placeholder="موضوع یا توضیحات مشاوره (اختیاری)"
                disabled={isSubmitting}
              />

              <button
                className="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {sent
                  ? '✓ درخواست ثبت شد'
                  : isSubmitting
                  ? 'در حال ارسال...'
                  : 'درخواست مشاوره'}
              </button>
            </div>
          </form>
        </section>
      </div>

      <SiteFooter footer={fallbackData.footer} />
    </main>
  );
}
