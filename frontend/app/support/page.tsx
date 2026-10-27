import './support.css';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SupportPage } from '@/components/support-page';
import {
  getPublishedFaqsServer,
  getSupportContactInfoServer,
} from '@/lib/support-storage';
import { fallbackData } from '@/lib/home-data';
import { defaultFaqCategories } from '@/lib/support-data';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'مرکز پشتیبانی، تیکتینگ و سوالات متداول | رادینت',
  description: 'پشتیبانی ۲۴ ساعته تله‌رادیولوژی رادینت؛ ثبت تیکت، پیگیری درخواست‌ها، سوالات متداول و راه‌های ارتباط فوری.',
};

export default async function SupportRoute() {
  const [contactInfo, faqs, footer] = await Promise.all([
    getSupportContactInfoServer(),
    getPublishedFaqsServer(),
    Promise.resolve(fallbackData.footer),
  ]);

  const rawCategories = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)));
  const categories = ['همه دسته‌ها', ...rawCategories];

  return (
    <main className="support-page">
      <SiteHeader activePath="/support" />
      <SupportPage
        initialContactInfo={contactInfo}
        initialFaqs={faqs}
        categories={categories.length > 1 ? categories : defaultFaqCategories}
      />
      <SiteFooter footer={footer} />
    </main>
  );
}
