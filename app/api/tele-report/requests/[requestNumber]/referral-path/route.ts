import { NextRequest, NextResponse } from 'next/server';
import { setReferralPathServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: { requestNumber: string } },
) {
  try {
    const requestNumber = decodeURIComponent(context.params.requestNumber);
    const body = await req.json();
    const updated = await setReferralPathServer(
      requestNumber,
      body.referralPath || 'platform_radiologist',
    );
    if (!updated) {
      return NextResponse.json({ message: 'درخواست تله‌ریپورت یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در ثبت مسیر ارجاع درخواست' },
      { status: 400 },
    );
  }
}
