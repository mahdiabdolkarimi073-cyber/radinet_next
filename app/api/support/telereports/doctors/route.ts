import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationHeader } from '@/lib/server-auth';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = getAuthorizationHeader(req, 'support_expert');
    const response = await fetch(`${backendUrl}/support/telereports/doctors`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });
    const data = await response.json().catch(() => []);
    return NextResponse.json(Array.isArray(data) ? data : data?.items ?? [], {
      status: response.status,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || 'خطا در دریافت لیست پزشکان رادیولوژیست' },
      { status: 502 },
    );
  }
}
