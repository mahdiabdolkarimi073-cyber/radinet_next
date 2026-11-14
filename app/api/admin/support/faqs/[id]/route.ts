import { NextResponse } from 'next/server';
import { updateFaqServer, deleteFaqServer } from '@/lib/support-storage';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const auth = getAuthorizationHeader(request, 'support_expert');
    const updated = await updateFaqServer(id, body, auth);
    if (!updated) {
      return NextResponse.json({ error: 'سوال مورد نظر یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getAuthorizationHeader(request, 'support_expert');
    const deleted = await deleteFaqServer(id, auth);
    if (!deleted) {
      return NextResponse.json({ error: 'سوال مورد نظر یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
