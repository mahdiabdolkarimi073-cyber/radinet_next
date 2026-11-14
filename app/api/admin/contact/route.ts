import { NextResponse } from 'next/server';
import { getAdminContactData } from '@/lib/contact-storage';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = getAuthorizationHeader(request, 'admin');
    const data = await getAdminContactData(auth);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
