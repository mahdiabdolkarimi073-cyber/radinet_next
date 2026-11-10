import { NextRequest, NextResponse } from 'next/server';
import { verifyTeleReportPaymentServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.requestNumber) {
      return NextResponse.json({ message: 'شماره درخواست الزامی است.' }, { status: 400 });
    }
    const result = await verifyTeleReportPaymentServer({
      requestNumber: body.requestNumber,
      paymentToken: body.paymentToken || body.paymentReference,
      gateway: body.gateway,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در تأیید پرداخت آزمایشی در سرور' },
      { status: 400 },
    );
  }
}
