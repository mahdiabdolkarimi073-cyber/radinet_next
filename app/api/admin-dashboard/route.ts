import { NextResponse } from 'next/server';
import { BACKEND_URL as backendUrl } from '@/lib/auth-client';

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const response = await fetch(`${backendUrl}/admin-dashboard`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'اتصال به سرور برقرار نیست.' }, { status: 503 });
  }
}
