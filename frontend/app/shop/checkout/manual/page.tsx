import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CheckoutManualPage } from '@/components/checkout-manual-page';
import { fallbackData } from '@/lib/home-data';
import '../checkout.css';

export const metadata = { title: 'پرداخت کارت به کارت | فروشگاه رادینت' };

export default function ManualRoute() {
  return (
    <main>
      <SiteHeader activePath="/shop" />
      <Suspense fallback={null}><CheckoutManualPage /></Suspense>
      <SiteFooter footer={fallbackData.footer} />
    </main>
  );
}
