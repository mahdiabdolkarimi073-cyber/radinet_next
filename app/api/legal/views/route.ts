import { NextResponse } from 'next/server';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({ ok: true, received: body?.document_type });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
