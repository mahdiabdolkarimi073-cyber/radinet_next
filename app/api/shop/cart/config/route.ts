import { NextResponse } from 'next/server';
import { getShopCartConfigServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getShopCartConfigServer();
    return NextResponse.json(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت تنظیمات سبد خرید';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
