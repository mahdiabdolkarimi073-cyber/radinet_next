import { NextRequest, NextResponse } from 'next/server';
import { extractAdminOrSupportUser } from '@/lib/server-auth';
import { updateTeleReportStatusServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const actor = extractAdminOrSupportUser(req);
  if (!actor) {
    return NextResponse.json({ message: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  try {
    const id = decodeURIComponent(context.params.id || '');
    const body = await req.json();
    const updated = updateTeleReportStatusServer(id, String(body?.status || 'new'));
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'به‌روزرسانی وضعیت ناموفق بود.' },
      { status: 400 },
    );
  }
}
