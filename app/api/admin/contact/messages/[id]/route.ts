import { NextResponse } from 'next/server';
import { updateContactMessageStatus, deleteContactMessage } from '@/lib/contact-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body?.status) {
      return NextResponse.json({ error: 'وضعیت پیام مشخص نشده است.' }, { status: 400 });
    }
    const updated = await updateContactMessageStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ error: 'پیام موردنظر یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error updating message status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await deleteContactMessage(id);
    if (!deleted) {
      return NextResponse.json({ error: 'پیام موردنظر یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error deleting message';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
