import { NextResponse } from 'next/server';
import { createContactMessage, listContactMessages } from '@/lib/contact-storage';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  // Allow Persian and English digits, +, dashes, spaces, min 8 digits
  const clean = phone.replace(/[^\d+۰-۹]/g, '');
  return clean.length >= 7;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'لطفاً نام و نام خانوادگی معتبر وارد نمایید (حداقل ۲ نویسه).' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: 'لطفاً یک آدرس ایمیل معتبر وارد نمایید.' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !isValidPhone(phone.trim())) {
      return NextResponse.json(
        { error: 'لطفاً شماره تماس معتبر وارد نمایید (حداقل ۷ رقم).' },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
      return NextResponse.json(
        { error: 'لطفاً موضوع پیام را مشخص نمایید.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json(
        { error: 'لطفاً متن پیام خود را کامل‌تر وارد نمایید (حداقل ۵ نویسه).' },
        { status: 400 }
      );
    }

    const saved = await createContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return NextResponse.json({
      ok: true,
      message: 'پیام شما با موفقیت ثبت شد و به زودی توسط کارشناسان رادینت بررسی می‌شود.',
      data: saved,
    });
  } catch (err) {
    console.error('Error creating contact message:', err);
    const msg = err instanceof Error ? err.message : 'خطای غیرمنتظره در ثبت پیام';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const messages = await listContactMessages();
    return NextResponse.json(messages);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'خطا در دریافت پیام‌ها';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
