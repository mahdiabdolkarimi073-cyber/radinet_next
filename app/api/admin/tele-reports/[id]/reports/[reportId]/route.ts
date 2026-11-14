import { NextRequest, NextResponse } from 'next/server';
import { extractAdminOrSupportUser, getAuthorizationHeader } from '@/lib/server-auth';
import { reviewRadiologyReportServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; reportId: string }> | { id: string; reportId: string } },
) {
  const actor = extractAdminOrSupportUser(req);
  if (!actor) {
    return NextResponse.json(
      { error: 'دسترسی غیرمجاز؛ فقط مدیر یا کارشناس پشتیبانی مجاز به تأیید/رد گزارش پزشک است.' },
      { status: 403 },
    );
  }

  try {
    const resolved = await Promise.resolve(context.params);
    const id = decodeURIComponent(resolved.id || '');
    const reportId = decodeURIComponent(resolved.reportId || '');
    const auth = getAuthorizationHeader(req, actor.role.startsWith('support') ? 'support_expert' : 'admin');
    const body = await req.json();
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
        reviewerName: actor.fullName || (actor.role === 'admin' ? 'مدیر سیستم' : 'کارشناس پشتیبانی'),
        actorRole: actor.role,
        scope: actor.role.startsWith('support') ? 'support' : 'admin',
      },
      auth,
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'بررسی گزارش پزشک ناموفق بود.' },
      { status: 400 },
    );
  }
}
