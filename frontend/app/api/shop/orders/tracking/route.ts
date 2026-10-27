import { NextResponse } from 'next/server';
import {
  getShopOrderByNumberServer,
  getShopOrdersByPhoneServer,
} from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code') || searchParams.get('order');
    const phone = searchParams.get('phone');

    if (code) {
      const order = await getShopOrderByNumberServer(code);
      if (!order) {
        return NextResponse.json({ error: 'سفارشی با این شماره یا کد رهگیری پیدا نشد.' }, { status: 404 });
      }
      return NextResponse.json(order);
    }

    if (phone) {
      const orders = await getShopOrdersByPhoneServer(phone);
      return NextResponse.json(orders);
    }

    return NextResponse.json({ error: 'لطفاً کد رهگیری یا شماره تلفن را وارد کنید.' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت اطلاعات رهگیری';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
