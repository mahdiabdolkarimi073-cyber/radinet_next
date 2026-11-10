import { NextResponse } from 'next/server';
import { getShopShippingMethodsServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const methods = await getShopShippingMethodsServer();
    return NextResponse.json(methods);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت روش‌های ارسال';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
