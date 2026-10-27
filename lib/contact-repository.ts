// Client-safe contact repository - ZERO Node.js / fs dependencies
import type { ContactData } from '@/lib/contact-data';
import { fallbackContactData } from '@/lib/contact-data';

export async function getContactData(): Promise<ContactData> {
  try {
    const res = await fetch('/api/contact', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.error('Error fetching contact data:', err);
  }
  return fallbackContactData;
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/contact/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.error || 'ارسال پیام ناموفق بود. لطفاً ورودی‌های خود را بررسی کرده و مجدداً تلاش کنید.' };
    }

    return { ok: true };
  } catch (err) {
    console.error('Error submitting contact message:', err);
    return { ok: false, error: 'خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.' };
  }
}
