'use client';

import { Activity, Package, Stethoscope, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UpStatusBadge } from '@/components/user-panel/user-shell';
import { userGet, type UserDashboard } from '@/lib/user-panel-api';

export default function UserDashboardPage() {
  const [data, setData] = useState<UserDashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    userGet<UserDashboard>('/user/dashboard')
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  const stats = [
    { label: 'سفارش‌های من', value: data?.stats.totalOrders ?? '—', icon: Package },
    { label: 'درخواست‌های تله‌ریپورت', value: data?.stats.totalTeleReports ?? '—', icon: Stethoscope },
    { label: 'مشاوره‌ها', value: data?.stats.totalConsultations ?? '—', icon: MessageSquare },
  ];

  return (
    <section className="up-page">
      <div className="up-page-title">
        <span>خوش آمدید</span>
        <h2>داشبورد کاربری</h2>
        <p>آخرین فعالیت‌های خود را در یک نگاه ببینید.</p>
      </div>

      {error && <div className="up-error">{error}</div>}

      <div className="up-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <div className="up-stat" key={label}>
            <div className="up-stat-icon"><Icon size={21} /></div>
            <div><span>{label}</span><strong>{value}</strong></div>
          </div>
        ))}
      </div>

      <div className="up-card" style={{ marginTop: 18 }}>
        <h3>آخرین سفارش‌ها</h3>
        <div className="up-table-wrap">
          <table className="up-table">
            <thead><tr><th>شماره سفارش</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th></tr></thead>
            <tbody>
              {data?.latestOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{Number(order.total).toLocaleString('fa-IR')} ریال</td>
                  <td><UpStatusBadge value={order.status} /></td>
                  <td>{new Date(order.createdAt).toLocaleDateString('fa-IR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.latestOrders.length && <div className="up-empty"><Package size={28} /> سفارشی ثبت نشده است</div>}
        </div>
      </div>

      <div className="up-card">
        <h3>آخرین درخواست‌های تله‌ریپورت</h3>
        <div className="up-table-wrap">
          <table className="up-table">
            <thead><tr><th>شماره درخواست</th><th>نوع تصویربرداری</th><th>وضعیت</th><th>تاریخ</th></tr></thead>
            <tbody>
              {data?.latestTeleReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.requestNumber}</td>
                  <td>{report.imagingType} / {report.imagingArea}</td>
                  <td><UpStatusBadge value={report.status} /></td>
                  <td>{new Date(report.createdAt).toLocaleDateString('fa-IR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.latestTeleReports.length && <div className="up-empty"><Activity size={28} /> درخواستی ثبت نشده است</div>}
        </div>
      </div>

      <div className="up-card">
        <h3>آخرین مشاوره‌ها</h3>
        <div className="up-table-wrap">
          <table className="up-table">
            <thead><tr><th>نام</th><th>پیام</th><th>وضعیت</th><th>تاریخ</th></tr></thead>
            <tbody>
              {data?.latestConsultations.map((consult) => (
                <tr key={consult.id}>
                  <td>{consult.name}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{consult.message ?? '—'}</td>
                  <td><UpStatusBadge value={consult.status} /></td>
                  <td>{new Date(consult.createdAt).toLocaleDateString('fa-IR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.latestConsultations.length && <div className="up-empty"><MessageSquare size={28} /> مشاوره‌ای ثبت نشده است</div>}
        </div>
      </div>
    </section>
  );
}
