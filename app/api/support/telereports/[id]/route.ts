import { NextRequest, NextResponse } from 'next/server';
import { extractAdminOrSupportUser } from '@/lib/server-auth';
import { getAdminTeleReportDetailServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const actor = extractAdminOrSupportUser(req);

  try {
    const resolvedParams = await Promise.resolve(context?.params);
    const id = decodeURIComponent(resolvedParams?.id || '');
    const detail = await getAdminTeleReportDetailServer(id);
    return NextResponse.json({

      ...detail,
      notifications: [],
    });

  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'درخواست تله‌ریپورت یافت نشد.' },
      { status: 404 },
    );
  }
}
