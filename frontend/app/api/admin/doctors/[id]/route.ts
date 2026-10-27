import { NextResponse } from 'next/server';

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const { pathname } = new URL(req.url);
    const id = pathname.split('/').pop();
    const response = await fetch(`${backendUrl}/admin/doctors/${id}`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'اتصال به سرور برقرار نیست.' }, { status: 503 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const { pathname } = new URL(req.url);
    const id = pathname.split('/').pop();
    const body = await req.json();

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
  } catch {
    return NextResponse.json({ error: 'اتصال به سرور برقرار نیست.' }, { status: 503 });
  }
}
