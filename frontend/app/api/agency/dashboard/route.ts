import { NextResponse } from 'next/server';
import { getSupabaseAdmin, getAgencyId } from '@/lib/agency-server';

export async function GET(req: Request) {
  const agencyId = await getAgencyId(req);
  if (!agencyId) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  const sb = getSupabaseAdmin();

  const [centers, doctors, orders, transactions] = await Promise.all([
    sb.from('agency_sub_centers').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId),
    sb.from('agency_doctors').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId),
    sb.from('agency_orders').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId),
    sb.from('agency_transactions').select('amount, type, status').eq('agency_id', agencyId),
  ]);

  let revenue = 0;
  if (transactions.data) {
    for (const t of transactions.data) {
      if (t.status === 'paid' && (t.type === 'commission' || t.type === 'deposit')) {
        revenue += Number(t.amount);
      }
    }
  }

  const { data: recentOrders } = await sb.from('agency_orders').select('order_number, center_name, status, created_at').eq('agency_id', agencyId).order('created_at', { ascending: false }).limit(8);

  const now = new Date();
  const chartData: { label: string; orders: number; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(d);
    chartData.push({ label, orders: 0, revenue: 0 });
  }

  return NextResponse.json({
    stats: {
      centers: centers.count ?? 0,
      doctors: doctors.count ?? 0,
      orders: orders.count ?? 0,
      revenue,
    },
    charts: chartData,
    activities: (recentOrders ?? []).map((o: { order_number: string; center_name: string; status: string; created_at: string }) => ({
      title: `درخواست ${o.order_number}`,
      description: o.center_name,
      status: o.status,
      createdAt: o.created_at,
    })),
  });
}
