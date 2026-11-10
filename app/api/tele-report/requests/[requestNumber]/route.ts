import { NextRequest, NextResponse } from 'next/server';
import { getTeleReportRequestByNumberOrIdServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: { requestNumber: string } },
) {
  try {
    const requestNumber = decodeURIComponent(context.params.requestNumber);
    const found = await getTeleReportRequestByNumberOrIdServer(requestNumber);
    if (!found) {
      return NextResponse.json({ message: 'درخواست تله‌ریپورت یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json(found);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت اطلاعات درخواست' },
      { status: 500 },
    );
  }
}
