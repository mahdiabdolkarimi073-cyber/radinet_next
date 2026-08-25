'use client';

import { useState } from 'react';
import type { HomeData, HomeService, HomeStat } from '@/lib/home-data';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Activity, ArrowLeft, Building2, CheckCircle, Headphones, Network, ShieldCheck, ShoppingCart, Stethoscope, UserCheck, Users, Zap } from 'lucide-react';

type HomePageProps = { data: HomeData };

type IconProps = { size?: number; strokeWidth?: number };

const serviceIcons: Record<string, (props: IconProps) => JSX.Element> = {
  store: (props) => <ShoppingCart {...props} />,
  teleradiology: (props) => <Network {...props} />,
  consultation: (props) => <Headphones {...props} />,
  services: (props) => <Stethoscope {...props} />,
};

const statIcons: Record<string, (props: IconProps) => JSX.Element> = {
  activity: (props) => <Activity {...props} />,
  users: (props) => <Users {...props} />,
  building: (props) => <Building2 {...props} />,
  'user-check': (props) => <UserCheck {...props} />,
};

const featureIcons = [
  (props: IconProps) => <Zap {...props} />,
  (props: IconProps) => <ShieldCheck {...props} />,
  (props: IconProps) => <Headphones {...props} />,
];

const features = [
  { title: 'سرعت و دقت بالا', text: 'تفسیر تصاویر پزشکی در کمترین زمان ممکن با دقت تخصصی رادیولوژیست‌های مجرب' },
  { title: 'امنیت اطلاعات', text: 'حفاظت کامل از داده‌های بیماران مطابق با استانداردهای روز信息安全 و حریم خصوصی' },
  { title: 'پشتیبانی ۲۴ ساعته', text: 'تیم پشتیبانی متخصص در تمام ساعات شبانه‌روز آماده پاسخگویی به شما هستند' },
];

const testimonials = [
  { name: 'دکتر مریم احمدی', role: 'رادیولوژیست', text: 'استفاده از پلتفرم رادینت سرعت تفسیر گزارش‌ها را به شکل چشمگیری افزایش داده است. کیفیت خدمات واقعاً عالی است.' },
  { name: 'دکتر علی رضایی', role: 'مدیر مرکز تصویربرداری', text: 'از زمانی که با رادینت همکاری می‌کنیم، فرآیند تفسیر تصاویر بسیار سریع‌تر و منظم‌تر شده است. کاملاً راضی هستیم.' },
  { name: 'مهندس سارا کریمی', role: 'مسئول فنی بیمارستان', text: 'سیستم تله‌رادیولوژی رادینت بسیار پایدار و کاربرپسند است. پشتیبانی فوق‌العاده‌ای دارند و همیشه پاسخگو هستند.' },
];

const faqs = [
  { q: 'تله‌رادیولوژی چیست و چه مزایایی دارد؟', a: 'تله‌رادیولوژی به انتقال تصاویر پزشکی از طریق اینترنت برای تفسیر توسط متخصصان رادیولوژی در دور دست گفته می‌شود. مزیت اصلی آن سرعت بیشتر در تشخیص و دسترسی به متخصصان است.' },
  { q: 'چگونه می‌توانم از خدمات رادینت استفاده کنم؟', a: 'کافی است در سامانه ثبت‌نام کنید و درخواست خود را ثبت نمایید. کارشناسان ما در اسرع وقت با شما تماس می‌گیرند.' },
  { q: 'آیا اطلاعات بیماران من امن است؟', a: 'بله، تمامی داده‌ها با رمزنگاری منتقل و ذخیره می‌شوند و مطابق با استانداردهای امنیتی روز از اطلاعات محافظت می‌شود.' },
  { q: 'زمان پاسخگویی به درخواست‌ها چقدر است؟', a: 'درخواست‌های عادی معمولاً در کمتر از ۲۴ ساعت پاسخ داده می‌شوند و درخواست‌های اورژانسی به صورت فوری پردازش می‌گردند.' },
];

