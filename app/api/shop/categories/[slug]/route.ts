import { NextResponse } from 'next/server';
import { getShopCategoryBySlugServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug;
    const category = await getShopCategoryBySlugServer(slug);

    if (!category) {
      return NextResponse.json({ error: 'دسته‌بندی مورد نظر یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در دریافت مشخصات دسته‌بندی';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
