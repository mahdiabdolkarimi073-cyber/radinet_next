'use client';

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  Heart,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { addToCart } from '@/lib/cart';

const api = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

type Category = { id: string; name: string; slug: string } | null;

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  technicalSpecifications: string;
  categoryId: string | null;
  brand: string;
  sku: string;
  price: number;
  oldPrice?: number | null;
  discountPercent: number;
  stock: number;
  imageUrl: string;
  gallery: string[];
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  attributes: Record<string, string>;
  category: Category;
  related: RelatedProduct[];
};

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  imageUrl: string;
  stock: number;
};

const formatPrice = (value: number) =>
  Number(value).toLocaleString('fa-IR') + ' تومان';

function Stars({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    const filled = i < Math.round(rating / 2);
    stars.push(
      <Star
        key={i}
        size={16}
        className={filled ? 'pd-star--filled' : 'pd-star--empty'}
        fill={filled ? '#F59E0B' : 'none'}
        stroke={filled ? '#F59E0B' : '#D1D5DB'}
      />
    );
  }
  return <span className="pd-stars">{stars}</span>;
}

export function ProductDetailPage({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${api}/api/shop/products/${slug}`);
        if (!res.ok) throw new Error('not found');
        const data = await res.json();
        if (cancelled) return;
        setProduct(data);
        setActiveImage(0);
        setError(null);
      } catch {
        if (!cancelled) setError('محصول مورد نظر یافت نشد.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="pd-loading">
        <Loader2 size={32} className="animate-spin" />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-error">
        <h2>محصول یافت نشد</h2>
        <p>{error ?? 'محصول مورد نظر در دسترس نیست.'}</p>
        <a href="/shop" className="pd-error__back">بازگشت به فروشگاه</a>
      </div>
    );
  }

  const galleryImages =
    product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0
      ? product.gallery
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  const currentImage =
    galleryImages[activeImage] ?? '/assets/images/logo-radinat.svg.png';
  const inStock = product.stock > 0;
  const quickFeatures: { label: string; value: string }[] = [];
  if (product.brand) quickFeatures.push({ label: 'برند', value: product.brand });
  if (product.sku) quickFeatures.push({ label: 'کد محصول', value: product.sku });
  if (product.category?.name)
    quickFeatures.push({ label: 'دسته‌بندی', value: product.category.name });
  if (product.attributes && typeof product.attributes === 'object') {
    for (const [k, v] of Object.entries(product.attributes)) {
      if (quickFeatures.length >= 6) break;
      quickFeatures.push({ label: k, value: String(v) });
    }
  }

  const breadcrumb = [
    { label: 'خانه', href: '/' },
    { label: 'فروشگاه', href: '/shop' },
    ...(product.category
      ? [{ label: product.category.name, href: `/shop/category/${product.category.slug}` }]
      : []),
    { label: product.name, href: '#' },
  ];

  return (
    <div className="pd-page">
      <div className="pd-container">
        {/* Breadcrumb */}
        <nav className="pd-breadcrumb">
          {breadcrumb.map((item, i) => (
            <span key={i} className="pd-breadcrumb__item">
              {i < breadcrumb.length - 1 ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <span className="pd-breadcrumb__current">{item.label}</span>
              )}
              {i < breadcrumb.length - 1 && (
                <ChevronLeft size={14} className="pd-breadcrumb__sep" />
              )}
            </span>
          ))}
        </nav>

        {/* Top section: gallery + info + related */}
        <div className="pd-top">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-gallery__main">
              <img src={currentImage} alt={product.name} />
            </div>
            {galleryImages.length > 1 && (
              <div className="pd-gallery__thumbs">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-gallery__thumb ${i === activeImage ? 'is-active' : ''}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`تصویر ${i + 1}`}
                  >
                    <img src={img} alt={`${product.name} - ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <h1 className="pd-info__title">{product.name}</h1>
            {product.sku && <span className="pd-info__sku">کد محصول: {product.sku}</span>}

            <div className="pd-info__rating">
              <Stars rating={product.rating} />
              <span className="pd-info__rating-num">
                {product.rating > 0 ? product.rating.toLocaleString('fa-IR') : '—'}
              </span>
              {product.reviewCount > 0 && (
                <span className="pd-info__review-count">
                  ({product.reviewCount.toLocaleString('fa-IR')} نظر)
                </span>
              )}
            </div>

            <div className="pd-info__price-row">
              <span className="pd-info__price">{formatPrice(Number(product.price))}</span>
              {product.oldPrice && Number(product.oldPrice) > 0 && (
                <s className="pd-info__old-price">{formatPrice(Number(product.oldPrice))}</s>
              )}
              {product.discountPercent > 0 && (
                <span className="pd-info__discount">{product.discountPercent.toLocaleString('fa-IR')}٪ تخفیف</span>
              )}
            </div>

            <div className="pd-info__stock">
              <span className={inStock ? 'pd-stock--in' : 'pd-stock--out'}>
                {inStock ? 'موجود' : 'ناموجود'}
              </span>
            </div>

            {quickFeatures.length > 0 && (
              <div className="pd-quick-features">
                {quickFeatures.map((f, i) => (
                  <div className="pd-quick-feature" key={i}>
                    <span className="pd-quick-feature__label">{f.label}</span>
                    <span className="pd-quick-feature__value">{f.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pd-actions">
              <div className="pd-qty">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="کاهش تعداد"
                >
                  <Minus size={18} />
                </button>
                <span>{qty.toLocaleString('fa-IR')}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                  aria-label="افزایش تعداد"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                type="button"
                className="pd-add-cart"
                disabled={!inStock}
                onClick={() => {
                  addToCart({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    brand: product.brand,
                    imageUrl: product.imageUrl,
                    price: Number(product.price),
                    quantity: qty,
                    stock: product.stock,
                  });
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2000);
                }}
              >
                <ShoppingCart size={20} />
                {added ? 'افزوده شد!' : 'افزودن به سبد خرید'}
              </button>

              <button
                type="button"
                className={`pd-wishlist ${liked ? 'is-liked' : ''}`}
                onClick={() => setLiked((v) => !v)}
                aria-label="افزودن به علاقه‌مندی"
              >
                <Heart size={22} fill={liked ? '#EF4444' : 'none'} stroke={liked ? '#EF4444' : '#6B7280'} />
              </button>
            </div>
          </div>

          {/* Related sidebar */}
          {product.related && product.related.length > 0 && (
            <aside className="pd-related">
              <h3 className="pd-related__title">محصولات مرتبط</h3>
              <div className="pd-related__list">
                {product.related.map((rp) => (
                  <a href={`/shop/product/${rp.slug}`} className="pd-related-card" key={rp.id}>
                    <div className="pd-related-card__image">
                      <img src={rp.imageUrl || '/assets/images/logo-radinat.svg.png'} alt={rp.name} />
                    </div>
                    <div className="pd-related-card__body">
                      <span className="pd-related-card__name">{rp.name}</span>
                      <span className="pd-related-card__price">{formatPrice(Number(rp.price))}</span>
                    </div>
                  </a>
                ))}
              </div>
            </aside>
          )}
        </div>

        {/* Tabs */}
        <div className="pd-tabs-section">
          <div className="pd-tabs">
            <button
              className={`pd-tab ${tab === 'description' ? 'is-active' : ''}`}
              onClick={() => setTab('description')}
            >
              توضیحات محصول
            </button>
            <button
              className={`pd-tab ${tab === 'specs' ? 'is-active' : ''}`}
              onClick={() => setTab('specs')}
            >
              مشخصات فنی
            </button>
            <button
              className={`pd-tab ${tab === 'reviews' ? 'is-active' : ''}`}
              onClick={() => setTab('reviews')}
            >
              نظرات
            </button>
          </div>

          <div className="pd-tab-content">
            {tab === 'description' && (
              <div className="pd-description">
                {product.shortDescription && (
                  <p className="pd-description__short">{product.shortDescription}</p>
                )}
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <p className="pd-tab-empty">توضیحاتی برای این محصول ثبت نشده است.</p>
                )}
              </div>
            )}
            {tab === 'specs' && (
              <div className="pd-specs">
                {product.technicalSpecifications ? (
                  <pre className="pd-specs__text">{product.technicalSpecifications}</pre>
                ) : (
                  <p className="pd-tab-empty">مشخصات فنی برای این محصول ثبت نشده است.</p>
                )}
              </div>
            )}
            {tab === 'reviews' && (
              <div className="pd-reviews">
                {product.reviewCount > 0 ? (
                  <p>{product.reviewCount.toLocaleString('fa-IR')} نظر برای این محصول ثبت شده است.</p>
                ) : (
                  <p className="pd-tab-empty">هنوز نظری برای این محصول ثبت نشده است.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
