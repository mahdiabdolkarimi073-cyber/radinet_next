'use client';

import { useEffect, useState } from 'react';
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  Clock3,
  FilePlus2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Stethoscope,
  UserCog,
  UsersRound,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type DashboardStats = {
  total: number;
  new: number;
  inReview: number;
  completed: number;
};

type DashboardNotification = {
  id: string;
  title: string;
  description: string;
  status: 'warning' | 'success' | 'info' | 'error';
  createdAt: string;
};

type DashboardData = {
  stats: DashboardStats;
  notifications: DashboardNotification[];
};

const navItems = [
  { label: 'داشبورد', href: '/dashboard', icon: LayoutDashboard, active: true },
  { label: 'درخواست‌های ارجاعی', href: '/dashboard/referrals', icon: ClipboardList },
  { label: 'گزارش‌ها', href: '/dashboard/reports', icon: FileText },
  { label: 'بیماران', href: '/dashboard/patients', icon: UsersRound },
  { label: 'درخواست اطلاعات تکمیلی', href: '/dashboard/info-requests', icon: MessageCircleQuestion },
  { label: 'آرشیو گزارش‌ها', href: '/dashboard/report-archive', icon: Archive },
  { label: 'پروفایل تخصصی', href: '/dashboard/doctor-profile', icon: UserCog },
];

const quickActions = [
  { label: 'فهرست موارد ارجاعی', href: '/dashboard/referrals', icon: ClipboardList },
  { label: 'درخواست‌های جدید', href: '/tele-report/new', icon: FilePlus2 },
];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'همین حالا';
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  return `${Math.floor(hours / 24)} روز پیش`;
}

const statusColors: Record<DashboardNotification['status'], string> = {
  warning: '#C9973E',
  success: '#168A68',
  info: '#1456C3',
  error: '#D94B55',
};

export function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
    fetch('/api/dashboard', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (result) setData(result);
        else setError('دریافت اطلاعات داشبورد ناموفق بود.');
      })
      .catch(() => setError('اتصال به سرور برقرار نیست.'));
  }, []);

  const stats = [
    { label: 'درخواست‌های جدید', value: data?.stats.new ?? 0, change: '+۵ مورد نسبت به دیروز', tone: 'new', icon: FilePlus2 },
    { label: 'درخواست‌های در حال بررسی', value: data?.stats.inReview ?? 0, change: '+۷ مورد نسبت به دیروز', tone: 'review', icon: Clock3 },
    { label: 'درخواست‌های تکمیل‌شده', value: data?.stats.completed ?? 0, change: '+۲۲٪ مورد نسبت به هفته قبل', tone: 'completed', icon: CheckCircle2 },
  ];

  return (
    <div className="dashboard-root">
      <div className="dashboard-shell">
        <aside className={`dash-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="dash-brand">
            <div className="dash-brand__mark"><Stethoscope size={29} strokeWidth={1.7} /></div>
            <div>
              <strong>داشبورد</strong>
              <span>سامانه مدیریت خدمات پزشکی</span>
            </div>
          </div>
          <nav className="dash-nav" aria-label="منوی داشبورد">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className={`dash-nav__item ${item.active ? 'is-active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="dash-nav__logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج از حساب</span>
          </button>
        </aside>

        {sidebarOpen && <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="dashboard-content">
          <header className="dash-header">
            <button className="dash-burger" onClick={() => setSidebarOpen((open) => !open)} aria-label="باز کردن منو">
              {sidebarOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
            <div className="dash-profile">
              <div className="dash-avatar">{user?.fullName?.charAt(0) ?? 'م'}</div>
              <div className="dash-user">
                <strong>{loading ? 'در حال بارگذاری…' : user?.fullName ?? 'مهدی عبدالكریمی'}</strong>
                <span>مدیریت هوشمند خدمات پزشکی</span>
              </div>
              <ChevronDown className="dash-profile__chevron" size={17} />
            </div>
            <div className="dash-header__actions">
              <button className="dash-header__icon" aria-label="تقویم"><CalendarDays size={25} strokeWidth={1.7} /></button>
            </div>
          </header>

          <main className="dash-main">
            <section className="dash-welcome">
              <div className="dash-welcome__text">
                <h1>خوش آمدید، {user?.fullName ?? 'مهدی عبدالكریمی'}!</h1>
                <p>در اینجا می‌توانید درخواست‌ها و گزارش‌های خود را مدیریت کنید.</p>
              </div>
            </section>

            {error && <div className="dash-error">{error}</div>}

            <section className="dash-stats" aria-label="آمار درخواست‌ها">
              {stats.map((stat) => (
                <article className={`dash-stat dash-stat--${stat.tone}`} key={stat.label}>
                  <div className="dash-stat__top">
                    <span>{stat.label}</span>
                    <div className="dash-stat__icon"><stat.icon size={26} strokeWidth={1.8} /></div>
                  </div>
                  <strong>{stat.value.toLocaleString('fa-IR')}</strong>
                  <em>{stat.change} <b>↗</b></em>
                </article>
              ))}
            </section>

            <section className="dash-bottom">
              <div className="dash-card dash-card--notifications">
                <div className="dash-card__head">
                  <h2>دسترسی سریع به بخش‌ها</h2>
                  <ClipboardList size={23} strokeWidth={1.7} />
                </div>
                <ul className="dash-notif-list">
                  <li className="dash-notif">
                    <span className="dash-notif__dot" style={{ background: '#1456C3' }} />
                    <div className="dash-notif__body"><strong>درخواست اطلاعات تکمیلی</strong><span>ارسال درخواست مدارک یا اطلاعات بیشتر از بیمار</span></div>
                    <a href="/dashboard/info-requests" style={{ color: '#1456C3', fontSize: '14px' }}>مشاهده</a>
                  </li>
                  <li className="dash-notif">
                    <span className="dash-notif__dot" style={{ background: '#168A68' }} />
                    <div className="dash-notif__body"><strong>آرشیو گزارش‌ها</strong><span>مشاهده و جستجوی تمامی گزارش‌های ثبت‌شده</span></div>
                    <a href="/dashboard/report-archive" style={{ color: '#168A68', fontSize: '14px' }}>مشاهده</a>
                  </li>
                  <li className="dash-notif">
                    <span className="dash-notif__dot" style={{ background: '#C9973E' }} />
                    <div className="dash-notif__body"><strong>پروفایل تخصصی</strong><span>ویرایش اطلاعات شخصی، تخصص‌ها و رزومه</span></div>
                    <a href="/dashboard/doctor-profile" style={{ color: '#C9973E', fontSize: '14px' }}>مشاهده</a>
                  </li>
                </ul>
              </div>

              <div className="dash-card dash-card--quick">
                <div className="dash-card__head"><h2>دسترسی سریع</h2><span className="dash-card__accent">ϟ</span></div>
                <div className="dash-quick">
                  {quickActions.map((action) => (
                    <a key={action.label} href={action.href} className="dash-quick__btn">
                      <span className="dash-quick__icon"><action.icon size={23} strokeWidth={1.8} /></span>
                      <span>{action.label}</span>
                      <ChevronLeft size={20} className="dash-quick__arrow" />
                    </a>
                  ))}
                </div>
                <a href="/dashboard/referrals" className="dash-quick__all">مشاهده همه موارد ارجاعی <ChevronLeft size={19} /></a>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
