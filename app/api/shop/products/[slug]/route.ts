import { NextResponse } from 'next/server';
import { getShopProductBySlugServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug;
    const product = await getShopProductBySlugServer(slug);

    if (!product) {
      return NextResponse.json({ error: 'محصول مورد نظر یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت اطلاعات محصول';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
