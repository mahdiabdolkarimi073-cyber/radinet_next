import { NextResponse } from 'next/server';
import { generateRequestId, getMe } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const requestId = req.headers.get('x-request-id')?.trim() || generateRequestId();
  const incomingHost = req.headers.get('host');
  const auth = req.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
  const user = await getMe(token, { requestId, incomingHost });
  if (!user) {
    const res = NextResponse.json({ ok: false, requestId }, { status: 401 });
    res.headers.set('X-Request-ID', requestId);
    return res;
  }
  const res = NextResponse.json({ ok: true, requestId, user });
  res.headers.set('X-Request-ID', requestId);
  return res;
}
