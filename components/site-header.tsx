'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu, ShoppingCart, User, X } from 'lucide-react';
import { cartCount, readCart } from '@/lib/cart';
import { useAuth } from '@/components/auth-provider';
import { getPanelPathForRole } from '@/lib/auth-client';

const navItems = [
  { label: 'خانه', href: '/' },
  { label: 'درباره ما', href: '/about' },
  { label: 'فروشگاه', href: '/shop' },
  { label: 'تله‌ریپورت', href: '/tele-report' },
];

const moreMenuItems = [
  { label: 'مقالات', href: '/articles' },
  { label: 'پشتیبانی', href: '/support' },
  { label: 'تماس با ما', href: '/contact' },
  { label: 'قوانین', href: '/legal/terms' },
  { label: 'پیگیری سفارشات', href: '/shop/tracking' },
];

type SiteHeaderProps = {
  activePath: string;
};

export function SiteHeader({ activePath }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [count, setCount] = useState(0);
  const moreDropdownRef = useRef<HTMLDivElement | null>(null);
  const { user, loading, signOut } = useAuth();
  const [branding, setBranding] = useState<{ siteName?: string; logoUrl?: string }>({});

  useEffect(() => {
    fetch('/api/settings/public', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setBranding(data);
      })
      .catch(() => {});
  }, []);

  const isMoreActive = moreMenuItems.some(
    (item) => activePath === item.href || (item.href !== '/' && activePath.startsWith(item.href)),
  );

  useEffect(() => {
    const update = () => setCount(cartCount(readCart()));
    update();
    window.addEventListener('cart-updated', update);
    return () => window.removeEventListener('cart-updated', update);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="/" aria-label={branding.siteName || 'رادینت'}>
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.siteName || 'رادینت'}
              style={{ maxHeight: 38, maxWidth: 120, objectFit: 'contain' }}
            />
          ) : (
            <span className="brand-mark">◈</span>
          )}
          <span><b>{branding.siteName || 'رادینت'}</b><small>RADINAT</small></span>
        </a>
        <button
          className="mobile-menu-button"
          onClick={() => {
            setMenuOpen((open) => !open);
            setMoreOpen(false);
          }}
          aria-label="باز کردن منو"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <a
              key={item.label}
              className={item.href === activePath ? 'is-active' : ''}
              href={item.href}
              onClick={() => {
                setMenuOpen(false);
                setMoreOpen(false);
              }}
            >
              {item.label}
            </a>
          ))}
          <div className={`nav-dropdown ${moreOpen ? 'is-open' : ''}`} ref={moreDropdownRef}>
            <button
              type="button"
              className={`nav-dropdown-trigger ${isMoreActive ? 'is-active' : ''}`}
              onClick={() => setMoreOpen((prev) => !prev)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
            >
              <span>بیشتر</span>
              <ChevronDown
                size={15}
                className={`nav-dropdown-chevron ${moreOpen ? 'is-rotated' : ''}`}
              />
            </button>
            {moreOpen && (
              <div className="nav-dropdown-menu" role="menu">
                {moreMenuItems.map((item) => (
                  <a
                    key={item.label}
                    role="menuitem"
                    href={item.href}
                    className={`nav-dropdown-item ${item.href === activePath ? 'is-active' : ''}`}
                    onClick={() => {
                      setMoreOpen(false);
                      setMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="header-actions">
          <button className="language-button"><span>فارسی</span><ChevronDown size={13} /></button>
          <a className="cart-button" href="/shop/cart" aria-label="سبد خرید">
            <ShoppingCart size={18} />{count > 0 && <em>{count.toLocaleString('fa-IR')}</em>}
          </a>
          {loading ? null : user ? (
            <>
              <span className="header-user"><User size={16} /> {user.fullName || user.email?.split('@')[0]}</span>
              <a className="button button--outline" href={getPanelPathForRole(user.role)}>داشبورد</a>
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

