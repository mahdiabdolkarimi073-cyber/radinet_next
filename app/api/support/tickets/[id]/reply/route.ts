import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-client';
import { extractUserFromHeader, getAuthorizationHeader } from '@/lib/server-auth';
import { addTicketReplyServer } from '@/lib/support-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const authHeader = getAuthorizationHeader(request, 'support_expert');
    const user = extractUserFromHeader(authHeader);
    const body = await request.json().catch(() => ({}));
    const { message, author_name, author_role, author_id } = body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'متن پاسخ نمی‌تواند خالی باشد.' }, { status: 400 });
    }

    const trimmedMsg = message.trim();
    const authorName = author_name || user?.fullName || 'کارشناس پشتیبانی';
    const authorRole = (author_role || user?.role || 'support_expert') as 'user' | 'support_expert' | 'admin';
    const authorId = author_id || user?.id || user?.userId;

    const backendRes = await fetch(`${BACKEND_URL}/support/tickets/${encodeURIComponent(id)}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ message: trimmedMsg }),
    });

    if (backendRes.ok) {
      return NextResponse.json(await backendRes.json(), { status: 201 });
    }

    const fallbackReply = await addTicketReplyServer(
      id,
      trimmedMsg,
      authorName,
      authorRole,
      authorId,
      authHeader,
    );

    if (!fallbackReply) {
      return NextResponse.json({ error: 'تیکت یافت نشد' }, { status: 404 });
    }

    return NextResponse.json(fallbackReply, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
