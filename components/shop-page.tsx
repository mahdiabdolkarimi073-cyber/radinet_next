'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Boxes,
  ChevronDown,
  ChevronLeft,
  Film,
  Headphones,
  Loader2,
  Package,
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Wrench,
} from 'lucide-react';
import { addToCart, cartCount as getCartCount, readCart } from '@/lib/cart';

type Category = {
  id: string;
  name: string;
  slug: string;
  iconKey?: string;
  colorTheme?: string;
  _count?: { products: number };
};

type Product = {
  id: string;
  name: string;
  slug: string;
  categoryId?: string | null;
  category?: { id: string; name: string; slug: string } | null;
  price: number;
  oldPrice?: number | null;
  discountPercent?: number;
  stock: number;
  imageUrl: string;
  brand: string;
  rating?: number;
};

const heroImage = '/assets/images/ChatGPT_Image_Aug_25,_2026,_02_46_54_PM.png';

const fallbackCategories: Category[] = [
  { id: 'cat-imaging-equipment', name: 'دستگاه‌های تصویربرداری', slug: 'imaging-equipment', iconKey: 'imaging-equipment', colorTheme: 'blue' },
  { id: 'cat-accessories', name: 'تجهیزات و لوازم جانبی', slug: 'accessories', iconKey: 'accessories', colorTheme: 'green' },
  { id: 'cat-consumables', name: 'مواد و لوازم مصرفی', slug: 'consumables', iconKey: 'consumables', colorTheme: 'orange' },
  { id: 'cat-imaging-media', name: 'فیلم و مدیای تصویربرداری', slug: 'imaging-media', iconKey: 'imaging-media', colorTheme: 'blue' },
];

const advantages = [
  { title: 'پرداخت امن و فاکتور رسمی', icon: ShieldCheck },
  { title: 'پشتیبانی فنی و تله‌ریپورت', icon: Headphones },
  { title: 'ارسال تخصصی و سریع به سراسر کشور', icon: Truck },
  { title: 'ضمانت اصالت و سلامت فیزیکی', icon: PackageSearch },
];

const iconMap: Record<string, typeof Package> = {
  'imaging-equipment': Package,
  accessories: Wrench,
  consumables: Boxes,
  'imaging-media': Film,
};

const formatPrice = (value: number) => value.toLocaleString('fa-IR') + ' تومان';

