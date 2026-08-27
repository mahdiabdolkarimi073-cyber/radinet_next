import { CategoryPage } from '@/components/category-page';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { fallbackData } from '@/lib/home-data';
import '../category.css';

export const metadata = {
  title: 'دسته‌بندی محصولات | فروشگاه رادینت',
  description: 'مرور دسته‌بندی‌های محصولات تصویربرداری پزشکی رادینت',
};

export default function CategoryRoute({ params }: { params: { slug: string } }) {
  return (
    <main>
      <SiteHeader activePath="/shop" />
      <CategoryPage slug={params.slug} />
      <SiteFooter footer={fallbackData.footer} />
    </main>
  );
}
