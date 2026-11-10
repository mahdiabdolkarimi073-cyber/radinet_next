import { NextRequest, NextResponse } from 'next/server';
import { listDoctorReferralsServer } from '@/lib/tele-report-storage';
import { extractRequestUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = extractRequestUser(req);
    const { searchParams } = new URL(req.url);
    const doctorUserId = user?.userId || user?.email || searchParams.get('doctorUserId') || undefined;
    const data = await listDoctorReferralsServer({
      doctorUserId,
      status: searchParams.get('status') || undefined,
      imagingType: searchParams.get('imagingType') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 8,
    });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت درخواست‌های ارجاعی' },
      { status: 500 },
    );
  }
}
