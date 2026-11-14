import { NextRequest, NextResponse } from 'next/server';
import { getDoctorFinanceSummaryServer } from '@/lib/tele-report-storage';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthorizationHeader(req, 'doctor');
    const summary = await getDoctorFinanceSummaryServer(auth);
    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت اطلاعات مالی پزشک' },
      { status: 500 },
    );
  }
}
