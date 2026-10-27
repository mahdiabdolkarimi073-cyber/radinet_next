import { NextResponse } from 'next/server';
import { getShopBrandsServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brands = await getShopBrandsServer();
    return NextResponse.json(brands);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت لیست برندها';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
