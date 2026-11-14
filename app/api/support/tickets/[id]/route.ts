import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-client';
import { getAuthorizationHeader } from '@/lib/server-auth';
import {
  deleteTicketServer,
  getTicketDetailServer,
  updateTicketStatusServer,
} from '@/lib/support-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const authHeader = getAuthorizationHeader(request, 'support_expert');
    const res = await fetch(`${BACKEND_URL}/support/tickets/${encodeURIComponent(id)}`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
    const detail = await getTicketDetailServer(id, authHeader);
    if (!detail) {
      return NextResponse.json({ error: 'تیکت یافت نشد' }, { status: 404 });
    }
    return NextResponse.json(detail);
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
    const authHeader = getAuthorizationHeader(request, 'support_expert');
    const body = await request.json();
    const { status } = body || {};

    if (!status) {
      return NextResponse.json({ error: 'وضعیت جدید مشخص نشده است' }, { status: 400 });
    }

    const updated = await updateTicketStatusServer(id, status, authHeader);
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
    const authHeader = getAuthorizationHeader(request, 'support_expert');
    const success = await deleteTicketServer(id, authHeader);
    if (!success) {
      return NextResponse.json({ error: 'تیکت مورد نظر یافت نشد یا قبلاً حذف شده است.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'تیکت با موفقیت حذف شد.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
