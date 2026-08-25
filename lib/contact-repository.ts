import type {
  ContactData,
  ContactPageContent,
  ContactPhoneNumber,
  ContactSupportEmail,
  ContactResponseHour,
} from '@/lib/contact-data';
import { fallbackContactData } from '@/lib/contact-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fetchJson<T>(path: string, params?: string): Promise<T | null> {
  if (!supabaseUrl || !supabaseKey) return null;
  const url = `${supabaseUrl}/rest/v1/${path}${params ? `?${params}` : ''}`;
  const res = await fetch(url, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export async function getContactData(): Promise<ContactData> {
  const [pageRows, phones, emails, hours] = await Promise.all([
    fetchJson<ContactPageContent[]>('contact_page_content', 'limit=1'),
    fetchJson<ContactPhoneNumber[]>('contact_phone_numbers', 'is_active=eq.true&order=display_order.asc'),
    fetchJson<ContactSupportEmail[]>('contact_support_emails', 'is_active=eq.true&order=display_order.asc'),
    fetchJson<ContactResponseHour[]>('contact_response_hours', 'is_active=eq.true&order=display_order.asc'),
  ]);

  return {
    page: Array.isArray(pageRows) && pageRows[0] ? pageRows[0] : fallbackContactData.page,
    phones: Array.isArray(phones) && phones.length ? phones : fallbackContactData.phones,
    emails: Array.isArray(emails) && emails.length ? emails : fallbackContactData.emails,
    hours: Array.isArray(hours) && hours.length ? hours : fallbackContactData.hours,
  };
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseUrl || !supabaseKey) {
    return { ok: false, error: 'اتصال به سرور برقرار نیست.' };
  }
  const res = await fetch(`${supabaseUrl}/rest/v1/contact_messages`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    return { ok: false, error: 'ارسال پیام ناموفق بود. لطفاً دوباره تلاش کنید.' };
  }
  return { ok: true };
}
