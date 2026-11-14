import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-client';
import { extractTokenFromRequest } from '@/lib/server-auth';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(
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

    const backendRes = await fetch(`${BACKEND_URL}/panel/tickets/${encodeURIComponent(id)}`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });

    const data = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.message || 'تیکت یافت نشد' },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
