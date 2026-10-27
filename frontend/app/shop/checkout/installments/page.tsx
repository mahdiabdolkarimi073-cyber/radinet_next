import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CheckoutInstallmentsPage } from '@/components/checkout-installments-page';
import { fallbackData } from '@/lib/home-data';
import '../checkout.css';

export const metadata = { title: 'خرید اقساطی | فروشگاه رادینت' };

export default function InstallmentsRoute() {
  return (
    <main>
      <SiteHeader activePath="/shop" />
      <Suspense fallback={null}><CheckoutInstallmentsPage /></Suspense>
      <SiteFooter footer={fallbackData.footer} />
    </main>
  );
}
