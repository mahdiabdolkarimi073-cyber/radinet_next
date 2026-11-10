'use client';

import { useEffect, useState } from 'react';
import { Building2, Headphones, Instagram, Linkedin, Phone } from 'lucide-react';

type SiteFooterProps = {
  footer: {
    description: string;
    phone: string;
    email: string;
    address: string;
  };
};

export function SiteFooter({ footer }: SiteFooterProps) {
  const [branding, setBranding] = useState<{ siteName?: string; logoUrl?: string }>({});

  useEffect(() => {
    fetch('/api/settings/public', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setBranding(data);
      })
      .catch(() => {});
  }, []);

  const siteName = branding.siteName || 'رادینت';

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <a className="brand brand--footer" href="/">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={siteName}
                style={{ maxHeight: 38, maxWidth: 120, objectFit: 'contain' }}
              />
            ) : (
              <span className="brand-mark">◈</span>
            )}
            <span><b>{siteName}</b><small>RADINAT</small></span>
          </a>
          <p>{footer.description}</p>
          <div className="socials">
            <a href="#instagram" aria-label="اینستاگرام"><Instagram size={16} /></a>
            <a href="#linkedin" aria-label="لینکدین"><Linkedin size={16} /></a>
          </div>
        </div>
        <div className="footer-column">
          <h3>خدمات ما</h3>
          <a href="/#services">فروشگاه</a>
          <a href="/#services">تله‌رادیولوژی</a>
          <a href="/#services">مشاوره</a>
          <a href="/#services">سایر خدمات</a>
        </div>
        <div className="footer-column">
          <h3>دسترسی سریع</h3>
          <a href="/">خانه</a>
          <a href="/about">درباره ما</a>
          <a href="/articles">مقالات</a>
          <a href="/contact">پشتیبانی</a>
          <a href="/legal/terms">قوانین</a>
        </div>
        <div className="footer-column footer-contact">
          <h3>راه‌های ارتباطی</h3>
          <a href={`tel:${footer.phone}`}><Phone size={15} />{footer.phone}</a>
          <a href={`mailto:${footer.email}`}><Headphones size={15} />{footer.email}</a>
          <span><Building2 size={15} />{footer.address}</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© تمامی حقوق برای {siteName} محفوظ است.</span>
        <span>طراحی و توسعه با رویکرد سلامت دیجیتال</span>
      </div>
    </footer>
  );
}
