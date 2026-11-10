'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, LayoutDashboard, LogOut, User as UserIcon, UserCircle, Package, Stethoscope, FileText, CreditCard, Bell, MessageSquare, Star, Plus } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { getPanelPathForRole } from '@/lib/auth-client';
import { useEffect } from 'react';

const links = [
  { href: '/user-panel', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/user-panel/profile', label: 'پروفایل من', icon: UserCircle },
  { href: '/user-panel/orders', label: 'سفارش‌های فروشگاه', icon: Package },
  { href: '/user-panel/telereports', label: 'درخواست‌های تله‌ریپورت', icon: Stethoscope },
  { href: '/user-panel/medical-reports', label: 'گزارش‌های پزشکی', icon: FileText },
  { href: '/user-panel/transactions', label: 'تراکنش‌ها و پرداخت‌ها', icon: CreditCard },
  { href: '/user-panel/notifications', label: 'اعلان‌ها', icon: Bell },
  { href: '/user-panel/tickets', label: 'تیکت‌های پشتیبانی', icon: MessageSquare },
  { href: '/user-panel/reviews', label: 'نظرات و بازخورد', icon: Star },
];

export function UserPanelShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const isPatientOrUser = user?.role === 'user' || user?.role === 'patient';

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth');
      } else if (!isPatientOrUser) {
        router.replace(getPanelPathForRole(user.role));
      }
    }
  }, [loading, user, isPatientOrUser, router]);

  if (loading || !user || !isPatientOrUser) {
    return <div className="up-loading"><Activity size={24} className="up-spin" /> در حال بررسی دسترسی...</div>;
  }

  return (
    <div className="up-app" dir="rtl">
      <aside className="up-sidebar">
        <div className="up-brand"><span><UserIcon size={22} /></span><div><strong>رادینت</strong><small>پنل بیمار و کاربر</small></div></div>
        <div className="up-profile"><div className="up-avatar"><UserCircle size={22} /></div><div><strong>{user.fullName}</strong><small>{user.email}</small></div></div>
        <nav className="up-nav">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={pathname === href || (href !== '/user-panel' && pathname.startsWith(href)) ? 'is-active' : ''}><Icon size={19} /><span>{label}</span></Link>)}</nav>
        <button className="up-logout" onClick={signOut}><LogOut size={18} /> خروج از حساب</button>
      </aside>
      <main className="up-content">
        <header className="up-topbar">
          <div>
            <p>پنل کاربری</p>
            <h1>{links.find((link) => pathname === link.href || (link.href !== '/user-panel' && pathname.startsWith(link.href)))?.label ?? 'داشبورد'}</h1>
          </div>
          <div className="up-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              href="/tele-report/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                background: '#2563eb',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              }}
            >
              <Plus size={16} /> ثبت درخواست تله‌ریپورت جدید
            </Link>
            <span className="up-status"><i /> سامانه فعال</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export function UpStatusBadge({ value }: { value: string }) {
  const labels: Record<string, string> = {
    pending: 'در انتظار',
    pending_payment: 'در انتظار پرداخت',
    pending_review: 'ارسال‌شده به پشتیبانی / در انتظار ارجاع',
    assigned: 'ارجاع داده شده به پزشک',
    in_progress: 'در حال بررسی توسط پزشک',
    processing: 'در حال پردازش',
    shipped: 'ارسال شده',
    delivered: 'تحویل شده',
    cancelled: 'لغو شده',
    new: 'ارسال‌شده به پشتیبانی / در انتظار ارجاع',
    open: 'باز',
    closed: 'بسته',
    completed: 'تکمیل شده',
    paid: 'پرداخت شده',
    unpaid: 'پرداخت نشده',
    refunded: 'بازگشت‌داده شده',
    draft: 'پیش‌نویس پزشک',
    signed: 'امضا شده',
    approved: 'تایید شده',
    rejected: 'رد شده',
    resolved: 'حل شده',
    low: 'کم',
    medium: 'متوسط',
    high: 'زیاد',
    urgent: 'فوری',
  };
  return <span className={`up-badge up-badge--${value}`}>{labels[value] ?? value}</span>;
}

