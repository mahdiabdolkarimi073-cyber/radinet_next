import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-client';
import { getTicketDetailServer } from '@/lib/support-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const authHeader = request.headers.get('authorization') ?? undefined;

    let backendData: any = null;
    if (authHeader) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/panel/tickets/${id}`, {
          headers: { Authorization: authHeader },
          cache: 'no-store',
        });
        if (backendRes.ok) {
          backendData = await backendRes.json();
        }
      } catch {
        // Fallback to local storage
      }
    }

    const { extractUserFromHeader } = await import('@/lib/server-auth');
    const user = extractUserFromHeader(authHeader);

    const localDetail = await getTicketDetailServer(id);
    if (!backendData && !localDetail) {
      return NextResponse.json({ error: 'تیکت یافت نشد' }, { status: 404 });
    }

    // Format local replies
    const localFormattedReplies = (localDetail?.replies || []).map((r: any) => {
      const isUser = (r.author?.role || '').toLowerCase().includes('user') || r.author_role === 'user';
      return {
        id: r.id,
        message: r.message,
        createdAt: r.createdAt || r.created_at,
        author: {
          id: r.author?.id || r.author_id || '',
          fullName: r.author?.fullName || r.author_name || (isUser ? 'کاربر' : 'پشتیبان رادینت'),
          role: isUser ? 'user' : 'support_expert',
        },
      };
    });

    if (backendData) {
      // Merge backend replies with any local replies (e.g. from support who replied via local storage)
      const backendReplies = Array.isArray(backendData.replies) ? backendData.replies : [];

      const normalizeRole = (role?: string): 'user' | 'support' => {
        const r = (role || '').toLowerCase();
        if (r.includes('user') || r.includes('patient')) return 'user';
        return 'support';
      };

      const getReplyKey = (r: any) => {
        const msg = (r.message || '').trim();
        const role = normalizeRole(r.author?.role || r.authorRole || r.author_role);
        return `${msg}_${role}`;
      };

      const seenIds = new Set(backendReplies.map((r: any) => String(r.id || '')));
      const seenKeys = new Set(backendReplies.map(getReplyKey));

      const mergedReplies = [...backendReplies];
      for (const lr of localFormattedReplies) {
        const key = getReplyKey(lr);
        const idStr = String(lr.id || '');
        if (!seenKeys.has(key) && (!idStr || !seenIds.has(idStr))) {
          seenKeys.add(key);
          if (idStr) seenIds.add(idStr);
          mergedReplies.push(lr);
        }
      }

      mergedReplies.sort(
        (a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );

      backendData.replies = mergedReplies;
      return NextResponse.json(backendData);
    }

    // Authorization check for localDetail
    if (user && user.role !== 'admin' && !user.role.startsWith('support')) {
      const isOwner =
        localDetail.userId === user.userId ||
        localDetail.userId === user.id ||
        (localDetail.user?.email && localDetail.user.email.toLowerCase() === user.email.toLowerCase());
      if (!isOwner) {
        return NextResponse.json({ error: 'دسترسی غیرمجاز؛ شما تنها مجاز به مشاهده تیکت‌های خود هستید.' }, { status: 403 });
      }
    }

    // Format for PanelTicketDetail from localDetail
    const formatted = {
      id: localDetail.id,
      trackingCode: localDetail.trackingCode,
      subject: localDetail.subject,
      message: localDetail.message,
      category: localDetail.category || 'general',
      priority: localDetail.priority || 'medium',
      status: localDetail.status || 'open',
      createdAt: localDetail.createdAt,
      updatedAt: localDetail.updatedAt,
      replies: localFormattedReplies,
    };

    return NextResponse.json(formatted);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
