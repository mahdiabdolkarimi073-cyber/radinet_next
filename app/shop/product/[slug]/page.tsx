import { ProductDetailPage } from '@/components/product-detail-page';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { fallbackData } from '@/lib/home-data';
import '../product-detail.css';

export const metadata = {
  title: 'جزئیات محصول | فروشگاه رادینت',
  description: 'مشاهده جزئیات و مشخصات محصولات تصویربرداری پزشکی رادینت',
};

export default function ProductDetailRoute({ params }: { params: { slug: string } }) {
  return (
    <main>
      <SiteHeader activePath="/shop" />
      <ProductDetailPage slug={params.slug} />
      <SiteFooter footer={fallbackData.footer} />
    </main>
  );
}
