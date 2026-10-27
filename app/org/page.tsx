'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  FilePlus,
  FileText,
  Receipt,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import { orgGet, type OrgDashboardStats } from '@/lib/org-api';
import { OrgStatusBadge } from '@/components/org/status-badge';

const PIE_COLORS = ['#2877d4', '#3f9d7b', '#bf8b2b', '#c54b50', '#8b5cf6', '#06b6d4'];

function formatRial(value: string | number | undefined | null): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '۰ ریال';
  return `${num.toLocaleString('fa-IR')} ریال`;
}

export default function OrgDashboardPage() {
  const [data, setData] = useState<OrgDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orgGet<OrgDashboardStats>('/dashboard/stats')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="org-page">
        <div className="org-loading" style={{ minHeight: 400 }}>
          <Activity size={24} className="org-spin" /> در حال دریافت آمار واقعی سازمان...
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="org-page">
        <div className="org-error">{error}</div>
      </div>
    );
  }
  if (!data) return null;

  const totalByType = data.requestsByType.reduce((s, i) => s + i.count, 0) || 1;
  const maxMonthly = Math.max(...data.monthlyData.map((m) => m.count), 1);

  return (
    <div className="org-page">
      <div
        className="org-page-title"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <span>داشبورد مدیریت سازمان</span>
          <h2>نمای کلی و وضعیت عملکرد سازمان</h2>
          <p>
            گزارش زنده درخواست‌های تله‌ریپورت، کاربران زیرمجموعه و وضعیت مالی سازمان{' '}
            {data.organization?.name ? `«${data.organization.name}»` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/org/requests/new" className="org-button" style={{ textDecoration: 'none' }}>
            <FilePlus size={16} /> ثبت درخواست تله‌ریپورت جدید
          </Link>
          <Link
            href="/org/users"
            className="org-button secondary"
            style={{ textDecoration: 'none' }}
          >
            <Users size={16} /> مدیریت کاربران سازمان
          </Link>
        </div>
      </div>

      {/* ردیف اول: آمار درخواست‌ها */}
      <div className="org-grid-4" style={{ marginBottom: 16 }}>
        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#eaf3ff', color: '#2877d4' }}>
            <FileText size={22} />
          </div>
          <div>
            <span>کل درخواست‌های ثبت‌شده</span>
            <strong>{(data.totalRequests ?? 0).toLocaleString('fa-IR')}</strong>
          </div>
        </div>

        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#fff7e5', color: '#bf8b2b' }}>
            <Clock size={22} />
          </div>
          <div>
            <span>درخواست‌های در انتظار</span>
            <strong>{(data.pendingRequests ?? 0).toLocaleString('fa-IR')}</strong>
          </div>
        </div>

        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#e9fbf4', color: '#3f9d7b' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span>درخواست‌های تکمیل‌شده</span>
            <strong>{(data.completedRequests ?? 0).toLocaleString('fa-IR')}</strong>
          </div>
        </div>

        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#fff0f0', color: '#c54b50' }}>
            <XCircle size={22} />
          </div>
          <div>
            <span>درخواست‌های ردشده</span>
            <strong>{(data.rejectedRequests ?? 0).toLocaleString('fa-IR')}</strong>
          </div>
        </div>
      </div>

      {/* ردیف دوم: کاربران سازمان و خلاصه مالی */}
      <div className="org-grid-4" style={{ marginBottom: 22 }}>
        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <Users size={22} />
          </div>
          <div>
            <span>کاربران زیرمجموعه سازمان</span>
            <strong>{(data.staffCount ?? 0).toLocaleString('fa-IR')}</strong>
            <small className="org-muted" style={{ display: 'block', marginTop: 2 }}>
              {(data.activeStaffCount ?? data.staffCount ?? 0).toLocaleString('fa-IR')} کاربر فعال
            </small>
          </div>
        </div>

        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#eaf3ff', color: '#1765d1' }}>
            <Receipt size={22} />
          </div>
          <div>
            <span>صورت‌حساب‌های سازمان</span>
            <strong>{(data.totalInvoicesCount ?? 0).toLocaleString('fa-IR')}</strong>
            <small className="org-muted" style={{ display: 'block', marginTop: 2 }}>
              {(data.pendingInvoices ?? 0).toLocaleString('fa-IR')} فاکتور تسویه‌نشده
            </small>
          </div>
        </div>

        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#e9fbf4', color: '#2f855a' }}>
            <CreditCard size={22} />
          </div>
          <div>
            <span>مجموع مبالغ پرداخت‌شده</span>
            <strong style={{ fontSize: 19 }}>{formatRial(data.totalPaidAmount)}</strong>
            <small className="org-muted" style={{ display: 'block', marginTop: 2 }}>
              {(data.paidInvoicesCount ?? 0).toLocaleString('fa-IR')} فاکتور تسویه‌شده
            </small>
          </div>
        </div>

        <div className="org-stat">
          <div className="org-stat-icon" style={{ background: '#fff0f0', color: '#c54b50' }}>
            <Wallet size={22} />
          </div>
          <div>
            <span>بدهی‌های باقی‌مانده</span>
            <strong style={{ fontSize: 19, color: Number(data.remainingDebtAmount) > 0 ? '#c54b50' : '#172e50' }}>
              {formatRial(data.remainingDebtAmount)}
            </strong>
            <small className="org-muted" style={{ display: 'block', marginTop: 2 }}>
              از کل {formatRial(data.totalInvoicedAmount)}
            </small>
          </div>
        </div>
      </div>

      {/* آخرین درخواست‌ها و فعالیت‌های سازمان */}
      <div className="org-grid-2">
        <div className="org-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
            <h3 style={{ margin: 0 }}>آخرین درخواست‌های ثبت‌شده سازمان</h3>
            <Link href="/org/requests" className="org-link">
              مشاهده همه <ArrowLeft size={14} />
            </Link>
          </div>
          <div className="org-table-wrap">
            <table className="org-table" style={{ minWidth: 480 }}>
              <thead>
                <tr>
                  <th>شماره درخواست</th>
                  <th>نام بیمار</th>
                  <th>نوع خدمت / ناحیه</th>
                  <th>ثبت‌کننده</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {data.recentRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="org-empty">
                      هنوز درخواستی برای این سازمان ثبت نشده است
                    </td>
                  </tr>
                )}
                {data.recentRequests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/org/requests/${r.id}`} className="org-link" dir="ltr">
                        {r.requestNumber}
                      </Link>
                    </td>
                    <td>
                      {r.patientFirstName} {r.patientLastName}
                    </td>
                    <td>
                      {r.imagingType}
                      {r.imagingArea ? ` (${r.imagingArea})` : ''}
                    </td>
                    <td>{r.user?.fullName ?? '—'}</td>
                    <td>
                      <OrgStatusBadge value={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="org-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
            <h3 style={{ margin: 0 }}>آخرین فعالیت‌های سازمان</h3>
            <span className="org-muted" style={{ fontSize: 12 }}>
              رویدادهای واقعی سیستم
            </span>
          </div>

          {(!data.recentActivities || data.recentActivities.length === 0) ? (
            <div className="org-empty">هنوز فعالیتی ثبت نشده است</div>
          ) : (
            <div className="org-timeline">
              {data.recentActivities.map((act) => (
                <div className="org-timeline-item" key={act.id}>
                  <div className="org-timeline-dot">●</div>
                  <div className="org-timeline-body">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong>{act.title}</strong>
                      <small>
                        {new Date(act.createdAt).toLocaleString('fa-IR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </small>
                    </div>
                    <p>{act.description}</p>
                    <small>توسط: {act.actor}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* صورت‌حساب‌های اخیر و نمودارهای آماری */}
      <div className="org-grid-2">
        <div className="org-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
            <h3 style={{ margin: 0 }}>وضعیت آخرین صورت‌حساب‌ها</h3>
            <Link href="/org/contracts" className="org-link">
              مدیریت قراردادها و پرداخت‌ها <ArrowLeft size={14} />
            </Link>
          </div>
          <div className="org-table-wrap">
            <table className="org-table" style={{ minWidth: 460 }}>
              <thead>
                <tr>
                  <th>شماره فاکتور</th>
                  <th>مبلغ کل</th>
                  <th>پرداخت‌شده</th>
                  <th>مانده بدهی</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {(!data.recentInvoices || data.recentInvoices.length === 0) && (
                  <tr>
                    <td colSpan={5} className="org-empty">
                      صورت‌حسابی برای این سازمان ثبت نشده است
                    </td>
                  </tr>
                )}
                {data.recentInvoices?.map((inv) => (
                  <tr key={inv.id}>
                    <td dir="ltr">{inv.invoiceNumber}</td>
                    <td>{formatRial(inv.amount)}</td>
                    <td style={{ color: '#2f855a' }}>{formatRial(inv.paidAmount)}</td>
                    <td style={{ color: Number(inv.remainingAmount) > 0 ? '#c54b50' : '#38516e' }}>
                      {formatRial(inv.remainingAmount)}
                    </td>
                    <td>
                      <OrgStatusBadge value={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="org-card">
          <h3>توزیع درخواست‌ها بر اساس نوع تصویربرداری و ماه</h3>
          {data.requestsByType.length === 0 ? (
            <div className="org-empty">داده‌ای برای نمایش نمودار وجود ندارد</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="org-pie-wrap">
                <div className="org-pie-center-label">
                  <strong>{data.totalRequests.toLocaleString('fa-IR')}</strong>
                  کل درخواست‌ها
                </div>
                <div className="org-pie-legend">
                  {data.requestsByType.map((item, i) => (
                    <div className="org-pie-legend-item" key={item.name}>
                      <span style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {item.name}: {item.count.toLocaleString('fa-IR')} (
                      {Math.round((item.count / totalByType) * 100)}%)
                    </div>
                  ))}
                </div>
              </div>

              {data.monthlyData.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 12,
                    height: 120,
                    padding: '12px 0 0',
                    borderTop: '1px solid #edf1f6',
                  }}
                >
                  {data.monthlyData.map((m) => (
                    <div
                      key={m.month}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#172e50' }}>
                        {m.count.toLocaleString('fa-IR')}
                      </span>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: 36,
                          height: `${Math.max((m.count / maxMonthly) * 70, 8)}px`,
                          background: 'linear-gradient(180deg, #2877d4, #1765d1)',
                          borderRadius: '6px 6px 0 0',
                        }}
                      />
                      <small style={{ fontSize: 10, color: '#7890a7' }} dir="ltr">
                        {m.month}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
