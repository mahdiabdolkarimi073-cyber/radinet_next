import { NextResponse } from 'next/server';

const backendUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const { pathname } = new URL(req.url);
    // Path: /api/admin/organizations/[id]/requests-report
    const segments = pathname.split('/');
    const id = segments[segments.length - 2];

    const response = await fetch(`${backendUrl}/admin/organizations/${id}/requests-report`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'اتصال به سرور برقرار نیست.' }, { status: 503 });
  }
}
