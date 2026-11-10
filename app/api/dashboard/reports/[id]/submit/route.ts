import { NextRequest, NextResponse } from 'next/server';
import { submitDoctorReportForApprovalServer } from '@/lib/tele-report-storage';
import { extractRequestUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const user = extractRequestUser(req);
    const id = decodeURIComponent(context.params.id);
    const body = await req.json();
    const submitted = await submitDoctorReportForApprovalServer(id, {
      findings: body.findings,
      conclusion: body.conclusion,
      signatureName: body.signatureName || user?.fullName || 'پزشک رادیولوژیست',
      actorId: user?.userId,
      actorName: user?.fullName,
    });
    return NextResponse.json(submitted);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'ارسال گزارش جهت بررسی ناموفق بود.' },
      { status: 400 },
    );
  }
}
