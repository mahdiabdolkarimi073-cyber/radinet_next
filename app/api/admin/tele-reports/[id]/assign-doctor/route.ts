import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const resolvedParams = await Promise.resolve(context?.params);
    const id = decodeURIComponent(resolvedParams?.id || '').trim();
    const body = await req.json();
    const doctorId = String(body?.doctorId || '').trim();
    if (!doctorId) {
      return NextResponse.json({ error: 'انتخاب پزشک رادیولوژیست الزامی است.' }, { status: 400 });
    }

    const authHeader = getAuthorizationHeader(req, 'admin');

    const bRes = await fetch(`${backendUrl}/admin/tele-reports/${encodeURIComponent(id)}/assign-doctor`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ doctorId, requestNumber: id }),
    });

    const data = await bRes.json();
    return NextResponse.json(data, { status: bRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'اختصاص پزشک ناموفق بود.' },
      { status: 500 },
    );
  }
}
