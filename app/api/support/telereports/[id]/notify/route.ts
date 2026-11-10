import { NextRequest, NextResponse } from 'next/server';
import { extractAdminOrSupportUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const actor = extractAdminOrSupportUser(req);
  if (!actor) {
    return NextResponse.json({ message: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    notification: {
      requestId: context.params.id,
      recipient: body?.recipient || 'patient',
      message: body?.message || '',
      sentBy: actor.userId,
      sentAt: new Date().toISOString(),
    },
  });
}
