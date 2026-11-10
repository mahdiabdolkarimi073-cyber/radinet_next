import { NextRequest, NextResponse } from 'next/server';
import { extractRequestUser } from '@/lib/server-auth';
import {
  adminUpdateCommunicationServer,
  replyToInfoRequestServer,
} from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = extractRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  try {
    const id = decodeURIComponent(params.id || '');
    const body = await req.json();

    if (body?.response && String(body.response).trim()) {
      const updated = replyToInfoRequestServer(id, {
        senderRole: user.role === 'doctor' || user.role === 'specialist' ? 'doctor' : 'patient',
        senderId: user.userId,
        senderName: user.fullName || 'کاربر',
        message: String(body.response).trim(),
      });
      return NextResponse.json({
        ...updated,
        title: updated.subject,
        body: updated.message,
      });
    }

    if (body?.status) {
      const updated = adminUpdateCommunicationServer(id, {
        status: body.status,
        actorName: user.fullName || 'پزشک رادیولوژیست',
      });
      return NextResponse.json({
        ...updated,
        title: updated.subject,
        body: updated.message,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'خطا در به‌روزرسانی درخواست اطلاعات تکمیلی' },
      { status: 400 },
    );
  }
}
