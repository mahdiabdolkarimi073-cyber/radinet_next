import { NextResponse } from 'next/server';
import { getAllPublishedLegalDocumentsServer } from '@/lib/legal-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const docs = await getAllPublishedLegalDocumentsServer();
    return NextResponse.json(docs);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
