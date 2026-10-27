import { NextResponse } from 'next/server';

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

export async function PATCH(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const { pathname } = new URL(req.url);
    const parts = pathname.split('/');
    const centerId = parts[parts.indexOf('imaging-centers') + 1];
    const userId = parts[parts.indexOf('users') + 1];

    const response = await fetch(`${backendUrl}/admin/imaging-centers/${centerId}/users/${userId}`, {
      method: 'PATCH',
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'اتصال به سرور برقرار نیست.' }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const { pathname } = new URL(req.url);
    const parts = pathname.split('/');
    const centerId = parts[parts.indexOf('imaging-centers') + 1];
    const userId = parts[parts.indexOf('users') + 1];

    const response = await fetch(`${backendUrl}/admin/imaging-centers/${centerId}/users/${userId}`, {
      method: 'DELETE',
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'اتصال به سرور برقرار نیست.' }, { status: 503 });
  }
}
