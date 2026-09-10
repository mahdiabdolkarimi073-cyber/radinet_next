'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, LayoutDashboard, LogOut, User as UserIcon, UserCircle } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useEffect } from 'react';

const links = [
  { href: '/user-panel', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/user-panel/profile', label: 'پروفایل من', icon: UserCircle },
];

export function UserPanelShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'user')) router.replace('/auth');
  }, [loading, user, router]);

  if (loading || !user || user.role !== 'user') {
    return <div className="up-loading"><Activity size={24} className="up-spin" /> در حال بررسی دسترسی...</div>;
  }

  return (
    <div className="up-app" dir="rtl">
      <aside className="up-sidebar">
        <div className="up-brand"><span><UserIcon size={22} /></span><div><strong>رادینت</strong><small>پنل کاربر</small></div></div>
        <div className="up-profile"><div className="up-avatar"><UserCircle size={22} /></div><div><strong>{user.fullName}</strong><small>{user.email}</small></div></div>
        <nav className="up-nav">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={pathname === href || (href !== '/user-panel' && pathname.startsWith(href)) ? 'is-active' : ''}><Icon size={19} /><span>{label}</span></Link>)}</nav>
        <button className="up-logout" onClick={signOut}><LogOut size={18} /> خروج از حساب</button>
      </aside>
      <main className="up-content"><header className="up-topbar"><div><p>پنل کاربری</p><h1>{links.find((link) => pathname === link.href || (link.href !== '/user-panel' && pathname.startsWith(link.href)))?.label ?? 'داشبورد'}</h1></div><div className="up-topbar-actions"><span className="up-status"><i /> سامانه فعال</span></div></header>{children}</main>
    </div>
  );
}

export function UpStatusBadge({ value }: { value: string }) {
  const labels: Record<string, string> = { pending: 'در انتظار', processing: 'در حال پردازش', shipped: 'ارسال شده', delivered: 'تحویل شده', cancelled: 'لغو شده', new: 'جدید', open: 'باز', closed: 'بسته', completed: 'تکمیل شده' };
  return <span className={`up-badge up-badge--${value}`}>{labels[value] ?? value}</span>;
}
