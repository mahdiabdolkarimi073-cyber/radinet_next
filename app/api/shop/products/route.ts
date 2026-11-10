import { NextResponse } from 'next/server';
import { getShopProductsServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const categorySlug = searchParams.get('categorySlug') || undefined;
    const brands = searchParams.get('brands') || undefined;
    const inStock = searchParams.get('inStock') || undefined;
    const outOfStock = searchParams.get('outOfStock') || undefined;
    const minPrice = searchParams.get('minPrice') || undefined;
    const maxPrice = searchParams.get('maxPrice') || undefined;
    const sort = searchParams.get('sort') || undefined;
    const page = searchParams.get('page') || undefined;
    const limit = searchParams.get('limit') || searchParams.get('pageSize') || undefined;

    const data = await getShopProductsServer({
      search,
      category,
      categorySlug,
      brands,
      inStock,
      outOfStock,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت لیست محصولات';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
