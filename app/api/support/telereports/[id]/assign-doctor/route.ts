import { NextRequest, NextResponse } from 'next/server';
import { extractAdminOrSupportUser } from '@/lib/server-auth';
import { assignDoctorToTeleReportServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const actor = extractAdminOrSupportUser(req) || {
    fullName: 'کارشناس پشتیبانی',
    role: 'support_expert',
  };

  try {
    const resolvedParams = await Promise.resolve(context?.params);
    const id = decodeURIComponent(resolvedParams?.id || '');
    const body = await req.json();
    const doctorId = String(body?.doctorId || '').trim();
    if (!doctorId) {
      return NextResponse.json({ message: 'انتخاب پزشک رادیولوژیست الزامی است.' }, { status: 400 });
    }
    const result = await assignDoctorToTeleReportServer({
      requestId: id,
      doctorId,
      actorName: actor.fullName,
      actorRole: actor.role,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'ارجاع پرونده به پزشک ناموفق بود.' },
      { status: 400 },
    );
  }
}
