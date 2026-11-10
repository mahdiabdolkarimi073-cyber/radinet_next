import fs from 'fs';
import path from 'path';
import type {
  SupportContactInfo,
  SupportFaq,
  SupportTicket,
  TicketReplyItem,
} from './support-data';

function getDbFilePath(): string {
  const localData = path.join(process.cwd(), 'data', 'radinet_db.json');
  if (fs.existsSync(localData)) return localData;
  const frontendData = path.join(process.cwd(), 'frontend', 'data', 'radinet_db.json');
  if (fs.existsSync(frontendData)) return frontendData;
  if (fs.existsSync(path.join(process.cwd(), 'frontend'))) {
    return frontendData;
  }
  return localData;
}

const initialContactInfo: SupportContactInfo = {
  id: 'support-contact-1',
  hero_title: 'مرکز پشتیبانی و راهنمایی رادینت',
  hero_subtitle: 'کارشناسان و متخصصان فنی رادینت در تمامی ساعات در کنار شما هستند.',
  phone_number: '۰۲۱-۸۸۸۸۱۹۲۰',
  mobile_number: '۰۹۱۲۰۵۴۵۶۷۸',
  email: 'support@radinet.ir',
  working_hours: 'شنبه تا چهارشنبه ۸:۰۰ الی ۱۷:۰۰ | پنج‌شنبه‌ها ۸:۰۰ الی ۱۳:۰۰',
  emergency_notice: 'واحد تله‌ریپورت اورژانس و پشتیبانی سرورهای ابری به صورت ۲۴ ساعته و شبانه‌روزی فعال است.',
  updated_at: new Date().toISOString(),
};

