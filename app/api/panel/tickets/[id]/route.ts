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

    if (authHeader) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/panel/tickets/${id}`, {
          headers: { Authorization: authHeader },
          cache: 'no-store',
        });
        if (backendRes.ok) {
          const data = await backendRes.json();
          return NextResponse.json(data);
        }
      } catch {
        // Fallback to local storage
      }
    }

    const { extractUserFromHeader } = await import('@/lib/server-auth');
    const user = extractUserFromHeader(authHeader);

    const localDetail = await getTicketDetailServer(id);
    if (!localDetail) {
      return NextResponse.json({ error: 'تیکت یافت نشد' }, { status: 404 });
    }

    // Authorization check: User can only view their own ticket, support/admin can view all
    if (user && user.role !== 'admin' && !user.role.startsWith('support')) {
      const isOwner =
        localDetail.userId === user.userId ||
        localDetail.userId === user.id ||
        (localDetail.user?.email && localDetail.user.email.toLowerCase() === user.email.toLowerCase());
      if (!isOwner) {
        return NextResponse.json({ error: 'دسترسی غیرمجاز؛ شما تنها مجاز به مشاهده تیکت‌های خود هستید.' }, { status: 403 });
      }
    }

    // Format for PanelTicketDetail
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
      replies: (localDetail.replies || []).map((r: any) => ({
        id: r.id,
        message: r.message,
        createdAt: r.createdAt,
        author: {
          id: r.author?.id || '',
          fullName: r.author?.fullName || 'پشتیبانی',
          role: (r.author?.role || '').toLowerCase().includes('user') ? 'user' : 'support',
        },
      })),
    };

    return NextResponse.json(formatted);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
