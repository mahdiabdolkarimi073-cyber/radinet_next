import { NextRequest, NextResponse } from 'next/server';
import { extractAdminOrSupportUser, getAuthorizationHeader } from '@/lib/server-auth';
import { getAdminTeleReportDetailServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const actor = extractAdminOrSupportUser(req);
  if (!actor) {
    return NextResponse.json({ message: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  try {
    const resolvedParams = await Promise.resolve(context?.params);
    const id = decodeURIComponent(resolvedParams?.id || '');
    const auth = getAuthorizationHeader(req, 'support_expert');
    const detail = await getAdminTeleReportDetailServer(id, auth, 'support');
    if (!detail) {
      return NextResponse.json({ message: 'درخواست تله‌ریپورت یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({
      notifications: [],
      ...detail,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'درخواست تله‌ریپورت یافت نشد.' },
      { status: 404 },
    );
  }
}
