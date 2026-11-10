import { NextRequest, NextResponse } from 'next/server';
import { extractAdminOrSupportUser } from '@/lib/server-auth';
import { reviewRadiologyReportServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string; reportId: string } },
) {
  const actor = extractAdminOrSupportUser(req);
  if (!actor) {
    return NextResponse.json(
      { error: 'دسترسی غیرمجاز؛ فقط مدیر یا کارشناس پشتیبانی مجاز به تأیید/رد گزارش پزشک است.' },
      { status: 403 },
    );
  }

  try {
    const id = decodeURIComponent(context.params.id || '');
    const reportId = decodeURIComponent(context.params.reportId || '');
    const body = await req.json();
    const decision =
      body?.decision === 'rejected' || body?.status === 'rejected'
        ? 'rejected'
        : 'approved';

    const updated = reviewRadiologyReportServer({
      requestId: id,
      reportId,
      decision,
      rejectReason: body?.rejectReason,
      reviewerId: actor.userId,
      reviewerName: actor.fullName || (actor.role === 'admin' ? 'مدیر سیستم' : 'کارشناس پشتیبانی'),
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'بررسی گزارش پزشک ناموفق بود.' },
      { status: 400 },
    );
  }
}
