import { NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const authorization = getAuthorizationHeader(req, 'admin');
    const resolvedParams = await Promise.resolve(context?.params);
    const id = encodeURIComponent(decodeURIComponent(resolvedParams?.id || ''));
    const response = await fetch(`${backendUrl}/admin/tele-reports/${id}`, {
      headers: { Authorization: authorization },
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({ error: 'درخواست یافت نشد.' }));
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'اتصال به سرور برقرار نیست.' }, { status: 502 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const authorization = getAuthorizationHeader(req, 'admin');
    const resolvedParams = await Promise.resolve(context?.params);
    const id = encodeURIComponent(decodeURIComponent(resolvedParams?.id || ''));
    const body = await req.json();

    const isAssign = Boolean(body.action === 'assign' || body.doctorId);
    const endpoint = isAssign
      ? `${backendUrl}/admin/tele-reports/${id}/assign-doctor`
      : `${backendUrl}/admin/tele-reports/${id}/status`;

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'عملیات ناموفق بود.' }, { status: 502 });
  }
}
