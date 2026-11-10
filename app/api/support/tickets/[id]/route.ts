import { NextResponse } from 'next/server';
import { getTicketDetailServer } from '@/lib/support-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const { status } = body || {};

    if (!status) {
      return NextResponse.json({ error: 'وضعیت جدید مشخص نشده است' }, { status: 400 });
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
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
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
