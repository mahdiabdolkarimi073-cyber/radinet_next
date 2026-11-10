import { NextResponse } from 'next/server';
import { getShopOrdersByPhoneServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ phone: string }> | { phone: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const phone = resolvedParams.phone;
    const orders = await getShopOrdersByPhoneServer(phone);

    return NextResponse.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت سوابق سفارش‌های تلفن';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
