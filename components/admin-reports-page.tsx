'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  LogOut,
  Menu,
  Package,
  Printer,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { adminNavItems, formatDate, formatToman } from '@/lib/admin-nav';
import { useAuth } from '@/components/auth-provider';

type ActiveTab = 'sales' | 'doctors' | 'telereports' | 'shop';

export function AdminReportsPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('sales');
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab Data States
  const [salesReport, setSalesReport] = useState<any>(null);
  const [doctorsReport, setDoctorsReport] = useState<any>(null);
  const [teleReportSummary, setTeleReportSummary] = useState<any>(null);
  const [shopReport, setShopReport] = useState<any>(null);

  const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'sales') {
        const res = await fetch(`/api/admin/reports/sales?period=${period}`, { headers: authHeaders, cache: 'no-store' });
        if (!res.ok) throw new Error('دریافت گزارش فروش ناموفق بود.');
        setSalesReport(await res.json());
      } else if (activeTab === 'doctors') {
        const res = await fetch('/api/admin/reports/doctors', { headers: authHeaders, cache: 'no-store' });
        if (!res.ok) throw new Error('دریافت عملکرد پزشکان ناموفق بود.');
        setDoctorsReport(await res.json());
      } else if (activeTab === 'telereports') {
        const res = await fetch(`/api/admin/reports/tele-reports?period=${period}`, { headers: authHeaders, cache: 'no-store' });
        if (!res.ok) throw new Error('دریافت گزارش تله‌ریپورت ناموفق بود.');
        setTeleReportSummary(await res.json());
      } else if (activeTab === 'shop') {
        const res = await fetch(`/api/admin/reports/shop-orders?period=${period}`, { headers: authHeaders, cache: 'no-store' });
        if (!res.ok) throw new Error('دریافت گزارش فروشگاه ناموفق بود.');
        setShopReport(await res.json());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, period]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Export to Excel / CSV with UTF-8 BOM
  function exportToCsv() {
    let rows: string[][] = [];
    let filename = `radinet_report_${activeTab}_${period}.csv`;

    if (activeTab === 'sales' && salesReport) {
      rows.push(['دوره', 'تعداد سفارش', 'درآمد کل (تومان)', 'درآمد پرداخت‌شده (تومان)']);
      salesReport.sales?.forEach((s: any) => {
        rows.push([s.label, String(s.orderCount), String(s.revenue), String(s.paidRevenue)]);
      });
    } else if (activeTab === 'doctors' && doctorsReport) {
      rows.push(['نام پزشک', 'تخصص', 'کل گزارش‌ها', 'امضاشده', 'پیش‌نویس', 'نرخ امضا (٪)', 'تعرفه (تومان)']);
      doctorsReport.items?.forEach((d: any) => {
        rows.push([
          d.fullName,
          d.specialty || 'عمومی',
          String(d.stats.totalReports),
          String(d.stats.signedReports),
          String(d.stats.pendingReports),
          String(d.stats.signRate),
          String(d.tariff || 0),
        ]);
      });
    } else if (activeTab === 'telereports' && teleReportSummary) {
      rows.push(['بازه زمانی', 'کل درخواست‌ها', 'جدید', 'اختصاص‌یافته', 'تکمیل‌شده']);
      teleReportSummary.byPeriod?.forEach((p: any) => {
        rows.push([p.label, String(p.total), String(p.new), String(p.assigned), String(p.completed)]);
      });
    } else if (activeTab === 'shop' && shopReport) {
      rows.push(['نام محصول', 'تعداد فروخته‌شده', 'درآمد ناخالص (تومان)']);
      shopReport.topProducts?.forEach((p: any) => {
        rows.push([p.name, String(p.quantity), String(p.revenue)]);
      });
    }

    if (rows.length === 0) {
      alert('داده‌ای برای خروجی اکسل موجود نیست.');
      return;
    }

    const csvContent = '\uFEFF' + rows.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handlePrintPdf() {
    window.print();
  }

  return (
    <div className="admin-page-root">
      <style>{`
        @media print {
          .admin-page-sidebar, .admin-page-header, .admin-report-actions, .admin-report-nav {
            display: none !important;
          }
          .admin-page-content {
            margin: 0 !important;
            padding: 0 !important;
          }
          .admin-page-main {
            padding: 10px !important;
          }
          body {
            background: #fff !important;
          }
        }
      `}</style>

      <div className="admin-page-shell">
        <aside className={`admin-page-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-page-brand">
            <div className="admin-page-brand__mark"><ShieldCheck size={28} strokeWidth={1.7} /></div>
            <div>
              <strong>رادینت</strong>
              <span>پنل مدیریت</span>
            </div>
            <button className="admin-page-sidebar__close" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'grid' : 'none' }}>
              <X size={22} />
            </button>
          </div>

          <nav className="admin-page-nav">
            {adminNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`admin-page-nav__item ${item.href === '/admin/reports' ? 'is-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <button className="admin-page-nav__logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج</span>
          </button>
        </aside>

        {sidebarOpen && (
          <div className="admin-page-overlay" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,29,65,.42)' }} />
        )}

        <div className="admin-page-content">
          <header className="admin-page-header">
            <div className="admin-page-header__title">
              <BarChart3 size={26} strokeWidth={1.7} />
              <span>گزارش‌های مدیریتی جامع</span>
            </div>
            <div className="admin-page-profile">
              <div className="admin-page-avatar">{user?.fullName?.charAt(0) ?? 'A'}</div>
              <div className="admin-page-user">
                <strong>{user?.fullName ?? 'مدیر سیستم'}</strong>
                <span>مدیر کل</span>
              </div>
              <ChevronDown className="admin-page-profile__chevron" size={17} />
            </div>
            <button className="admin-page-burger" onClick={() => setSidebarOpen(true)} aria-label="منو">
              <Menu size={26} strokeWidth={1.7} />
            </button>
          </header>

          <main className="admin-page-main">
            {/* Top Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#0f172a' }}>گزارش‌های تحلیلی و مالی</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                  تحلیل و پایش عملکرد درآمدی، پزشکان، درخواست‌های تله‌ریپورت و فروشگاه
                </p>
              </div>

              <div className="admin-report-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {activeTab !== 'doctors' && (
                  <div style={{ display: 'flex', background: '#f1f5fa', borderRadius: '8px', padding: '3px' }}>
                    {(['daily', 'monthly', 'yearly'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        style={{
                          background: period === p ? '#fff' : 'transparent',
                          color: period === p ? '#1456C3' : '#64748b',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                      >
                        {p === 'daily' ? 'روزانه' : p === 'monthly' ? 'ماهانه' : 'سالانه'}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={exportToCsv}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#168A68',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <FileSpreadsheet size={16} />
                  <span>خروجی اکسل (Excel)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#1456C3',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Printer size={16} />
                  <span>خروجی PDF / چاپ</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="admin-report-nav" style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
              <button
                onClick={() => setActiveTab('sales')}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'sales' ? '2px solid #1456C3' : '2px solid transparent',
                  marginBottom: '-2px',
                  color: activeTab === 'sales' ? '#1456C3' : '#64748b',
                  fontWeight: activeTab === 'sales' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                درآمد و فروش کل
              </button>
              <button
                onClick={() => setActiveTab('doctors')}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'doctors' ? '2px solid #1456C3' : '2px solid transparent',
                  marginBottom: '-2px',
                  color: activeTab === 'doctors' ? '#1456C3' : '#64748b',
                  fontWeight: activeTab === 'doctors' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                عملکرد پزشکان و گزارش‌ها
              </button>
              <button
                onClick={() => setActiveTab('telereports')}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'telereports' ? '2px solid #1456C3' : '2px solid transparent',
                  marginBottom: '-2px',
                  color: activeTab === 'telereports' ? '#1456C3' : '#64748b',
                  fontWeight: activeTab === 'telereports' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                تحلیل تله‌ریپورت
              </button>
              <button
                onClick={() => setActiveTab('shop')}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'shop' ? '2px solid #1456C3' : '2px solid transparent',
                  marginBottom: '-2px',
                  color: activeTab === 'shop' ? '#1456C3' : '#64748b',
                  fontWeight: activeTab === 'shop' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                تحلیل سفارش‌های فروشگاه
              </button>
            </div>

            {error && <div className="admin-page-error">{error}</div>}
            {isLoading && <div className="admin-page-empty">در حال دریافت و تحلیل داده‌های دیتابیس…</div>}

            {/* TAB 1: SALES & REVENUE */}
            {!isLoading && !error && activeTab === 'sales' && salesReport && (
              <div>
                <section className="admin-stats-grid" style={{ marginBottom: '20px' }}>
                  <article className="admin-stat-card">
                    <div className="admin-stat-card__top">
                      <span>کل سفارش‌های این دوره</span>
                      <div className="admin-stat-card__icon" style={{ background: '#fdeaea', color: '#D94B55' }}>
                        <ShoppingCart size={24} />
                      </div>
                    </div>
                    <strong>{formatToman(salesReport.summary?.totalOrders ?? 0)}</strong>
                  </article>

                  <article className="admin-stat-card">
                    <div className="admin-stat-card__top">
                      <span>کل درخواست‌های تله‌ریپورت</span>
                      <div className="admin-stat-card__icon" style={{ background: '#f0eef6', color: '#5b3f8a' }}>
                        <FileText size={24} />
                      </div>
                    </div>
                    <strong>{formatToman(salesReport.summary?.totalRequests ?? 0)}</strong>
                  </article>

                  <article className="admin-stat-card">
                    <div className="admin-stat-card__top">
                      <span>درآمد کل ناخالص</span>
                      <div className="admin-stat-card__icon" style={{ background: '#fff6e5', color: '#C9973E' }}>
                        <DollarSign size={24} />
                      </div>
                    </div>
                    <strong>{formatToman(salesReport.summary?.totalRevenue ?? 0)} تومان</strong>
                  </article>

                  <article className="admin-stat-card">
                    <div className="admin-stat-card__top">
                      <span>درآمد وصول‌شده (پرداخت قطعی)</span>
                      <div className="admin-stat-card__icon" style={{ background: '#e8f7f1', color: '#168A68' }}>
                        <TrendingUp size={24} />
                      </div>
                    </div>
                    <strong>{formatToman(salesReport.summary?.paidRevenue ?? 0)} تومان</strong>
                  </article>
                </section>

                <div className="admin-card" style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px' }}>جدول روند درآمد و سفارش‌ها بر اساس بازه ({period === 'daily' ? 'روزانه' : period === 'monthly' ? 'ماهانه' : 'سالانه'})</h3>
                  <div className="admin-page-table-wrap">
                    <table className="admin-page-table">
                      <thead>
                        <tr>
                          <th>بازه زمانی</th>
                          <th>تعداد سفارش</th>
                          <th>درآمد فروشگاه (تومان)</th>
                          <th>درآمد وصول‌شده (تومان)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesReport.sales?.map((s: any, idx: number) => (
                          <tr key={idx}>
                            <td><strong>{s.label}</strong></td>
                            <td>{s.orderCount.toLocaleString('fa-IR')}</td>
                            <td>{formatToman(s.revenue)} تومان</td>
                            <td style={{ color: '#168A68', fontWeight: 600 }}>{formatToman(s.paidRevenue)} تومان</td>
                          </tr>
                        ))}
                        {(!salesReport.sales || salesReport.sales.length === 0) && (
                          <tr><td colSpan={4} className="admin-page-empty">تراکنشی در این بازه یافت نشد.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DOCTOR PERFORMANCE */}
            {!isLoading && !error && activeTab === 'doctors' && doctorsReport && (
              <div className="admin-card" style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px' }}>کارنامه و عملکرد پزشکان متخصص رادیولوژی</h3>
                <div className="admin-page-table-wrap">
                  <table className="admin-page-table">
                    <thead>
                      <tr>
                        <th>نام پزشک</th>
                        <th>تخصص</th>
                        <th>کل گزارش‌ها</th>
                        <th>امضاشده (نهایی)</th>
                        <th>پیش‌نویس</th>
                        <th>نرخ امضا</th>
                        <th>سقف روزانه</th>
                        <th>تعرفه پایه (تومان)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorsReport.items?.map((d: any) => (
                        <tr key={d.doctorId}>
                          <td><strong>{d.fullName}</strong></td>
                          <td>{d.specialty || 'متخصص رادیولوژی'}</td>
                          <td><strong>{d.stats.totalReports.toLocaleString('fa-IR')}</strong></td>
                          <td style={{ color: '#168A68', fontWeight: 600 }}>{d.stats.signedReports.toLocaleString('fa-IR')}</td>
                          <td style={{ color: '#C9973E' }}>{d.stats.pendingReports.toLocaleString('fa-IR')}</td>
                          <td>
                            <span style={{ background: '#eaf2ff', color: '#1456C3', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                              {d.stats.signRate.toLocaleString('fa-IR')}٪
                            </span>
                          </td>
                          <td>{d.maxDailyReports.toLocaleString('fa-IR')} گزارش</td>
                          <td>{formatToman(d.tariff || 0)} تومان</td>
                        </tr>
                      ))}
                      {(!doctorsReport.items || doctorsReport.items.length === 0) && (
                        <tr><td colSpan={8} className="admin-page-empty">پزشک فعالی ثبت نشده است.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: TELE-REPORT ANALYTICS */}
            {!isLoading && !error && activeTab === 'telereports' && teleReportSummary && (
              <div>
                <section className="admin-stats-grid" style={{ marginBottom: '20px' }}>
                  <article className="admin-stat-card">
                    <div className="admin-stat-card__top">
                      <span>کل پرونده‌ها</span>
                      <div className="admin-stat-card__icon" style={{ background: '#eaf2ff', color: '#1456C3' }}>
                        <FileText size={24} />
                      </div>
                    </div>
                    <strong>{formatToman(teleReportSummary.summary?.total ?? 0)}</strong>
                  </article>

                  <article className="admin-stat-card">
                    <div className="admin-stat-card__top">
                      <span>تکمیل‌شده</span>
                      <div className="admin-stat-card__icon" style={{ background: '#e8f7f1', color: '#168A68' }}>
                        <ShieldCheck size={24} />
                      </div>
                    </div>
                    <strong>{formatToman(teleReportSummary.summary?.byStatus?.completed ?? 0)}</strong>
                  </article>

                  <article className="admin-stat-card">
                    <div className="admin-stat-card__top">
                      <span>اختصاص‌یافته</span>
                      <div className="admin-stat-card__icon" style={{ background: '#fff6e5', color: '#C9973E' }}>
                        <Stethoscope size={24} />
                      </div>
                    </div>
                    <strong>{formatToman(teleReportSummary.summary?.byStatus?.assigned ?? 0)}</strong>
                  </article>

                  <article className="admin-stat-card">
                    <div className="admin-stat-card__top">
                      <span>درخواست‌های جدید</span>
                      <div className="admin-stat-card__icon" style={{ background: '#f1f5fa', color: '#64748b' }}>
                        <Activity size={24} />
                      </div>
                    </div>
                    <strong>{formatToman(teleReportSummary.summary?.byStatus?.new ?? 0)}</strong>
                  </article>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div className="admin-card" style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px' }}>تفکیک بر اساس نوع تصویربرداری (Modality)</h3>
                    <ul className="admin-detail-list">
                      {Object.entries(teleReportSummary.byImagingType || {}).map(([type, count]) => (
                        <li key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                          <strong>{type}</strong>
                          <span style={{ background: '#eaf2ff', color: '#1456C3', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                            {(count as number).toLocaleString('fa-IR')} پرونده
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="admin-card" style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px' }}>تفکیک بر اساس کشور درخواست‌دهنده</h3>
                    <ul className="admin-detail-list">
                      {Object.entries(teleReportSummary.byCountry || {}).map(([c, count]) => (
                        <li key={c} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                          <strong>{c === 'IR' ? 'ایران' : c}</strong>
                          <span style={{ background: '#e8f7f1', color: '#168A68', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                            {(count as number).toLocaleString('fa-IR')} پرونده
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SHOP ORDER ANALYTICS */}
            {!isLoading && !error && activeTab === 'shop' && shopReport && (
              <div>
                <section className="admin-stats-grid" style={{ marginBottom: '20px' }}>
                  <article className="admin-stat-card">
                    <div className="admin-stat-card__top">
                      <span>کل سفارش‌ها</span>
                      <div className="admin-stat-card__icon" style={{ background: '#fdeaea', color: '#D94B55' }}>
                        <ShoppingCart size={24} />
                      </div>
                    </div>
                    <strong>{formatToman(shopReport.summary?.totalOrders ?? 0)}</strong>
                  </article>

                  <article className="admin-stat-card">
                    <div className="admin-stat-card__top">
                      <span>درآمد کل فروشگاه</span>
                      <div className="admin-stat-card__icon" style={{ background: '#fff6e5', color: '#C9973E' }}>
                        <DollarSign size={24} />
                      </div>
                    </div>
                    <strong>{formatToman(shopReport.summary?.totalRevenue ?? 0)} تومان</strong>
                  </article>

                  <article className="admin-stat-card">
                    <div className="admin-stat-card__top">
                      <span>درآمد وصول‌شده</span>
                      <div className="admin-stat-card__icon" style={{ background: '#e8f7f1', color: '#168A68' }}>
                        <TrendingUp size={24} />
                      </div>
                    </div>
                    <strong>{formatToman(shopReport.summary?.paidRevenue ?? 0)} تومان</strong>
                  </article>
                </section>

                <div className="admin-card" style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px' }}>پرفروش‌ترین کالاها و تجهیزات پزشکی</h3>
                  <div className="admin-page-table-wrap">
                    <table className="admin-page-table">
                      <thead>
                        <tr>
                          <th>نام محصول</th>
                          <th>تعداد فروش</th>
                          <th>درآمد ناخالص (تومان)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shopReport.topProducts?.map((p: any) => (
                          <tr key={p.productId}>
                            <td><strong>{p.name}</strong></td>
                            <td>{p.quantity.toLocaleString('fa-IR')} عدد</td>
                            <td style={{ color: '#168A68', fontWeight: 600 }}>{formatToman(p.revenue)} تومان</td>
                          </tr>
                        ))}
                        {(!shopReport.topProducts || shopReport.topProducts.length === 0) && (
                          <tr><td colSpan={3} className="admin-page-empty">فروشی در این بازه ثبت نشده است.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
