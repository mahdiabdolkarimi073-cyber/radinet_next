'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  History,
  Lock,
  LogOut,
  RefreshCw,
  Save,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { adminNavItems } from '@/lib/admin-nav';
import { toShamsiDate } from '@/lib/articles-types';
import type {
  LegalChangeLog,
  LegalDocument,
  LegalDocumentType,
  LegalDocumentVersion,
} from '@/lib/legal-data';
import { documentTypeLabels } from '@/lib/legal-data';

export function AdminLegalPage() {
  const { user, signOut } = useAuth();
  const [selectedType, setSelectedType] = useState<LegalDocumentType>('terms');
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Documents state
  const [documents, setDocuments] = useState<Record<string, LegalDocument>>({});
  const [versions, setVersions] = useState<LegalDocumentVersion[]>([]);
  const [changeLogs, setChangeLogs] = useState<LegalChangeLog[]>([]);

  // Current editing form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [versionNumber, setVersionNumber] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [effectiveDate, setEffectiveDate] = useState<string>('');
  const [scheduledPublishDate, setScheduledPublishDate] = useState<string>('');
  const [bumpVersion, setBumpVersion] = useState<boolean>(false);
  const [changeSummary, setChangeSummary] = useState<string>('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
      const res = await fetch('/api/admin/legal', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('خطا در دریافت اطلاعات قوانین و مقررات');
      const data = await res.json();

      const docMap: Record<string, LegalDocument> = {};
      if (Array.isArray(data.documents)) {
        for (const doc of data.documents) {
          docMap[doc.document_type] = doc;
        }
      }
      setDocuments(docMap);
      setVersions(Array.isArray(data.versions) ? data.versions : []);
      setChangeLogs(Array.isArray(data.changeLogs) ? data.changeLogs : []);

      // Populate current active doc
      const currentDoc = docMap[selectedType];
      if (currentDoc) {
        setTitle(currentDoc.title || '');
        setContent(currentDoc.content || '');
        setVersionNumber(currentDoc.version_number || 1);
        setIsActive(Boolean(currentDoc.is_active));
        setEffectiveDate(currentDoc.effective_date || '');
        setScheduledPublishDate(currentDoc.scheduled_publish_date || '');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در بارگذاری اطلاعات');
    } finally {
      setIsLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When selectedType changes, update form fields from docMap
  useEffect(() => {
    const currentDoc = documents[selectedType];
    if (currentDoc) {
      setTitle(currentDoc.title || '');
      setContent(currentDoc.content || '');
      setVersionNumber(currentDoc.version_number || 1);
      setIsActive(Boolean(currentDoc.is_active));
      setEffectiveDate(currentDoc.effective_date || '');
      setScheduledPublishDate(currentDoc.scheduled_publish_date || '');
      setBumpVersion(false);
      setChangeSummary('');
    }
  }, [selectedType, documents]);

  const notifySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMessage('عنوان و متن سند الزامی هستند.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
      const res = await fetch(`/api/admin/legal/${selectedType}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          content,
          version_number: versionNumber,
          is_active: isActive,
          effective_date: effectiveDate || new Date().toISOString(),
          scheduled_publish_date: scheduledPublishDate || null,
          bump_version: bumpVersion,
          summary: changeSummary.trim() || (isActive ? 'بروزرسانی سند توسط مدیر' : 'ذخیره پیش‌نویس توسط مدیر'),
          actor: user?.fullName || 'مدیر سیستم',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'خطا در ذخیره‌سازی سند');
      }

      const updated = await res.json();
      setDocuments((prev) => ({ ...prev, [selectedType]: updated }));
      setVersionNumber(updated.version_number);
      setBumpVersion(false);
      setChangeSummary('');
      notifySuccess(
        isActive
          ? `سند «${documentTypeLabels[selectedType]}» با موفقیت ذخیره و در سایت منتشر شد.`
          : `سند «${documentTypeLabels[selectedType]}» به صورت پیش‌نویس ذخیره شد (برای عموم مخفی است).`
      );
      void loadData();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'خطا در ذخیره‌سازی');
    } finally {
      setIsSaving(false);
    }
  };

  const currentDoc = documents[selectedType];
  const filteredVersions = versions.filter((v) => v.document_type === selectedType);
  const filteredLogs = changeLogs.filter((l) => l.document_type === selectedType);

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
            const active = item.href === '/admin/legal';
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
            <span>مدیر ارشد حقوقی</span>
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

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <FileCheck className="text-blue-600" size={22} />
              <span>مدیریت قوانین و مقررات، حریم خصوصی و پردازش داده‌ها</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              مدیریت و انتشار اسناد رسمی، کنترل پیش‌نویس‌ها و ثبت تغییرات و نسخه‌ها بدون نیاز به تغییر کد
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
              href={`/legal/${selectedType}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors border border-slate-200"
            >
              <ExternalLink size={14} />
              <span>مشاهده سند در سایت</span>
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

        {/* Document Type Selector Tabs */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
            <button
              onClick={() => setSelectedType('terms')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedType === 'terms'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <FileCheck size={16} />
              <span>قوانین و شرایط استفاده</span>
              {documents.terms && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    documents.terms.is_active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {documents.terms.is_active ? 'منتشرشده' : 'پیش‌نویس'}
                </span>
              )}
            </button>

            <button
              onClick={() => setSelectedType('privacy')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedType === 'privacy'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Lock size={16} />
              <span>سیاست حفظ حریم خصوصی</span>
              {documents.privacy && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    documents.privacy.is_active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {documents.privacy.is_active ? 'منتشرشده' : 'پیش‌نویس'}
                </span>
              )}
            </button>

            <button
              onClick={() => setSelectedType('data_processing')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedType === 'data_processing'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <FileText size={16} />
              <span>نحوه نگهداری و پردازش داده‌ها</span>
              {documents.data_processing && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    documents.data_processing.is_active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {documents.data_processing.is_active ? 'منتشرشده' : 'پیش‌نویس'}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sub-tabs: Editor vs History */}
        <div className="px-6 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Edit3 size={13} />
                <span>ویرایشگر و تنظیمات سند</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <History size={13} />
                <span>تاریخچه نسخه‌ها و تغییرات</span>
                <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono text-[10px]">
                  {filteredVersions.length}
                </span>
              </span>
            </button>
          </div>

          {activeTab === 'editor' && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPreviewMode('edit')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  previewMode === 'edit' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-600'
                }`}
              >
                کد و فرمت
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('preview')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  previewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-600'
                }`}
              >
                پیش‌نمایش زنده در سایت
              </button>
            </div>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'editor' && (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Status and Meta card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">وضعیت انتشار سند:</span>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isActive ? 'منتشرشده (عمومی)' : 'پیش‌نویس (غیرقابل نمایش برای کاربران)'}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      <span>آخرین بروزرسانی در دیتابیس:</span>
                      <strong className="text-slate-700 font-mono">
                        {currentDoc?.last_updated ? toShamsiDate(currentDoc.last_updated) : '—'}
                      </strong>
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                      <span>شماره نسخه جاری:</span>
                      <strong className="text-blue-600 font-mono font-bold">{versionNumber}</strong>
                    </span>
                  </div>
                </div>

                {!isActive && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                    <span>
                      توجه: این سند در وضعیت <strong>پیش‌نویس</strong> قرار دارد و کاربران عادی در صفحه <code>/legal/{selectedType}</code> محتوای آن را نخواهند دید.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      عنوان سند حقوقی
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="عنوان سند حقوقی..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      شماره نسخه (Version Number)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={versionNumber}
                      onChange={(e) => setVersionNumber(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Content Editor Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      متن کامل و بندهای حقوقی ({documentTypeLabels[selectedType]})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      از عناوین، پاراگراف‌ها و لیست‌های شماره‌دار <code>&lt;ol&gt; &lt;li&gt;</code> برای چیدمان زیبا استفاده نمایید.
                    </p>
                  </div>

                  {previewMode === 'edit' && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>راهنمای ساختار:</span>
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-700">
                        &lt;ol&gt; &lt;li&gt;&lt;strong&gt;عنوان&lt;/strong&gt;&lt;p&gt;متن&lt;/p&gt;&lt;/li&gt; &lt;/ol&gt;
                      </code>
                    </div>
                  )}
                </div>

                {previewMode === 'edit' ? (
                  <div>
                    <textarea
                      rows={18}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="متن سند حقوقی به همراه تگ‌های HTML..."
                      className="w-full p-4 rounded-xl border border-slate-200 text-sm font-mono leading-relaxed focus:outline-none focus:border-blue-500 bg-slate-50/50"
                      dir="rtl"
                    />
                  </div>
                ) : (
                  <div className="p-8 border border-slate-200 rounded-xl bg-white shadow-inner max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>
                    <div
                      className="legal-document-content text-slate-700 leading-loose"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                    <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                      <Calendar size={14} />
                      <span>تاریخ پیش‌نمایش آخرین بروزرسانی: امروز</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Version Bump & Change Summary Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase">عملیات نسخه و انتشار</h4>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bumpVersion}
                      onChange={(e) => setBumpVersion(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-800">
                      افزایش خودکار شماره نسخه (ارتقا به نسخه {versionNumber + 1}) و بایگانی نسخه فعلی در تاریخچه
                    </span>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      خلاصه یا یادداشت تغییرات (اختیاری جهت ثبت در لاگ سیستم)
                    </label>
                    <input
                      type="text"
                      value={changeSummary}
                      onChange={(e) => setChangeSummary(e.target.value)}
                      placeholder="مثال: به‌روزرسانی بند ۳ مربوط به استانداردهای امنیتی و زمان نگهداری پرونده‌ها"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Save size={16} />
                      <span>
                        {isSaving
                          ? 'در حال ذخیره‌سازی...'
                          : isActive
                          ? 'ذخیره و انتشار فوری در سایت'
                          : 'ذخیره تغییرات به عنوان پیش‌نویس'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsActive(!isActive);
                      }}
                      className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      {isActive ? 'تغییر به وضعیت پیش‌نویس' : 'تغییر به وضعیت انتشار عمومی'}
                    </button>
                  </div>

                  <a
                    href={`/legal/${selectedType}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>مشاهده صفحه اصلی در سایت</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Versions Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <History size={16} className="text-blue-600" />
                    <span>نسخه‌های بایگانی‌شده سند ({documentTypeLabels[selectedType]})</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    تعداد نسخه‌های بایگانی: {filteredVersions.length}
                  </span>
                </div>

                {filteredVersions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <History size={36} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">هنوز نسخه بایگانی‌شده‌ای برای این سند ثبت نشده است.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      با تیک زدن گزینه «افزایش شماره نسخه» هنگام ذخیره، نسخه قبلی در این قسمت بایگانی می‌شود.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-3 px-4">شماره نسخه</th>
                        <th className="py-3 px-4">عنوان نسخه</th>
                        <th className="py-3 px-4">تاریخ آرشیو</th>
                        <th className="py-3 px-4 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredVersions.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600">نسخه {v.version_number}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{v.title}</td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                            {toShamsiDate(v.archived_at)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('آیا مایل به بازگردانی متن این نسخه به عنوان محتوای ویرایشگر هستید؟')) {
                                  setTitle(v.title);
                                  setContent(v.content);
                                  setActiveTab('editor');
                                  notifySuccess(`متن نسخه ${v.version_number} در ویرایشگر بارگذاری شد.`);
                                }
                              }}
                              className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200 font-medium"
                            >
                              بارگذاری در ویرایشگر
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Change Logs Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    <span>لاگ تغییرات و عملیات مدیران (Audit Log)</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    تعداد رخدادها: {filteredLogs.length}
                  </span>
                </div>

                {filteredLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Clock size={36} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">لاگی ثبت نشده است.</p>
                  </div>
                ) : (
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-3 px-4">کاربر / اقدام‌کننده</th>
                        <th className="py-3 px-4">نوع عملیات</th>
                        <th className="py-3 px-4">خلاصه تغییرات</th>
                        <th className="py-3 px-4">تاریخ و زمان</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{log.actor}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-medium">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{log.summary || '—'}</td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                            {toShamsiDate(log.created_at)}
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
    </div>
  );
}
