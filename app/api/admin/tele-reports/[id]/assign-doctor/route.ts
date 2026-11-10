import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';
import { extractAdminOrSupportUser } from '@/lib/server-auth';
import { assignDoctorToTeleReportServer } from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const actor = extractAdminOrSupportUser(req) || {
    fullName: 'مدیر ارشد سامانه',
    role: 'admin',
  };

  try {
    const resolvedParams = await Promise.resolve(context?.params);
    const id = decodeURIComponent(resolvedParams?.id || '');
    const body = await req.json();
    const doctorId = String(body?.doctorId || '').trim();
    if (!doctorId) {
      return NextResponse.json({ error: 'انتخاب پزشک رادیولوژیست الزامی است.' }, { status: 400 });
    }

    let backendResult: any = null;
    const authorization = req.headers.get('authorization');
    if (authorization) {
      try {
        const bRes = await fetch(`${backendUrl}/admin/tele-reports/${id}/assign-doctor`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authorization,
          },
          body: JSON.stringify({ doctorId }),
        });
        if (bRes.ok) {
          backendResult = await bRes.json();
        }
      } catch {
        // Backend offline or unreachable
      }
    }

    if (backendResult) {
      try {
        await assignDoctorToTeleReportServer({
          requestId: id,
          doctorId,
          actorName: actor.fullName,
          actorRole: actor.role,
        });
      } catch {
        // Local cache sync optional when backend succeeds
      }
      return NextResponse.json(backendResult);
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
      { error: err?.message || 'اختصاص پزشک ناموفق بود.' },
      { status: 400 },
    );
  }
}
