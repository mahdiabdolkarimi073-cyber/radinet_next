import { NextResponse } from 'next/server';
import { adminUpdateOrderStatusServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderNumber: string }> | { orderNumber: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderNumber = resolvedParams.orderNumber;
    const body = await req.json();
    const { status, trackingCode } = body || {};

    if (!status) {
      return NextResponse.json({ error: 'وضعیت سفارش مشخص نشده است.' }, { status: 400 });
    }

    const updated = await adminUpdateOrderStatusServer(orderNumber, status, trackingCode);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'به‌روزرسانی وضعیت سفارش ناموفق بود.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
