import { NextResponse } from 'next/server';
import { getAiConfigServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getAiConfigServer();
    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'خطا در دریافت تنظیمات هوش مصنوعی' },
      { status: 500 },
    );
  }
}
