import { NextResponse } from 'next/server';
import { validateShopDiscountServer } from '@/lib/shop-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const code = resolvedParams.code;
    const { searchParams } = new URL(request.url);
    const subtotal = Number(searchParams.get('subtotal')) || 0;

    const discount = await validateShopDiscountServer(code, subtotal);
    if (!discount) {
      return NextResponse.json({ error: 'کد تخفیف نامعتبر یا منقضی شده است.' }, { status: 404 });
    }

    return NextResponse.json(discount);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در اعتبارسنجی کد تخفیف';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
