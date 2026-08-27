import { SearchPage } from '@/components/search-page';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { fallbackData } from '@/lib/home-data';
import './search.css';

export const metadata = {
  title: 'جستجو و فیلتر پیشرفته | فروشگاه رادینت',
  description: 'جستجوی پیشرفته در محصولات تصویربرداری پزشکی با فیلتر دسته‌بندی، قیمت، برند و موجودی',
};

export default function SearchRoute() {
  return (
    <main>
      <SiteHeader activePath="/shop" />
      <SearchPage />
      <SiteFooter footer={fallbackData.footer} />
    </main>
  );
}
