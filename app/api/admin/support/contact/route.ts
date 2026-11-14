import { NextResponse } from 'next/server';
import { updateSupportContactInfoServer } from '@/lib/support-storage';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const auth = getAuthorizationHeader(request, 'support_expert');
    const updated = await updateSupportContactInfoServer(body, auth);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
