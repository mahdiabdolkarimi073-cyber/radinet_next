import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-client';
import { extractTokenFromRequest, extractUserFromHeader } from '@/lib/server-auth';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const token = extractTokenFromRequest(request);
  const authHeader = token ? `Bearer ${token}` : request.headers.get('authorization') ?? undefined;
  const user = extractUserFromHeader(authHeader);

  if (!user && !authHeader) {
    return NextResponse.json({ items: [] });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/panel/tickets`, {
      headers: authHeader ? { Authorization: authHeader } : {},
      cache: 'no-store',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ items: [], error: err.message }, { status: res.status });
    }
    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    return NextResponse.json({ items });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ items: [], error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    const authHeader = token ? `Bearer ${token}` : request.headers.get('authorization') ?? undefined;
    if (!authHeader) {
      return NextResponse.json({ error: 'احراز هویت الزامی است' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, message, category, priority } = body || {};

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return NextResponse.json({ error: 'موضوع تیکت باید حداقل ۳ حرف باشد.' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'متن تیکت نمی‌تواند خالی باشد.' }, { status: 400 });
    }

    const normalizedCategory =
      category === 'finance' ? 'billing' : category === 'account' ? 'general' : category || 'general';

    const backendRes = await fetch(`${BACKEND_URL}/panel/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        subject: subject.trim(),
        message: message.trim(),
        category: normalizedCategory,
        priority: priority || 'medium',
      }),
    });

    const data = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json({ error: data.message || 'خطا در ثبت تیکت' }, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
