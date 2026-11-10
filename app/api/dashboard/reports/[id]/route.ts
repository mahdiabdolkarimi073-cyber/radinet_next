import { NextRequest, NextResponse } from 'next/server';
import {
  getDoctorReportByIdServer,
  updateDoctorReportDraftServer,
} from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const id = decodeURIComponent(context.params.id);
    const report = await getDoctorReportByIdServer(id);
    if (!report) {
      return NextResponse.json({ message: 'گزارش یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت گزارش' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const id = decodeURIComponent(context.params.id);
    const body = await req.json();
    const updated = await updateDoctorReportDraftServer(id, {
      findings: body.findings,
      conclusion: body.conclusion,
      signatureName: body.signatureName,
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در ذخیره پیش‌نویس گزارش' },
      { status: 400 },
    );
  }
}
