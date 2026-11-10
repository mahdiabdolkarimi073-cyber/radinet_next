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

    let backendTicket: any = null;
    if (authHeader) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/support/tickets/${id}`, {
          headers: { Authorization: authHeader },
          cache: 'no-store',
        });
        if (backendRes.ok) {
          backendTicket = await backendRes.json();
        }
      } catch {
        // Backend offline
      }
    }

    const localTicket = await getTicketDetailServer(id);

    if (!backendTicket && !localTicket) {
      return NextResponse.json({ error: 'تیکت یافت نشد' }, { status: 404 });
    }

    if (backendTicket && !localTicket) {
      return NextResponse.json(backendTicket);
    }

    if (!backendTicket && localTicket) {
      return NextResponse.json(localTicket);
    }

    // Merge backendTicket and localTicket replies
    const backendReplies = Array.isArray(backendTicket.replies) ? backendTicket.replies : [];
    const localReplies = Array.isArray(localTicket.replies) ? localTicket.replies : [];

    const normalizeRole = (role?: string): 'user' | 'support' => {
      const r = (role || '').toLowerCase();
      if (r.includes('user') || r.includes('patient')) return 'user';
      return 'support';
    };

    const getReplyKey = (r: any) => {
      const msg = (r.message || '').trim();
      const role = normalizeRole(r.author?.role || r.author_role || r.authorRole);
      return `${msg}_${role}`;
    };

    const seenIds = new Set(backendReplies.map((r: any) => String(r.id || '')));
    const seenKeys = new Set(backendReplies.map(getReplyKey));

    const mergedReplies = [...backendReplies];
    for (const lr of localReplies) {
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

    return NextResponse.json({
      ...backendTicket,
      replies: mergedReplies,
      status: backendTicket.status || localTicket.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const authHeader = request.headers.get('authorization') ?? undefined;
    const body = await request.json();
    const { status } = body || {};

    if (!status) {
      return NextResponse.json({ error: 'وضعیت جدید مشخص نشده است' }, { status: 400 });
    }

    if (authHeader) {
      try {
        if (status === 'closed') {
          await fetch(`${BACKEND_URL}/support/tickets/${id}/close`, {
            method: 'PATCH',
            headers: { Authorization: authHeader },
          });
        }
      } catch {
        // Backend optional
      }
    }

    const { updateTicketStatusServer } = await import('@/lib/support-storage');
    const updated = await updateTicketStatusServer(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'تیکت مورد نظر یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const authHeader = request.headers.get('authorization') ?? undefined;

    if (authHeader) {
      try {
        await fetch(`${BACKEND_URL}/support/tickets/${id}`, {
          method: 'DELETE',
          headers: { Authorization: authHeader },
        });
      } catch {
        // Backend optional
      }
    }

    const { deleteTicketServer } = await import('@/lib/support-storage');
    const success = await deleteTicketServer(id);
    if (!success) {
      return NextResponse.json({ error: 'تیکت مورد نظر یافت نشد یا قبلاً حذف شده است.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'تیکت با موفقیت حذف شد.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
