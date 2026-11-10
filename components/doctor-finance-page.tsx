'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Archive,
  Banknote,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Receipt,
  Stethoscope,
  TrendingUp,
  UserCog,
  UsersRound,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

type FinanceSummary = {
  totalIncome: number;
  settleableIncome: number;
  settledIncome: number;
  incomeGeneratingRequestsCount: number;
  currency: string;
  isUnderDevelopment: boolean;
  developmentNotice: string;
  transactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    status: string;
  }>;
};

const defaultSummary: FinanceSummary = {
  totalIncome: 0,
  settleableIncome: 0,
  settledIncome: 0,
  incomeGeneratingRequestsCount: 0,
  currency: 'IRR',
  isUnderDevelopment: true,
  developmentNotice:
    'بخش مالی و درآمد پزشک در حال توسعه است. محاسبه و تسویه درآمد در نسخه فعلی فعال نیست.',
  transactions: [],
};

const navItems = [
  { label: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { label: 'درخواست‌های ارجاعی', href: '/dashboard/referrals', icon: ClipboardList },
  { label: 'گزارش‌ها', href: '/dashboard/reports', icon: FileText },
  { label: 'بیماران', href: '/dashboard/patients', icon: UsersRound },
  { label: 'درخواست اطلاعات تکمیلی', href: '/dashboard/info-requests', icon: MessageCircleQuestion },
  { label: 'مالی و درآمد', href: '/dashboard/finance', icon: Wallet, active: true },
  { label: 'آرشیو گزارش‌ها', href: '/dashboard/report-archive', icon: Archive },
  { label: 'پروفایل تخصصی', href: '/dashboard/doctor-profile', icon: UserCog },
];

function formatZeroOrCurrency(val: number): string {
  if (!val || val === 0) return 'صفر (۰ تومان)';
  return `${val.toLocaleString('fa-IR')} تومان`;
}

export function DoctorFinancePage() {
  const { user, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<FinanceSummary>(defaultSummary);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadFinance() {
      try {
        const token = window.localStorage.getItem('radinet_auth_token');
        const res = await fetch('/api/dashboard/finance', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        if (res.ok) {
          const json = (await res.json()) as FinanceSummary;
          if (active) setData(json);
        }
      } catch {
        // Use default dynamic zero state
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void loadFinance();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="referrals-root">
      <div className="referrals-shell">
        <aside className={`referrals-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="referrals-brand">
            <div className="referrals-brand__mark">
              <Stethoscope size={29} strokeWidth={1.7} />
            </div>
            <div>
              <strong>داشبورد پزشک</strong>
              <span>سامانه مدیریت خدمات رادیولوژی</span>
            </div>
          </div>
          <nav className="referrals-nav" aria-label="منوی داشبورد">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`referrals-nav-item ${item.active ? 'is-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="referrals-nav-item--logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج از حساب</span>
          </button>
        </aside>

        {sidebarOpen && <div className="referrals-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="referrals-content">
          <header className="referrals-header">
            <button
              className="referrals-burger"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label="باز کردن منو"
            >
              {sidebarOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
            <div className="referrals-profile">
              <div className="referrals-avatar">{user?.fullName?.charAt(0) ?? 'د'}</div>
              <div>
                <strong>{loading ? 'در حال بارگذاری…' : user?.fullName ?? 'پزشک رادیولوژیست'}</strong>
                <span>متخصص رادیولوژی و تصویربرداری پزشکی</span>
              </div>
              <ChevronDown className="referrals-profile__chevron" size={17} />
            </div>
            <div className="referrals-header__actions">
              <button className="referrals-header__icon" aria-label="تقویم">
                <CalendarDays size={25} strokeWidth={1.7} />
              </button>
            </div>
          </header>

          <main className="referrals-main">
            <div className="referrals-title">
              <div>
                <h2>مالی و درآمد پزشک رادیولوژیست</h2>
                <p>گزارش کارکرد مالی، وضعیت تسویه‌حساب‌ها و درخواست‌های درآمدزا</p>
              </div>
              <a href="/dashboard" className="back-dashboard">
                <ChevronRight size={16} /> بازگشت به داشبورد
              </a>
            </div>

            {/* پیام اطلاع‌رسانی در حال توسعه بودن بخش مالی */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                borderRadius: '14px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#92400e',
                marginBottom: '22px',
                fontWeight: 600,
              }}
            >
              <AlertCircle size={22} style={{ flexShrink: 0, color: '#d97706' }} />
              <span>{data.developmentNotice}</span>
            </div>

            {/* کارت‌های آماری مالی (با مقادیر صفر پویا) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '18px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>درآمد کل</span>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#1d4ed8', display: 'grid', placeItems: 'center' }}>
                    <Wallet size={20} />
                  </div>
                </div>
                <strong style={{ fontSize: '22px', color: '#0f172a', display: 'block' }}>
                  {isLoading ? '...' : formatZeroOrCurrency(data.totalIncome)}
                </strong>
                <small style={{ fontSize: '12px', color: '#94a3b8' }}>مجموع کارکرد ثبت‌شده تا این لحظه</small>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>درآمد قابل تسویه</span>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#047857', display: 'grid', placeItems: 'center' }}>
                    <Banknote size={20} />
                  </div>
                </div>
                <strong style={{ fontSize: '22px', color: '#0f172a', display: 'block' }}>
                  {isLoading ? '...' : formatZeroOrCurrency(data.settleableIncome)}
                </strong>
                <small style={{ fontSize: '12px', color: '#94a3b8' }}>موجودی آماده برداشت پزشک</small>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>درآمد تسویه‌شده</span>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', color: '#6d28d9', display: 'grid', placeItems: 'center' }}>
                    <CreditCard size={20} />
                  </div>
                </div>
                <strong style={{ fontSize: '22px', color: '#0f172a', display: 'block' }}>
                  {isLoading ? '...' : formatZeroOrCurrency(data.settledIncome)}
                </strong>
                <small style={{ fontSize: '12px', color: '#94a3b8' }}>مبالغ واریزشده به حساب پزشک</small>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>تعداد درخواست‌های درآمدزا</span>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff7ed', color: '#c2410c', display: 'grid', placeItems: 'center' }}>
                    <TrendingUp size={20} />
                  </div>
                </div>
                <strong style={{ fontSize: '22px', color: '#0f172a', display: 'block' }}>
                  {isLoading
                    ? '...'
                    : data.incomeGeneratingRequestsCount === 0
                      ? 'صفر (۰ مورد)'
                      : `${data.incomeGeneratingRequestsCount.toLocaleString('fa-IR')} مورد`}
                </strong>
                <small style={{ fontSize: '12px', color: '#94a3b8' }}>گزارش‌های نهایی مشمول سهم پزشک</small>
              </div>
            </div>

            {/* جدول تاریخچه تراکنش‌ها و تسویه‌ها */}
            <section className="referrals-table-card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 22px',
                  borderBottom: '1px solid #eef2f6',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Receipt size={20} color="#1458cf" />
                  <strong style={{ fontSize: '16px', color: '#1e293b' }}>
                    تاریخچه تراکنش‌ها و تسویه‌حساب‌ها
                  </strong>
                </div>
                <button
                  type="button"
                  disabled
                  style={{
                    height: '38px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f1f5f9',
                    color: '#94a3b8',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'not-allowed',
                  }}
                >
                  درخواست تسویه (به‌زودی)
                </button>
              </div>

              <div className="referrals-table-wrap">
                <table className="referrals-table">
                  <thead>
                    <tr>
                      <th>شناسه تراکنش</th>
                      <th>تاریخ</th>
                      <th>شرح تراکنش</th>
                      <th>مبلغ</th>
                      <th>وضعیت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="referrals-empty" style={{ padding: '42px 16px', textAlign: 'center' }}>
                          <div style={{ maxWidth: '460px', margin: '0 auto' }}>
                            <strong style={{ display: 'block', marginBottom: '6px', color: '#334155' }}>
                              تراکنش یا تسویه‌حسابی ثبت نشده است
                            </strong>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>
                              {data.developmentNotice}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data.transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>{tx.id}</td>
                          <td>{tx.date}</td>
                          <td>{tx.description}</td>
                          <td>{tx.amount.toLocaleString('fa-IR')} تومان</td>
                          <td>{tx.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
