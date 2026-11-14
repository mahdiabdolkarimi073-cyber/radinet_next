import { NextRequest, NextResponse } from 'next/server';
import { updateTeleReportStatusServer } from '@/lib/tele-report-storage';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const resolved = await Promise.resolve(context.params);
    const id = decodeURIComponent(resolved.id);
    const auth = getAuthorizationHeader(req, 'doctor');
    const body = await req.json();
    const updated = await updateTeleReportStatusServer(id, body.status || 'in_progress', {
      scope: 'dashboard',
      auth,
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'تغییر وضعیت درخواست انجام نشد.' },
      { status: 400 },
    );
  }
}
