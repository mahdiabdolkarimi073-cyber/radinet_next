import { NextRequest, NextResponse } from 'next/server';
import { extractAdminOrSupportUser } from '@/lib/server-auth';
import { listAdminTeleReportsServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const actor = extractAdminOrSupportUser(req);
  // Allow support staff or admin to view tele-report queue

  try {
    const { searchParams } = new URL(req.url);
    const data = await listAdminTeleReportsServer({
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      page: 1,
      limit: 100,
    });
    return NextResponse.json(data.items);

  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت درخواست‌های تله‌ریپورت' },
      { status: 500 },
    );
  }
}
