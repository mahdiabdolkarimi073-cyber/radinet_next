import { NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  try {
    const authorization = req.headers.get('authorization');
    const qs = searchParams.toString();
    const response = await fetch(`${backendUrl}/admin/users${qs ? `?${qs}` : ''}`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'دریافت فهرست کاربران با خطا مواجه شد.' },
      { status: 503 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const body = await req.json();
    const response = await fetch(`${backendUrl}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'ایجاد کاربر در دیتابیس با خطا مواجه شد.' },
      { status: 500 },
    );
  }
}
