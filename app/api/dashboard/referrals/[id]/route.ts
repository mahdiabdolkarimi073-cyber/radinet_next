import { NextRequest, NextResponse } from 'next/server';
import { updateTeleReportStatusServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const id = decodeURIComponent(context.params.id);
    const body = await req.json();
    const updated = await updateTeleReportStatusServer(id, body.status || 'in_progress');
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'تغییر وضعیت درخواست انجام نشد.' },
      { status: 400 },
    );
  }
}
