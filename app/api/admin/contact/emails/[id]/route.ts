import { NextResponse } from 'next/server';
import { updateSupportEmail, deleteSupportEmail } from '@/lib/contact-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateSupportEmail(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'ایمیل یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error updating email';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await deleteSupportEmail(id);
    if (!deleted) {
      return NextResponse.json({ error: 'ایمیل یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error deleting email';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
