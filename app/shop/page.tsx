import './shop.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ShopPage } from '@/components/shop-page';
import { fallbackData } from '@/lib/home-data';

export const metadata = {
  title: 'فروشگاه رادینت',
  description: 'خرید تجهیزات، لوازم جانبی و مواد مصرفی تصویربرداری پزشکی از فروشگاه رادینت.',
};

export default function ShopRoute() {
  return <main className="shop-page"><SiteHeader activePath="/shop" /><ShopPage /><SiteFooter footer={fallbackData.footer} /></main>;
}
