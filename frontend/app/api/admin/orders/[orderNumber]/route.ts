import { NextResponse } from 'next/server';
import { getShopOrderByNumberServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> | { orderNumber: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderNumber = resolvedParams.orderNumber;
    const order = await getShopOrderByNumberServer(orderNumber);

    if (!order) {
      return NextResponse.json({ error: 'سفارش یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت اطلاعات سفارش';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
