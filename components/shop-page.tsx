'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Boxes,
  ChevronDown,
  Film,
  Headphones,
  Package,
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Wrench,
} from 'lucide-react';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
};

const heroImage = '/assets/images/ChatGPT_Image_Aug_25,_2026,_02_46_54_PM.png';

const products: Product[] = [
  { id: 'p1', name: 'دستگاه تصویربرداری MRI ۱.۵ تسلا', category: 'دستگاه‌های تصویربرداری', price: 185000000, oldPrice: 210000000, image: 'https://images.pexels.com/photos/32532077/pexels-photo-32532077.jpeg?auto=compress&cs=tinysrgb&h=500&w=500', badge: '۱۲٪ تخفیف' },
  { id: 'p2', name: 'کابل کویل تصویربرداری', category: 'تجهیزات و لوازم جانبی', price: 2450000, image: 'https://images.pexels.com/photos/13704354/pexels-photo-13704354.jpeg?auto=compress&cs=tinysrgb&h=500&w=500' },
  { id: 'p3', name: 'سیستم تفسیر رادیولوژی', category: 'دستگاه‌های تصویربرداری', price: 98000000, oldPrice: 112000000, image: 'https://images.pexels.com/photos/9951387/pexels-photo-9951387.jpeg?auto=compress&cs=tinysrgb&h=500&w=500', badge: '۱۳٪ تخفیف' },
  { id: 'p4', name: 'ست تجهیزات پشتیبانی بالینی', category: 'مواد و لوازم مصرفی', price: 1890000, image: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg?auto=compress&cs=tinysrgb&h=500&w=500' },
];

const categories = [
  { name: 'دستگاه‌های تصویربرداری', slug: 'imaging-equipment', icon: Package, theme: 'blue' },
  { name: 'تجهیزات و لوازم جانبی', slug: 'accessories', icon: Wrench, theme: 'green' },
  { name: 'مواد و لوازم مصرفی', slug: 'consumables', icon: Boxes, theme: 'orange' },
  { name: 'فیلم و مدیای تصویربرداری', slug: 'imaging-media', icon: Film, theme: 'blue' },
];

const advantages = [
  { title: 'پرداخت امن', icon: ShieldCheck },
  { title: 'پشتیبانی تخصصی', icon: Headphones },
  { title: 'ارسال سریع به سراسر کشور', icon: Truck },
  { title: 'ضمانت اصالت کالا', icon: PackageSearch },
];

const formatPrice = (value: number) => value.toLocaleString('fa-IR') + ' تومان';

export function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<string>('همه');
  const [query, setQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCategory === 'همه' || p.category === activeCategory;
      const matchQuery = !query || p.name.includes(query);
      return matchCat && matchQuery;
    });
  }, [activeCategory, query]);

  return (
    <div className="shop-screen">
      <section className="shop-hero">
        <div className="shop-hero__image">
          <img src={heroImage} alt="دستگاه MRI تصویربرداری پزشکی" />
        </div>
        <div className="shop-hero__copy">
          <span className="shop-hero__eyebrow">فروشگاه تخصصی رادینت</span>
          <h1>فروشگاه رادینت</h1>
          <p>تجهیزات، لوازم جانبی و مواد مصرفی تصویربرداری پزشکی با ضمانت اصالت و ارسال سریع</p>
          <a className="shop-hero__cta" href="#products">مشاهده محصولات <ArrowLeft size={18} /></a>
        </div>
      </section>

      <div className="shop-container">
        <section className="shop-advantages">
          {advantages.map(({ title, icon: Icon }) => (
            <div className="shop-advantage" key={title}>
              <span className="shop-advantage__icon"><Icon size={24} /></span>
              <span>{title}</span>
            </div>
          ))}
        </section>

        <section className="shop-section">
          <div className="shop-section__head">
            <div><span className="shop-eyebrow">گروه‌بندی محصولات</span><h2>دسته‌بندی محصولات</h2></div>
          </div>
          <div className="shop-categories">
            {categories.map(({ name, slug, icon: Icon, theme }) => (
              <a href={`/shop/category/${slug}`} key={name} className={`shop-category shop-category--${theme}`}>
                <span className="shop-category__icon"><Icon size={28} /></span>
                <span className="shop-category__name">{name}</span>
                <ChevronDown size={18} />
              </a>
            ))}
          </div>
        </section>

        <section className="shop-section" id="products">
          <div className="shop-section__head">
            <div><span className="shop-eyebrow">پرفروش‌ترین‌ها</span><h2>محصولات پرفروش</h2></div>
            <div className="shop-search">
              <Search size={18} />
              <input type="text" placeholder="جستجوی محصول..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="جستجوی محصول" />
            </div>
          </div>

          <div className="shop-filter-row">
            <button type="button" className={`shop-chip${activeCategory === 'همه' ? ' is-active' : ''}`} onClick={() => setActiveCategory('همه')}>همه</button>
            {categories.map((c) => (
              <button type="button" key={c.name} className={`shop-chip${activeCategory === c.name ? ' is-active' : ''}`} onClick={() => setActiveCategory(c.name)}>{c.name}</button>
            ))}
          </div>

          <div className="shop-products">
            {filtered.map((p) => (
              <article className="shop-product" key={p.id}>
                <div className="shop-product__image">
                  <img src={p.image} alt={p.name} loading="lazy" />
                  {p.badge && <span className="shop-product__badge">{p.badge}</span>}
                </div>
                <div className="shop-product__body">
                  <small>{p.category}</small>
                  <h3>{p.name}</h3>
                  <div className="shop-product__price">
                    <strong>{formatPrice(p.price)}</strong>
                    {p.oldPrice && <s>{formatPrice(p.oldPrice)}</s>}
                  </div>
                  <button type="button" className="shop-product__cart" onClick={() => setCartCount((c) => c + 1)}>
                    <ShoppingCart size={18} /> افزودن به سبد
                  </button>
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && <p className="shop-empty">محصولی یافت نشد.</p>}
        </section>
      </div>

      {cartCount > 0 && (
        <div className="shop-cart-badge" aria-live="polite">
          <ShoppingCart size={20} /> {cartCount} کالا در سبد
        </div>
      )}
    </div>
  );
}
