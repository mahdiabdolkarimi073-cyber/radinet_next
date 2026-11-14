import { NextRequest, NextResponse } from 'next/server';
import { extractAdminOrSupportUser, getAuthorizationHeader } from '@/lib/server-auth';
import { reviewRadiologyReportServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const actor = extractAdminOrSupportUser(req);
  if (!actor) {
    return NextResponse.json({ message: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  try {
    const resolved = await Promise.resolve(context.params);
    const id = decodeURIComponent(resolved.id || '');
    const auth = getAuthorizationHeader(req, 'support_expert');
    const body = await req.json();
    const reportId = String(body?.reportId || '').trim();
    const decision =
      body?.decision === 'rejected' || body?.decision === 'reject' || body?.status === 'rejected'
        ? 'rejected'
        : 'approved';

    const updated = await reviewRadiologyReportServer(
      {
        requestId: id,
        reportId,
        decision,
        rejectReason: body?.rejectReason,
        reviewerId: actor.userId,
        reviewerName: actor.fullName || 'کارشناس پشتیبانی',
        actorRole: 'support_expert',
        scope: 'support',
      },
      auth,
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'بررسی گزارش پزشک ناموفق بود.' },
      { status: 400 },
    );
  }
}
