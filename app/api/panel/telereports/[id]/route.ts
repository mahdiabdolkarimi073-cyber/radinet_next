import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const auth = req.headers.get('authorization');
  if (!auth) {
    return NextResponse.json({ message: 'لطفاً وارد حساب کاربری خود شوید.' }, { status: 401 });
  }

  const id = decodeURIComponent(context.params.id || '');
  try {
    const res = await fetch(`${BACKEND_URL}/panel/telereports/${id}`, {
      headers: {
        Authorization: auth,
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }
  } catch {
    // Proceed to fallback
  }

  try {
    const { getTeleReportRequestByNumberOrIdServer } = await import('@/lib/tele-report-storage');
    const item = await getTeleReportRequestByNumberOrIdServer(id);
    if (!item) {
      return NextResponse.json({ message: 'درخواست یافت نشد' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت درخواست' },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const auth = req.headers.get('authorization');
  if (!auth) {
    return NextResponse.json({ message: 'لطفاً وارد حساب کاربری خود شوید.' }, { status: 401 });
  }

  const id = decodeURIComponent(context.params.id || '');
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/panel/telereports/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
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
