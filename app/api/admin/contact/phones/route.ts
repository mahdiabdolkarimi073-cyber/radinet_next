import { NextResponse } from 'next/server';
import { createPhoneNumber } from '@/lib/contact-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.phone || !body?.label) {
      return NextResponse.json({ error: 'عنوان و شماره تماس الزامی هستند.' }, { status: 400 });
    }
    const created = await createPhoneNumber({
      label: body.label,
      phone: body.phone,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      display_order: Number(body.display_order ?? 0),
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error creating phone';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
