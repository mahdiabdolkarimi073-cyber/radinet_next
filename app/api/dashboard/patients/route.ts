import { NextRequest, NextResponse } from 'next/server';
import { listDoctorReferralsServer } from '@/lib/tele-report-storage';
import { extractRequestUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = extractRequestUser(req);
    const { searchParams } = new URL(req.url);
    const data = await listDoctorReferralsServer({
      doctorUserId: user?.userId,
      status: searchParams.get('status') || undefined,
      imagingType: searchParams.get('imagingType') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 12,
    });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت لیست بیماران' },
      { status: 500 },
    );
  }
}