const initialFaqs: SupportFaq[] = [
  {
    id: 'faq-1',
    question: 'چگونه می‌توانم درخواست تفسیر و تله‌رادیولوژی ثبت کنم؟',
    answer: 'پس از ورود به حساب کاربری یا پنل مرکز درمانی، وارد بخش تله‌ریپورت شوید، فایل DICOM یا آرشیو تصویربرداری را آپلود نموده و مشخصات بیمار و فوریت تشخیصی را تعیین کنید. سیستم به صورت خودکار پرونده را به متخصص رادیولوژیست مربوطه ارجاع می‌دهد.',
    category: 'تله‌رادیولوژی',
    display_order: 1,
    is_published: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-2',
    question: 'زمان اعلام نتایج و صدور گزارش تله‌ریپورت چقدر است؟',
    answer: 'برای موارد اورژانسی (تروما، سکته مغزی و بستری فوری) گزارش کمتر از ۳۰ دقیقه صادر می‌شود. برای درخواست‌های روتین، گزارش‌نویسی دقیق بین ۲ تا ۴ ساعت کاری پس از دریافت کامل فایل‌ها تکمیل می‌گردد.',
    category: 'تله‌رادیولوژی',
    display_order: 2,
    is_published: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-3',
    question: 'شرایط اتصال سرور PACS مرکز تصویربرداری به رادینت چیست؟',
    answer: 'سامانه رادینت از کلیه پروتکل‌های استاندارد DICOM C-STORE, WADO و استانداردهای HL7 پشتیبانی می‌کند. تیم فنی رادینت بدون نیاز به تغییر تجهیزات شما، در کمتر از چند ساعت روتر اختصاصی تله‌رادیولوژی را به صورت ایمن راه‌اندازی می‌نماید.',
    category: 'فنی و پکس',
    display_order: 3,
    is_published: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-4',
    question: 'نحوه محاسبه هزینه‌ها و تعرفه گزارش‌نویسی چگونه است؟',
    answer: 'تعرفه‌ها مطابق با ضوابط مصوب وزارت بهداشت و نوع مدالیته تصویربرداری (سی‌تی‌اسکن، ام‌آر‌آی، ماموگرافی، رادیوگرافی ساده و...) با تخفیف‌های قراردادی ویژه مراکز محاسبه می‌شود. در انتهای هر دوره، صورتحساب رسمی صادر می‌گردد.',
    category: 'مالی و پرداخت',
    display_order: 4,
    is_published: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-5',
    question: 'آیا امنیت و محرمانگی پرونده‌های بیماران تضمین شده است؟',
    answer: 'بله، تمامی انتقال‌های داده با رمزنگاری ۲۵۶ بیتی SSL/TLS انجام می‌پذیرد و سرورهای ذخیره‌سازی داده‌های پزشکی دارای گواهینامه‌های امنیتی ISO 27001 و انطباق با پروتکل‌های حفاظت از داده‌های سلامت هستند.',
    category: 'عمومی',
    display_order: 5,
    is_published: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-6',
    question: 'در صورت قطعی اینترنت یا کندی سرعت، روند ارسال تصاویر چگونه انجام می‌شود؟',
    answer: 'کلاینت آپلود رادینت مجهز به سیستم فشرده‌سازی هوشمند بدون افت کیفیت و Resume خودکار است؛ به این معنی که با هر نوسان شبکه، فرآیند ارسال متوقف نشده و پس از برقراری مجدد اتصال از همان نقطه ادامه می‌یابد.',
    category: 'فنی و پکس',
    display_order: 6,
    is_published: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialTickets: SupportTicket[] = [];

function readDb(): any {
  const filePath = getDbFilePath();
  const dir = path.dirname(filePath);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      const initial = {
        supportContactInfo: initialContactInfo,
        supportFaqs: initialFaqs,
        supportTickets: initialTickets,
      };
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const db = JSON.parse(raw);
    let changed = false;

    if (!db.supportContactInfo) {
      db.supportContactInfo = initialContactInfo;
      changed = true;
    }
    if (!db.supportFaqs || !Array.isArray(db.supportFaqs)) {
      db.supportFaqs = initialFaqs;
      changed = true;
    }
    if (!db.supportTickets || !Array.isArray(db.supportTickets)) {
      db.supportTickets = initialTickets;
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
    }
    return db;
  } catch (err) {
    console.error('Error reading support db:', err);
    return {
      supportContactInfo: initialContactInfo,
      supportFaqs: initialFaqs,
      supportTickets: initialTickets,
    };
  }
}

function writeDb(db: any) {
  const filePath = getDbFilePath();
  const dir = path.dirname(filePath);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing support storage radinet_db.json:', err);
  }
}

// ── FAQs Operations ──

