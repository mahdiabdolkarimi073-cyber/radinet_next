import { NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: { id: string } },
) {
  try {
    const authorization = req.headers.get('authorization');
    const resolvedParams = await Promise.resolve(context?.params);
    const id = decodeURIComponent(resolvedParams?.id || '');
    const response = await fetch(`${backendUrl}/admin/tele-reports/${id}`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }
  } catch {
    // Proceed to fallback
  }

  try {
    const resolvedParams = await Promise.resolve(context?.params);
    const id = decodeURIComponent(resolvedParams?.id || '');
    const { getAdminTeleReportDetailServer } = await import('@/lib/tele-report-storage');
    const fallback = await getAdminTeleReportDetailServer(id);
    if (!fallback) {
      return NextResponse.json({ error: 'درخواست یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json(fallback);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'اتصال به سرور برقرار نیست.' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: { id: string } },
) {
  try {
    const authorization = req.headers.get('authorization');
    const resolvedParams = await Promise.resolve(context?.params);
    const id = decodeURIComponent(resolvedParams?.id || '');
    const body = await req.json();

    let endpoint = `${backendUrl}/admin/tele-reports/${id}/status`;
    if (body.action === 'assign' || body.doctorId) {
      endpoint = `${backendUrl}/admin/tele-reports/${id}/assign`;
    }

    const response = await fetch(endpoint, {
      method: body.action === 'assign' || body.doctorId ? 'POST' : 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    // Proceed to fallback
  }

  try {
    const resolvedParams = await Promise.resolve(context?.params);
    const id = decodeURIComponent(resolvedParams?.id || '');
    const body = await req.json().catch(() => ({}));

    if (body.action === 'assign' || body.doctorId) {
      const { assignDoctorToTeleReportServer } = await import('@/lib/tele-report-storage');
      const assigned = await assignDoctorToTeleReportServer({
        requestId: id,
        doctorId: body.doctorId,
        actorName: 'مدیر ارشد سامانه',
        actorRole: 'admin',
      });
      return NextResponse.json(assigned);
    }

    if (body.status) {
      const { updateTeleReportStatusServer } = await import('@/lib/tele-report-storage');
      const updated = await updateTeleReportStatusServer(id, body.status);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ ok: true, message: 'عملیات با موفقیت انجام شد.' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'عملیات ناموفق بود.' }, { status: 400 });
  }
}
