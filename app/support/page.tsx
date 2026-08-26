import './support.css';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SupportPage } from '@/components/support-page';
import { fallbackData } from '@/lib/home-data';

export const metadata = {
  title: 'پشتیبانی | رادینت',
  description: 'پشتیبانی رادینت؛ پاسخ به سوالات، اطلاعات تماس و راهنمایی کاربران.',
};

export default function SupportRoute() {
  return (
    <main className="support-page">
      <SiteHeader activePath="/support" />
      <SupportPage />
      <SiteFooter footer={fallbackData.footer} />
    </main>
  );
}