function ServiceCard({ service }: { service: HomeService }) {
  const Icon = serviceIcons[service.icon_key] ?? serviceIcons.services;
  return (
    <article className={`service-card service-card--${service.color_theme}`}>
      <div className="service-card__top">
        <div className="service-card__icon"><Icon size={28} strokeWidth={1.8} /></div>
        <div>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
        </div>
      </div>
      <button className="text-action">{service.cta_label}<ArrowLeft size={16} /></button>
    </article>
  );
}

function StatCard({ stat }: { stat: HomeStat }) {
  const Icon = statIcons[stat.icon_key] ?? statIcons.activity;
  return (
    <div className="stat-card">
      <div className="stat-card__icon"><Icon size={24} strokeWidth={1.8} /></div>
      <div>
        <span>{stat.label}</span>
        <strong>{stat.value}</strong>
      </div>
    </div>
  );
}

export default function HomePage({ data }: HomePageProps) {
  return (
    <main>
      <SiteHeader activePath="/" />

      <section className="hero" id="home">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">راهکارهای نوین تصویربرداری</span>
            <h1>{data.slide.title}</h1>
            <h2>{data.slide.subtitle}</h2>
            <p>{data.slide.description}</p>
            <div className="hero-actions">
              <button className="button button--primary button--wide">{data.slide.primary_cta}</button>
              <button className="button button--outline button--wide">{data.slide.secondary_cta}</button>
            </div>
          </div>
          <div className="hero-visual"><img src={data.slide.image_url} alt="محیط تصویربرداری پزشکی رادینت" /></div>
        </div>
      </section>

      <div className="container services-grid" id="services">
        {data.services.map((service) => <ServiceCard key={service.name} service={service} />)}
      </div>

      <section className="container dashboard-grid">
        <div className="panel news-panel">
          <div className="section-heading">
            <div><span className="eyebrow">دانستنی‌های رادینت</span><h2>آخرین مقالات و اخبار</h2></div>
            <a href="#news">مشاهده همه <ArrowLeft size={16} /></a>
          </div>
          <div className="news-list" id="news">
            {data.news.map((item) => (
              <article className="news-item" key={item.title}>
                <img src={item.image_url} alt="" />
                <div><h3>{item.title}</h3><time>{item.date_label}</time></div>
                <ArrowLeft size={18} />
              </article>
            ))}
          </div>
        </div>
        <div className="panel stats-panel">
          <div className="section-heading">
            <div><span className="eyebrow">فعالیت سامانه</span><h2>آمار و ارقام رادینت</h2></div>
          </div>
          <div className="stats-grid">
            {data.stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">چرا رادینت؟</span><h2 style={{ fontSize: '28px' }}>مزایای استفاده از سامانه رادینت</h2></div>
          </div>
          <div className="features-grid">
            {features.map((f, i) => {
              const Icon = featureIcons[i] ?? featureIcons[0];
              return (
                <div className="feature-card" key={f.title}>
                  <div className="feature-card__icon"><Icon size={32} strokeWidth={1.8} /></div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">نظر مشتریان ما</span><h2 style={{ fontSize: '28px' }}>تجربه کاربران رادینت</h2></div>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div className="testimonial-card" key={t.name}>
                <div className="testimonial-card__stars">★★★★★</div>
                <p>{t.text}</p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">{t.name.charAt(0)}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-banner">
            <h2>آماده شروع همکاری با رادینت هستید؟</h2>
            <p>همین حالا ثبت‌نام کنید و از خدمات تخصصی تصویربرداری پزشکی بهره‌مند شوید</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="button button--primary">ثبت‌نام در سامانه</button>
              <button className="button button--outline">مشاوره رایگان</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">سوالات متداول</span><h2 style={{ fontSize: '28px' }}>پرسش‌های رایج کاربران</h2></div>
          </div>
          <div className="faq-list">
            {faqs.map((f) => (
              <details className="faq-item" key={f.q}>
                <summary>{f.q}</summary>
                <div className="faq-item__answer">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter footer={data.footer} />
    </main>
  );
}
