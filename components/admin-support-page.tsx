'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Clock3,
  Edit3,
  ExternalLink,
  Eye,
  Headphones,
  Inbox,
  LogOut,
  Mail,
  Menu,
  MessageCircleQuestion,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Ticket,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { adminNavItems } from '@/lib/admin-nav';
import { toShamsiDate } from '@/lib/articles-types';
import type {
  SupportContactInfo,
  SupportFaq,
  SupportTicket,
} from '@/lib/support-data';
import {
  ticketCategoryLabels,
  ticketPriorityLabels,
  ticketStatusLabels,
} from '@/lib/support-data';

export function AdminSupportPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'faqs' | 'contact' | 'tickets'>('faqs');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [faqs, setFaqs] = useState<SupportFaq[]>([]);
  const [contactInfo, setContactInfo] = useState<SupportContactInfo>({
    id: '',
    hero_title: 'مرکز پشتیبانی رادینت',
    hero_subtitle: 'ما در تمامی ساعات در کنار شما هستیم',
    phone_number: '۰۲۱-۸۸۸۸۱۹۲۰',
    mobile_number: '۰۹۱۲۰۵۴۵۶۷۸',
    email: 'support@radinet.ir',
    working_hours: 'شنبه تا چهارشنبه ۸:۰۰ الی ۱۷:۰۰',
    emergency_notice: 'واحد تله‌ریپورت اورژانس ۲۴ ساعته فعال است.',
    updated_at: '',
  });
  const [tickets, setTickets] = useState<any[]>([]);

  // FAQ Modal state
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<SupportFaq | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('عمومی');
  const [faqOrder, setFaqOrder] = useState<number>(1);
  const [faqPublished, setFaqPublished] = useState<boolean>(true);

  // Filters
  const [faqSearch, setFaqSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/support', { cache: 'no-store' });
      if (!res.ok) throw new Error('خطا در بارگذاری اطلاعات پشتیبانی');
      const data = await res.json();
      if (data.contact_info) setContactInfo(data.contact_info);
      setFaqs(Array.isArray(data.faqs) ? data.faqs : []);
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در برقراری ارتباط');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const notifySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  // Ticket management state
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleAdminReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedTicket) return;
    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: adminReplyText.trim(),
          author_name: user?.fullName || 'مدیر سیستم',
          author_role: 'admin',
        }),
      });
      if (!res.ok) throw new Error('ارسال پاسخ ناموفق بود');
      const newReply = await res.json();
      const updatedReplies = [
        ...(selectedTicket.replies || []),
        {
          id: newReply.id || `rep-${Date.now()}`,
          message: adminReplyText.trim(),
          createdAt: new Date().toISOString(),
          author: {
            fullName: user?.fullName || 'مدیر سیستم',
            role: 'admin',
          },
        },
      ];
      const updatedTicket = { ...selectedTicket, replies: updatedReplies, status: 'waiting_user' };
      setSelectedTicket(updatedTicket);
      setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? { ...t, ...updatedTicket } : t)));
      setAdminReplyText('');
      notifySuccess('پاسخ شما با موفقیت در رشته مکالمه ثبت شد.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطا در ارسال پاسخ');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleAdminStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('تغییر وضعیت ناموفق بود');
      const updatedTicket = { ...selectedTicket, status: newStatus };
      setSelectedTicket(updatedTicket);
      setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: newStatus } : t)));
      notifySuccess('وضعیت تیکت با موفقیت تغییر یافت.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطا در تغییر وضعیت');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ── Contact Info Save ──
  const handleSaveContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/support/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactInfo),
      });
      if (!res.ok) throw new Error('خطا در ذخیره اطلاعات تماس');
      const updated = await res.json();
      setContactInfo(updated);
      notifySuccess('اطلاعات تماس و ساعات کاری پشتیبانی با موفقیت در دیتابیس بروز شد.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در ذخیره‌سازی');
    } finally {
      setIsSaving(false);
    }
  };

  // ── FAQ Save ──
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      setErrorMessage('سوال و پاسخ الزامی هستند.');
      return;
    }

    try {
      if (editingFaq) {
        const res = await fetch(`/api/admin/support/faqs/${editingFaq.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: faqQuestion,
            answer: faqAnswer,
            category: faqCategory,
            display_order: faqOrder,
            is_published: faqPublished,
          }),
        });
        if (!res.ok) throw new Error('خطا در ویرایش سوال');
        const updated = await res.json();
        setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
        notifySuccess('سوال متداول با موفقیت ویرایش شد.');
      } else {
        const res = await fetch('/api/admin/support/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: faqQuestion,
            answer: faqAnswer,
            category: faqCategory,
            display_order: faqOrder,
            is_published: faqPublished,
          }),
        });
        if (!res.ok) throw new Error('خطا در ایجاد سوال متداول');
        const created = await res.json();
        setFaqs((prev) => [...prev, created]);
        notifySuccess('سوال متداول جدید با موفقیت به دیتابیس اضافه شد.');
      }
      setFaqModalOpen(false);
      setEditingFaq(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در ثبت سوال');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm('آیا از حذف این سوال متداول اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/admin/support/faqs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('خطا در حذف سوال');
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      notifySuccess('سوال متداول حذف شد.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در حذف');
    }
  };

  // Filtered lists
  const filteredFaqs = faqs.filter((f) => {
    const q = faqSearch.trim().toLowerCase();
    return (
      !q ||
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    );
  });

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = ticketStatusFilter === 'all' || t.status === ticketStatusFilter;
    const q = ticketSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.subject?.toLowerCase().includes(q) ||
      t.trackingCode?.toLowerCase().includes(q) ||
      t.user?.fullName?.toLowerCase().includes(q) ||
      t.user?.email?.toLowerCase().includes(q) ||
      t.message?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="admin-page-root" dir="rtl">
      <div className="admin-page-shell">
        <aside className={`admin-page-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-page-brand">
            <div className="admin-page-brand__mark">
              <ShieldCheck size={28} strokeWidth={1.7} />
            </div>
            <div>
              <strong>رادینت</strong>
              <span>پنل مدیریت</span>
            </div>
            <button
              className="admin-page-sidebar__close"
              onClick={() => setSidebarOpen(false)}
              style={{ display: sidebarOpen ? 'grid' : 'none' }}
            >
              <X size={22} />
            </button>
          </div>

          <nav className="admin-page-nav">
            {adminNavItems.map((item) => {
              const active = item.href === '/admin/support';
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`admin-page-nav__item ${active ? 'is-active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={22} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          <button className="admin-page-nav__logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج</span>
          </button>
        </aside>

        {sidebarOpen && (
          <div
            className="admin-page-overlay"
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,29,65,.42)' }}
          />
        )}

        {/* Main Content Area */}
        <div className="admin-page-content" style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <header className="admin-page-header">
            <div className="admin-page-header__title">
              <Headphones size={26} strokeWidth={1.7} />
              <span>مدیریت پشتیبانی و سوالات متداول</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => loadData()}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 text-xs"
                title="بروزرسانی داده‌ها"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                <span>بروزرسانی</span>
              </button>
              <a
                href="/support-panel/tickets"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors border border-blue-200"
              >
                <Ticket size={14} />
                <span>پنل کارشناسان پشتیبانی</span>
              </a>
              <a
                href="/support"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors border border-slate-200"
              >
                <ExternalLink size={14} />
                <span>مشاهده سایت</span>
              </a>
              <button
                className="admin-page-burger"
                onClick={() => setSidebarOpen(true)}
                aria-label="منو"
              >
                <Menu size={24} strokeWidth={1.7} />
              </button>
            </div>
          </header>

        {/* Notifications */}
        <div className="p-6 pb-0 space-y-3">
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 text-sm animate-fadeIn">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2.5 text-sm">
              <X size={18} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Tabs Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'faqs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <MessageCircleQuestion size={16} />
              <span>سوالات متداول (FAQ)</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-bold">
                {faqs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'contact'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Phone size={16} />
              <span>اطلاعات تماس فوری و ساعات کاری</span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'tickets'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Ticket size={16} />
              <span>تیکت‌های ثبت‌شده کاربران</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-bold">
                {tickets.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* TAB 1: FAQs */}
          {activeTab === 'faqs' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="جستجو در سوالات و پاسخ‌ها..."
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingFaq(null);
                    setFaqQuestion('');
                    setFaqAnswer('');
                    setFaqCategory('عمومی');
                    setFaqOrder(faqs.length + 1);
                    setFaqPublished(true);
                    setFaqModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  <span>افزودن سوال متداول جدید</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {filteredFaqs.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <MessageCircleQuestion size={40} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">سوالی یافت نشد.</p>
                  </div>
                ) : (
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-3 px-4">پرسش و پاسخ</th>
                        <th className="py-3 px-4">دسته‌بندی</th>
                        <th className="py-3 px-4 text-center">ترتیب</th>
                        <th className="py-3 px-4 text-center">وضعیت انتشار</th>
                        <th className="py-3 px-4 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredFaqs.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 max-w-md">
                            <div className="font-bold text-slate-900">{f.question}</div>
                            <div className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                              {f.answer}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-700 font-medium">
                              {f.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-xs">{f.display_order}</td>
                          <td className="py-3.5 px-4 text-center">
                            {f.is_published ? (
                              <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-medium">
                                منتشرشده
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-medium">
                                پیش‌نویس
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingFaq(f);
                                  setFaqQuestion(f.question);
                                  setFaqAnswer(f.answer);
                                  setFaqCategory(f.category);
                                  setFaqOrder(f.display_order);
                                  setFaqPublished(f.is_published);
                                  setFaqModalOpen(true);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="ویرایش"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteFaq(f.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Contact Info */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveContactInfo} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 max-w-3xl">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Phone size={18} className="text-blue-600" />
                <span>اطلاعات تماس پشتیبانی و ساعات کاری</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">عنوان هدر صفحه پشتیبانی</label>
                  <input
                    type="text"
                    required
                    value={contactInfo.hero_title}
                    onChange={(e) => setContactInfo({ ...contactInfo, hero_title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">زیرعنوان هدر</label>
                  <input
                    type="text"
                    value={contactInfo.hero_subtitle}
                    onChange={(e) => setContactInfo({ ...contactInfo, hero_subtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">تلفن ثابت پشتیبانی</label>
                  <input
                    type="text"
                    required
                    value={contactInfo.phone_number}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone_number: e.target.value })}
                    placeholder="۰۲۱-۸۸۸۸۱۹۲۰"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">خط همراه ویژه مراکز</label>
                  <input
                    type="text"
                    value={contactInfo.mobile_number}
                    onChange={(e) => setContactInfo({ ...contactInfo, mobile_number: e.target.value })}
                    placeholder="۰۹۱۲۰۵۴۵۶۷۸"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ایمیل پشتیبانی</label>
                  <input
                    type="email"
                    required
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    placeholder="support@radinet.ir"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">ساعات پاسخگویی اداری</label>
                <input
                  type="text"
                  required
                  value={contactInfo.working_hours}
                  onChange={(e) => setContactInfo({ ...contactInfo, working_hours: e.target.value })}
                  placeholder="شنبه تا چهارشنبه ۸:۰۰ الی ۱۷:۰۰ | پنج‌شنبه‌ها ۸:۰۰ الی ۱۳:۰۰"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  متن اعلان فوریت و اورژانس شبانه‌روزی
                </label>
                <textarea
                  rows={3}
                  value={contactInfo.emergency_notice}
                  onChange={(e) => setContactInfo({ ...contactInfo, emergency_notice: e.target.value })}
                  placeholder="واحد تله‌ریپورت اورژانس ۲۴ ساعته فعال است..."
                  className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>{isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره اطلاعات در دیتابیس'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Tickets */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1">
                  <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    placeholder="جستجو در کد پیگیری، موضوع، نام کاربر یا متن..."
                    className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 whitespace-nowrap">فیلتر وضعیت:</span>
                  <select
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="all">همه وضعیت‌ها ({tickets.length})</option>
                    <option value="open">باز / جدید</option>
                    <option value="pending">در حال بررسی</option>
                    <option value="waiting_user">در انتظار نظر کاربر</option>
                    <option value="resolved">حل‌شده</option>
                    <option value="closed">بسته شده</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {filteredTickets.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Ticket size={40} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">تیکتی یافت نشد.</p>
                  </div>
                ) : (
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-3 px-4">کد و تاریخ</th>
                        <th className="py-3 px-4">کاربر</th>
                        <th className="py-3 px-4">موضوع تیکت</th>
                        <th className="py-3 px-4">اولویت</th>
                        <th className="py-3 px-4">وضعیت</th>
                        <th className="py-3 px-4 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTickets.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
                              {t.trackingCode || t.id}
                            </span>
                            <div className="text-[11px] text-slate-400 font-mono mt-1">
                              {toShamsiDate(t.createdAt)}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">{t.user?.fullName || '—'}</div>
                            <div className="text-xs text-slate-500 font-mono">{t.user?.phone || t.user?.email || '—'}</div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-bold text-slate-900 truncate">{t.subject}</div>
                            <div className="text-xs text-slate-500 truncate mt-0.5">{t.message}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs ${ticketPriorityLabels[t.priority]?.color || 'bg-slate-100'}`}>
                              {ticketPriorityLabels[t.priority]?.label || t.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs border ${ticketStatusLabels[t.status]?.color || 'bg-slate-100'}`}>
                              {ticketStatusLabels[t.status]?.label || t.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedTicket(t)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                              >
                                <Eye size={12} />
                                <span>مشاهده مکالمه و مدیریت</span>
                              </button>
                              <a
                                href={`/support-panel/tickets/${t.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                title="مشاهده در پنل پشتیبانی"
                              >
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Modal */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveFaq} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageCircleQuestion size={18} className="text-blue-600" />
                <span>{editingFaq ? 'ویرایش سوال متداول' : 'افزودن سوال متداول جدید'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setFaqModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">پرسش (سوال)</label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="مثال: نحوه دریافت گزارش تله‌رادیولوژی چگونه است؟"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">دسته‌بندی</label>
                  <select
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="عمومی">عمومی</option>
                    <option value="تله‌رادیولوژی">تله‌رادیولوژی</option>
                    <option value="فنی و پکس">فنی و پکس</option>
                    <option value="مالی و پرداخت">مالی و پرداخت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ترتیب نمایش</label>
                  <input
                    type="number"
                    value={faqOrder}
                    onChange={(e) => setFaqOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">پاسخ کامل</label>
                <textarea
                  required
                  rows={5}
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="شرح دقیق و شفاف پاسخ به کاربران..."
                  className="w-full p-3 rounded-lg border border-slate-200 text-sm leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={faqPublished}
                  onChange={(e) => setFaqPublished(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-700">این سوال منتشر شده و در سایت عمومی نمایش داده شود</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFaqModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                ذخیره سوال
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket Conversation & Management Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Ticket size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedTicket.subject}</h3>
                    <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                      {selectedTicket.trackingCode || selectedTicket.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                    <span>ثبت: {toShamsiDate(selectedTicket.createdAt)}</span>
                    <span>دسته‌بندی: {ticketCategoryLabels[selectedTicket.category] || selectedTicket.category || 'عمومی'}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Meta & Status Control Bar */}
            <div className="p-4 border-b border-slate-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User size={13} className="text-slate-500" />
                  <span>کاربر ثبت‌کننده: {selectedTicket.user?.fullName || 'کاربر بیمار'}</span>
                </div>
                <div className="text-slate-500 flex items-center gap-3">
                  {selectedTicket.user?.phone && <span>تلفن: <b dir="ltr" className="font-mono">{selectedTicket.user.phone}</b></span>}
                  {selectedTicket.user?.email && <span>ایمیل: <b dir="ltr" className="font-mono">{selectedTicket.user.email}</b></span>}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-slate-500 mb-1">وضعیت فعلی تیکت:</div>
                  <select
                    value={selectedTicket.status}
                    disabled={isUpdatingStatus}
                    onChange={(e) => handleAdminStatusChange(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="open">باز / جدید</option>
                    <option value="pending">در حال بررسی</option>
                    <option value="waiting_user">در انتظار پاسخ کاربر</option>
                    <option value="resolved">حل‌شده</option>
                    <option value="closed">بسته شده</option>
                  </select>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">اولویت:</div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ticketPriorityLabels[selectedTicket.priority]?.color || 'bg-slate-100'}`}>
                    {ticketPriorityLabels[selectedTicket.priority]?.label || selectedTicket.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40 min-h-[220px]">
              {/* Initial message */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>{selectedTicket.user?.fullName || 'پیام اولیه کاربر'}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">بیمار</span>
                  </div>
                  <span className="text-slate-400 text-[11px] font-mono">{toShamsiDate(selectedTicket.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>

              {/* Replies */}
              {(selectedTicket.replies || []).map((r: any, idx: number) => {
                const isAdmin = r.author?.role === 'admin' || (r.author?.role || '').toLowerCase().includes('admin');
                const isSupport = (r.author?.role || '').toLowerCase().includes('support');
                const isUser = !isAdmin && !isSupport;

                return (
                  <div
                    key={r.id || idx}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 shadow-xs ${
                      isAdmin
                        ? 'bg-emerald-50/70 border-emerald-200 mr-4'
                        : isSupport
                        ? 'bg-blue-50/70 border-blue-200 mr-4'
                        : 'bg-white border-slate-200/80 ml-4'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isAdmin ? 'bg-emerald-500' : isSupport ? 'bg-blue-500' : 'bg-slate-400'
                          }`}
                        />
                        <span>{r.author?.fullName || (isAdmin ? 'مدیریت رادینت' : isSupport ? 'پشتیبانی' : 'کاربر')}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            isAdmin
                              ? 'bg-emerald-100 text-emerald-800'
                              : isSupport
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isAdmin ? 'مدیر سیستم' : isSupport ? 'کارشناس پشتیبانی' : 'بیمار'}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px] font-mono">{toShamsiDate(r.createdAt)}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{r.message}</p>
                  </div>
                );
              })}
            </div>

            {/* Admin Reply Form */}
            <form onSubmit={handleAdminReplySubmit} className="p-4 border-t border-slate-100 bg-white space-y-2">
              <label className="block text-xs font-bold text-slate-700">ارسال پاسخ مدیریتی به تیکت:</label>
              <textarea
                rows={3}
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                placeholder="متن پاسخ مدیریت به کاربر و کارشناس پشتیبانی..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                required
              />
              <div className="flex items-center justify-between">
                <a
                  href={`/support-panel/tickets/${selectedTicket.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>مشاهده صفحه کامل در پنل پشتیبانی</span>
                  <ExternalLink size={12} />
                </a>
                <button
                  type="submit"
                  disabled={isSendingReply || !adminReplyText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send size={13} />
                  <span>{isSendingReply ? 'در حال ارسال…' : 'ارسال پاسخ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
