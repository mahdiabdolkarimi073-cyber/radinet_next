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

const initialTickets: SupportTicket[] = [
  {
    id: 'tck-1001',
    tracking_code: 'RAD-73921',
    subject: 'درخواست راهنمایی در کانفیگ پورت WADO سرور PACS',
    message: 'با سلام، ما پکس بیمارستان را به آی‌پی اختصاصی رادینت هدایت کردیم اما ارتباط تست ناموفق است. لطفا پورت‌های مجاز فایروال را بفرمایید.',
    status: 'pending',
    priority: 'high',
    category: 'technical',
    user_name: 'دکتر محمدرضا صادقی',
    user_email: 'sadeghi@hospital.ir',
    user_phone: '۰۹۱۲۱۱۱۴۴۵۵',
    assigned_to: 'expert-1',
    assigned_expert_name: 'مهندس احمدی (کارشناس ارشد شبکه)',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    replies: [
      {
        id: 'rep-1',
        ticket_id: 'tck-1001',
        author_name: 'مهندس احمدی',
        author_role: 'support_expert',
        message: 'درود بر شما دکتر صادقی گرامی. پورت ورودی استاندارد ۱۰۴ و پورت ۸۰۴۲ برای وب‌سرویس باز هستند. یک فایل کانفیگ نمونه برای ایمیل شما ارسال شد.',
        created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
      },
      {
        id: 'rep-2',
        ticket_id: 'tck-1001',
        author_name: 'دکتر محمدرضا صادقی',
        author_role: 'user',
        message: 'ممنون، فایل دریافت شد و تنظیمات را اعمال کردیم. در حال حاضر تست اولیه انجام شد.',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
  },
  {
    id: 'tck-1002',
    tracking_code: 'RAD-84192',
    subject: 'صدور پیش‌فاکتور رسمی دوره سه‌ماهه پاییز',
    message: 'با سلام، لطفا پیش‌فاکتور رسمی به نام کلینیک تصویربرداری فارابی جهت تمدید اعتبار تله‌ریپورت صادر فرمایید.',
    status: 'resolved',
    priority: 'medium',
    category: 'finance',
    user_name: 'خانم احمدزاده',
    user_email: 'farabi.clinic@yahoo.com',
    user_phone: '۰۹۱۹۳۳۳۷۷۸۸',
    assigned_to: 'expert-2',
    assigned_expert_name: 'واحد حسابداری و فروش',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    replies: [
      {
        id: 'rep-3',
        ticket_id: 'tck-1002',
        author_name: 'واحد حسابداری رادینت',
        author_role: 'support_expert',
        message: 'سلام وقت بخیر، پیش‌فاکتور با اعمال ۱۵ درصد تخفیف همکاری مراکز طرف قرارداد به ایمیل مرکز ارسال گردید.',
        created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
      },
    ],
  },
];

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
  const trackingCode = `RAD-${randomDigits}`;
  const now = new Date().toISOString();

  const newTicket: SupportTicket = {
    id: `tck-${Date.now()}`,
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
  }));

  return { items, total, page, limit };
}

export async function getTicketDetailServer(id: string): Promise<any | null> {
  const db = readDb();
  const list: SupportTicket[] = db.supportTickets || [];
  const ticket = list.find((t) => t.id === id || t.tracking_code === id);
  if (!ticket) return null;

  return {
    id: ticket.id,
    trackingCode: ticket.tracking_code,
    subject: ticket.subject,
    message: ticket.message,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    user: {
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
        fullName: r.author_name,
        role: r.author_role === 'support_expert' ? 'SUPPORT_EXPERT' : r.author_role === 'admin' ? 'ADMIN' : 'USER',
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
  if (idx === -1) return null;

  const now = new Date().toISOString();
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
