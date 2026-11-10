import { NextResponse } from 'next/server';
import { createFaqServer } from '@/lib/support-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.question || !body?.answer) {
      return NextResponse.json({ error: 'صورت سوال و پاسخ الزامی هستند.' }, { status: 400 });
    }

    const created = await createFaqServer({
      question: body.question,
      answer: body.answer,
      category: body.category,
      display_order: body.display_order,
      is_published: body.is_published,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
