import { NextResponse } from 'next/server';
import { deleteAboutMedia, updateAboutMedia } from '@/lib/about-data';
import { getAuthorizationHeader } from '@/lib/server-auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const { id } = await Promise.resolve(params);
    const body = await req.json();
    const auth = getAuthorizationHeader(req, 'admin');
    const updated = await updateAboutMedia(id, body, auth);
    if (!updated) {
      return NextResponse.json({ error: 'آیتم مورد نظر یافت نشد' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const { id } = await Promise.resolve(params);
    const auth = getAuthorizationHeader(req, 'admin');
    const success = await deleteAboutMedia(id, auth);
    if (!success) {
      return NextResponse.json({ error: 'آیتم مورد نظر یافت نشد' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: 'تصویر با موفقیت حذف شد' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
