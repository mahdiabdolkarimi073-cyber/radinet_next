'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Calendar, FileCheck, FileText, Lock, ShieldAlert } from 'lucide-react';
import type { LegalDocument, LegalDocumentType } from '@/lib/legal-data';
import { documentTypeLabels } from '@/lib/legal-data';
import { recordLegalView } from '@/lib/legal-repository';
import { toShamsiDate } from '@/lib/articles-types';

type LegalPageProps = {
  document: LegalDocument | null;
  documentType: LegalDocumentType;
};

export function LegalPage({ document, documentType }: LegalPageProps) {
  useEffect(() => {
    void recordLegalView(documentType);
  }, [documentType]);

  const navItems: { type: LegalDocumentType; label: string; icon: typeof FileText }[] = [
    { type: 'terms', label: 'قوانین و شرایط استفاده', icon: FileCheck },
    { type: 'privacy', label: 'سیاست حفظ حریم خصوصی', icon: Lock },
    { type: 'data_processing', label: 'نحوه نگهداری و پردازش داده‌ها', icon: FileText },
  ];

  const formattedDate = document?.last_updated
    ? toShamsiDate(document.last_updated)
    : '—';

  return (
    <div className="legal-screen">
      <section className="legal-hero">
        <div className="container legal-hero__content">
          <span className="legal-hero__breadcrumb">خانه / قوانین و مقررات / {documentTypeLabels[documentType]}</span>
          <h1>{documentTypeLabels[documentType]}</h1>
          <p>مطالعه شرایط، استانداردهای امنیتی و سیاست‌های حفظ حریم خصوصی سامانه رادینت</p>
          <div className="legal-hero__divider" />
        </div>
      </section>

      {/* Navigation tabs between legal documents */}
      <section className="legal-content-section">
        <div className="container">
          <div className="max-w-[1100px] mx-auto mb-6 flex flex-wrap gap-2.5 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.type === documentType;
              return (
                <Link
                  key={item.type}
                  href={`/legal/${item.type}`}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="legal-rules-card">
            {!document || !document.is_active ? (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <ShieldAlert size={48} className="mx-auto text-amber-500 opacity-80" />
                <h3 className="text-xl font-bold text-slate-800">این سند در حال حاضر در دسترس نیست</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  محتوای این سند در وضعیت پیش‌نویس قرار دارد یا به‌روزرسانی آن توسط تیم مدیریت رادینت در حال بازبینی است.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <h2>{document.title}</h2>
                    <p className="legal-intro-text mb-0 mt-2">
                      با استفاده از خدمات رادینت، شما موافقت می‌فرمایید که از این سامانه مطابق با ضوابط زیر استفاده نمایید:
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    <span>نسخه سند:</span>
                    <span className="font-mono font-bold">{document.version_number}</span>
                  </div>
                </div>

                <div
                  className="legal-document-content"
                  dangerouslySetInnerHTML={{ __html: document.content }}
                />

                <div className="legal-update-date">
                  <hr />
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>تاریخ آخرین بروزرسانی:</span>
                      <strong className="text-slate-700">{formattedDate}</strong>
                    </span>
                    <span className="text-slate-400">
                      پلتفرم سلامت دیجیتال و تله‌رادیولوژی رادینت
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
