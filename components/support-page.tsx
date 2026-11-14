'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Headphones,
  Inbox,
  LaptopMinimal,
  Mail,
  MessageCircleQuestion,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Star,
  Tag,
  Ticket,
  User,
  X,
} from 'lucide-react';
import type {
  SupportContactInfo,
  SupportFaq,
  SupportTicket,
  TicketReplyItem,
} from '@/lib/support-data';
import {
  ticketCategoryLabels,
  ticketPriorityLabels,
  ticketStatusLabels,
} from '@/lib/support-data';
import {
  searchFaqs,
  sendTicketReply,
  submitTicket,
  trackTicket,
} from '@/lib/support-repository';
import { toShamsiDate } from '@/lib/articles-types';
import { useAuth } from '@/components/auth-provider';
import { getStoredToken } from '@/lib/auth-client';
import type { ProductReview } from '@/lib/shop-data';

type SupportPageProps = {
  initialContactInfo: SupportContactInfo;
  initialFaqs: SupportFaq[];
  categories: string[];
  initialReviews?: ProductReview[];
};

export function SupportPage({
  initialContactInfo,
  initialFaqs,
  categories,
  initialReviews = [],
}: SupportPageProps) {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  // FAQs state
  const [faqs, setFaqs] = useState<SupportFaq[]>(initialFaqs);
  const [openQuestion, setOpenQuestion] = useState<string | null>(initialFaqs[0]?.id || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('همه دسته‌ها');
  const [searchFaqQuery, setSearchFaqQuery] = useState<string>('');
  const [isSearchingFaq, setIsSearchingFaq] = useState<boolean>(false);

  // Support Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewContent, setReviewContent] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<string>('');

  // Tickets state: 'create' | 'track'
  const [ticketTab, setTicketTab] = useState<'create' | 'track'>('create');

  // Create Ticket Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('general');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketUserName, setTicketUserName] = useState('');
  const [ticketUserPhone, setTicketUserPhone] = useState('');
  const [ticketUserEmail, setTicketUserEmail] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSubmitError, setTicketSubmitError] = useState('');
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Track Ticket Form
  const [trackQuery, setTrackQuery] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [trackedTicket, setTrackedTicket] = useState<SupportTicket | null>(null);

  // Ticket Reply Form
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');

  // Handle FAQ Database Search
  const handleFaqSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchingFaq(true);
    try {
      const results = await searchFaqs(searchFaqQuery, selectedCategory);
      setFaqs(results);
      if (results.length > 0) setOpenQuestion(results[0].id);
    } catch {
      // Keep existing faqs on error
    } finally {
      setIsSearchingFaq(false);
    }
  };

  const handleCategoryChange = async (cat: string) => {
    setSelectedCategory(cat);
    setIsSearchingFaq(true);
    try {
      const results = await searchFaqs(searchFaqQuery, cat);
      setFaqs(results);
      if (results.length > 0) setOpenQuestion(results[0].id);
    } finally {
      setIsSearchingFaq(false);
    }
  };

  // Handle Ticket Submission
  const handleCreateTicket = async (e: FormEvent) => {
    e.preventDefault();
    setTicketSubmitError('');
    setIsSubmittingTicket(true);

    try {
      const result = await submitTicket({
        subject: ticketSubject,
        category: ticketCategory,
        priority: ticketPriority,
        user_name: ticketUserName,
        user_phone: ticketUserPhone,
        user_email: ticketUserEmail,
        message: ticketMessage,
      });

      if (!result.ok || !result.ticket) {
        setTicketSubmitError(result.error || 'خطا در ثبت تیکت پشتیبانی.');
        return;
      }

      setCreatedTicket(result.ticket);
      // Reset form
      setTicketSubject('');
      setTicketMessage('');
      setTicketUserEmail('');
    } catch {
      setTicketSubmitError('خطا در برقراری ارتباط با سامانه پشتیبانی.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Handle Ticket Tracking
  const handleTrackSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    setTrackError('');
    setIsTracking(true);
    try {
      const result = await trackTicket(trackQuery.trim());
      if (!result.ok || !result.ticket) {
        setTrackError(result.error || 'تیکتی با این شماره پیگیری یا شماره تماس یافت نشد.');
        setTrackedTicket(null);
        return;
      }
      setTrackedTicket(result.ticket);
    } catch {
      setTrackError('خطا در دریافت وضعیت تیکت.');
      setTrackedTicket(null);
    } finally {
      setIsTracking(false);
    }
  };

  // Handle User Reply
  const handleSendReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !trackedTicket) return;

    setIsSendingReply(true);
    setReplyError('');

    try {
      const result = await sendTicketReply({
        ticketId: trackedTicket.id,
        message: replyMessage.trim(),
        authorName: trackedTicket.user_name || 'کاربر',
      });

      if (!result.ok || !result.reply) {
        setReplyError(result.error || 'خطا در ارسال پاسخ.');
        return;
      }

      // Append reply to tracked ticket
      setTrackedTicket({
        ...trackedTicket,
        status: 'pending',
        replies: [...(trackedTicket.replies || []), result.reply],
      });
      setReplyMessage('');
    } catch {
      setReplyError('خطا در ارسال پاسخ به سرور.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  const handleSubmitSupportReview = async (e: FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!isAuthenticated) {
      setReviewError('برای ثبت نظر در بخش پشتیبانی، لطفاً ابتدا وارد حساب کاربری خود شوید.');
      return;
    }

    if (reviewContent.trim().length < 3) {
      setReviewError('متن نظر باید حداقل ۳ کاراکتر باشد.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const token = getStoredToken();
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          rating: reviewRating,
          content: reviewContent.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || 'خطا در ثبت نظر');
      }
      setReviewSuccess(
        json?.message ||
          'نظر شما با موفقیت ثبت شد و با وضعیت «در انتظار تأیید» به بخش مدیریت نظرات ارسال گردید. پس از تأیید ادمین در این صفحه نمایش داده خواهد شد.',
      );
      setReviewContent('');
      setReviewRating(5);
    } catch (err: any) {
      setReviewError(err?.message || 'خطا در ثبت نظر.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="support-screen">
      {/* ── Dynamic Hero ── */}
      <section className="support-hero" aria-labelledby="support-title">
        <div className="support-hero__content">
          <h1 id="support-title">{initialContactInfo.hero_title || 'مرکز پشتیبانی رادینت'}</h1>
          <p>{initialContactInfo.hero_subtitle || 'ما در تمامی ساعات شبانه‌روز در کنار شما هستیم'}</p>
        </div>
      </section>

      <main className="support-main">
        {/* ── 3 Quick Navigation Tools ── */}
        <section className="support-tools" aria-label="خدمات پشتیبانی">
          <a className="support-tool support-tool--green" href="#contact-info">
            <span className="support-tool__icon">
              <Headphones size={22} />
            </span>
            <span>
              <strong>تماس فوری</strong>
              <small>ارتباط مستقیم با کارشناسان کشیک</small>
            </span>
            <span className="support-tool__action">
              مشاهده شماره‌ها <ArrowLeft size={14} />
            </span>
          </a>

          <a className="support-tool support-tool--blue" href="#faq">
            <span className="support-tool__icon">
              <MessageCircleQuestion size={22} />
            </span>
            <span>
              <strong>سوالات متداول</strong>
              <small>پاسخ فوری به پرسش‌های پرتکرار</small>
            </span>
            <span className="support-tool__action">
              مشاهده و جستجو <ArrowLeft size={14} />
            </span>
          </a>

          <a className="support-tool support-tool--mint" href="#tickets-section">
            <span className="support-tool__icon">
              <LaptopMinimal size={22} />
            </span>
            <span>
              <strong>سامانه تیکتینگ</strong>
              <small>ثبت درخواست و پیگیری وضعیت</small>
            </span>
            <span className="support-tool__action">
              ثبت و پیگیری تیکت <ArrowLeft size={14} />
            </span>
          </a>
        </section>

        {/* ── Interactive Ticketing Section ── */}
        <section id="tickets-section" className="mt-14 scroll-mt-24">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                  <Ticket className="text-blue-600" size={24} />
                  <span>سامانه رسمی تیکتینگ و پیگیری درخواست‌ها</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  درخواست‌های تخصصی، سوالات فنی پکس، مسائل مالی و تله‌رادیولوژی را ثبت و پیگیری فرمایید.
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setTicketTab('create')}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                    ticketTab === 'create'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ثبت تیکت جدید
                </button>
                <button
                  type="button"
                  onClick={() => setTicketTab('track')}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                    ticketTab === 'track'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  پیگیری تیکت قبلی
                </button>
              </div>
            </div>

            {/* TAB 1: Create Ticket */}
            {ticketTab === 'create' && (
              <div>
                {createdTicket ? (
                  <div className="p-8 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-4 animate-scaleUp">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">تیکت شما با موفقیت ثبت شد</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      درخواست شما در کارتابل کارشناسان پشتیبانی رادینت قرار گرفت و در سریع‌ترین زمان بررسی خواهد شد.
                    </p>

                    <div className="bg-white p-4 rounded-xl border border-emerald-200 inline-flex flex-col items-center gap-2 shadow-sm min-w-[280px]">
                      <span className="text-xs text-slate-500">کد پیگیری اختصاصی شما:</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-2xl font-black text-blue-600 tracking-wider">
                          {createdTicket.tracking_code}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(createdTicket.tracking_code)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                          title="کپی کد پیگیری"
                        >
                          {copiedCode ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTrackQuery(createdTicket.tracking_code);
                          setTrackedTicket(createdTicket);
                          setTicketTab('track');
                          setCreatedTicket(null);
                        }}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
                      >
                        مشاهده جزئیات و رشته پیام‌ها
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreatedTicket(null)}
                        className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors"
                      >
                        ثبت تیکت دیگر
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCreateTicket} className="space-y-5">
                    {ticketSubmitError && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
                        <X size={16} className="text-rose-600 shrink-0" />
                        <span>{ticketSubmitError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          نام و نام خانوادگی <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={ticketUserName}
                          onChange={(e) => setTicketUserName(e.target.value)}
                          placeholder="مثال: دکتر علیرضا رضایی"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          شماره تماس همراه <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={ticketUserPhone}
                          onChange={(e) => setTicketUserPhone(e.target.value)}
                          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500 bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          آدرس ایمیل (اختیاری)
                        </label>
                        <input
                          type="email"
                          value={ticketUserEmail}
                          onChange={(e) => setTicketUserEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500 bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          موضوع درخواست <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          placeholder="عنوان خلاصه مشکل یا درخواست..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          دسته‌بندی موضوعی
                        </label>
                        <select
                          value={ticketCategory}
                          onChange={(e) => setTicketCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="general">عمومی و راهنمایی</option>
                          <option value="telereport">تله‌رادیولوژی و تفسیر</option>
                          <option value="technical">فنی، شبکه و پکس (PACS)</option>
                          <option value="finance">امور مالی و فاکتور</option>
                          <option value="account">حساب کاربری و دسترسی‌ها</option>
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          میزان فوریت
                        </label>
                        <select
                          value={ticketPriority}
                          onChange={(e) => setTicketPriority(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="low">کم (درخواست‌های غیرفوری)</option>
                          <option value="medium">متوسط (پاسخ در ساعات کاری)</option>
                          <option value="high">زیاد (اولویت بالا)</option>
                          <option value="urgent">بسیار فوری (فوریت بالینی / قطعی سرویس)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        شرح کامل پیام <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        placeholder="توضیحات تکمیلی، جزئیات پرونده یا خطا را اینجا شرح دهید..."
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-sm leading-relaxed focus:outline-none focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isSubmittingTicket}
                        className="inline-flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                      >
                        <Send size={16} />
                        <span>{isSubmittingTicket ? 'در حال ثبت تیکت...' : 'ارسال و ثبت نهایی تیکت'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: Track Ticket */}
            {ticketTab === 'track' && (
              <div className="space-y-6">
                <form onSubmit={handleTrackSubmit} className="max-w-xl mx-auto flex gap-2">
                  <div className="relative flex-1">
                    <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={trackQuery}
                      onChange={(e) => setTrackQuery(e.target.value)}
                      placeholder="کد پیگیری (مثال: RAD-73921) یا شماره تماس..."
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500 shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isTracking}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isTracking ? 'در حال جستجو...' : 'پیگیری'}
                  </button>
                </form>

                {trackError && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm text-center max-w-lg mx-auto">
                    {trackError}
                  </div>
                )}

                {trackedTicket && (
                  <div className="border border-slate-200 rounded-2xl bg-slate-50/40 p-5 md:p-6 space-y-5 animate-scaleUp">
                    {/* Ticket Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                            {trackedTicket.tracking_code}
                          </span>
                          <span className="text-xs text-slate-500">
                            {ticketCategoryLabels[trackedTicket.category] || trackedTicket.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{trackedTicket.subject}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            ticketStatusLabels[trackedTicket.status]?.color || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ticketStatusLabels[trackedTicket.status]?.label || trackedTicket.status}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            ticketPriorityLabels[trackedTicket.priority]?.color || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          اولویت: {ticketPriorityLabels[trackedTicket.priority]?.label || trackedTicket.priority}
                        </span>
                      </div>
                    </div>

                    {/* Messages Thread */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase">تاریخچه گفتگو و پاسخ‌ها:</h4>

                      {/* Initial message */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 pb-2">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <User size={14} className="text-slate-400" />
                            <span>{trackedTicket.user_name} (شما)</span>
                          </span>
                          <span className="font-mono">{toShamsiDate(trackedTicket.created_at)}</span>
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {trackedTicket.message}
                        </p>
                      </div>

                      {/* Replies */}
                      {trackedTicket.replies?.map((rep: TicketReplyItem) => {
                        const isExpert = rep.author_role === 'support_expert' || rep.author_role === 'admin';
                        return (
                          <div
                            key={rep.id}
                            className={`p-4 rounded-xl border space-y-2 ${
                              isExpert
                                ? 'bg-blue-50/60 border-blue-200 mr-4'
                                : 'bg-white border-slate-200 ml-4'
                            }`}
                          >
                            <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                              <span
                                className={`font-semibold flex items-center gap-1.5 ${
                                  isExpert ? 'text-blue-900 font-bold' : 'text-slate-800'
                                }`}
                              >
                                {isExpert && <Headphones size={14} className="text-blue-600" />}
                                <span>{rep.author_name}</span>
                                {isExpert && (
                                  <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    پاسخ کارشناس پشتیبانی
                                  </span>
                                )}
                              </span>
                              <span className="text-slate-400 font-mono">{toShamsiDate(rep.created_at)}</span>
                            </div>
                            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                              {rep.message}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Send Follow-up reply */}
                    {trackedTicket.status !== 'closed' ? (
                      <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-200 space-y-3">
                        <label className="block text-xs font-bold text-slate-700">ارسال پاسخ یا توضیح جدید:</label>
                        <textarea
                          required
                          rows={3}
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="پاسخ یا سوال تکمیلی خود را بنویسید..."
                          className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                        />
                        {replyError && <p className="text-xs text-rose-600">{replyError}</p>}
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSendingReply}
                            className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                          >
                            <Send size={14} />
                            <span>{isSendingReply ? 'در حال ارسال...' : 'ارسال پاسخ به کارشناس'}</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-500">
                        این تیکت بسته شده است. در صورت نیاز به پیگیری، تیکت جدیدی ثبت فرمایید.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Dynamic Panels Grid: FAQ & Urgent Contact ── */}
        <section className="support-panels mt-14">
          {/* FAQ Panel */}
          <div className="support-panel support-faq" id="faq">
            <div className="support-panel__heading">
              <div>
                <h2>سوالات متداول</h2>
                <p>پاسخ‌های سریع و شفاف به پرسش‌های پرتکرار کاربران و مراکز درمانی</p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 my-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Real Search Input */}
            <form onSubmit={handleFaqSearch} className="relative my-3">
              <input
                type="text"
                value={searchFaqQuery}
                onChange={(e) => setSearchFaqQuery(e.target.value)}
                placeholder="جستجو در متن سوالات و پاسخ‌های دیتابیس..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
              <button
                type="submit"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-600 p-1"
                title="جستجو"
              >
                {isSearchingFaq ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              </button>
            </form>

            {/* Dynamic FAQs List */}
            <div className="support-faq-list">
              {faqs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <MessageCircleQuestion size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">سوالی با این مشخصات یافت نشد.</p>
                </div>
              ) : (
                faqs.map((item) => {
                  const isOpen = openQuestion === item.id;
                  return (
                    <div className={`support-faq-item${isOpen ? ' is-open' : ''}`} key={item.id}>
                      <button
                        type="button"
                        onClick={() => setOpenQuestion(isOpen ? null : item.id)}
                        aria-expanded={isOpen}
                      >
                        <span className="font-semibold text-slate-800">{item.question}</span>
                        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-1 text-slate-600 leading-relaxed text-sm border-t border-slate-100 mt-2">
                          <p>{item.answer}</p>
                          <span className="inline-block mt-3 text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">
                            دسته‌بندی: {item.category}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Urgent Contact Info Panel */}
          <div className="support-panel support-contact" id="contact-info">
            <div className="support-panel__heading">
              <div>
                <h2>اطلاعات تماس پشتیبانی فوری</h2>
                <p>راه‌های ارتباطی مستقیم با تیم فنی و کشیک رادینت</p>
              </div>
              <span className="support-panel__badge">
                <Headphones size={18} />
              </span>
            </div>

            <div className="support-contact-list">
              {/* Telephone */}
              {initialContactInfo.phone_number && (
                <a
                  href={`tel:${initialContactInfo.phone_number.replace(/[^\d+]/g, '')}`}
                  className="support-contact-item"
                >
                  <span>
                    <Phone size={16} />
                  </span>
                  <div>
                    <small>تلفن ثابت پشتیبانی</small>
                    <strong className="font-mono">{initialContactInfo.phone_number}</strong>
                  </div>
                </a>
              )}

              {/* Mobile */}
              {initialContactInfo.mobile_number && (
                <a
                  href={`tel:${initialContactInfo.mobile_number.replace(/[^\d+]/g, '')}`}
                  className="support-contact-item"
                >
                  <span>
                    <Smartphone size={16} />
                  </span>
                  <div>
                    <small>خط همراه ویژه مراکز</small>
                    <strong className="font-mono">{initialContactInfo.mobile_number}</strong>
                  </div>
                </a>
              )}

              {/* Email */}
              {initialContactInfo.email && (
                <a
                  href={`mailto:${initialContactInfo.email}`}
                  className="support-contact-item"
                >
                  <span>
                    <Mail size={16} />
                  </span>
                  <div>
                    <small>پست الکترونیک رسمی</small>
                    <strong className="font-mono text-xs">{initialContactInfo.email}</strong>
                  </div>
                </a>
              )}

              {/* Working Hours */}
              {initialContactInfo.working_hours && (
                <div className="support-contact-item" style={{ cursor: 'default' }}>
                  <span>
                    <Clock3 size={16} />
                  </span>
                  <div>
                    <small>ساعات پاسخگویی اداری</small>
                    <strong className="text-xs leading-normal">{initialContactInfo.working_hours}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Notice Box */}
            {initialContactInfo.emergency_notice && (
              <div className="support-response-box">
                <CalendarClock size={20} className="shrink-0 text-blue-600" />
                <div>
                  <strong>پشتیبانی آنلاین و اورژانس شبانه‌روزی</strong>
                  <p>{initialContactInfo.emergency_notice}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── User Support Reviews & Feedback Section ── */}
        <section className="mt-14 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8" id="support-reviews">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare size={22} className="text-blue-600" />
                <span>نظرات و دیدگاه‌های کاربران درباره پشتیبانی رادینت</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                دیدگاه و تجربه خود را از خدمات پشتیبانی ثبت کنید؛ نظرات پس از بررسی و تأیید ادمین منتشر می‌شوند.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold self-start">
              <Star size={15} fill="#2563eb" stroke="#2563eb" />
              <span>{reviews.length.toLocaleString('fa-IR')} نظر تأییدشده</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            {/* Submit Review Form */}
            <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
              <h3 className="text-base font-bold text-slate-800 mb-2">ثبت نظر جدید</h3>
              {!isAuthenticated ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-6">
                  برای ثبت نظر در بخش پشتیبانی، لطفاً ابتدا وارد حساب کاربری خود شوید.
                  <div className="mt-3">
                    <a
                      href="/login"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                    >
                      ورود به حساب کاربری
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitSupportReview} className="space-y-4">
                  <div className="text-xs text-slate-600">
                    ارسال نظر با نام: <strong className="text-slate-900">{user?.fullName || 'کاربر رادینت'}</strong>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">امتیاز شما به پشتیبانی:</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`p-2 rounded-lg border transition-all ${
                            reviewRating >= star
                              ? 'bg-amber-50 border-amber-300 text-amber-500'
                              : 'bg-white border-slate-200 text-slate-300'
                          }`}
                          title={`امتیاز ${star} از ۵`}
                        >
                          <Star size={18} fill={reviewRating >= star ? '#F59E0B' : 'none'} stroke={reviewRating >= star ? '#F59E0B' : 'currentColor'} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 mr-2">
                        {reviewRating.toLocaleString('fa-IR')} از ۵
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">متن نظر و دیدگاه شما:</label>
                    <textarea
                      rows={4}
                      required
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="تجربه خود را از سرعت پاسخگویی و کیفیت خدمات پشتیبانی بنویسید..."
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>

                  {reviewError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {reviewError}
                    </div>
                  )}

                  {reviewSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
                      <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                      <span>{reviewSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <Send size={15} />
                    <span>{isSubmittingReview ? 'در حال ثبت نظر...' : 'ثبت و ارسال نظر برای بررسی ادمین'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Approved Reviews List */}
            <div className="lg:col-span-7 space-y-3">
              {reviews.length === 0 ? (
                <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                  <MessageSquare size={32} className="mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-slate-600">هنوز نظر تأییدشده‌ای در این بخش ثبت نشده است.</p>
                  <p className="text-xs text-slate-400 mt-1">اولین نفری باشید که دیدگاه خود را درباره پشتیبانی رادینت ثبت می‌کند.</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                          {(rev.userName || 'ک').charAt(0)}
                        </span>
                        <div>
                          <strong className="text-sm text-slate-900 block">{rev.userName || 'کاربر رادینت'}</strong>
                          <span className="text-[11px] text-slate-400">{toShamsiDate(rev.createdAt)}</span>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold">
                        <Star size={13} fill="#F59E0B" stroke="#F59E0B" />
                        <span>{Number(rev.rating || 5).toLocaleString('fa-IR')} از ۵</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mt-2">
                      {rev.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
