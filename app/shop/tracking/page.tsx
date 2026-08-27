import './tracking.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { OrderTrackingPage } from '@/components/order-tracking-page';
import { fallbackData } from '@/lib/home-data';

export const metadata = {
  title: 'پیگیری سفارش | فروشگاه رادینت',
  description: 'پیگیری وضعیت سفارش و مشاهده کد رهگیری مرسوله',
};

export default function TrackingRoute() {
  return (
    <main>
      <SiteHeader activePath="/shop" />
      <OrderTrackingPage />
      <SiteFooter footer={fallbackData.footer} />
    </main>
  );
}
