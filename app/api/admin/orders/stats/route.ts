import { NextResponse } from 'next/server';
import { adminGetOrderStatsServer } from '@/lib/shop-storage';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const auth = getAuthorizationHeader(req, 'admin');
    const stats = await adminGetOrderStatsServer(auth);
    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت آمار سفارش‌ها';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
