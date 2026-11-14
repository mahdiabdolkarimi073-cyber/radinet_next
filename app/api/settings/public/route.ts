import { NextRequest, NextResponse } from 'next/server';
import { resolveBackendApiUrlForRequest } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const backendUrl = resolveBackendApiUrlForRequest(req.headers.get('host'));
    const res = await fetch(`${backendUrl}/admin/settings/public`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.siteName === 'string') {
        return NextResponse.json(data);
      }
    }
  } catch {}

  return NextResponse.json({ siteName: 'رادینت', logoUrl: '' });
}
