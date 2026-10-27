import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CheckoutSuccessPage } from '@/components/checkout-success-page';
import { fallbackData } from '@/lib/home-data';
import '../checkout.css';

export const metadata = { title: 'پرداخت موفق | فروشگاه رادینت' };

export default function SuccessRoute() {
  return (
    <main>
      <SiteHeader activePath="/shop" />
      <Suspense fallback={null}><CheckoutSuccessPage /></Suspense>
      <SiteFooter footer={fallbackData.footer} />
    </main>
  );
}
