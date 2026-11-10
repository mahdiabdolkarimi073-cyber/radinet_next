import { NextResponse } from 'next/server';
import { updateContactPageContent } from '@/lib/contact-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const updated = await updateContactPageContent(body);
    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error updating contact page';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
