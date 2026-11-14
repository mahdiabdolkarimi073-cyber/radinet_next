import { NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authorization = req.headers.get('authorization');
  try {
    const response = await fetch(`${backendUrl}/admin/settings/general`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ siteName: 'رادینت', logoUrl: '' });
  } catch {
    return NextResponse.json({ siteName: 'رادینت', logoUrl: '' });
  }
}

export async function PATCH(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const body = await req.json();

    const response = await fetch(`${backendUrl}/admin/settings/general`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }
    const errData = await response.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData?.message || 'ذخیره تنظیمات در دیتابیس ناموفق بود.' },
      { status: response.status || 500 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'ذخیره تنظیمات ناموفق بود.' },
      { status: 500 },
    );
  }
}
