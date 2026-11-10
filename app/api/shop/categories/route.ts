import { NextResponse } from 'next/server';
import { getShopCategoriesServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getShopCategoriesServer();
    return NextResponse.json(categories);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت لیست دسته‌بندی‌ها';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
