import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-client';
import { extractTokenFromRequest } from '@/lib/server-auth';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const token = extractTokenFromRequest(request);
    const authHeader = token ? `Bearer ${token}` : request.headers.get('authorization') ?? undefined;
    if (!authHeader) {
      return NextResponse.json({ error: 'احراز هویت الزامی است' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'متن پاسخ نمی‌تواند خالی باشد.' }, { status: 400 });
    }

    const backendRes = await fetch(`${BACKEND_URL}/panel/tickets/${encodeURIComponent(id)}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ message: message.trim() }),
    });

    const data = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.message || 'خطا در ارسال پاسخ' },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
