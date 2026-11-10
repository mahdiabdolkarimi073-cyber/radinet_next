import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-client';
import { extractUserFromHeader } from '@/lib/server-auth';
import { addTicketReplyServer } from '@/lib/support-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = extractUserFromHeader(authHeader);
    const body = await request.json().catch(() => ({}));
    const { message, author_name, author_role, author_id } = body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'متن پاسخ نمی‌تواند خالی باشد.' }, { status: 400 });
    }

    const trimmedMsg = message.trim();
    const authorName = author_name || user?.fullName || 'کارشناس پشتیبانی';
    const authorRole = (author_role || user?.role || 'support_expert') as 'user' | 'support_expert' | 'admin';
    const authorId = author_id || user?.id || user?.userId || 'support-agent';

    // 1. Forward to NestJS backend if token is available
    let backendReply: any = null;
    if (authHeader) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/support/tickets/${id}/reply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({ message: trimmedMsg }),
        });
        if (backendRes.ok) {
          backendReply = await backendRes.json();
        }
      } catch {
        // Backend offline or unreachable, fallback smoothly
      }
    }

    // 2. Persist locally to storage only if backend did not handle it
    const localReply = !backendReply
      ? await addTicketReplyServer(
          id,
          trimmedMsg,
          authorName,
          authorRole,
          authorId
        )
      : null;

    const result = backendReply || {
      id: localReply?.id || `rep-${Date.now()}`,
      message: trimmedMsg,
      createdAt: localReply?.created_at || new Date().toISOString(),
      author: {
        id: authorId,
        fullName: authorName,
        role: authorRole,
      },
    };

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
