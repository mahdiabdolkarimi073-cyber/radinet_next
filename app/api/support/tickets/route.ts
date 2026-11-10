import { NextResponse } from 'next/server';
import {
  createTicketServer,
  listTicketsServer,
} from '@/lib/support-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 50;

    const result = await listTicketsServer({ status, priority, search, page, limit });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, message, user_name, user_phone, user_email, priority, category } = body || {};

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return NextResponse.json({ error: 'لطفاً موضوع تیکت را مشخص نمایید (حداقل ۳ حرف).' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: 'لطفاً شرح درخواست خود را کامل‌تر بنویسید (حداقل ۵ حرف).' }, { status: 400 });
    }

    if (!user_name || typeof user_name !== 'string' || user_name.trim().length < 2) {
      return NextResponse.json({ error: 'نام و نام خانوادگی الزامی است.' }, { status: 400 });
    }

    if (!user_phone || typeof user_phone !== 'string' || user_phone.trim().length < 7) {
      return NextResponse.json({ error: 'شماره تماس معتبر جهت پیگیری الزامی است.' }, { status: 400 });
    }

    const ticket = await createTicketServer({
      subject: subject.trim(),
      message: message.trim(),
      user_name: user_name.trim(),
      user_phone: user_phone.trim(),
      user_email: user_email ? user_email.trim() : '',
      priority: priority || 'medium',
      category: category || 'general',
    });

    return NextResponse.json({
      ok: true,
      message: `تیکت شما با کد پیگیری ${ticket.tracking_code} با موفقیت ثبت شد.`,
      ticket,
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
