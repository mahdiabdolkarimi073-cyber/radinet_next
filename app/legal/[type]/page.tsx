import '../legal.css';
import { LegalPage } from '@/components/legal-page';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getPublishedLegalDocumentServer } from '@/lib/legal-storage';
import { fallbackData } from '@/lib/home-data';
import type { LegalDocumentType } from '@/lib/legal-data';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }> | { type: string };
}) {
  const resolved = await Promise.resolve(params);
  const rawType = resolved?.type;
  const documentType = (['terms', 'privacy', 'data_processing'].includes(rawType)
    ? rawType
    : 'terms') as LegalDocumentType;
  const labels: Record<LegalDocumentType, string> = {
    terms: 'قوانین و شرایط استفاده',
    privacy: 'سیاست حفظ حریم خصوصی',
    data_processing: 'نحوه نگهداری و پردازش داده‌ها',
  };
  return {
    title: `${labels[documentType]} | رادینت`,
    description: `مطالعه ${labels[documentType]} استفاده از سامانه تله‌رادیولوژی رادینت - شرایط استفاده، حریم خصوصی و امنیت پرونده بیماران`,
  };
}

export default async function LegalRoute({
  params,
}: {
  params: Promise<{ type: string }> | { type: string };
}) {
  const resolved = await Promise.resolve(params);
  const rawType = resolved?.type;
  const documentType = (['terms', 'privacy', 'data_processing'].includes(rawType)
    ? rawType
    : 'terms') as LegalDocumentType;

  const [document, footer] = await Promise.all([
    getPublishedLegalDocumentServer(documentType),
    Promise.resolve(fallbackData.footer),
  ]);

  return (
    <main>
      <SiteHeader activePath={`/legal/${documentType}`} />
      <LegalPage document={document} documentType={documentType} />
      <SiteFooter footer={footer} />
    </main>
  );
}
