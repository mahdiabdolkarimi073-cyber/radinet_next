'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Building2,
  DollarSign,
  FileText,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { formatToman } from '@/lib/agency-nav';

type DashboardData = {
  stats: { centers: number; doctors: number; orders: number; revenue: number };
  charts: { label: string; orders: number; revenue: number }[];
  activities: { title: string; description: string; status: string; createdAt: string }[];
};

const statusColors: Record<string, string> = {
  new: '#1456C3', pending: '#C9973E', in_progress: '#1456C3', completed: '#168A68', rejected: '#D94B55',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'همین حالا';
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  return `${Math.floor(hours / 24)} روز پیش`;
}

export function AgencyDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
    fetch('/api/agency/dashboard', { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => { if (result && !result.error) setData(result); else setError('دریافت اطلاعات ناموفق بود.'); })
      .catch(() => setError('اتصال به سرور برقرار نیست.'));
  }, []);

  const statCards = [
    { label: 'مراکز زیرمجموعه', value: data?.stats.centers ?? 0, icon: Building2, color: '#C9973E', bg: '#fff6e5' },
    { label: 'پزشکان', value: data?.stats.doctors ?? 0, icon: Stethoscope, color: '#168A68', bg: '#e8f7f1' },
    { label: 'درخواست‌ها', value: data?.stats.orders ?? 0, icon: FileText, color: '#1456C3', bg: '#eaf2ff' },
    { label: 'درآمد (تومان)', value: data?.stats.revenue ?? 0, icon: DollarSign, color: '#168A68', bg: '#e8f7f1' },
  ];

  const chartData = data?.charts ?? [];
  const maxChartVal = Math.max(...chartData.map((d) => Math.max(d.orders, d.revenue)), 1);

  return (
    <>
      <section className="agency-welcome">
        <div className="agency-welcome__text">
          <h1>سلام {user?.fullName ?? 'نماینده'}، خوش آمدید</h1>
          <p>به پنل نمایندگی رادینت وارد شده‌اید. آمار، نمودار و فعالیت‌های اخیر نمایندگی خود را مدیریت کنید.</p>
        </div>
      </section>

      {error && <div className="agency-error">{error}</div>}

      <section className="agency-stats-grid">
        {statCards.map((card) => (
          <article className="agency-stat-card" key={card.label}>
            <div className="agency-stat-card__top">
              <span>{card.label}</span>
              <div className="agency-stat-card__icon" style={{ background: card.bg, color: card.color }}>
                <card.icon size={26} strokeWidth={1.8} />
              </div>
            </div>
            <strong>{formatToman(card.value)}</strong>
          </article>
        ))}
      </section>

      <section className="agency-charts-row">
        <div className="agency-card">
          <div className="agency-card__head">
            <h2><BarChart3 size={22} strokeWidth={1.7} /> نمودار عملکرد</h2>
          </div>
          <div className="agency-chart">
            <div className="agency-chart__bars">
              {chartData.map((point, i) => (
                <div className="agency-chart__group" key={i}>
                  <div className="agency-chart__bar-wrap">
                    <div className="agency-chart__bar agency-chart__bar--orders" style={{ height: `${(point.orders / maxChartVal) * 100}%` }} title={`درخواست: ${point.orders}`} />
                    <div className="agency-chart__bar agency-chart__bar--revenue" style={{ height: `${(point.revenue / maxChartVal) * 100}%` }} title={`درآمد: ${point.revenue}`} />
                  </div>
                  <span className="agency-chart__label">{point.label}</span>
                </div>
              ))}
            </div>
            <div className="agency-chart__legend">
              <span><i style={{ background: '#1456c3' }} /> درخواست‌ها</span>
              <span><i style={{ background: '#d0a04a' }} /> درآمد</span>
            </div>
          </div>
        </div>

        <div className="agency-card">
          <div className="agency-card__head">
            <h2><DollarSign size={22} strokeWidth={1.7} /> درآمد</h2>
            <TrendingUp size={22} strokeWidth={1.7} style={{ color: '#C9973E' }} />
          </div>
          <div className="agency-revenue-list">
            <div className="agency-revenue-item">
              <div className="agency-revenue-item__icon" style={{ background: '#eaf2ff', color: '#1456C3' }}>
                <FileText size={22} strokeWidth={1.8} />
              </div>
              <div className="agency-revenue-item__body">
                <strong>درخواست‌ها</strong>
                <span>{formatToman(data?.stats.orders ?? 0)}</span>
              </div>
            </div>
            <div className="agency-revenue-item agency-revenue-item--total">
              <div className="agency-revenue-item__icon" style={{ background: '#e8f7f1', color: '#168A68' }}>
                <DollarSign size={22} strokeWidth={1.8} />
              </div>
              <div className="agency-revenue-item__body">
                <strong>درآمد کل</strong>
                <span>{formatToman(data?.stats.revenue ?? 0)} تومان</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="agency-activity-row">
        <div className="agency-card">
          <div className="agency-card__head">
            <h2><Activity size={22} strokeWidth={1.7} /> آخرین فعالیت‌ها</h2>
          </div>
          <ul className="agency-activity-list">
            {data?.activities.length === 0 && <li className="agency-activity--empty">فعالیتی ثبت نشده است.</li>}
            {data?.activities.map((act, i) => (
              <li className="agency-activity" key={i}>
                <span className="agency-activity__dot" style={{ background: statusColors[act.status] ?? '#8795A9' }} />
                <div className="agency-activity__body">
                  <strong>{act.title}</strong>
                  <span>{act.description}</span>
                </div>
                <time>{relativeTime(act.createdAt)}</time>
              </li>
            ))}
          </ul>
        </div>
        <div className="agency-card">
          <div className="agency-card__head">
            <h2><Building2 size={22} strokeWidth={1.7} /> خلاصه نمایندگی</h2>
          </div>
          <div className="agency-revenue-list">
            <div className="agency-revenue-item">
              <div className="agency-revenue-item__icon" style={{ background: '#fff6e5', color: '#C9973E' }}>
                <Building2 size={22} strokeWidth={1.8} />
              </div>
              <div className="agency-revenue-item__body">
                <strong>مراکز زیرمجموعه</strong>
                <span>{formatToman(data?.stats.centers ?? 0)}</span>
              </div>
            </div>
            <div className="agency-revenue-item">
              <div className="agency-revenue-item__icon" style={{ background: '#e8f7f1', color: '#168A68' }}>
                <Stethoscope size={22} strokeWidth={1.8} />
              </div>
              <div className="agency-revenue-item__body">
                <strong>پزشکان زیرمجموعه</strong>
                <span>{formatToman(data?.stats.doctors ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
