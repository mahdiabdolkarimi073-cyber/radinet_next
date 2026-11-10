import { NextResponse } from 'next/server';
import { addTicketReplyServer } from '@/lib/support-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { message, author_name, author_role, author_id } = body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'متن پاسخ نمی‌تواند خالی باشد.' }, { status: 400 });
    }

    const reply = await addTicketReplyServer(
      id,
      message.trim(),
      author_name || 'کارشناس پشتیبانی',
      author_role || 'support_expert',
      author_id
    );

    if (!reply) {
      return NextResponse.json({ error: 'تیکت مورد نظر یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json(reply, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
