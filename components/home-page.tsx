'use client';

import { useState } from 'react';
import type { HomeData, HomeService, HomeStat } from '@/lib/home-data';
import { Activity, ArrowLeft, Building2, ChevronDown, Headphones, Instagram, Linkedin, Menu, MessageCircle, Network, Phone, ShoppingCart, Stethoscope, UserCheck, Users, X } from 'lucide-react';

type HomePageProps = { data: HomeData };

type IconProps = { size?: number; strokeWidth?: number };

const serviceIcons: Record<string, (props: IconProps) => JSX.Element> = {
  store: (props) => <ShoppingCart {...props} />,
  teleradiology: (props) => <Network {...props} />,
  consultation: (props) => <MessageCircle {...props} />,
  services: (props) => <Stethoscope {...props} />,
};

const statIcons: Record<string, (props: IconProps) => JSX.Element> = {
  activity: (props) => <Activity {...props} />,
  users: (props) => <Users {...props} />,
  building: (props) => <Building2 {...props} />,
  'user-check': (props) => <UserCheck {...props} />,
};

const navItems = ['خانه', 'درباره ما', 'خدمات', 'فروشگاه', 'تله‌رادیولوژی', 'مشاوره', 'مقالات', 'پشتیبانی', 'تماس با ما'];

function ServiceCard({ service }: { service: HomeService }) {
  const Icon = serviceIcons[service.icon_key] ?? serviceIcons.services;
  return (
    <article className={`service-card service-card--${service.color_theme}`}>
      <div className="service-card__top">
        <div className="service-card__icon"><Icon size={24} strokeWidth={1.8} /></div>
        <div>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
        </div>
      </div>
      <button className="text-action">{service.cta_label}<ArrowLeft size={14} /></button>
    </article>
  );
}

function StatCard({ stat }: { stat: HomeStat }) {
  const Icon = statIcons[stat.icon_key] ?? statIcons.activity;
  return (
    <div className="stat-card">
      <div className="stat-card__icon"><Icon size={20} strokeWidth={1.8} /></div>
      <div>
        <span>{stat.label}</span>
        <strong>{stat.value}</strong>
      </div>
    </div>
  );
}

export default function HomePage({ data }: HomePageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  return (
    <main>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#home" aria-label="رادینت">
            <span className="brand-mark">◈</span>
            <span><b>رادینت</b><small>RADINAT</small></span>
          </a>
          <button className="mobile-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="باز کردن منو">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
            {navItems.map((item, index) => <a key={item} className={index === 0 ? 'is-active' : ''} href={`#${index === 0 ? 'home' : 'services'}`} onClick={() => setMenuOpen(false)}>{item}</a>)}
          </nav>
          <div className="header-actions">
            <button className="language-button"><span>فارسی</span><ChevronDown size={13} /></button>
            <button className="cart-button" onClick={() => setCartCount((count) => count + 1)} aria-label="سبد خرید"><ShoppingCart size={18} />{cartCount > 0 && <em>{cartCount}</em>}</button>
            <button className="button button--outline">ورود</button>
            <button className="button button--primary">ثبت‌نام</button>
          </div>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">راهکارهای نوین تصویربرداری</span>
            <h1>{data.slide.title}</h1>
            <h2>{data.slide.subtitle}</h2>
            <p>{data.slide.description}</p>
            <div className="hero-actions"><button className="button button--primary button--wide">{data.slide.primary_cta}</button><button className="button button--outline button--wide">{data.slide.secondary_cta}</button></div>
          </div>
          <div className="hero-visual"><img src={data.slide.image_url} alt="محیط تصویربرداری پزشکی رادینت" /></div>
        </div>
      </section>

      <div className="container services-grid" id="services">{data.services.map((service) => <ServiceCard key={service.name} service={service} />)}</div>

      <section className="container dashboard-grid">
        <div className="panel news-panel">
          <div className="section-heading"><div><span className="eyebrow">دانستنی‌های رادینت</span><h2>آخرین مقالات و اخبار</h2></div><a href="#news">مشاهده همه <ArrowLeft size={14} /></a></div>
          <div className="news-list" id="news">{data.news.map((item) => <article className="news-item" key={item.title}><img src={item.image_url} alt="" /><div><h3>{item.title}</h3><time>{item.date_label}</time></div><ArrowLeft size={16} /></article>)}</div>
        </div>
        <div className="panel stats-panel">
          <div className="section-heading"><div><span className="eyebrow">فعالیت سامانه</span><h2>آمار و ارقام رادینت</h2></div></div>
          <div className="stats-grid">{data.stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-about"><a className="brand brand--footer" href="#home"><span className="brand-mark">◈</span><span><b>رادینت</b><small>RADINAT</small></span></a><p>{data.footer.description}</p><div className="socials"><a href="#instagram" aria-label="اینستاگرام"><Instagram size={16} /></a><a href="#linkedin" aria-label="لینکدین"><Linkedin size={16} /></a></div></div>
          <div className="footer-column"><h3>خدمات ما</h3><a href="#services">فروشگاه</a><a href="#services">تله‌رادیولوژی</a><a href="#services">مشاوره</a><a href="#services">سایر خدمات</a></div>
          <div className="footer-column"><h3>دسترسی سریع</h3><a href="#home">خانه</a><a href="#about">درباره ما</a><a href="#news">مقالات</a><a href="#support">پشتیبانی</a></div>
          <div className="footer-column footer-contact"><h3>راه‌های ارتباطی</h3><a href={`tel:${data.footer.phone}`}><Phone size={15} />{data.footer.phone}</a><a href={`mailto:${data.footer.email}`}><Headphones size={15} />{data.footer.email}</a><span><Building2 size={15} />{data.footer.address}</span></div>
        </div>
        <div className="container footer-bottom"><span>© تمامی حقوق برای رادینت محفوظ است.</span><span>طراحی و توسعه با رویکرد سلامت دیجیتال</span></div>
      </footer>
    </main>
  );
}
