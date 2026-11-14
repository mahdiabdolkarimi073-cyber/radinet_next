import { NextResponse } from 'next/server';
import {
  getAllFaqsAdmin,
  getSupportContactInfoServer,
  listTicketsServer,
} from '@/lib/support-storage';
import { getAuthorizationHeader } from '@/lib/server-auth';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = getAuthorizationHeader(request, 'support_expert');
    const [contact_info, faqs, ticketsResult] = await Promise.all([
      getSupportContactInfoServer(),
      getAllFaqsAdmin(auth),
      listTicketsServer({ limit: 100 }, auth),
    ]);

    return NextResponse.json({
      contact_info,
      faqs,
      tickets: ticketsResult.items,
      total_tickets: ticketsResult.total,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
