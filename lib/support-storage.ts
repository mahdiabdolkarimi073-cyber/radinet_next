import { BACKEND_URL as backendUrl } from './auth-client';
import type {
  PublicSupportBundle,
  SupportContactInfo,
  SupportFaq,
  SupportTicket,
  TicketReplyItem,
} from './support-data';

const defaultContactInfo: SupportContactInfo = {
  id: 'support-contact-info',
  hero_title: 'مرکز پشتیبانی و راهنمایی رادینت',
  hero_subtitle: 'کارشناسان و متخصصان فنی رادینت در تمامی ساعات در کنار شما هستند.',
  phone_number: '۰۲۱-۸۸۸۸۱۹۲۰',
  mobile_number: '۰۹۱۲۰۵۴۵۶۷۸',
  email: 'support@radinet.ir',
  working_hours: 'شنبه تا چهارشنبه ۸:۰۰ الی ۱۷:۰۰',
  emergency_notice: 'واحد تله‌ریپورت اورژانس ۲۴ ساعته فعال است.',
  updated_at: new Date().toISOString(),
};

function mapContactInfo(data: any): SupportContactInfo {
  return {
    id: data.id || 'support-contact-info',
    hero_title: data.heroTitle || data.hero_title || defaultContactInfo.hero_title,
    hero_subtitle: data.heroSubtitle || data.hero_subtitle || defaultContactInfo.hero_subtitle,
    phone_number: data.phoneNumber || data.phone_number || defaultContactInfo.phone_number,
    mobile_number: data.mobileNumber || data.mobile_number || defaultContactInfo.mobile_number,
    email: data.email || defaultContactInfo.email,
    working_hours: data.workingHours || data.working_hours || defaultContactInfo.working_hours,
    emergency_notice: data.emergencyNotice || data.emergency_notice || defaultContactInfo.emergency_notice,
    updated_at: data.updatedAt || data.updated_at || new Date().toISOString(),
  };
}

function mapFaq(f: any): SupportFaq {
  return {
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category || 'general',
    display_order: Number(f.displayOrder ?? f.display_order ?? 0),
    is_published: f.isPublished !== undefined ? Boolean(f.isPublished) : Boolean(f.is_published ?? true),
    created_at: f.createdAt || f.created_at || new Date().toISOString(),
    updated_at: f.updatedAt || f.updated_at || new Date().toISOString(),
  };
}

function mapTicket(t: any): SupportTicket {
  const replies: TicketReplyItem[] = Array.isArray(t.replies)
    ? t.replies.map((r: any) => ({
        id: r.id,
        ticket_id: r.ticketId || r.ticket_id || t.id,
        author_id: r.authorId || r.author_id || r.author?.id,
        author_name: r.authorName || r.author_name || r.author?.fullName || 'کاربر',
        author_role: (r.authorRole || r.author_role || r.author?.role || 'user') as 'user' | 'support_expert' | 'admin',
        message: r.message,
        created_at: r.createdAt || r.created_at || new Date().toISOString(),
      }))
    : [];

  return {
    id: t.id,
    tracking_code: t.trackingCode || t.tracking_code || String(t.id || '').slice(0, 8).toUpperCase(),
    subject: t.subject,
    message: t.message,
    status: (t.status || 'open') as SupportTicket['status'],
    priority: (t.priority || 'medium') as SupportTicket['priority'],
    category: (t.category || 'general') as SupportTicket['category'],
    user_id: t.userId || t.user_id || t.user?.id,
    user_name: t.userName || t.user_name || t.user?.fullName || 'کاربر',
    user_email: t.userEmail || t.user_email || t.user?.email || '',
    user_phone: t.userPhone || t.user_phone || '',
    assigned_to: t.assignedTo || t.assigned_to || t.expert?.id,
    assigned_expert_name: t.expert?.fullName || t.assigned_expert_name,
    created_at: t.createdAt || t.created_at || new Date().toISOString(),
    updated_at: t.updatedAt || t.updated_at || new Date().toISOString(),
    replies,
  };
}

export async function getSupportContactInfoServer(): Promise<SupportContactInfo> {
  try {
    const res = await fetch(`${backendUrl}/support/contact-info`, { cache: 'no-store' });
    if (res.ok) {
      return mapContactInfo(await res.json());
    }
  } catch (err) {
    console.error('Error fetching support contact info from backend:', err);
  }
  return defaultContactInfo;
}

export async function updateSupportContactInfoServer(
  input: Partial<SupportContactInfo>,
  auth?: string,
): Promise<SupportContactInfo | null> {
  try {
    const payload: Record<string, unknown> = {};
    if (input.hero_title !== undefined) payload.heroTitle = input.hero_title;
    if (input.hero_subtitle !== undefined) payload.heroSubtitle = input.hero_subtitle;
    if (input.phone_number !== undefined) payload.phoneNumber = input.phone_number;
    if (input.mobile_number !== undefined) payload.mobileNumber = input.mobile_number;
    if (input.email !== undefined) payload.email = input.email;
    if (input.working_hours !== undefined) payload.workingHours = input.working_hours;
    if (input.emergency_notice !== undefined) payload.emergencyNotice = input.emergency_notice;

    const res = await fetch(`${backendUrl}/support/admin/contact-info`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return mapContactInfo(await res.json());
    }
  } catch (err) {
    console.error('Error updating support contact info:', err);
  }
  return null;
}

