import { NextResponse } from 'next/server';
import { getDoctorFinanceSummaryServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = await getDoctorFinanceSummaryServer();
    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت اطلاعات مالی پزشک' },
      { status: 500 },
    );
  }
}
