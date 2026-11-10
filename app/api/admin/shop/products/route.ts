import { NextResponse } from 'next/server';
import {
  adminCreateShopProductServer,
  adminListShopProductsServer,
} from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || undefined;
    const limit = searchParams.get('limit') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const status = searchParams.get('status') || undefined;
    const sort = searchParams.get('sort') || undefined;
    const search = searchParams.get('search') || undefined;

    const data = await adminListShopProductsServer({
      page,
      limit,
      categoryId,
      status,
      sort,
      search,
    });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت لیست محصولات';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await adminCreateShopProductServer(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ایجاد محصول با خطا مواجه شد.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
