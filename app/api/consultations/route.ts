import { NextResponse } from 'next/server';
import {
  createConsultationRequest,
  getAllConsultationRequests,
} from '@/lib/about-data';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      return NextResponse.json({ error: 'نام و نام خانوادگی الزامی است (حداقل ۲ کاراکتر)' }, { status: 400 });
    }

    if (!body.phone || typeof body.phone !== 'string' || body.phone.trim().length < 7) {
      return NextResponse.json({ error: 'شماره تماس الزامی و نامعتبر است' }, { status: 400 });
    }

    const created = await createConsultationRequest({
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim(),
      message: body.message?.trim(),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const list = await getAllConsultationRequests();
    return NextResponse.json(list);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
