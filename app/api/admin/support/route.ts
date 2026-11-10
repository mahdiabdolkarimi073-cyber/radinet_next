import { NextResponse } from 'next/server';
import {
  getAllFaqsAdmin,
  getSupportContactInfoServer,
  listTicketsServer,
} from '@/lib/support-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [contact_info, faqs, ticketsResult] = await Promise.all([
      getSupportContactInfoServer(),
      getAllFaqsAdmin(),
      listTicketsServer({ limit: 100 }),
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
