'use client';

import { FormEvent, useState } from 'react';
import { Clock, Instagram, Linkedin, Mail, MapPin, Phone, Send } from 'lucide-react';
import type { ContactData } from '@/lib/contact-data';
import { submitContactMessage } from '@/lib/contact-repository';

type ContactPageProps = {
  data: ContactData;
  footer: { description: string; phone: string; email: string; address: string };
};

export function ContactPage({ data, footer }: ContactPageProps) {
  const page = data.page;
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await submitContactMessage({
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? ''),
      subject: String(form.get('subject') ?? ''),
      message: String(form.get('message') ?? ''),
    });
    setSubmitting(false);
    if (result.ok) {
      setSent(true);
      e.currentTarget.reset();
    } else {
      setError(result.error ?? 'خطایی رخ داد.');
    }
  }

  const mapSrc = page?.latitude && page?.longitude
    ? `https://maps.google.com/maps?q=${page.latitude},${page.longitude}&z=15&output=embed`
    : null;

  return (
    <div className="contact-screen">
      <section className="contact-hero">
        <div className="contact-hero__overlay" />
        <div className="container contact-hero__content">
          <span className="contact-hero__breadcrumb">خانه / تماس با ما</span>
          <h1>{page?.hero_title ?? 'تماس با ما'}</h1>
          <p>{page?.hero_subtitle ?? 'با ما در ارتباط باشید'}</p>
        </div>
      </section>

      <div className="container contact-main">
        <div className="contact-card">
          <div className="contact-form-column">
            <h2 className="contact-section-title">فرم ارتباط با ما</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form__row">
                <input name="name" required placeholder="نام و نام خانوادگی" aria-label="نام" />
                <input name="phone" required placeholder="شماره تماس" aria-label="شماره تماس" />
              </div>
              <div className="contact-form__row">
                <input name="email" type="email" required placeholder="ایمیل" aria-label="ایمیل" />
                <input name="subject" required placeholder="موضوع" aria-label="موضوع" />
              </div>
              <textarea name="message" required placeholder="متن پیام" aria-label="متن پیام" rows={5} />
              <button type="submit" className="contact-form__submit" disabled={submitting}>
                <Send size={14} />
                {submitting ? 'در حال ارسال...' : 'ارسال پیام'}
              </button>
              {sent && <p className="contact-form__success">پیام شما با موفقیت ارسال شد. به‌زودی با شما تماس می‌گیریم.</p>}
              {error && <p className="contact-form__error">{error}</p>}
            </form>
          </div>

          <div className="contact-info-column">
            <h2 className="contact-section-title">{page?.intro_title ?? 'اطلاعات تماس'}</h2>
            <p className="contact-info-intro">{page?.intro_body}</p>

            <ul className="contact-info-list">
              {data.phones.map((p) => (
                <li key={p.id}>
                  <span className="contact-info-icon"><Phone size={13} /></span>
                  <div><strong>{p.label}</strong><a href={`tel:${p.phone}`}>{p.phone}</a></div>
                </li>
              ))}
              {data.emails.map((e) => (
                <li key={e.id}>
                  <span className="contact-info-icon"><Mail size={13} /></span>
                  <div><strong>{e.label}</strong><a href={`mailto:${e.email}`}>{e.email}</a></div>
                </li>
              ))}
              <li>
                <span className="contact-info-icon"><MapPin size={13} /></span>
                <div><strong>آدرس دفتر مرکزی</strong><span>{page?.office_address}</span></div>
              </li>
              {data.hours.map((h) => (
                <li key={h.id}>
                  <span className="contact-info-icon"><Clock size={13} /></span>
                  <div><strong>{h.day_label}</strong><span>{h.hours}</span></div>
                </li>
              ))}
            </ul>

            <div className="contact-socials">
              <a href="#instagram" aria-label="اینستاگرام"><Instagram size={14} /></a>
              <a href="#linkedin" aria-label="لینکدین"><Linkedin size={14} /></a>
              <a href="#telegram" aria-label="تلگرام"><Send size={14} /></a>
            </div>

            <div className="contact-map">
              {mapSrc ? (
                <iframe
                  title="نقشه دفتر مرکزی رادینت"
                  src={mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="contact-map__placeholder">
                  <MapPin size={28} />
                  <span>موقعیت روی نقشه</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
