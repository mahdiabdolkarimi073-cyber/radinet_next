import './contact.css';
import { ContactPage } from '@/components/contact-page';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getContactDataServer } from '@/lib/contact-storage';
import { fallbackData } from '@/lib/home-data';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function ContactRoute() {
  const [data, footer] = await Promise.all([getContactDataServer(), Promise.resolve(fallbackData.footer)]);
  return (
    <main>
      <SiteHeader activePath="/contact" />
      <ContactPage data={data} footer={footer} />
      <SiteFooter footer={footer} />
    </main>
  );
}
