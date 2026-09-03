'use client';

import { useState } from 'react';
import { LayoutDashboard, LogOut, Menu, ShieldCheck, Users, FileText, Settings, X } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export function AdminDashboardPage() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'داشبورد', icon: LayoutDashboard, active: true },
    { label: 'کاربران', icon: Users },
    { label: 'گزارش‌ها', icon: FileText },
    { label: 'تنظیمات', icon: Settings },
  ];

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <div className="admin-content">
          <header className="admin-header">
            <div className="admin-header__title">
              <ShieldCheck size={26} strokeWidth={1.7} />
              <span>پنل مدیریت</span>
            </div>
            <div className="admin-profile">
              <div className="admin-avatar">{user?.fullName?.charAt(0) ?? 'A'}</div>
              <div className="admin-user">
                <strong>{user?.fullName ?? 'مدیر سیستم'}</strong>
                <span>مدیر کل</span>
              </div>
            </div>
            <button className="admin-burger" onClick={() => setSidebarOpen(true)} aria-label="منو">
              <Menu size={26} strokeWidth={1.7} />
            </button>
          </header>

          <main className="admin-main">
            <div className="admin-welcome">
              <div className="admin-welcome__text">
                <h1>سلام ادمین، خوش آمدید</h1>
                <p>به پنل مدیریت رادینت وارد شده‌اید. از اینجا می‌توانید سیستم را مدیریت کنید.</p>
              </div>
            </div>

            <div className="admin-cards">
              <div className="admin-card">
                <div className="admin-card__icon"><Users size={26} strokeWidth={1.7} /></div>
                <strong>کاربران</strong>
                <span>مدیریت کاربران و دسترسی‌ها</span>
              </div>
              <div className="admin-card">
                <div className="admin-card__icon"><FileText size={26} strokeWidth={1.7} /></div>
                <strong>گزارش‌ها</strong>
                <span>مشاهده و مدیریت گزارش‌های سیستم</span>
              </div>
              <div className="admin-card">
                <div className="admin-card__icon"><Settings size={26} strokeWidth={1.7} /></div>
                <strong>تنظیمات</strong>
                <span>پیکربندی و تنظیمات کلی سایت</span>
              </div>
              <div className="admin-card">
                <div className="admin-card__icon"><ShieldCheck size={26} strokeWidth={1.7} /></div>
                <strong>امنیت</strong>
                <span>مدیریت امنیت و دسترسی‌ها</span>
              </div>
            </div>
          </main>
        </div>

        {sidebarOpen && (
          <div className="admin-overlay" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,29,65,.42)' }} />
        )}

        <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-brand">
            <div className="admin-brand__mark">
              <ShieldCheck size={28} strokeWidth={1.7} />
            </div>
            <div>
              <strong>رادینت</strong>
              <span>پنل مدیریت</span>
            </div>
            <button style={{ marginRight: 'auto', border: 'none', background: 'transparent', color: '#fff', display: sidebarOpen ? 'grid' : 'none', placeItems: 'center' }} onClick={() => setSidebarOpen(false)}>
              <X size={22} />
            </button>
          </div>

          <nav className="admin-nav">
            {navItems.map((item) => (
              <button key={item.label} className={`admin-nav__item ${item.active ? 'is-active' : ''}`}>
                <item.icon size={22} strokeWidth={1.7} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button className="admin-nav__logout" onClick={signOut}>
            <LogOut size={22} strokeWidth={1.7} />
            <span>خروج</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
