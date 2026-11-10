import { NextResponse } from 'next/server';
import { adminListShopOrdersServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || undefined;
    const limit = searchParams.get('limit') || undefined;
    const status = searchParams.get('status') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const search = searchParams.get('search') || undefined;

    const data = await adminListShopOrdersServer({
      page,
      limit,
      status,
      paymentStatus,
      search,
    });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت لیست سفارش‌ها';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
