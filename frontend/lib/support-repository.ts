// Client-safe support repository - ZERO Node.js / fs dependencies
import type {
  PublicSupportBundle,
  SupportFaq,
  SupportTicket,
  TicketReplyItem,
} from './support-data';

export async function fetchSupportPublicData(): Promise<PublicSupportBundle> {
  try {
    const res = await fetch('/api/support', { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching support data in repository:', err);
  }

  return {
    contact_info: {
      id: 'default',
      hero_title: 'پشتیبانی رادینت',
      hero_subtitle: 'کارشناسان و متخصصان فنی رادینت در تمامی ساعات در کنار شما هستند.',
      phone_number: '۰۲۱-۸۸۸۸۱۹۲۰',
      mobile_number: '۰۹۱۲۰۵۴۵۶۷۸',
      email: 'support@radinet.ir',
      working_hours: 'شنبه تا چهارشنبه ۸:۰۰ الی ۱۷:۰۰',
      emergency_notice: 'واحد تله‌ریپورت اورژانس ۲۴ ساعته فعال است.',
      updated_at: new Date().toISOString(),
    },
    faqs: [],
    categories: ['همه دسته‌ها', 'عمومی', 'تله‌رادیولوژی', 'فنی و پکس', 'مالی و پرداخت'],
  };
}

export async function searchFaqs(query?: string, category?: string): Promise<SupportFaq[]> {
  try {
    const params = new URLSearchParams();
    if (query?.trim()) params.set('q', query.trim());
    if (category && category !== 'همه دسته‌ها' && category !== 'all') params.set('category', category);

    const res = await fetch(`/api/support/faqs?${params.toString()}`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error searching faqs:', err);
  }
  return [];
}

export async function submitTicket(input: {
  subject: string;
  message: string;
  category: string;
  priority: string;
  user_name: string;
  user_email: string;
  user_phone: string;
}): Promise<{ ok: boolean; ticket?: SupportTicket; error?: string }> {
  try {
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.error || 'خطا در ثبت تیکت پشتیبانی.' };
    }

    return { ok: true, ticket: data.ticket };
  } catch (err) {
    console.error('Error submitting ticket:', err);
    return { ok: false, error: 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.' };
  }
}

export async function trackTicket(
  codeOrPhone: string
): Promise<{ ok: boolean; ticket?: SupportTicket; error?: string }> {
  try {
    const res = await fetch(`/api/support/tickets/track?q=${encodeURIComponent(codeOrPhone.trim())}`, {
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.error || 'تیکتی با این شماره پیگیری یا شماره تماس یافت نشد.' };
    }

    return { ok: true, ticket: data.ticket };
  } catch (err) {
    console.error('Error tracking ticket:', err);
    return { ok: false, error: 'خطا در بررسی وضعیت تیکت.' };
  }
}

export async function sendTicketReply(input: {
  ticketId: string;
  message: string;
  authorName: string;
}): Promise<{ ok: boolean; reply?: TicketReplyItem; error?: string }> {
  try {
    const res = await fetch(`/api/support/tickets/${input.ticketId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input.message,
        author_name: input.authorName,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.error || 'ارسال پاسخ ناموفق بود.' };
    }

    return { ok: true, reply: data };
  } catch (err) {
    console.error('Error sending reply:', err);
    return { ok: false, error: 'خطا در ارسال پیام به سرور.' };
  }
}
