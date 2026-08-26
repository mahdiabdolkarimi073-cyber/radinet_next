'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  ChevronDown,
  Clock3,
  Headphones,
  LaptopMinimal,
  Mail,
  MessageCircleQuestion,
  Phone,
  Send,
  Smartphone,
} from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  { question: 'چگونه میتوانم درخواست تصویربرداری ثبت کنم؟', answer: 'از بخش خدمات، گزینه موردنظر را انتخاب کنید و فرم درخواست را تکمیل کنید.' },
  { question: 'چگونه میتوانم یک درخواست جدید ثبت کنم؟', answer: 'پس از ورود به حساب کاربری، از منوی خدمات روی درخواست جدید کلیک کنید.' },
  { question: 'چگونه میتوانم گزارش خود را مشاهده کنم؟', answer: 'گزارش‌های آماده در پنل کاربری و بخش سوابق درخواست‌ها قابل مشاهده هستند.' },
  { question: 'چگونه میتوانم برای پشتیبانی درخواست ثبت کنم؟', answer: 'از همین صفحه با کارشناسان پشتیبانی تماس بگیرید یا پیام خود را برای ما ارسال کنید.' },
];

const contactItems = [
  { icon: Phone, label: 'تلفن', value: '021-12545678' },
  { icon: Smartphone, label: 'موبایل', value: '0991-123-5678' },
  { icon: Mail, label: 'ایمیل', value: 'support@radinat.com' },
  { icon: Clock3, label: 'ساعت پاسخگویی', value: 'شنبه تا چهارشنبه ۸:۰۰ - ۱۷:۰۰' },
];

export function SupportPage() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  return (
    <div className="support-screen">
      <section className="support-hero" aria-labelledby="support-title">
        <div className="support-hero__content">
          <h1 id="support-title">پشتیبانی</h1>
          <p>ما در کنار شما هستیم</p>
        </div>
      </section>

      <main className="support-main">
        <section className="support-tools" aria-label="خدمات پشتیبانی">
          <a className="support-tool support-tool--green" href="/contact">
            <span className="support-tool__icon"><Headphones size={20} /></span>
            <span><strong>تماس فوری</strong><small>با کارشناسان ما در ارتباط باشید</small></span>
            <span className="support-tool__action">تماس با ما <ArrowLeft size={14} /></span>
          </a>
          <a className="support-tool support-tool--blue" href="#faq">
            <span className="support-tool__icon"><MessageCircleQuestion size={20} /></span>
            <span><strong>سوالات متداول</strong><small>پاسخ به پرسش‌های شما</small></span>
            <span className="support-tool__action">مشاهده سوالات <ArrowLeft size={14} /></span>
          </a>
          <a className="support-tool support-tool--mint" href="#contact-info">
            <span className="support-tool__icon"><LaptopMinimal size={20} /></span>
            <span><strong>سامانه تیکتینگ</strong><small>درخواست خود را ثبت کنید</small></span>
            <span className="support-tool__action">ورود به سامانه <ArrowLeft size={14} /></span>
          </a>
        </section>

        <section className="support-panels">
          <div className="support-panel support-faq" id="faq">
            <div className="support-panel__heading">
              <div><h2>سوالات متداول</h2><p>پاسخ به پرسش‌های زیر:</p></div>
              <button className="support-search" type="button" aria-label="جستجوی سوالات"><Send size={15} /></button>
            </div>
            <div className="support-faq-list">
              {faqItems.map((item, index) => {
                const isOpen = openQuestion === index;
                return (
                  <div className={`support-faq-item${isOpen ? ' is-open' : ''}`} key={item.question}>
                    <button type="button" onClick={() => setOpenQuestion(isOpen ? null : index)} aria-expanded={isOpen}>
                      <span>{item.question}</span><ChevronDown size={16} />
                    </button>
                    {isOpen && <p>{item.answer}</p>}
                  </div>
                );
              })}
            </div>
            <a className="support-outline-button" href="#faq">مشاهده همه سوالات</a>
          </div>

          <div className="support-panel support-contact" id="contact-info">
            <div className="support-panel__heading"><div><h2>اطلاعات تماس پشتیبانی</h2><p>راه‌های ارتباطی با کارشناسان</p></div><span className="support-panel__badge"><Headphones size={16} /></span></div>
            <div className="support-contact-list">
              {contactItems.map(({ icon: Icon, label, value }) => (
                <a href={label === 'ایمیل' ? `mailto:${value}` : `tel:${value}`} className="support-contact-item" key={label}>
                  <span><Icon size={16} /></span><div><small>{label}</small><strong>{value}</strong></div>
                </a>
              ))}
            </div>
            <div className="support-response-box"><CalendarClock size={18} /><div><strong>پاسخگویی سریع و مطمئن</strong><p>پشتیبانی در کنار شماست تا تجربه‌ای ساده و مطمئن داشته باشید.</p></div></div>
          </div>
        </section>
      </main>
    </div>
  );
}
