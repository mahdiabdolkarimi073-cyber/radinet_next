import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-client';
import { extractTokenFromRequest } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ message: 'لطفاً وارد حساب کاربری خود شوید.' }, { status: 401 });
  }

  const resolved = await Promise.resolve(context.params);
  const id = encodeURIComponent(decodeURIComponent(resolved.id || ''));
  try {
    const res = await fetch(`${BACKEND_URL}/panel/telereports/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت درخواست' },
      { status: 502 },
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ message: 'لطفاً وارد حساب کاربری خود شوید.' }, { status: 401 });
  }

  const resolved = await Promise.resolve(context.params);
  const id = encodeURIComponent(decodeURIComponent(resolved.id || ''));
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/panel/telereports/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در ارسال پاسخ به پزشک' },
      { status: 502 },
    );
  }
}
