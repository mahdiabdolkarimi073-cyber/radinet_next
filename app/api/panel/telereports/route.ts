import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-client';
import { extractTokenFromRequest } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ message: 'لطفاً وارد حساب کاربری خود شوید.' }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/panel/telereports`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({ items: [] }));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت درخواست‌های تله‌ریپورت' },
      { status: 502 },
    );
  }
}
