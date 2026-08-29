'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, LogOut, Menu, ShoppingCart, User, X } from 'lucide-react';
import { cartCount, readCart } from '@/lib/cart';
import { useAuth } from '@/components/auth-provider';

const navItems = [
  { label: 'خانه', href: '/' },
  { label: 'درباره ما', href: '/about' },
  { label: 'خدمات', href: '/#services' },
  { label: 'فروشگاه', href: '/shop' },
  { label: 'جستجوی محصولات', href: '/shop/search' },
  { label: 'تله‌ریپورت', href: '/tele-report' },
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
  const { user, loading, signOut } = useAuth();

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
          {loading ? null : user ? (
            <>
              <span className="header-user"><User size={16} /> {user.email?.split('@')[0]}</span>
              <button className="button button--outline" onClick={() => void signOut()}><LogOut size={16} /> خروج</button>
            </>
          ) : (
            <>
              <a className="button button--outline" href="/auth">ورود</a>
              <a className="button button--primary" href="/auth?mode=signup">ثبت‌نام</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