export async function getPublishedFaqsServer(q?: string, category?: string): Promise<SupportFaq[]> {
  try {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    const qs = params.toString();
    const res = await fetch(`${backendUrl}/support/faqs${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
    if (res.ok) {
      const list = await res.json();
      return (Array.isArray(list) ? list : []).map(mapFaq);
    }
  } catch (err) {
    console.error('Error fetching FAQs from backend:', err);
  }
  return [];
}

export async function getAllFaqsAdmin(auth?: string): Promise<SupportFaq[]> {
  try {
    const res = await fetch(`${backendUrl}/support/admin/faqs`, {
      headers: auth ? { Authorization: auth } : {},
      cache: 'no-store',
    });
    if (res.ok) {
      const list = await res.json();
      return (Array.isArray(list) ? list : []).map(mapFaq);
    }
  } catch (err) {
    console.error('Error fetching admin FAQs from backend:', err);
  }
  return [];
}

export async function createFaqServer(
  input: {
    question: string;
    answer: string;
    category?: string;
    display_order?: number;
    is_published?: boolean;
  },
  auth?: string,
): Promise<SupportFaq | null> {
  try {
    const res = await fetch(`${backendUrl}/support/admin/faqs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({
        question: input.question,
        answer: input.answer,
        category: input.category || 'general',
        displayOrder: input.display_order !== undefined ? Number(input.display_order) : 0,
        isPublished: input.is_published ?? true,
      }),
    });
    if (res.ok) {
      return mapFaq(await res.json());
    }
  } catch (err) {
    console.error('Error creating FAQ:', err);
  }
  return null;
}

