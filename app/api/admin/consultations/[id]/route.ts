import { NextResponse } from 'next/server';
import {
  deleteConsultationRequest,
  updateConsultationStatus,
} from '@/lib/about-data';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const updated = await updateConsultationStatus(params.id, body.status);
    if (!updated) {
      return NextResponse.json({ error: 'درخواست یافت نشد' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const success = await deleteConsultationRequest(params.id);
    if (!success) {
      return NextResponse.json({ error: 'درخواست یافت نشد' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: 'درخواست با موفقیت حذف شد' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
