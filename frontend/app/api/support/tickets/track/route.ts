import { NextResponse } from 'next/server';
import { getTicketByTrackingCodeServer } from '@/lib/support-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    if (!q || !q.trim()) {
      return NextResponse.json({ error: 'کد پیگیری یا شماره تماس الزامی است.' }, { status: 400 });
    }

    const ticket = await getTicketByTrackingCodeServer(q.trim());
    if (!ticket) {
      return NextResponse.json(
        { error: 'تیکتی با این شماره پیگیری یا شماره تماس یافت نشد.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, ticket });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
