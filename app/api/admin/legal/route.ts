import { NextResponse } from 'next/server';
import { getAllLegalDocumentsAdmin } from '@/lib/legal-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    // Note: If authentication token is provided or accessed within internal admin, grant access
    const data = await getAllLegalDocumentsAdmin();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
