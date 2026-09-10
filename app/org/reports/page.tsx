'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Users,
  Download,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { orgGet, type OrgReportData } from '@/lib/org-api';

const PIE_COLORS = ['#2877d4', '#3f9d7b', '#bf8b2b', '#c54b50', '#8b5cf6', '#ec4899'];

export default function OrgReportsPage() {
  const [data, setData] = useState<OrgReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'byUser' | 'byType' | 'byDate'>('byDate');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateRange.startDate) params.set('startDate', dateRange.startDate);
    if (dateRange.endDate) params.set('endDate', dateRange.endDate);
    orgGet<OrgReportData>(`/reports?${params}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function exportCSV() {
    if (!data) return;
    let rows: string[][] = [];
    let headers: string[] = [];
    if (tab === 'byUser') {
      headers = ['کاربر', 'تعداد'];
      rows = data.byUser.map((r) => [r.name, String(r.count)]);
    } else if (tab === 'byType') {
      headers = ['نوع تصویربرداری', 'تعداد'];
      rows = data.byType.map((r) => [r.name, String(r.count)]);
    } else {
      headers = ['تاریخ', 'تعداد'];
      rows = data.byDate.map((r) => [r.date, String(r.count)]);
    }
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${tab}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading)
    return (
      <div className="org-page">
        <div className="org-loading" style={{ minHeight: 400 }}><Activity size={24} className="org-spin" /> در حال بارگذاری...</div>
      </div>
    );
  if (error) return <div className="org-page"><div className="org-error">{error}</div></div>;
  if (!data) return null;

  const totalByUser = data.byUser.reduce((s, r) => s + r.count, 0);
  const totalByType = data.byType.reduce((s, r) => s + r.count, 0);
  const totalByDate = data.byDate.reduce((s, r) => s + r.count, 0);

  return (
    <div className="org-page">
      <div className="org-page-title">
        <span>گزارش‌ها و آمار</span>
        <h2>تحلیل درخواست‌های تله‌ریپورت</h2>
        <p>آمار تفکیکی بر اساس کاربر، نوع تصویربرداری و تاریخ</p>
      </div>

      <div className="org-search-bar">
        <div className="org-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} className="org-muted" />
          <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} style={{ border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: '#2d4562' }} />
          <span className="org-muted">تا</span>
          <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} style={{ border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: '#2d4562' }} />
        </div>
        <button className="org-button secondary" onClick={load}>اعمال فیلتر</button>
        <button className="org-button secondary" onClick={exportCSV}><Download size={16} /> خروجی CSV</button>
      </div>

      <div className="org-tabs">
        <button className={`org-tab ${tab === 'byDate' ? 'is-active' : ''}`} onClick={() => setTab('byDate')}>روند روزانه (۳۰ روز)</button>
        <button className={`org-tab ${tab === 'byUser' ? 'is-active' : ''}`} onClick={() => setTab('byUser')}>بر اساس کاربر</button>
        <button className={`org-tab ${tab === 'byType' ? 'is-active' : ''}`} onClick={() => setTab('byType')}>بر اساس نوع</button>
      </div>

      <div className="org-card">
        {tab === 'byDate' && (
          <>
            <h3>روند روزانه درخواست‌ها — مجموع: {totalByDate}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.byDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf1f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7890a7' }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12, fill: '#7890a7' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e8eef5', fontSize: 13 }} />
                <Bar dataKey="count" fill="#2877d4" radius={[6, 6, 0, 0]} name="تعداد درخواست" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === 'byUser' && (
          <>
            <h3>درخواست‌ها بر اساس کاربر — مجموع: {totalByUser}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.byUser} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#edf1f6" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#7890a7' }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#38516e' }} width={120} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e8eef5', fontSize: 13 }} />
                <Bar dataKey="count" fill="#3f9d7b" radius={[0, 6, 6, 0]} name="تعداد درخواست" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === 'byType' && (
          <>
            <h3>توزیع بر اساس نوع تصویربرداری — مجموع: {totalByType}</h3>
            <div className="org-pie-wrap">
              <ResponsiveContainer width={260} height={260}>
                <PieChart>
                  <Pie data={data.byType} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={2}>
                    {data.byType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e8eef5', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="org-pie-legend">
                {data.byType.map((item, i) => (
                  <div key={i} className="org-pie-legend-item">
                    <span style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {item.name}: {item.count}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