export function ShopPage() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('همه');
  const [query, setQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Initial read cart
    setCartCount(getCartCount(readCart()));

    const handleCartUpdate = () => {
      setCartCount(getCartCount(readCart()));
    };
    window.addEventListener('cart-updated', handleCartUpdate);

    // Fetch dynamic categories
    fetch('/api/shop/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => undefined);

    // Fetch dynamic products
    fetch('/api/shop/products?limit=24')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          setProducts(data.items);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity: 1,
      stock: product.stock,
    });

    setToastMessage(`"${product.name}" به سبد خرید افزوده شد.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const catMatch =
        activeCategory === 'همه' ||
        p.category?.name === activeCategory ||
        p.category?.slug === activeCategory ||
        p.categoryId === activeCategory;

      const q = query.trim().toLowerCase();
      const queryMatch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q));

      return catMatch && queryMatch;
    });
  }, [products, activeCategory, query]);

  return (
    <div className="shop-screen">
      <section className="shop-hero">
        <div className="shop-hero__image">
          <img src={heroImage} alt="دستگاه MRI تصویربرداری پزشکی" />
        </div>
        <div className="shop-hero__copy">
          <span className="shop-hero__eyebrow">فروشگاه تخصصی رادینت</span>
          <h1>تجهیزات و ملزومات تصویربرداری پزشکی</h1>
          <p>
            تأمین مستقیم تجهیزات MRI، سی‌تی‌اسکن، سونوگرافی، مانیتورهای تشخیصی DICOM و مواد مصرفی با ضمانت اصالت کالا و ارسال سریع به سراسر کشور
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <a className="shop-hero__cta" href="#products">
              مشاهده محصولات <ArrowLeft size={18} />
            </a>
            <a
              href="/shop/tracking"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff',
                color: '#092F5B',
                border: '1px solid #C4D3E6',
                height: 50,
                padding: '0 24px',
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                marginTop: 16,
              }}
            >
              پیگیری سفارشات
            </a>
          </div>
        </div>
      </section>

      <div className="shop-container">
        <section className="shop-advantages">
          {advantages.map(({ title, icon: Icon }) => (
            <div className="shop-advantage" key={title}>
              <span className="shop-advantage__icon">
                <Icon size={24} />
              </span>
              <span>{title}</span>
            </div>
          ))}
        </section>

        {/* Categories Section */}
        <section className="shop-section">
          <div className="shop-section__head">
            <div>
              <span className="shop-eyebrow">گروه‌بندی محصولات</span>
              <h2>دسته‌بندی تجهیزات و ملزومات</h2>
            </div>
            <a
              href="/shop/search"
              style={{
                color: '#1557C8',
                fontSize: 15,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              مشاهده همه دسته‌ها <ChevronLeft size={16} />
            </a>
          </div>
          <div className="shop-categories">
            {categories.map((cat) => {
              const Icon = (cat.iconKey && iconMap[cat.iconKey]) || Package;
              const theme = cat.colorTheme || 'blue';
              return (
                <a
                  href={`/shop/category/${cat.slug}`}
                  key={cat.id || cat.slug}
                  className={`shop-category shop-category--${theme}`}
                >
                  <span className="shop-category__icon">
                    <Icon size={28} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="shop-category__name" style={{ display: 'block' }}>
                      {cat.name}
                    </span>
                    {cat._count?.products !== undefined && (
                      <small style={{ color: '#8392A7', fontSize: 13, marginTop: 2, display: 'block' }}>
                        {cat._count.products.toLocaleString('fa-IR')} محصول
                      </small>
                    )}
                  </div>
                  <ChevronDown size={18} />
                </a>
              );
            })}
          </div>
        </section>

        {/* Products Section */}
        <section className="shop-section" id="products">
          <div className="shop-section__head">
            <div>
              <span className="shop-eyebrow">کاتالوگ آنلاین</span>
              <h2>جدیدترین و پرفروش‌ترین محصولات</h2>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="shop-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="جستجوی نام دستگاه، برند یا قطعه..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="جستجوی محصول"
                />
              </div>
              <a
                href="/shop/search"
                style={{
                  color: '#1557C8',
                  fontSize: 15,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                }}
              >
                جستجوی پیشرفته <ChevronLeft size={16} />
              </a>
            </div>
          </div>

          <div className="shop-filter-row">
            <button
              type="button"
              className={`shop-chip${activeCategory === 'همه' ? ' is-active' : ''}`}
              onClick={() => setActiveCategory('همه')}
            >
              همه محصولات
            </button>
            {categories.map((c) => (
              <button
                type="button"
                key={c.id || c.slug}
                className={`shop-chip${activeCategory === c.name || activeCategory === c.slug ? ' is-active' : ''}`}
                onClick={() => setActiveCategory(c.name)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: '#1557C8' }}>
              <Loader2 size={36} className="animate-spin" />
            </div>
          ) : (
            <div className="shop-products">
              {filtered.map((p) => {
                const discount = p.discountPercent || (p.oldPrice && p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0);
                const isOutOfStock = (p.stock || 0) <= 0;

                return (
                  <article className="shop-product" key={p.id}>
                    <a
                      href={`/shop/product/${p.slug}`}
                      className="shop-product__image"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <img src={p.imageUrl} alt={p.name} loading="lazy" />
                      {discount > 0 && (
                        <span className="shop-product__badge">{discount.toLocaleString('fa-IR')}٪ تخفیف</span>
                      )}
                      {isOutOfStock && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 12,
                            right: 12,
                            background: '#475569',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: 6,
                          }}
                        >
                          ناموجود
                        </span>
                      )}
                    </a>
                    <div className="shop-product__body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <small>{p.category?.name || p.brand}</small>
                        <small style={{ color: '#1557C8', fontWeight: 600 }}>{p.brand}</small>
                      </div>
                      <a
                        href={`/shop/product/${p.slug}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <h3>{p.name}</h3>
                      </a>
                      <div className="shop-product__price">
                        <strong>{formatPrice(p.price)}</strong>
                        {p.oldPrice && p.oldPrice > p.price && <s>{formatPrice(p.oldPrice)}</s>}
                      </div>

                      <button
                        type="button"
                        className="shop-product__cart"
                        disabled={isOutOfStock}
                        style={{
                          opacity: isOutOfStock ? 0.6 : 1,
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        }}
                        onClick={(e) => handleAddToCart(p, e)}
                      >
                        <ShoppingCart size={18} /> {isOutOfStock ? 'عدم موجودی در انبار' : 'افزودن به سبد'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <p className="shop-empty">محصولی مطابق فیلترهای انتخابی یافت نشد.</p>
          )}
        </section>
      </div>

      {/* Floating cart bar if items exist */}
      {cartCount > 0 && (
        <a href="/shop/cart" className="shop-cart-badge" aria-live="polite" style={{ textDecoration: 'none' }}>
          <ShoppingCart size={20} />
          <span>
            {cartCount.toLocaleString('fa-IR')} کالا در سبد خرید &bull; مشاهده و پرداخت
          </span>
          <ChevronLeft size={18} />
        </a>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            background: '#092F5B',
            color: '#fff',
            padding: '14px 22px',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          <ShieldCheck size={20} color="#20AA87" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
