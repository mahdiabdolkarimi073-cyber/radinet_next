// Client-safe types and labels for Support and Ticketing system (Zero Node.js / fs dependencies)

export type SupportFaq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type SupportContactInfo = {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  phone_number: string;
  mobile_number: string;
  email: string;
  working_hours: string;
  emergency_notice: string;
  updated_at: string;
};

export type TicketReplyItem = {
  id: string;
  ticket_id: string;
  author_id?: string;
  author_name: string;
  author_role: 'user' | 'support_expert' | 'admin';
  message: string;
  created_at: string;
};

export type SupportTicket = {
  id: string;
  tracking_code: string;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'waiting_user' | 'closed' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'telereport' | 'finance' | 'technical' | 'account';
  user_id?: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  assigned_to?: string;
  assigned_expert_name?: string;
  created_at: string;
  updated_at: string;
  replies: TicketReplyItem[];
};

export type PublicSupportBundle = {
  contact_info: SupportContactInfo;
  faqs: SupportFaq[];
  categories: string[];
};

export const ticketStatusLabels: Record<string, { label: string; color: string }> = {
  open: { label: 'باز / جدید', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  pending: { label: 'در حال بررسی توسط کارشناس', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  waiting_user: { label: 'پاسخ داده‌شده (در انتظار نظر کاربر)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  resolved: { label: 'حل‌شده', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  closed: { label: 'بسته شده', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const ticketPriorityLabels: Record<string, { label: string; color: string }> = {
  low: { label: 'کم', color: 'text-slate-600 bg-slate-100' },
  medium: { label: 'متوسط', color: 'text-blue-700 bg-blue-50' },
  high: { label: 'زیاد', color: 'text-amber-700 bg-amber-50' },
  urgent: { label: 'بسیار فوری (اورژانسی)', color: 'text-rose-700 bg-rose-50 font-bold' },
};

export const ticketCategoryLabels: Record<string, string> = {
  general: 'عمومی و راهنمایی',
  telereport: 'تله‌رادیولوژی و تفسیر آنلاین',
  technical: 'فنی، شبکه و سامانه PACS',
  finance: 'امور مالی، فاکتور و پرداخت',
  account: 'حساب کاربری و احراز هویت',
};

export const defaultFaqCategories = [
  'همه دسته‌ها',
  'عمومی',
  'تله‌رادیولوژی',
  'فنی و پکس',
  'مالی و پرداخت',
];
