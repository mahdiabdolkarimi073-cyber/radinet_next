import { NextResponse } from 'next/server';
import { getAllLegalDocumentsAdmin } from '@/lib/legal-storage';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = getAuthorizationHeader(request, 'admin');
    const data = await getAllLegalDocumentsAdmin(auth);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
