'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, Bell, ChevronLeft, ClipboardList, Headphones, LayoutDashboard, LogOut, MessageCircle, Package, Star, Stethoscope, Ticket, UserRound } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useEffect } from 'react';

const links = [
  { href: '/support-panel', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/support-panel/tickets', label: 'تیکت‌ها', icon: Ticket },
  { href: '/support-panel/chat', label: 'چت آنلاین', icon: MessageCircle },
  { href: '/support-panel/telereports', label: 'تله‌ریپورت', icon: Stethoscope },
  { href: '/support-panel/reviews', label: 'نظرات', icon: Star },
  { href: '/support-panel/orders', label: 'سفارش‌های فروشگاه', icon: Package },
];

export function SupportShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !['SUPPORT_EXPERT', 'support_expert'].includes(user.role))) router.replace('/auth');
  }, [loading, user, router]);

  if (loading || !user || !['SUPPORT_EXPERT', 'support_expert'].includes(user.role)) {
    return <div className="support-loading"><Activity size={24} className="support-spin" /> در حال بررسی دسترسی...</div>;
  }

  return (
    <div className="support-app" dir="rtl">
      <aside className="support-sidebar">
        <div className="support-brand"><span><Headphones size={22} /></span><div><strong>رادینت</strong><small>مرکز پشتیبانی</small></div></div>
        <div className="support-profile"><div className="support-avatar"><UserRound size={20} /></div><div><strong>{user.fullName}</strong><small>کارشناس پشتیبانی</small></div></div>
        <nav className="support-nav">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={pathname === href || (href !== '/support-panel' && pathname.startsWith(href)) ? 'is-active' : ''}><Icon size={19} /><span>{label}</span>{href === '/support-panel/chat' && <i>جدید</i>}</Link>)}</nav>
        <button className="support-logout" onClick={signOut}><LogOut size={18} /> خروج از حساب</button>
      </aside>
      <main className="support-content"><header className="support-topbar"><div><p>مرکز عملیات پشتیبانی</p><h1>{links.find((link) => pathname === link.href || (link.href !== '/support-panel' && pathname.startsWith(link.href)))?.label ?? 'داشبورد'}</h1></div><div className="support-topbar-actions"><span className="support-status"><i /> سامانه فعال</span><button aria-label="اعلان‌ها"><Bell size={20} /></button></div></header>{children}</main>
    </div>
  );
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="support-page-title"><div>{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

export function StatusBadge({ value }: { value: string }) {
  const labels: Record<string, string> = { open: 'باز', pending: 'در انتظار', closed: 'بسته', waiting: 'در صف انتظار', active: 'فعال', low: 'کم', medium: 'متوسط', high: 'زیاد', urgent: 'فوری', approved: 'تأیید شده', rejected: 'رد شده', shipped: 'ارسال شده', delivered: 'تحویل شده', processing: 'در حال پردازش', cancelled: 'لغو شده', new: 'جدید', coordinating: 'در حال هماهنگی', scheduled: 'زمان‌بندی شده', completed: 'تکمیل شده' };
  return <span className={`support-badge support-badge--${value}`}>{labels[value] ?? value}</span>;
}
