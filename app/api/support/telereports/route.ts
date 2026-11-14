import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = getAuthorizationHeader(req, 'support_expert');
    const qs = searchParams.toString();
    const bRes = await fetch(`${backendUrl}/support/telereports${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });
    const data = await bRes.json().catch(() => []);
    if (!bRes.ok) {
      return NextResponse.json(data, { status: bRes.status });
    }
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت درخواست‌های تله‌ریپورت' },
      { status: 500 },
    );
  }
}
