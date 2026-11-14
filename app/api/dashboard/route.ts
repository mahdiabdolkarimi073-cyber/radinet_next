import { NextRequest, NextResponse } from 'next/server';
import { getDoctorDashboardServer } from '@/lib/tele-report-storage';
import { extractRequestUser, getAuthorizationHeader } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = extractRequestUser(req);
    const auth = getAuthorizationHeader(req, 'doctor');
    const data = await getDoctorDashboardServer(user?.userId, auth);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت اطلاعات داشبورد پزشک' },
      { status: 500 },
    );
  }
}
