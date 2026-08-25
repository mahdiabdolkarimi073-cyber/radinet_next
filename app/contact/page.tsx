import './contact.css';
import { ContactPage } from '@/components/contact-page';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getContactData } from '@/lib/contact-repository';
import { fallbackData } from '@/lib/home-data';

export const revalidate = 60;

export default async function ContactRoute() {
  const [data, footer] = await Promise.all([getContactData(), Promise.resolve(fallbackData.footer)]);
  return (
    <main>
      <SiteHeader activePath="/contact" />
      <ContactPage data={data} footer={footer} />
      <SiteFooter footer={footer} />
    </main>
  );
}
