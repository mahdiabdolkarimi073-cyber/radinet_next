'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  FileText,
  Users,
  Clock,
  TrendingUp,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { orgGet, type OrgDashboardStats } from '@/lib/org-api';
import { OrgStatusBadge } from '@/components/org/status-badge';

const PIE_COLORS = ['#2877d4', '#3f9d7b', '#bf8b2b', '#c54b50', '#8b5cf6', '#ec4899'];

export default function OrgDashboardPage() {
  const [stats, setStats] = useState<OrgDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orgGet<OrgDashboardStats>('/dashboard/stats')
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="org-page">
        <div className="org-loading" style={{ minHeight: 400 }}>
          <Activity size={24} className="org-spin" /> در حال بارگذاری...
        </div>
      </div>
    );
  if (error) return <div className="org-page"><div className="org-error">{error}</div></div>;
  if (!stats) return null;

  return (
    <div className="org-page">
      <div className="org-page-title">
        <span>نمای کلی</span>
        <h2>داشبورد سازمانی</h2>
        <p>آمار و وضعیت درخواست‌های تله‌ریپورت سازمان شما</p>
      </div>

      <div className="org-grid">
        <div className="org-stat">
          <div className="org-stat-icon"><FileText size={22} /></div>
          <div>
            <span>کل درخواست‌ها</span>
            <strong>{stats.totalRequests}</strong>
          </div>
        </div>
        <div className="org-stat">
          <div className="org-stat-icon"><Users size={22} /></div>
          <div>
            <span>کاربران سازمان</span>
            <strong>{stats.staffCount}</strong>
          </div>
        </div>
        <div className="org-stat">
          <div className="org-stat-icon"><Clock size={22} /></div>
          <div>
            <span>فاکتورهای معوق</span>
            <strong>{stats.pendingInvoices}</strong>
          </div>
        </div>
      </div>

      <div className="org-grid-2" style={{ marginTop: 16 }}>
        <div className="org-card">
          <h3>روند ماهانه درخواست‌ها</h3>
          {stats.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf1f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#7890a7' }} />
                <YAxis tick={{ fontSize: 12, fill: '#7890a7' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e8eef5',
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="count" fill="#2877d4" radius={[8, 8, 0, 0]} name="تعداد درخواست" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="org-empty">داده‌ای برای نمایش وجود ندارد</div>
          )}
        </div>

        <div className="org-card">
          <h3>توزیع درخواست‌ها بر اساس نوع تصویربرداری</h3>
          {stats.requestsByType.length > 0 ? (
            <div className="org-pie-wrap">
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie
                    data={stats.requestsByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {stats.requestsByType.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e8eef5',
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="org-pie-legend">
                {stats.requestsByType.map((item, i) => (
                  <div key={i} className="org-pie-legend-item">
                    <span style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {item.name}: {item.value}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="org-empty">داده‌ای برای نمایش وجود ندارد</div>
          )}
        </div>
      </div>

      <div className="org-card" style={{ marginTop: 16 }}>
        <h3>آخرین درخواست‌ها</h3>
        {stats.recentRequests.length > 0 ? (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>شماره درخواست</th>
                  <th>بیمار</th>
                  <th>نوع تصویربرداری</th>
                  <th>ثبت‌کننده</th>
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentRequests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.requestNumber}</td>
                    <td>{req.patientFirstName} {req.patientLastName}</td>
                    <td>{req.imagingType}</td>
                    <td>{req.user?.fullName ?? '-'}</td>
                    <td><OrgStatusBadge value={req.status} /></td>
                    <td>{new Date(req.createdAt).toLocaleDateString('fa-IR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="org-empty">هنوز درخواستی ثبت نشده است</div>
        )}
      </div>
    </div>
  );
}
