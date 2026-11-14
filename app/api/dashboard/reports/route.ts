import { NextRequest, NextResponse } from 'next/server';
import { createOrGetDoctorReportServer } from '@/lib/tele-report-storage';
import { extractRequestUser, getAuthorizationHeader } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = extractRequestUser(req);
    const auth = getAuthorizationHeader(req, 'doctor');
    const body = await req.json();
    if (!body.requestId) {
      return NextResponse.json({ message: 'شناسه درخواست الزامی است.' }, { status: 400 });
    }
    const report = await createOrGetDoctorReportServer(
      {
        requestId: body.requestId,
        authorId: user?.userId,
        authorName: user?.fullName,
        findings: body.findings,
        conclusion: body.conclusion,
      },
      auth,
    );
    return NextResponse.json(report, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در ایجاد یا بازیابی گزارش رادیولوژی' },
      { status: 400 },
    );
  }
}
