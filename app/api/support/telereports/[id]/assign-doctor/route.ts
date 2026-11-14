import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';
import { extractAdminOrSupportUser, getAuthorizationHeader } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const actor = extractAdminOrSupportUser(req);
  if (!actor) {
    return NextResponse.json({ message: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  try {
    const resolvedParams = await Promise.resolve(context?.params);
    const id = decodeURIComponent(resolvedParams?.id || '').trim();
    const body = await req.json();
    const doctorId = String(body?.doctorId || '').trim();
    if (!doctorId) {
      return NextResponse.json({ message: 'انتخاب پزشک رادیولوژیست الزامی است.' }, { status: 400 });
    }

    const authHeader = getAuthorizationHeader(req, 'support_expert');
    const bRes = await fetch(`${backendUrl}/support/telereports/${encodeURIComponent(id)}/assign-doctor`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        doctorId,
        requestNumber: id,
      }),
      cache: 'no-store',
    });

    const data = await bRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: bRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'ارجاع پرونده به پزشک ناموفق بود.' },
      { status: 400 },
    );
  }
}
