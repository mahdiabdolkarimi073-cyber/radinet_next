import { NextRequest, NextResponse } from 'next/server';
import { validateCartItemsServer } from '@/lib/shop-storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const check = await validateCartItemsServer(items);
    if (!check.valid) {
      return NextResponse.json(
        { valid: false, message: check.message || 'محدودیت تعداد خرید رعایت نشده است.' },
        { status: 400 },
      );
    }
    return NextResponse.json({ valid: true });
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, message: err?.message || 'خطا در بررسی سبد خرید' },
      { status: 400 },
    );
  }
}
