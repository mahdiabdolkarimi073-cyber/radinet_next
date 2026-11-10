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
    const body = await request.json();

    const { message } = body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'متن پاسخ نمی‌تواند خالی باشد.' }, { status: 400 });
    }

    const userName = user?.fullName || 'کاربر بیمار';
    const userId = user?.id || `usr-${Date.now()}`;

    // 1. Persist locally to support storage
    const localReply = await addTicketReplyServer(id, message.trim(), userName, 'user', userId);

    // 2. Also forward to backend if available
    let backendReply: any = null;
    if (authHeader) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/panel/tickets/${id}/reply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({ message: message.trim() }),
        });
        if (backendRes.ok) {
          backendReply = await backendRes.json();
        }
      } catch {
        // Ignore backend offline
      }
    }

    const result = backendReply || {
      id: localReply?.id || `rep-${Date.now()}`,
      message: message.trim(),
      createdAt: localReply?.created_at || new Date().toISOString(),
      author: {
        id: userId,
        fullName: userName,
        role: 'user',
      },
    };

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
