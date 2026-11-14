import { NextRequest, NextResponse } from 'next/server';
import { extractRequestUser, getAuthorizationHeader } from '@/lib/server-auth';
import {
  adminUpdateCommunicationServer,
  replyToInfoRequestServer,
} from '@/lib/tele-report-storage';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const user = extractRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  try {
    const resolved = await Promise.resolve(context.params);
    const id = decodeURIComponent(resolved.id || '');
    const auth = getAuthorizationHeader(req, 'doctor');
    const body = await req.json();

    if (body?.response && String(body.response).trim()) {
      const updated = await replyToInfoRequestServer(
        id,
        {
          senderRole:
            user.role === 'doctor' || user.role === 'specialist' || user.role === 'radiologist'
              ? 'doctor'
              : 'patient',
          senderId: user.userId,
          senderName: user.fullName || 'کاربر',
          message: String(body.response).trim(),
        },
        auth,
      );
      return NextResponse.json({
        ...updated,
        title: updated.title || updated.subject || '',
        body: updated.body || updated.message || '',
      });
    }

    if (body?.status) {
      const updated = await adminUpdateCommunicationServer(
        id,
        {
          status: body.status,
          actorName: user.fullName || 'پزشک رادیولوژیست',
        },
        auth,
      );
      return NextResponse.json({
        ...updated,
        title: updated.title || updated.subject || '',
        body: updated.body || updated.message || '',
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
