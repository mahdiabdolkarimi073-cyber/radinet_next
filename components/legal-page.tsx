'use client';

import { useEffect } from 'react';
import { Calendar } from 'lucide-react';
import type { LegalDocument, LegalDocumentType } from '@/lib/legal-data';
import { documentTypeLabels } from '@/lib/legal-data';
import { recordLegalView } from '@/lib/legal-repository';

type LegalPageProps = {
  document: LegalDocument;
  documentType: LegalDocumentType;
};

export function LegalPage({ document, documentType }: LegalPageProps) {
  useEffect(() => {
    void recordLegalView(documentType);
  }, [documentType]);

  const formattedDate = document.last_updated
    ? new Date(document.last_updated).toLocaleDateString('fa-IR')
    : '—';

  return (
    <div className="legal-screen">
      <section className="legal-hero">
        <div className="container legal-hero__content">
          <span className="legal-hero__breadcrumb">خانه / {documentTypeLabels[documentType]}</span>
          <h1>{documentTypeLabels[documentType]}</h1>
          <p>لطفاً توضیحات و مقررات استفاده از سامانه را به دقت مطالعه فرمایید.</p>
          <div className="legal-hero__divider" />
        </div>
      </section>

      <section className="legal-content-section">
        <div className="container">
          <div className="legal-rules-card">
            <h2>{document.title}</h2>
            <p className="legal-intro-text">
              با استفاده از خدمات رادینت، شما موافقت می‌کنید که از این سامانه مطابق با قوانین و مقررات زیر استفاده نمایید:
            </p>

            <div
              className="legal-document-content"
              dangerouslySetInnerHTML={{ __html: document.content }}
            />

            <div className="legal-update-date">
              <hr />
              <span>
                <Calendar size={14} />
                تاریخ آخرین بروزرسانی: {formattedDate}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
