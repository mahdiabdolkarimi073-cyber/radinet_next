import { CartPage } from '@/components/cart-page';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { fallbackData } from '@/lib/home-data';
import './cart.css';

export const metadata = { title: 'سبد خرید | فروشگاه رادینت', description: 'مرور و ویرایش محصولات انتخاب‌شده در سبد خرید' };

export default function CartRoute() {
  return <main><SiteHeader activePath="/shop" /><CartPage /><SiteFooter footer={fallbackData.footer} /></main>;
}
