import { NextRequest, NextResponse } from 'next/server';
import { startTeleReportPaymentServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.requestNumber) {
      return NextResponse.json({ message: 'شماره درخواست الزامی است.' }, { status: 400 });
    }
    const result = await startTeleReportPaymentServer({
      requestNumber: body.requestNumber,
      gateway: body.gateway,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در آغاز فرآیند پرداخت آزمایشی' },
      { status: 400 },
    );
  }
}
