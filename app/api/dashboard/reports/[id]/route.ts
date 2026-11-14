import { NextRequest, NextResponse } from 'next/server';
import {
  getDoctorReportByIdServer,
  updateDoctorReportDraftServer,
} from '@/lib/tele-report-storage';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const resolved = await Promise.resolve(context.params);
    const id = decodeURIComponent(resolved.id);
    const auth = getAuthorizationHeader(req, 'doctor');
    const report = await getDoctorReportByIdServer(id, auth);
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
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const resolved = await Promise.resolve(context.params);
    const id = decodeURIComponent(resolved.id);
    const auth = getAuthorizationHeader(req, 'doctor');
    const body = await req.json();
    const updated = await updateDoctorReportDraftServer(
      id,
      {
        findings: body.findings,
        conclusion: body.conclusion,
        signatureName: body.signatureName,
      },
      auth,
    );
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در ذخیره پیش‌نویس گزارش' },
      { status: 400 },
    );
  }
}
