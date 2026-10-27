import { NextResponse } from 'next/server';
import { adminGetOrderStatsServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await adminGetOrderStatsServer();
    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت آمار سفارش‌ها';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