export async function getPublishedFaqsServer(
  searchQuery?: string,
  category?: string
): Promise<SupportFaq[]> {
  const db = readDb();
  let list: SupportFaq[] = (db.supportFaqs || []).filter((f: SupportFaq) => f.is_published);

  if (category && category !== 'all' && category !== 'همه دسته‌ها') {
    list = list.filter((f) => f.category === category);
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    list = list.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

export async function getAllFaqsAdmin(): Promise<SupportFaq[]> {
  const db = readDb();
  return (db.supportFaqs || []).sort(
    (a: SupportFaq, b: SupportFaq) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );
}

export async function createFaqServer(data: {
  question: string;
  answer: string;
  category?: string;
  display_order?: number;
  is_published?: boolean;
}): Promise<SupportFaq> {
  const db = readDb();
  db.supportFaqs = db.supportFaqs || [];

  const now = new Date().toISOString();
  const newFaq: SupportFaq = {
    id: `faq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    question: data.question.trim(),
    answer: data.answer.trim(),
    category: data.category?.trim() || 'عمومی',
    display_order: Number(data.display_order ?? (db.supportFaqs.length + 1)),
    is_published: data.is_published !== undefined ? Boolean(data.is_published) : true,
    created_at: now,
    updated_at: now,
  };

  db.supportFaqs.push(newFaq);
  writeDb(db);
  return newFaq;
}

export async function updateFaqServer(
  id: string,
  data: Partial<SupportFaq>
): Promise<SupportFaq | null> {
  const db = readDb();
  const list: SupportFaq[] = db.supportFaqs || [];
  const idx = list.findIndex((f) => f.id === id);
  if (idx === -1) return null;

  const updated: SupportFaq = {
    ...list[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };

  list[idx] = updated;
  db.supportFaqs = list;
  writeDb(db);
  return updated;
}

export async function deleteFaqServer(id: string): Promise<boolean> {
  const db = readDb();
  const initialLen = (db.supportFaqs || []).length;
  db.supportFaqs = (db.supportFaqs || []).filter((f: SupportFaq) => f.id !== id);
  if (db.supportFaqs.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

// ── Contact Info Operations ──

export async function getSupportContactInfoServer(): Promise<SupportContactInfo> {
  const db = readDb();
  return db.supportContactInfo || initialContactInfo;
}

export async function updateSupportContactInfoServer(
  data: Partial<SupportContactInfo>
): Promise<SupportContactInfo> {
  const db = readDb();
  const current: SupportContactInfo = db.supportContactInfo || initialContactInfo;

  const updated: SupportContactInfo = {
    ...current,
    ...data,
    updated_at: new Date().toISOString(),
  };

  db.supportContactInfo = updated;
  writeDb(db);
  return updated;
}

// ── Tickets Operations ──

export async function createTicketServer(input: {
  id?: string;
  tracking_code?: string;
  subject: string;
  message: string;
  category?: 'general' | 'telereport' | 'finance' | 'technical' | 'account';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  user_name: string;
  user_email: string;
  user_phone: string;
  user_id?: string;
}): Promise<SupportTicket> {
  const db = readDb();
  db.supportTickets = db.supportTickets || [];

  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const trackingCode = input.tracking_code?.trim() || `RAD-${randomDigits}`;
  const now = new Date().toISOString();

  // If a ticket with this ID already exists, update and return it
  if (input.id) {
    const existingIdx = db.supportTickets.findIndex((t: SupportTicket) => t.id === input.id);
    if (existingIdx !== -1) {
      db.supportTickets[existingIdx].subject = input.subject.trim();
      db.supportTickets[existingIdx].message = input.message.trim();
      db.supportTickets[existingIdx].updated_at = now;
      writeDb(db);
      return db.supportTickets[existingIdx];
    }
  }

  const newTicket: SupportTicket = {
    id: input.id || `tck-${Date.now()}`,
    tracking_code: trackingCode,
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: 'open',
    priority: input.priority || 'medium',
    category: input.category || 'general',
    user_name: input.user_name.trim(),
    user_email: input.user_email.trim(),
    user_phone: input.user_phone.trim(),
    user_id: input.user_id,
    created_at: now,
    updated_at: now,
    replies: [],
  };

  db.supportTickets.unshift(newTicket);
  writeDb(db);
  return newTicket;
}

export async function listTicketsServer(params?: {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: any[]; total: number; page: number; limit: number }> {
  const db = readDb();
  let list: SupportTicket[] = db.supportTickets || [];

  if (params?.status && params.status !== 'all') {
    list = list.filter((t) => t.status === params.status);
  }
  if (params?.priority && params.priority !== 'all') {
    list = list.filter((t) => t.priority === params.priority);
  }
  if (params?.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q) ||
        t.tracking_code.toLowerCase().includes(q) ||
        t.user_name.toLowerCase().includes(q) ||
        t.user_phone.includes(q) ||
        t.user_email.toLowerCase().includes(q)
    );
  }

  const total = list.length;
  const page = Math.max(Number(params?.page) || 1, 1);
  const limit = Math.max(Number(params?.limit) || 50, 1);
  const paged = list.slice((page - 1) * limit, page * limit);

  // Map to structure compatible with support panel
  const items = paged.map((t) => ({
    id: t.id,
    trackingCode: t.tracking_code,
    subject: t.subject,
    message: t.message,
    status: t.status,
    priority: t.priority,
    category: t.category,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    user: {
      fullName: t.user_name,
      email: t.user_email,
      phone: t.user_phone,
    },
    expert: t.assigned_expert_name ? { fullName: t.assigned_expert_name } : undefined,
    repliesCount: t.replies ? t.replies.length : 0,
    replies: (t.replies || []).map((r) => ({
      id: r.id,
      message: r.message,
      createdAt: r.created_at,
      author: {
        id: r.author_id || '',
        fullName: r.author_name,
        role: r.author_role === 'support_expert' ? 'support_expert' : r.author_role === 'admin' ? 'admin' : 'user',
      },
    })),
  }));

  return { items, total, page, limit };
}

export async function listUserTicketsServer(userIdOrEmail?: string): Promise<any[]> {
  const db = readDb();
  const list: SupportTicket[] = db.supportTickets || [];
  if (!userIdOrEmail || !userIdOrEmail.trim()) {
    return [];
  }
  const q = userIdOrEmail.trim().toLowerCase();
  const matched = list.filter(
    (t) =>
      (t.user_id && t.user_id === userIdOrEmail) ||
      (t.user_email && t.user_email.toLowerCase() === q) ||
      (t.user_phone && t.user_phone === userIdOrEmail)
  );

  return matched.map((t) => ({
    id: t.id,
    userId: t.user_id,
    trackingCode: t.tracking_code,
    subject: t.subject,
    message: t.message,
    category: t.category || 'general',
    priority: t.priority || 'medium',
    status: t.status || 'open',
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    _count: { replies: (t.replies || []).length },
  }));
}

export async function getTicketDetailServer(id: string): Promise<any | null> {
  const db = readDb();
  const list: SupportTicket[] = db.supportTickets || [];
  const ticket = list.find((t) => t.id === id || t.tracking_code === id);
  if (!ticket) {
    const rawTickets: any[] = db.tickets || [];
    const t = rawTickets.find((item) => item.id === id || item.ticketNumber === id || item.tracking_code === id);
    if (t) {
      const messages = Array.isArray(t.messages) ? t.messages : [];
      const replies = Array.isArray(t.replies)
        ? t.replies
        : messages.slice(1).map((m: any) => ({
            id: m.id,
            ticket_id: t.id,
            author_id: m.senderId,
            author_name: m.senderName,
            author_role: m.senderRole === 'support' ? 'support_expert' : m.senderRole === 'admin' ? 'admin' : 'user',
            message: m.body,
            created_at: m.createdAt,
          }));
      return {
        id: t.id,
        userId: t.userId || t.user_id,
        trackingCode: t.ticketNumber || t.tracking_code || t.id,
        subject: t.subject,
        message: t.message || (messages[0]?.body) || '',
        status: t.status,
        priority: t.priority,
        category: t.category,
        createdAt: t.createdAt || t.created_at,
        updatedAt: t.updatedAt || t.updated_at,
        user: {
          id: t.userId || t.user_id,
          fullName: t.userName || t.user_name || 'کاربر',
          email: t.userEmail || t.user_email || '',
          phone: t.userPhone || t.user_phone || '',
        },
        replies: replies.map((r: any) => ({
          id: r.id,
          message: r.message,
          createdAt: r.created_at,
          author: {
            id: r.author_id || '',
            fullName: r.author_name,
            role: r.author_role === 'support_expert' ? 'support_expert' : r.author_role === 'admin' ? 'admin' : 'user',
          },
        })),
      };
    }
    return null;
  }

  return {
    id: ticket.id,
    userId: ticket.user_id,
    trackingCode: ticket.tracking_code,
    subject: ticket.subject,
    message: ticket.message,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    user: {
      id: ticket.user_id,
      fullName: ticket.user_name,
      email: ticket.user_email,
      phone: ticket.user_phone,
    },
    expert: ticket.assigned_expert_name ? { fullName: ticket.assigned_expert_name } : undefined,
    replies: (ticket.replies || []).map((r) => ({
      id: r.id,
      message: r.message,
      createdAt: r.created_at,
      author: {
        id: r.author_id || '',
        fullName: r.author_name,
        role: r.author_role === 'support_expert' ? 'support_expert' : r.author_role === 'admin' ? 'admin' : 'user',
      },
    })),
  };
}

export async function getTicketByTrackingCodeServer(
  query: string
): Promise<SupportTicket | null> {
  const db = readDb();
  const list: SupportTicket[] = db.supportTickets || [];
  const q = query.trim().toUpperCase();

  const ticket = list.find(
    (t) =>
      t.tracking_code.toUpperCase() === q ||
      t.id.toUpperCase() === q ||
      t.user_phone.trim() === query.trim()
  );
  return ticket || null;
}

export async function addTicketReplyServer(
  ticketId: string,
  message: string,
  authorName: string,
  authorRole: 'user' | 'support_expert' | 'admin' = 'user',
  authorId?: string
): Promise<TicketReplyItem | null> {
  const db = readDb();
  const list: SupportTicket[] = db.supportTickets || [];
  const idx = list.findIndex((t) => t.id === ticketId || t.tracking_code === ticketId);
  const now = new Date().toISOString();

  if (idx === -1) {
    const rawTickets: any[] = db.tickets || [];
    const tIdx = rawTickets.findIndex((t) => t.id === ticketId || t.ticketNumber === ticketId || t.tracking_code === ticketId);
    if (tIdx !== -1) {
      const reply: TicketReplyItem = {
        id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ticket_id: rawTickets[tIdx].id,
        author_id: authorId,
        author_name: authorName.trim(),
        author_role: authorRole,
        message: message.trim(),
        created_at: now,
      };
      rawTickets[tIdx].replies = rawTickets[tIdx].replies || [];
      rawTickets[tIdx].replies.push(reply);
      rawTickets[tIdx].messages = rawTickets[tIdx].messages || [];
      rawTickets[tIdx].messages.push({
        id: reply.id,
        senderId: authorId || 'support',
        senderName: authorName.trim(),
        senderRole: authorRole === 'user' ? 'patient' : 'support',
        body: message.trim(),
        createdAt: now,
      });
      rawTickets[tIdx].updated_at = now;
      rawTickets[tIdx].updatedAt = now;
      db.tickets = rawTickets;
      writeDb(db);
      return reply;
    }
    return null;
  }

  const reply: TicketReplyItem = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ticket_id: list[idx].id,
    author_id: authorId,
    author_name: authorName.trim(),
    author_role: authorRole,
    message: message.trim(),
    created_at: now,
  };

  list[idx].replies = list[idx].replies || [];
  list[idx].replies.push(reply);
  list[idx].updated_at = now;

  // Auto transition status
  if (authorRole === 'support_expert' || authorRole === 'admin') {
    list[idx].status = 'waiting_user';
  } else {
    list[idx].status = 'pending';
  }

  db.supportTickets = list;
  writeDb(db);
  return reply;
}

export async function updateTicketStatusServer(
  id: string,
  status: 'open' | 'pending' | 'waiting_user' | 'closed' | 'resolved'
): Promise<SupportTicket | null> {
  const db = readDb();
  const list: SupportTicket[] = db.supportTickets || [];
  const idx = list.findIndex((t) => t.id === id || t.tracking_code === id);
  if (idx === -1) return null;

  list[idx].status = status;
  list[idx].updated_at = new Date().toISOString();
  db.supportTickets = list;
  writeDb(db);
  return list[idx];
}

export async function deleteTicketServer(id: string): Promise<boolean> {
  const db = readDb();
  const list: SupportTicket[] = db.supportTickets || [];
  const initialLen = list.length;
  const filtered = list.filter((t) => t.id !== id && t.tracking_code !== id);
  if (filtered.length !== initialLen) {
    db.supportTickets = filtered;
    writeDb(db);
    return true;
  }
  return false;
}

