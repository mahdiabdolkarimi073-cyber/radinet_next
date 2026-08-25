import '../legal.css';
import { LegalPage } from '@/components/legal-page';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getLegalDocument } from '@/lib/legal-repository';
import { fallbackData } from '@/lib/home-data';
import type { LegalDocumentType } from '@/lib/legal-data';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { type: string } }) {
  const documentType = (['terms', 'privacy', 'data_processing'].includes(params.type) ? params.type : 'terms') as LegalDocumentType;
  const labels: Record<LegalDocumentType, string> = {
    terms: 'قوانین و مقررات',
    privacy: 'حریم خصوصی',
    data_processing: 'پردازش داده',
  };
  return {
    title: `${labels[documentType]} | رادینت`,
    description: `مطالعه ${labels[documentType]} استفاده از سامانه رادینت - شرایط استفاده، حریم خصوصی و قوانین خدمات`,
  };
}

export default async function LegalRoute({ params }: { params: { type: string } }) {
  const documentType = (['terms', 'privacy', 'data_processing'].includes(params.type) ? params.type : 'terms') as LegalDocumentType;
  const [document, footer] = await Promise.all([getLegalDocument(documentType), Promise.resolve(fallbackData.footer)]);
  return (
    <main>
      <SiteHeader activePath="/legal/terms" />
      <LegalPage document={document} documentType={documentType} />
      <SiteFooter footer={footer} />
    </main>
  );
}
