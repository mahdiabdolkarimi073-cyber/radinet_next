import { NextRequest, NextResponse } from 'next/server';
import { resolveBackendApiUrlForRequest } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const backendUrl = resolveBackendApiUrlForRequest(req.headers.get('host'));
    const authorization = req.headers.get('authorization');
    const response = await fetch(`${backendUrl}/admin/settings/super-admins`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'اتصال به سرور برقرار نیست.' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const backendUrl = resolveBackendApiUrlForRequest(req.headers.get('host'));
    const authorization = req.headers.get('authorization');
    const body = await req.json();
    const response = await fetch(`${backendUrl}/admin/settings/super-admins`, {
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
  } catch {
    return NextResponse.json({ error: 'اتصال به سرور برقرار نیست.' }, { status: 503 });
  }
}
