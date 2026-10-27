import { NextResponse } from 'next/server';
import { getTicketDetailServer } from '@/lib/support-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await getTicketDetailServer(id);
    if (!ticket) {
      return NextResponse.json({ error: 'تیکت یافت نشد' }, { status: 404 });
    }
    return NextResponse.json(ticket);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
