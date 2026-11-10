'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Filter,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import {
  orgGet,
  type OrgReportData,
  type OrgStaffUser,
} from '@/lib/org-api';
import { OrgStatusBadge } from '@/components/org/status-badge';

const PIE_COLORS = ['#2877d4', '#3f9d7b', '#bf8b2b', '#c54b50', '#8b5cf6', '#06b6d4'];

export default function OrgReportsPage() {
  const [data, setData] = useState<OrgReportData | null>(null);
  const [orgUsers, setOrgUsers] = useState<OrgStaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    orgGet<OrgStaffUser[]>('/users')
      .then(setOrgUsers)
      .catch(() => {});
  }, []);

  function loadReports() {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);
    if (userFilter) params.set('userId', userFilter);
    const qs = params.toString();

    orgGet<OrgReportData>(`/reports${qs ? `?${qs}` : ''}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadReports();
  }, [statusFilter, typeFilter, userFilter]);

  function handleResetFilters() {
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setTypeFilter('');
    setUserFilter('');
    setLoading(true);
    orgGet<OrgReportData>('/reports')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  function exportCSV() {
    if (!data) return;
    const rows = [
      ['بخش', 'عنوان / نام', 'کل درخواست‌ها', 'تکمیل‌شده', 'در انتظار', 'ردشده'],
      ...data.byUser.map((u) => [
        'کاربر سازمان',
        u.name,
        String(u.count),
        String(u.completed),
        String(u.pending),
        String(u.rejected),
      ]),
      ...data.byType.map((t) => ['نوع خدمت', t.name, String(t.count), '-', '-', '-']),
      ...data.byStatus.map((s) => ['وضعیت درخواست', s.status, String(s.count), '-', '-', '-']),
      ...data.byDate.map((d) => ['تاریخ', d.date, String(d.count), '-', '-', '-']),
    ];
    const csv = '\uFEFF' + rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `org-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalByType = data ? data.byType.reduce((s, i) => s + i.count, 0) || 1 : 1;
  const maxDate = data ? Math.max(...data.byDate.map((d) => d.count), 1) : 1;

  return (
    <div className="org-page">
      <div
        className="org-page-title"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <span>گزارش‌ها و آمار عملکرد</span>
          <h2>گزارش‌های تجمیعی درخواست‌های سازمان</h2>
          <p>
            تحلیل عملکرد درخواست‌ها بر اساس کاربران زیرمجموعه، بازه زمانی، نوع خدمت و وضعیت پرونده‌ها
          </p>
        </div>
        <button
          className="org-button secondary"
          onClick={exportCSV}
          disabled={!data || data.summary.total === 0}
        >
          <Download size={16} /> دانلود خروجی CSV
        </button>
      </div>

      {/* فیلترهای گزارش‌گیری */}
      <div className="org-card">
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div className="org-field" style={{ flex: '1 1 150px' }}>
            <label>از تاریخ</label>
            <input
              type="date"
              dir="ltr"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="org-field" style={{ flex: '1 1 150px' }}>
            <label>تا تاریخ</label>
            <input
              type="date"
              dir="ltr"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="org-field" style={{ flex: '1 1 160px' }}>
            <label>کاربر زیرمجموعه</label>
            <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
              <option value="">همه کاربران سازمان</option>
              {orgUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="org-field" style={{ flex: '1 1 150px' }}>
            <label>نوع خدمت</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">همه انواع خدمات</option>
              <option value="MRI">MRI</option>
              <option value="CT Scan">CT Scan</option>
              <option value="X-Ray (رادیوگرافی)">X-Ray (رادیوگرافی)</option>
              <option value="سونوگرافی (Ultrasound)">سونوگرافی (Ultrasound)</option>
              <option value="ماموگرافی (Mammography)">ماموگرافی (Mammography)</option>
              <option value="PET Scan">PET Scan</option>
              <option value="OPG / رادیولوژی دهان و فک">OPG / رادیولوژی دهان و فک</option>
            </select>
          </div>
          <div className="org-field" style={{ flex: '1 1 140px' }}>
            <label>وضعیت</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">همه وضعیت‌ها</option>
              <option value="new">جدید</option>
              <option value="pending">در انتظار</option>
              <option value="in_progress">در حال انجام</option>
              <option value="completed">تکمیل شده</option>
              <option value="rejected">رد شده</option>
            </select>
          </div>
          <button className="org-button" style={{ height: 44 }} onClick={loadReports}>
            <Filter size={16} /> اعمال فیلتر تاریخ
          </button>
          <button
            type="button"
            className="org-button secondary"
            style={{ height: 44 }}
            onClick={handleResetFilters}
          >
            <RotateCcw size={15} /> بازنشانی
          </button>
        </div>
      </div>

      {error && <div className="org-error">{error}</div>}

      {loading ? (
        <div className="org-loading" style={{ minHeight: 280 }}>
          <Activity size={24} className="org-spin" /> در حال محاسبه گزارش‌های تجمیعی سازمان...
        </div>
      ) : data ? (
        <>
          {/* شاخص‌های عملکردی کلیدی (KPI) */}
          <div className="org-grid-4" style={{ marginBottom: 18 }}>
            <div className="org-stat">
              <div className="org-stat-icon" style={{ background: '#eaf3ff', color: '#2877d4' }}>
                <FileText size={22} />
              </div>
              <div>
                <span>کل درخواست‌ها در بازه</span>
                <strong>{data.summary.total.toLocaleString('fa-IR')}</strong>
              </div>
            </div>

            <div className="org-stat">
              <div className="org-stat-icon" style={{ background: '#e9fbf4', color: '#3f9d7b' }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span>درخواست‌های تکمیل‌شده</span>
                <strong>{data.summary.completed.toLocaleString('fa-IR')}</strong>
                <small className="org-muted" style={{ display: 'block', marginTop: 2 }}>
                  نرخ تکمیل: {data.summary.completionRate.toLocaleString('fa-IR')}%
                </small>
              </div>
            </div>

            <div className="org-stat">
              <div className="org-stat-icon" style={{ background: '#fff7e5', color: '#bf8b2b' }}>
                <Clock size={22} />
              </div>
              <div>
                <span>در انتظار / در حال انجام</span>
                <strong>{data.summary.pending.toLocaleString('fa-IR')}</strong>
              </div>
            </div>

            <div className="org-stat">
              <div className="org-stat-icon" style={{ background: '#fff0f0', color: '#c54b50' }}>
                <XCircle size={22} />
              </div>
              <div>
                <span>درخواست‌های ردشده</span>
                <strong>{data.summary.rejected.toLocaleString('fa-IR')}</strong>
              </div>
            </div>
          </div>

          {/* گزارش تفکیکی عملکرد کاربران زیرمجموعه */}
          <div className="org-card">
            <h3>آمار عملکرد و درخواست‌ها به تفکیک کاربران سازمان</h3>
            {data.byUser.length === 0 ? (
              <div className="org-empty">داده‌ای برای نمایش وجود ندارد</div>
            ) : (
              <div className="org-table-wrap">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>نام کاربر سازمان</th>
                      <th>نقش سازمانی</th>
                      <th>کل درخواست‌های ثبت‌شده</th>
                      <th>تکمیل‌شده</th>
                      <th>در انتظار / در جریان</th>
                      <th>ردشده</th>
                      <th>درصد سهم از کل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byUser.map((u) => {
                      const share =
                        data.summary.total > 0
                          ? Math.round((u.count / data.summary.total) * 100)
                          : 0;
                      return (
                        <tr key={u.userId}>
                          <td>
                            <strong>{u.name}</strong>
                          </td>
                          <td>
                            <OrgStatusBadge value={u.role} />
                          </td>
                          <td>
                            <strong>{u.count.toLocaleString('fa-IR')}</strong>
                          </td>
                          <td style={{ color: '#2f855a' }}>
                            {u.completed.toLocaleString('fa-IR')}
                          </td>
                          <td style={{ color: '#bf8b2b' }}>
                            {u.pending.toLocaleString('fa-IR')}
                          </td>
                          <td style={{ color: '#c54b50' }}>
                            {u.rejected.toLocaleString('fa-IR')}
                          </td>
                          <td>{share.toLocaleString('fa-IR')}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* تفکیک بر اساس وضعیت و نوع خدمت */}
          <div className="org-grid-2">
            <div className="org-card">
              <h3>تفکیک درخواست‌ها بر اساس وضعیت</h3>
              {data.byStatus.length === 0 ? (
                <div className="org-empty">هنوز درخواستی ثبت نشده است</div>
              ) : (
                <div className="org-table-wrap">
                  <table className="org-table" style={{ minWidth: 320 }}>
                    <thead>
                      <tr>
                        <th>وضعیت درخواست</th>
                        <th>تعداد</th>
                        <th>درصد</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byStatus.map((s) => (
                        <tr key={s.status}>
                          <td>
                            <OrgStatusBadge value={s.status} />
                          </td>
                          <td>
                            <strong>{s.count.toLocaleString('fa-IR')}</strong>
                          </td>
                          <td>
                            {Math.round(
                              (s.count / Math.max(1, data.summary.total)) * 100,
                            ).toLocaleString('fa-IR')}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="org-card">
              <h3>توزیع درخواست‌ها بر اساس نوع خدمت تصویربرداری</h3>
              {data.byType.length === 0 ? (
                <div className="org-empty">داده‌ای وجود ندارد</div>
              ) : (
                <div className="org-pie-wrap">
                  <div className="org-pie-center-label">
                    <strong>
                      {data.byType.reduce((s, i) => s + i.count, 0).toLocaleString('fa-IR')}
                    </strong>
                    کل درخواست‌ها
                  </div>
                  <div className="org-pie-legend">
                    {data.byType.map((item, i) => (
                      <div className="org-pie-legend-item" key={item.name}>
                        <span style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {item.name}: {item.count.toLocaleString('fa-IR')} (
                        {Math.round((item.count / totalByType) * 100)}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* روند زمانی ثبت درخواست‌ها */}
          <div className="org-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} /> روند زمانی ثبت درخواست‌ها (بر اساس تاریخ)
            </h3>
            {data.byDate.length === 0 ? (
              <div className="org-empty">داده‌ای برای نمایش روند زمانی وجود ندارد</div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 10,
                  height: 190,
                  padding: '20px 0',
                  overflowX: 'auto',
                }}
              >
                {data.byDate.map((d) => (
                  <div
                    key={d.date}
                    style={{
                      flex: '0 0 auto',
                      minWidth: 46,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#172e50' }}>
                      {d.count.toLocaleString('fa-IR')}
                    </span>
                    <div
                      style={{
                        width: 28,
                        height: `${Math.max((d.count / maxDate) * 125, 8)}px`,
                        background: 'linear-gradient(180deg, #2877d4, #1765d1)',
                        borderRadius: '6px 6px 0 0',
                      }}
                    />
                    <small
                      style={{
                        fontSize: 10,
                        color: '#7890a7',
                        writingMode: 'vertical-rl',
                      }}
                      dir="ltr"
                    >
                      {d.date}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
