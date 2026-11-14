import { NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = getAuthorizationHeader(req, 'admin');
    const qs = searchParams.toString();
    const response = await fetch(`${backendUrl}/admin/tele-reports${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      pages: 1,
    }));
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json(
      { items: [], total: 0, page: 1, limit: 20, pages: 1, error: err?.message || 'خطا در دریافت لیست' },
      { status: 500 },
    );
  }
}
