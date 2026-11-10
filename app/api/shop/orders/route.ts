import { NextResponse } from 'next/server';
import { createShopOrderServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      shippingAddress,
      items,
    } = body || {};

    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json({ message: 'نام و نام خانوادگی تحویل‌گیرنده الزامی است.' }, { status: 400 });
    }

    if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.trim().length < 7) {
      return NextResponse.json({ message: 'شماره تلفن معتبر جهت هماهنگی ارسال الزامی است.' }, { status: 400 });
    }

    if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim().length < 5) {
      return NextResponse.json({ message: 'آدرس کامل پستی محل تحویل الزامی است.' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'سبد خرید شما خالی است.' }, { status: 400 });
    }

    const order = await createShopOrderServer(body);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ثبت سفارش با خطا مواجه شد.';
    return NextResponse.json({ message }, { status: 400 });
  }
}
