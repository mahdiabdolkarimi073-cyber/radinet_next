'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Menu, ShoppingCart, X } from 'lucide-react';
import { cartCount, readCart } from '@/lib/cart';

const navItems = [
  { label: 'خانه', href: '/' },
  { label: 'درباره ما', href: '/about' },
  { label: 'خدمات', href: '/#services' },
  { label: 'فروشگاه', href: '/shop' },
  { label: 'جستجوی محصولات', href: '/shop/search' },
  { label: 'تله‌رادیولوژی', href: '/#services' },
  { label: 'مشاوره', href: '/#services' },
  { label: 'مقالات', href: '/#news' },
  { label: 'پشتیبانی', href: '/support' },
  { label: 'پیگیری سفارش', href: '/shop/tracking' },
  { label: 'تماس با ما', href: '/contact' },
  { label: 'قوانین', href: '/legal/terms' },
];

type SiteHeaderProps = {
  activePath: string;
};

export function SiteHeader({ activePath }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(cartCount(readCart()));
    update();
    window.addEventListener('cart-updated', update);
    return () => window.removeEventListener('cart-updated', update);
  }, []);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="/" aria-label="رادینت">
          <span className="brand-mark">◈</span>
          <span><b>رادینت</b><small>RADINAT</small></span>
        </a>
        <button className="mobile-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="باز کردن منو">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <a
              key={item.label}
              className={item.href === activePath ? 'is-active' : ''}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="language-button"><span>فارسی</span><ChevronDown size={13} /></button>
          <a className="cart-button" href="/shop/cart" aria-label="سبد خرید">
            <ShoppingCart size={18} />{count > 0 && <em>{count.toLocaleString('fa-IR')}</em>}
          </a>
          <button className="button button--outline">ورود</button>
          <button className="button button--primary">ثبت‌نام</button>
        </div>
      </div>
    </header>
  );
}
