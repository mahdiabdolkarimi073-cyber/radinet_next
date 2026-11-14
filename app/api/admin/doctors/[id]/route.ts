import { NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { pathname } = new URL(req.url);
  const id = decodeURIComponent(pathname.split('/').pop() || '');

  try {
    const authorization = req.headers.get('authorization');
    const response = await fetch(`${backendUrl}/admin/doctors/${id}`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'دریافت مشخصات پزشک با خطا مواجه شد.' },
      { status: 503 },
    );
  }
}

export async function PATCH(req: Request) {
  const { pathname } = new URL(req.url);
  const id = decodeURIComponent(pathname.split('/').pop() || '');
  const body = await req.json().catch(() => ({}));

  try {
    const authorization = req.headers.get('authorization');
    let endpoint = `${backendUrl}/admin/doctors/${id}`;
    if (body.action === 'approve') endpoint += '/approve';
    else if (body.action === 'reject') endpoint += '/reject';

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body.action ? {} : body),
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'ویرایش مشخصات پزشک با خطا مواجه شد.' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const { pathname } = new URL(req.url);
  const id = decodeURIComponent(pathname.split('/').pop() || '');

  try {
    const authorization = req.headers.get('authorization');
    const response = await fetch(`${backendUrl}/admin/doctors/${id}`, {
      method: 'DELETE',
      headers: authorization ? { Authorization: authorization } : {},
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'حذف پزشک با خطا مواجه شد.' },
      { status: 500 },
    );
  }
}
