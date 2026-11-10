'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  ExternalLink,
  Eye,
  Inbox,
  LogOut,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { adminNavItems } from '@/lib/admin-nav';
import { toShamsiDate } from '@/lib/articles-types';
import type {
  ContactMessage,
  ContactPageContent,
  ContactPhoneNumber,
  ContactResponseHour,
  ContactSupportEmail,
} from '@/lib/contact-data';

export function AdminContactPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'messages' | 'info' | 'phones' | 'emails' | 'hours'>('messages');
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Contact Data states
  const [pageContent, setPageContent] = useState<ContactPageContent>({
    id: '',
    hero_title: 'تماس با ما',
    hero_subtitle: 'با کارشناسان و متخصصان رادینت در ارتباط باشید',
    intro_title: 'راه‌های ارتباطی با رادینت',
    intro_body: '',
    office_address: '',
    latitude: 35.7575,
    longitude: 51.4106,
    map_url: null,
    response_hours: '',
  });

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [phones, setPhones] = useState<ContactPhoneNumber[]>([]);
  const [emails, setEmails] = useState<ContactSupportEmail[]>([]);
  const [hours, setHours] = useState<ContactResponseHour[]>([]);

  // Filters & Selected Message
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null);

  // Phone Modal
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<ContactPhoneNumber | null>(null);
  const [phoneLabel, setPhoneLabel] = useState('');
  const [phoneNumberValue, setPhoneNumberValue] = useState('');
  const [phoneOrder, setPhoneOrder] = useState<number>(1);
  const [phoneActive, setPhoneActive] = useState<boolean>(true);

  // Email Modal
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<ContactSupportEmail | null>(null);
  const [emailLabel, setEmailLabel] = useState('');
  const [emailAddressValue, setEmailAddressValue] = useState('');
  const [emailOrder, setEmailOrder] = useState<number>(1);
  const [emailActive, setEmailActive] = useState<boolean>(true);

  // Hours Modal
  const [hourModalOpen, setHourModalOpen] = useState(false);
  const [editingHour, setEditingHour] = useState<ContactResponseHour | null>(null);
  const [hourDayLabel, setHourDayLabel] = useState('');
  const [hourValue, setHourValue] = useState('');
  const [hourOrder, setHourOrder] = useState<number>(1);
  const [hourActive, setHourActive] = useState<boolean>(true);

  // Saving state
  const [isSavingPage, setIsSavingPage] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/contact', { cache: 'no-store' });
      if (!res.ok) throw new Error('خطا در دریافت اطلاعات تماس');
      const data = await res.json();
      if (data.page) setPageContent(data.page);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setPhones(Array.isArray(data.phones) ? data.phones : []);
      setEmails(Array.isArray(data.emails) ? data.emails : []);
      setHours(Array.isArray(data.hours) ? data.hours : []);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در بارگذاری اطلاعات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const notifySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // ── Page Info Save ──
  const handleSavePageContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPage(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/contact/page', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageContent),
      });
      if (!res.ok) throw new Error('خطا در ذخیره‌سازی اطلاعات صفحه');
      const saved = await res.json();
      setPageContent(saved);
      notifySuccess('اطلاعات و نشانی شرکت با موفقیت در دیتابیس بروزرسانی شد.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در ذخیره اطلاعات');
    } finally {
      setIsSavingPage(false);
    }
  };

  // ── Message Status Change ──
  const handleUpdateMessageStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/contact/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('خطا در تغییر وضعیت پیام');
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
      if (viewingMessage && viewingMessage.id === id) {
        setViewingMessage({ ...viewingMessage, status: newStatus });
      }
      notifySuccess('وضعیت پیام با موفقیت بروزرسانی شد.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در بروزرسانی وضعیت');
    }
  };

  // ── Message Delete ──
  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('آیا از حذف این پیام اطمینان دارید؟ این عملیات قابل بازگشت نیست.')) return;
    try {
      const res = await fetch(`/api/admin/contact/messages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('خطا در حذف پیام');
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (viewingMessage?.id === id) setViewingMessage(null);
      notifySuccess('پیام با موفقیت حذف شد.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در حذف پیام');
    }
  };

  // ── Phone CRUD ──
  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneLabel.trim() || !phoneNumberValue.trim()) return;

    try {
      if (editingPhone) {
        const res = await fetch(`/api/admin/contact/phones/${editingPhone.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label: phoneLabel,
            phone: phoneNumberValue,
            display_order: phoneOrder,
            is_active: phoneActive,
          }),
        });
        if (!res.ok) throw new Error('خطا در ویرایش شماره تماس');
        const updated = await res.json();
        setPhones((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        notifySuccess('شماره تماس با موفقیت ویرایش شد.');
      } else {
        const res = await fetch('/api/admin/contact/phones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label: phoneLabel,
            phone: phoneNumberValue,
            display_order: phoneOrder,
            is_active: phoneActive,
          }),
        });
        if (!res.ok) throw new Error('خطا در ثبت شماره تماس جدید');
        const created = await res.json();
        setPhones((prev) => [...prev, created]);
        notifySuccess('شماره تماس جدید با موفقیت اضافه شد.');
      }
      setPhoneModalOpen(false);
      setEditingPhone(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در ذخیره شماره');
    }
  };

  const handleDeletePhone = async (id: string) => {
    if (!window.confirm('آیا از حذف این شماره تماس اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/admin/contact/phones/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('خطا در حذف شماره تماس');
      setPhones((prev) => prev.filter((p) => p.id !== id));
      notifySuccess('شماره تماس حذف شد.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در حذف شماره');
    }
  };

  // ── Email CRUD ──
  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailLabel.trim() || !emailAddressValue.trim()) return;

    try {
      if (editingEmail) {
        const res = await fetch(`/api/admin/contact/emails/${editingEmail.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label: emailLabel,
            email: emailAddressValue,
            display_order: emailOrder,
            is_active: emailActive,
          }),
        });
        if (!res.ok) throw new Error('خطا در ویرایش ایمیل پشتیبانی');
        const updated = await res.json();
        setEmails((prev) => prev.map((em) => (em.id === updated.id ? updated : em)));
        notifySuccess('ایمیل پشتیبانی با موفقیت ویرایش شد.');
      } else {
        const res = await fetch('/api/admin/contact/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label: emailLabel,
            email: emailAddressValue,
            display_order: emailOrder,
            is_active: emailActive,
          }),
        });
        if (!res.ok) throw new Error('خطا در ثبت ایمیل جدید');
        const created = await res.json();
        setEmails((prev) => [...prev, created]);
        notifySuccess('ایمیل جدید با موفقیت اضافه شد.');
      }
      setEmailModalOpen(false);
      setEditingEmail(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در ذخیره ایمیل');
    }
  };

  const handleDeleteEmail = async (id: string) => {
    if (!window.confirm('آیا از حذف این ایمیل پشتیبانی اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/admin/contact/emails/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('خطا در حذف ایمیل');
      setEmails((prev) => prev.filter((em) => em.id !== id));
      notifySuccess('ایمیل پشتیبانی حذف شد.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در حذف ایمیل');
    }
  };

  // ── Hours CRUD ──
  const handleSaveHour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hourDayLabel.trim() || !hourValue.trim()) return;

    try {
      if (editingHour) {
        const res = await fetch(`/api/admin/contact/hours/${editingHour.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day_label: hourDayLabel,
            hours: hourValue,
            display_order: hourOrder,
            is_active: hourActive,
          }),
        });
        if (!res.ok) throw new Error('خطا در ویرایش ساعات کاری');
        const updated = await res.json();
        setHours((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
        notifySuccess('ساعات کاری با موفقیت ویرایش شد.');
      } else {
        const res = await fetch('/api/admin/contact/hours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day_label: hourDayLabel,
            hours: hourValue,
            display_order: hourOrder,
            is_active: hourActive,
          }),
        });
        if (!res.ok) throw new Error('خطا در ثبت ساعات کاری جدید');
        const created = await res.json();
        setHours((prev) => [...prev, created]);
        notifySuccess('ساعات کاری با موفقیت اضافه شد.');
      }
      setHourModalOpen(false);
      setEditingHour(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در ذخیره ساعات کاری');
    }
  };

  const handleDeleteHour = async (id: string) => {
    if (!window.confirm('آیا از حذف این ساعات کاری اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/admin/contact/hours/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('خطا در حذف ساعات کاری');
      setHours((prev) => prev.filter((h) => h.id !== id));
      notifySuccess('ساعات کاری حذف شد.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در حذف ساعات کاری');
    }
  };

  // Filtered messages
  const filteredMessages = messages.filter((m) => {
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.message.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">جدید</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">در انتظار بررسی</span>;
      case 'answered':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">پاسخ داده‌شده</span>;
      case 'read':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">خوانده‌شده</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const lat = pageContent.latitude != null ? Number(pageContent.latitude) : 35.7575;
  const lon = pageContent.longitude != null ? Number(pageContent.longitude) : 51.4106;
  const delta = 0.007;
  const previewMapSrc = pageContent.map_url
    ? pageContent.map_url
    : `https://www.openstreetmap.org/export/embed.html?bbox=${(lon - delta).toFixed(5)}%2C${(lat - delta).toFixed(5)}%2C${(lon + delta).toFixed(5)}%2C${(lat + delta).toFixed(5)}&layer=mapnik&marker=${lat.toFixed(5)}%2C${lon.toFixed(5)}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-200 hidden lg:flex flex-col border-l border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              ر
            </div>
            <div>
              <div className="font-bold text-white text-base">پنل مدیریت رادینت</div>
              <div className="text-xs text-slate-400">سیستم تله‌رادیولوژی</div>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/admin/contact';
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-2">
            <span>مدیر سیستم</span>
            <span className="text-emerald-400 font-mono">آنلاین</span>
          </div>
          {signOut && (
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span>خروج از حساب</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <PhoneCall className="text-blue-600" size={22} />
              <span>مدیریت صفحه و پیام‌های تماس با ما</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              مدیریت اطلاعات تماس، موقعیت نقشه، شماره‌ها، ایمیل‌ها و پاسخگویی به پیام‌های ارسالی کاربران
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData()}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 text-xs"
              title="بروزرسانی داده‌ها"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>بروزرسانی</span>
            </button>
            <a
              href="/contact"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors border border-slate-200"
            >
              <ExternalLink size={14} />
              <span>مشاهده صفحه سایت</span>
            </a>
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
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'messages'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Inbox size={16} />
              <span>پیام‌های دریافتی کاربران</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-bold">
                {messages.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <MapPin size={16} />
              <span>اطلاعات و نقشه شرکت</span>
            </button>

            <button
              onClick={() => setActiveTab('phones')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'phones'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Phone size={16} />
              <span>شماره‌های تماس</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-bold">
                {phones.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('emails')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'emails'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Mail size={16} />
              <span>ایمیل‌های پشتیبانی</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-bold">
                {emails.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('hours')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'hours'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Clock size={16} />
              <span>ساعات پاسخگویی</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-bold">
                {hours.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* TAB 1: Messages */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              {/* Filter / Search Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1">
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو در نام، ایمیل، شماره تماس، موضوع و متن پیام..."
                    className="w-full pl-3 pr-9 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 whitespace-nowrap">وضعیت:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="all">همه وضعیت‌ها ({messages.length})</option>
                    <option value="new">جدید ({messages.filter((m) => m.status === 'new').length})</option>
                    <option value="pending">در انتظار بررسی ({messages.filter((m) => m.status === 'pending').length})</option>
                    <option value="answered">پاسخ داده‌شده ({messages.filter((m) => m.status === 'answered').length})</option>
                    <option value="read">خوانده‌شده ({messages.filter((m) => m.status === 'read').length})</option>
                  </select>
                </div>
              </div>

              {/* Messages Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {filteredMessages.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Inbox size={42} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">پیامی یافت نشد.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold">
                        <tr>
                          <th className="py-3 px-4">کاربر و تاریخ</th>
                          <th className="py-3 px-4">اطلاعات تماس</th>
                          <th className="py-3 px-4">موضوع و متن پیام</th>
                          <th className="py-3 px-4">وضعیت</th>
                          <th className="py-3 px-4 text-center">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredMessages.map((msg) => (
                          <tr key={msg.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-semibold text-slate-900">{msg.name}</div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5">
                                {toShamsiDate(msg.created_at)}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="text-slate-800 font-mono text-xs">{msg.phone}</div>
                              <div className="text-slate-500 text-xs truncate max-w-[180px]">{msg.email}</div>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="font-medium text-slate-900 truncate">{msg.subject}</div>
                              <div className="text-xs text-slate-500 truncate mt-0.5">{msg.message}</div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <select
                                value={msg.status}
                                onChange={(e) => handleUpdateMessageStatus(msg.id, e.target.value)}
                                className="text-xs rounded-lg border border-slate-200 py-1 px-2 bg-white focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                              >
                                <option value="new">جدید</option>
                                <option value="pending">در انتظار بررسی</option>
                                <option value="answered">پاسخ داده‌شده</option>
                                <option value="read">خوانده‌شده</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setViewingMessage(msg)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="مشاهده متن کامل"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="حذف پیام"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Info & Map */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form onSubmit={handleSavePageContent} className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MapPin size={18} className="text-blue-600" />
                  <span>تنظیمات محتوا، نشانی و مختصات نقشه</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">عنوان هدر صفحه</label>
                    <input
                      type="text"
                      value={pageContent.hero_title}
                      onChange={(e) => setPageContent({ ...pageContent, hero_title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">زیرعنوان هدر صفحه</label>
                    <input
                      type="text"
                      value={pageContent.hero_subtitle}
                      onChange={(e) => setPageContent({ ...pageContent, hero_subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">عنوان بخش اطلاعات تماس</label>
                  <input
                    type="text"
                    value={pageContent.intro_title}
                    onChange={(e) => setPageContent({ ...pageContent, intro_title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">متن توضیحات و خوش‌آمدگویی</label>
                  <textarea
                    rows={3}
                    value={pageContent.intro_body}
                    onChange={(e) => setPageContent({ ...pageContent, intro_body: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="توضیحاتی برای مراجعین و مخاطبان رادینت..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">نشانی کامل دفتر مرکزی</label>
                  <textarea
                    rows={2}
                    value={pageContent.office_address}
                    onChange={(e) => setPageContent({ ...pageContent, office_address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="تهران، خیابان ولیعصر..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      عرض جغرافیایی (Latitude)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={pageContent.latitude ?? ''}
                      onChange={(e) =>
                        setPageContent({
                          ...pageContent,
                          latitude: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                      placeholder="35.7575"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">مثال تهران ونک: 35.7575</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      طول جغرافیایی (Longitude)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={pageContent.longitude ?? ''}
                      onChange={(e) =>
                        setPageContent({
                          ...pageContent,
                          longitude: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                      placeholder="51.4106"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">مثال تهران ونک: 51.4106</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    آدرس امبد سفارشی نقشه (اختیاری)
                  </label>
                  <input
                    type="url"
                    value={pageContent.map_url || ''}
                    onChange={(e) => setPageContent({ ...pageContent, map_url: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                    placeholder="در صورت خالی بودن، نقشه خودکار بر اساس مختصات OpenStreetMap ساخته می‌شود"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingPage}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    <span>{isSavingPage ? 'در حال ذخیره‌سازی...' : 'ذخیره تغییرات در دیتابیس'}</span>
                  </button>
                </div>
              </form>

              {/* Map Live Preview */}
              <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                  <Compass size={18} className="text-blue-600" />
                  <span>پیش‌نمایش زنده نقشه (OpenStreetMap)</span>
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  موقعیت دفتر به صورت آنی با نقشه منبع‌باز و رایگان OpenStreetMap بدون نیاز به هیچ کلید یا تحریمی رندر می‌شود.
                </p>

                <div className="flex-1 min-h-[300px] border border-slate-200 rounded-xl overflow-hidden relative bg-slate-50">
                  <iframe
                    title="پیش نمایش نقشه"
                    src={previewMapSrc}
                    className="w-full h-full border-0 absolute inset-0"
                    loading="lazy"
                  />
                </div>

                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 flex justify-between items-center">
                  <span>مختصات فعلی: {lat.toFixed(4)}, {lon.toFixed(4)}</span>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>مشاهده در OpenStreetMap</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Phones */}
          {activeTab === 'phones' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900">شماره‌های تماس رادینت</h2>
                  <p className="text-xs text-slate-500 mt-0.5">افزودن و مدیریت خطوط تلفن ثابت، همراه و پشتیبانی</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPhone(null);
                    setPhoneLabel('');
                    setPhoneNumberValue('');
                    setPhoneOrder(phones.length + 1);
                    setPhoneActive(true);
                    setPhoneModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  <Plus size={16} />
                  <span>افزودن شماره تماس جدید</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-3 px-4">عنوان بخش / خط</th>
                      <th className="py-3 px-4">شماره تماس</th>
                      <th className="py-3 px-4 text-center">ترتیب نمایش</th>
                      <th className="py-3 px-4 text-center">وضعیت</th>
                      <th className="py-3 px-4 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {phones.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{p.label}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-800">{p.phone}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs">{p.display_order}</td>
                        <td className="py-3.5 px-4 text-center">
                          {p.is_active ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-medium">فعال</span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-medium">غیرفعال</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingPhone(p);
                                setPhoneLabel(p.label);
                                setPhoneNumberValue(p.phone);
                                setPhoneOrder(p.display_order);
                                setPhoneActive(p.is_active);
                                setPhoneModalOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ویرایش"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeletePhone(p.id)}
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
              </div>
            </div>
          )}

          {/* TAB 4: Support Emails */}
          {activeTab === 'emails' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900">ایمیل‌های پشتیبانی و سازمانی</h2>
                  <p className="text-xs text-slate-500 mt-0.5">افزودن و مدیریت آدرس‌های الکترونیکی ارتباط با رادینت</p>
                </div>
                <button
                  onClick={() => {
                    setEditingEmail(null);
                    setEmailLabel('');
                    setEmailAddressValue('');
                    setEmailOrder(emails.length + 1);
                    setEmailActive(true);
                    setEmailModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  <Plus size={16} />
                  <span>افزودن ایمیل جدید</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-3 px-4">عنوان بخش</th>
                      <th className="py-3 px-4">آدرس ایمیل</th>
                      <th className="py-3 px-4 text-center">ترتیب نمایش</th>
                      <th className="py-3 px-4 text-center">وضعیت</th>
                      <th className="py-3 px-4 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {emails.map((em) => (
                      <tr key={em.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{em.label}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-800 text-xs">{em.email}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs">{em.display_order}</td>
                        <td className="py-3.5 px-4 text-center">
                          {em.is_active ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-medium">فعال</span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-medium">غیرفعال</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingEmail(em);
                                setEmailLabel(em.label);
                                setEmailAddressValue(em.email);
                                setEmailOrder(em.display_order);
                                setEmailActive(em.is_active);
                                setEmailModalOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ویرایش"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteEmail(em.id)}
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
              </div>
            </div>
          )}

          {/* TAB 5: Response Hours */}
          {activeTab === 'hours' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900">ساعات پاسخگویی و کاری شرکت</h2>
                  <p className="text-xs text-slate-500 mt-0.5">تنظیم روزها و ساعات کاری بخش‌های پشتیبانی و تله‌ریپورت</p>
                </div>
                <button
                  onClick={() => {
                    setEditingHour(null);
                    setHourDayLabel('');
                    setHourValue('');
                    setHourOrder(hours.length + 1);
                    setHourActive(true);
                    setHourModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  <Plus size={16} />
                  <span>افزودن ساعات کاری جدید</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-3 px-4">روز یا ایام هفته</th>
                      <th className="py-3 px-4">ساعات کاری و پاسخگویی</th>
                      <th className="py-3 px-4 text-center">ترتیب نمایش</th>
                      <th className="py-3 px-4 text-center">وضعیت</th>
                      <th className="py-3 px-4 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hours.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{h.day_label}</td>
                        <td className="py-3.5 px-4 text-slate-800">{h.hours}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs">{h.display_order}</td>
                        <td className="py-3.5 px-4 text-center">
                          {h.is_active ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-medium">فعال</span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-medium">غیرفعال</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingHour(h);
                                setHourDayLabel(h.day_label);
                                setHourValue(h.hours);
                                setHourOrder(h.display_order);
                                setHourActive(h.is_active);
                                setHourModalOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ویرایش"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteHour(h.id)}
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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      {viewingMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Inbox size={18} className="text-blue-600" />
                <span>جزئیات پیام کاربر</span>
              </h3>
              <button
                onClick={() => setViewingMessage(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>فرستنده: <strong className="text-slate-900 text-sm">{viewingMessage.name}</strong></span>
                  <span className="font-mono">{toShamsiDate(viewingMessage.created_at)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
                  <span>تلفن: <span className="font-mono text-blue-600">{viewingMessage.phone}</span></span>
                  <span>ایمیل: <span className="font-mono text-slate-700">{viewingMessage.email}</span></span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">موضوع پیام:</span>
                <div className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {viewingMessage.subject}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">متن کامل پیام:</span>
                <div className="text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-100 whitespace-pre-wrap leading-relaxed text-sm">
                  {viewingMessage.message}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">تغییر وضعیت:</span>
                  <select
                    value={viewingMessage.status}
                    onChange={(e) => handleUpdateMessageStatus(viewingMessage.id, e.target.value)}
                    className="text-xs rounded-lg border border-slate-200 py-1.5 px-3 bg-white font-medium"
                  >
                    <option value="new">جدید</option>
                    <option value="pending">در انتظار بررسی</option>
                    <option value="answered">پاسخ داده‌شده</option>
                    <option value="read">خوانده‌شده</option>
                  </select>
                </div>

                <button
                  onClick={() => handleDeleteMessage(viewingMessage.id)}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  <span>حذف پیام</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone Add/Edit Modal */}
      {phoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSavePhone} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Phone size={18} className="text-blue-600" />
                <span>{editingPhone ? 'ویرایش شماره تماس' : 'افزودن شماره تماس جدید'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setPhoneModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان بخش یا خط</label>
                <input
                  type="text"
                  required
                  value={phoneLabel}
                  onChange={(e) => setPhoneLabel(e.target.value)}
                  placeholder="مثال: پشتیبانی فنی ۲۴ ساعته"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">شماره تماس</label>
                <input
                  type="text"
                  required
                  value={phoneNumberValue}
                  onChange={(e) => setPhoneNumberValue(e.target.value)}
                  placeholder="مثال: ۰۲۱-۸۸۸۸۱۹۲۰"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ترتیب نمایش</label>
                  <input
                    type="number"
                    value={phoneOrder}
                    onChange={(e) => setPhoneOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">وضعیت نمایش</label>
                  <select
                    value={phoneActive ? 'active' : 'inactive'}
                    onChange={(e) => setPhoneActive(e.target.value === 'active')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="active">فعال و قابل مشاهده</option>
                    <option value="inactive">غیرفعال (مخفی)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPhoneModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                ذخیره شماره
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Email Add/Edit Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveEmail} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail size={18} className="text-blue-600" />
                <span>{editingEmail ? 'ویرایش ایمیل پشتیبانی' : 'افزودن ایمیل پشتیبانی جدید'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان واحد / دپارتمان</label>
                <input
                  type="text"
                  required
                  value={emailLabel}
                  onChange={(e) => setEmailLabel(e.target.value)}
                  placeholder="مثال: امور همکاری و قراردادها"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">آدرس ایمیل</label>
                <input
                  type="email"
                  required
                  value={emailAddressValue}
                  onChange={(e) => setEmailAddressValue(e.target.value)}
                  placeholder="مثال: support@radinet.ir"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ترتیب نمایش</label>
                  <input
                    type="number"
                    value={emailOrder}
                    onChange={(e) => setEmailOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">وضعیت نمایش</label>
                  <select
                    value={emailActive ? 'active' : 'inactive'}
                    onChange={(e) => setEmailActive(e.target.value === 'active')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="active">فعال و قابل مشاهده</option>
                    <option value="inactive">غیرفعال (مخفی)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                ذخیره ایمیل
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hours Add/Edit Modal */}
      {hourModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveHour} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                <span>{editingHour ? 'ویرایش ساعات پاسخگویی' : 'افزودن ساعات پاسخگویی جدید'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setHourModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">روز یا بازه زمانی</label>
                <input
                  type="text"
                  required
                  value={hourDayLabel}
                  onChange={(e) => setHourDayLabel(e.target.value)}
                  placeholder="مثال: شنبه تا چهارشنبه"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ساعات کاری یا شیفت</label>
                <input
                  type="text"
                  required
                  value={hourValue}
                  onChange={(e) => setHourValue(e.target.value)}
                  placeholder="مثال: ۸:۰۰ الی ۱۷:۰۰"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ترتیب نمایش</label>
                  <input
                    type="number"
                    value={hourOrder}
                    onChange={(e) => setHourOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">وضعیت نمایش</label>
                  <select
                    value={hourActive ? 'active' : 'inactive'}
                    onChange={(e) => setHourActive(e.target.value === 'active')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="active">فعال و قابل مشاهده</option>
                    <option value="inactive">غیرفعال (مخفی)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setHourModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                ذخیره ساعات
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
