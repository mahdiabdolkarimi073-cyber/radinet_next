import { NextResponse } from 'next/server';

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const { pathname } = new URL(req.url);
    const id = pathname.split('/').pop();
    const response = await fetch(`${backendUrl}/admin/users/${id}`, {
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
    const response = await fetch(`${backendUrl}/admin/users/${id}`, {
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

export async function DELETE(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const { pathname } = new URL(req.url);
    const id = pathname.split('/').pop();
    const response = await fetch(`${backendUrl}/admin/users/${id}`, {
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
