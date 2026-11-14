import { NextRequest, NextResponse } from 'next/server';
import { submitDoctorReportForApprovalServer } from '@/lib/tele-report-storage';
import { extractRequestUser, getAuthorizationHeader } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const user = extractRequestUser(req);
    const auth = getAuthorizationHeader(req, 'doctor');
    const resolved = await Promise.resolve(context.params);
    const id = decodeURIComponent(resolved.id);
    const body = await req.json();
    const submitted = await submitDoctorReportForApprovalServer(
      id,
      {
        findings: body.findings,
        conclusion: body.conclusion,
        signed: body.signed ?? true,
        signatureName: body.signatureName || user?.fullName || 'پزشک رادیولوژیست',
        actorId: user?.userId,
        actorName: user?.fullName,
      },
      auth,
    );
    return NextResponse.json(submitted);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'ارسال گزارش جهت بررسی ناموفق بود.' },
      { status: 400 },
    );
  }
}
