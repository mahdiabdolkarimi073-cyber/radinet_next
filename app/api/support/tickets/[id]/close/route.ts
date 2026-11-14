import { NextResponse } from 'next/server';
import { updateTicketStatusServer } from '@/lib/support-storage';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getAuthorizationHeader(request, 'support_expert');
    const updated = await updateTicketStatusServer(id, 'closed', auth);
    if (!updated) {
      return NextResponse.json({ error: 'تیکت مورد نظر یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