export async function updateFaqServer(
  id: string,
  input: Partial<SupportFaq>,
  auth?: string,
): Promise<SupportFaq | null> {
  try {
    const payload: Record<string, unknown> = {};
    if (input.question !== undefined) payload.question = input.question;
    if (input.answer !== undefined) payload.answer = input.answer;
    if (input.category !== undefined) payload.category = input.category;
    if (input.display_order !== undefined) payload.displayOrder = Number(input.display_order);
    if (input.is_published !== undefined) payload.isPublished = Boolean(input.is_published);

    const res = await fetch(`${backendUrl}/support/admin/faqs/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return mapFaq(await res.json());
    }
  } catch (err) {
    console.error('Error updating FAQ:', err);
  }
  return null;
}

export async function deleteFaqServer(id: string, auth?: string): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/support/admin/faqs/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: auth ? { Authorization: auth } : {},
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getPublicSupportBundleServer(): Promise<PublicSupportBundle> {
  try {
    const res = await fetch(`${backendUrl}/support/bundle`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        contact_info: mapContactInfo(data.contact_info || {}),
        faqs: Array.isArray(data.faqs) ? data.faqs.map(mapFaq) : [],
        categories: Array.isArray(data.categories) ? data.categories : ['تله‌رادیولوژی', 'فنی و پکس', 'مالی و تعرفه', 'عمومی'],
      };
    }
  } catch (err) {
    console.error('Error fetching support bundle from backend:', err);
  }
  return {
    contact_info: defaultContactInfo,
    faqs: [],
    categories: ['تله‌رادیولوژی', 'فنی و پکس', 'مالی و تعرفه', 'عمومی'],
  };
}

export async function createTicketServer(input: {
  id?: string;
  tracking_code?: string;
  subject: string;
  message: string;
  user_name: string;
  user_phone: string;
  user_email?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'general' | 'telereport' | 'finance' | 'technical' | 'account';
  user_id?: string;
}): Promise<SupportTicket> {
  const res = await fetch(`${backendUrl}/public-tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: input.subject,
      message: input.message,
      userName: input.user_name,
      userPhone: input.user_phone,
      userEmail: input.user_email,
      priority: input.priority || 'medium',
      category: input.category || 'general',
      userId: input.user_id,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    return {
      id: data.id,
      tracking_code: data.tracking_code,
      subject: data.subject,
      message: input.message,
      status: data.status || 'open',
      priority: input.priority || 'medium',
      category: input.category || 'general',
      user_name: input.user_name,
      user_phone: input.user_phone,
      user_email: input.user_email || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      replies: [],
    };
  }
  const err = await res.json().catch(() => ({}));
  throw new Error(err.message || 'ثبت تیکت ناموفق بود');
}

export async function getTicketByTrackingCodeServer(trackingCode: string): Promise<SupportTicket | null> {
  try {
    const res = await fetch(`${backendUrl}/public-tickets/track/${encodeURIComponent(trackingCode)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      return mapTicket(await res.json());
    }
  } catch (err) {
    console.error('Error tracking ticket in backend:', err);
  }
  return null;
}

export async function getTicketDetailServer(id: string, auth?: string): Promise<SupportTicket | null> {
  try {
    if (auth) {
      const res = await fetch(`${backendUrl}/support/tickets/${encodeURIComponent(id)}`, {
        headers: { Authorization: auth },
        cache: 'no-store',
      });
      if (res.ok) {
        return mapTicket(await res.json());
      }
    }
    return await getTicketByTrackingCodeServer(id);
  } catch (err) {
    console.error('Error getting ticket detail from backend:', err);
  }
  return null;
}

type AddTicketReplyObjectInput = {
  ticket_id: string;
  tracking_code?: string;
  author_id?: string;
  author_name: string;
  author_role: 'user' | 'support_expert' | 'admin';
  message: string;
};

export async function addTicketReplyServer(
  inputOrTicketId: AddTicketReplyObjectInput | string,
  authOrMessage?: string,
  authorName?: string,
  authorRole?: 'user' | 'support_expert' | 'admin',
  authorId?: string,
  authHeader?: string,
): Promise<TicketReplyItem | null> {
  const input: AddTicketReplyObjectInput =
    typeof inputOrTicketId === 'string'
      ? {
          ticket_id: inputOrTicketId,
          message: authOrMessage || '',
          author_name: authorName || 'کاربر',
          author_role: authorRole || 'user',
          author_id: authorId,
        }
      : inputOrTicketId;

  const auth = typeof inputOrTicketId === 'string' ? authHeader : authOrMessage;

  try {
    if (auth && (input.author_role === 'support_expert' || input.author_role === 'admin')) {
      const res = await fetch(`${backendUrl}/support/tickets/${encodeURIComponent(input.ticket_id)}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: auth,
        },
        body: JSON.stringify({ message: input.message }),
      });
      if (res.ok) {
        const r = await res.json();
        return {
          id: r.id,
          ticket_id: r.ticketId || input.ticket_id,
          author_id: r.authorId || r.author?.id || input.author_id,
          author_name: r.author?.fullName || r.authorName || input.author_name,
          author_role: (r.author?.role || r.authorRole || input.author_role) as 'user' | 'support_expert' | 'admin',
          message: r.message,
          created_at: r.createdAt || new Date().toISOString(),
        };
      }
    }

    const code = input.tracking_code || input.ticket_id;
    const res = await fetch(`${backendUrl}/public-tickets/track/${encodeURIComponent(code)}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({
        message: input.message,
        authorName: input.author_name,
        authorRole: input.author_role,
        authorId: input.author_id,
      }),
    });
    if (res.ok) {
      return res.json();
    }
  } catch (err) {
    console.error('Error adding ticket reply in backend:', err);
  }
  return null;
}

export async function listTicketsServer(
  params: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
  auth?: string,
): Promise<{ items: SupportTicket[]; total: number; page: number; limit: number; pages: number }> {
  try {
    const q = new URLSearchParams();
    if (params.status && params.status !== 'all') q.set('status', params.status);
    if (params.priority && params.priority !== 'all') q.set('priority', params.priority);
    if (params.search) q.set('search', params.search);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    const qs = q.toString();

    const res = await fetch(`${backendUrl}/support/tickets${qs ? `?${qs}` : ''}`, {
      headers: auth ? { Authorization: auth } : {},
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const items = (data.items || []).map(mapTicket);
      return {
        items,
        total: data.total || items.length,
        page: data.page || 1,
        limit: data.limit || 20,
        pages: data.pages || 1,
      };
    }
  } catch (err) {
    console.error('Error listing tickets from backend:', err);
  }
  return { items: [], total: 0, page: 1, limit: 20, pages: 1 };
}

export async function listUserTicketsServer(authHeader?: string): Promise<any[]> {
  if (!authHeader) return [];
  try {
    const res = await fetch(`${backendUrl}/panel/tickets`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data?.items) ? data.items : [];
    }
  } catch (err) {
    console.error('Error listing user tickets from backend:', err);
  }
  return [];
}

export async function updateTicketStatusServer(
  id: string,
  status: string,
  auth?: string,
): Promise<SupportTicket | null> {
  try {
    if (status === 'closed') {
      const res = await fetch(`${backendUrl}/support/tickets/${encodeURIComponent(id)}/close`, {
        method: 'PATCH',
        headers: auth ? { Authorization: auth } : {},
      });
      if (res.ok) {
        return mapTicket(await res.json());
      }
    }
    const detail = await getTicketDetailServer(id, auth);
    return detail;
  } catch (err) {
    console.error('Error updating ticket status:', err);
  }
  return null;
}

export async function deleteTicketServer(id: string, auth?: string): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/support/tickets/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: auth ? { Authorization: auth } : {},
    });
    return res.ok;
  } catch {
    return false;
  }
}
