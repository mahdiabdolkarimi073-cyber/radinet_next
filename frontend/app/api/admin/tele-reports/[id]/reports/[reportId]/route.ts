import { NextResponse } from 'next/server';

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

export async function PATCH(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const { pathname } = new URL(req.url);
    // Path: /api/admin/tele-reports/[id]/reports/[reportId]
    const segments = pathname.split('/');
    const reportId = segments[segments.length - 1];
    const id = segments[segments.length - 3];
    const body = await req.json();

    const response = await fetch(`${backendUrl}/admin/tele-reports/${id}/reports/${reportId}`, {
      method: 'PATCH',
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
    return NextResponse.json({ error: 'اتصال به سرور برقرار نیست.' }, { status: 503 });
  }
}
