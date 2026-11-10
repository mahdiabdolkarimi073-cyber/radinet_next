import { NextResponse } from 'next/server';
import { createResponseHour } from '@/lib/contact-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.day_label || !body?.hours) {
      return NextResponse.json({ error: 'عنوان روزها و ساعات کاری الزامی هستند.' }, { status: 400 });
    }
    const created = await createResponseHour({
      day_label: body.day_label,
      hours: body.hours,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      display_order: Number(body.display_order ?? 0),
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error creating response hour';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
