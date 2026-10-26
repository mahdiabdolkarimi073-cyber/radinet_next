import type { ContactData } from '@/lib/contact-data';
import { getContactDataServer } from '@/lib/contact-storage';

export async function getContactData(): Promise<ContactData> {
  try {
    return await getContactDataServer();
  } catch (err) {
    console.error('Error getting contact data:', err);
    const { fallbackContactData } = await import('@/lib/contact-data');
    return fallbackContactData;
  }
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
