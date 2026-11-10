import './checkout.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CheckoutPage } from '@/components/checkout-page';
import { fallbackData } from '@/lib/home-data';

export const metadata = {
  title: 'تسویه حساب | فروشگاه رادینت',
  description: 'تکمیل اطلاعات ارسال، انتخاب روش ارسال و پرداخت برای ثبت نهایی سفارش',
};

export default function CheckoutRoute() {
  return (
    <main>
      <SiteHeader activePath="/shop" />
      <CheckoutPage />
      <SiteFooter footer={fallbackData.footer} />
    </main>
  );
}
