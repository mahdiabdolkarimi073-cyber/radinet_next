import { NextRequest, NextResponse } from 'next/server';
import { getPaymentConfigServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || 'IR';
    const config = await getPaymentConfigServer(country);
    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت تنظیمات پرداخت' },
      { status: 500 },
    );
  }
}
