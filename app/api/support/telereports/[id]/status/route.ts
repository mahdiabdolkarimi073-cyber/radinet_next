import { NextRequest, NextResponse } from 'next/server';
import { extractAdminOrSupportUser, getAuthorizationHeader } from '@/lib/server-auth';
import { updateTeleReportStatusServer } from '@/lib/tele-report-storage';

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
    const updated = await updateTeleReportStatusServer(id, String(body?.status || 'new'), {
      scope: 'support',
      auth,
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'به‌روزرسانی وضعیت ناموفق بود.' },
      { status: 400 },
    );
  }
}
