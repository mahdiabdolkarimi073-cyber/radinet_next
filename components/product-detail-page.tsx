'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Heart,
  Loader2,
  MessageSquarePlus,
  Minus,
  Plus,
  Send,
  ShoppingCart,
  Star,
  User as UserIcon,
} from 'lucide-react';
import { addToCart, checkCartItemAddition, getEffectiveMaxQty, readCart } from '@/lib/cart';
import { useAuth } from '@/components/auth-provider';
import { getStoredToken } from '@/lib/auth-client';

const api = process.env.NEXT_PUBLIC_BACKEND_URL || '';

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
  maxOrderQty?: number | null;
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
  maxOrderQty?: number | null;
};

type ApprovedReview = {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  createdAt: string;
};

const formatPrice = (value: number) =>
  Number(value).toLocaleString('fa-IR') + ' تومان';

function Stars({ rating, scale = 10 }: { rating: number; scale?: 5 | 10 }) {
  const normalized = scale === 10 ? Math.round(rating / 2) : Math.round(rating);
  const stars = [];
  for (let i = 0; i < 5; i++) {
    const filled = i < normalized;
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
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [qtyWarning, setQtyWarning] = useState('');
  const [tab, setTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ApprovedReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState('');

  const loadApprovedReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const res = await fetch(`${api}/api/shop/products/${encodeURIComponent(slug)}/reviews`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      setReviews(Array.isArray(data?.items) ? data.items : []);
    } catch {
      // ignore
    } finally {
      setReviewsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${api}/api/shop/products/${slug}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('not found');
        const data = await res.json();
        if (cancelled) return;
        setProduct(data);
        setActiveImage(0);
        setQty(1);
        setQtyWarning('');
        setError(null);
      } catch {
        if (!cancelled) setError('محصول مورد نظر یافت نشد.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    void loadApprovedReviews();
    return () => {
      cancelled = true;
    };
  }, [slug, loadApprovedReviews]);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewError('');
    setReviewSuccessMessage('');

    const trimmed = reviewContent.trim();
    if (trimmed.length < 3) {
      setReviewError('لطفاً متن نظر خود را وارد کنید (حداقل ۳ کاراکتر).');
      return;
    }
    if (trimmed.length > 2000) {
      setReviewError('متن نظر نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد.');
      return;
    }

    const token = getStoredToken();
    if (!token) {
      setReviewError('برای ثبت نظر ابتدا وارد حساب کاربری خود شوید.');
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await fetch(`${api}/api/shop/products/${encodeURIComponent(slug)}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: reviewRating,
          content: trimmed,
          userName: user?.fullName || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'ثبت نظر ناموفق بود.');
      }
      setReviewContent('');
      setReviewRating(5);
      setReviewSuccessMessage(
        data?.message ||
          'نظر شما با موفقیت ثبت شد و در وضعیت «در انتظار تأیید» قرار گرفت. پس از تأیید مدیریت در صفحه محصول نمایش داده خواهد شد.',
      );
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'خطا در ثبت نظر.');
    } finally {
      setReviewSubmitting(false);
    }
  }

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
  const effectiveMaxQty = getEffectiveMaxQty({
    stock: product.stock,
    maxOrderQty: product.maxOrderQty,
  });
  const hasMaxOrderLimit =
    typeof product.maxOrderQty === 'number' && product.maxOrderQty >= 1;

  const quickFeatures: { label: string; value: string }[] = [];
  if (product.brand) quickFeatures.push({ label: 'برند', value: product.brand });
  if (product.sku) quickFeatures.push({ label: 'کد محصول', value: product.sku });
  if (product.category?.name)
    quickFeatures.push({ label: 'دسته‌بندی', value: product.category.name });
  if (hasMaxOrderLimit) {
    quickFeatures.push({
      label: 'سقف خرید هر کاربر',
      value: `${product.maxOrderQty!.toLocaleString('fa-IR')} عدد`,
    });
  }
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

  const displayedReviewCount = Math.max(reviews.length, product.reviewCount || 0);

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

            <div
              className="pd-info__rating"
              style={{ cursor: 'pointer' }}
              onClick={() => setTab('reviews')}
              title="مشاهده و ثبت نظرات"
            >
              <Stars rating={product.rating} />
              <span className="pd-info__rating-num">
                {product.rating > 0 ? product.rating.toLocaleString('fa-IR') : '—'}
              </span>
              <span className="pd-info__review-count">
                ({displayedReviewCount.toLocaleString('fa-IR')} نظر)
              </span>
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

            <div className="pd-info__stock" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className={inStock ? 'pd-stock--in' : 'pd-stock--out'}>
                {inStock ? 'موجود در انبار' : 'ناموجود'}
              </span>
              {hasMaxOrderLimit && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  حداکثر خرید هر کاربر: {product.maxOrderQty!.toLocaleString('fa-IR')} عدد
                </span>
              )}
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
                  onClick={() => {
                    setQtyWarning('');
                    setQty((q) => Math.max(1, q - 1));
                  }}
                  aria-label="کاهش تعداد"
                >
                  <Minus size={18} />
                </button>
                <span>{qty.toLocaleString('fa-IR')}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (qty >= effectiveMaxQty) {
                      setQtyWarning(
                        hasMaxOrderLimit && product.maxOrderQty! <= product.stock
                          ? `حداکثر تعداد مجاز خرید برای این محصول ${product.maxOrderQty!.toLocaleString('fa-IR')} عدد برای هر کاربر است.`
                          : `حداکثر موجودی قابل سفارش برای این محصول ${effectiveMaxQty.toLocaleString('fa-IR')} عدد است.`,
                      );
                      return;
                    }
                    setQtyWarning('');
                    setQty((q) => Math.min(effectiveMaxQty, q + 1));
                  }}
                  aria-label="افزایش تعداد"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                type="button"
                className="pd-add-cart"
                disabled={!inStock}
                onClick={async () => {
                  const candidateItem = {
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    brand: product.brand,
                    imageUrl: product.imageUrl,
                    price: Number(product.price),
                    quantity: qty,
                    stock: product.stock,
                    maxOrderQty: product.maxOrderQty ?? null,
                  };

                  const localCheck = checkCartItemAddition(candidateItem);
                  if (!localCheck.allowed) {
                    setQtyWarning(localCheck.message || 'تعداد انتخابی بیش از سقف مجاز است.');
                    return;
                  }

                  // Server-side validation of combined cart items
                  try {
                    const currentCart = readCart();
                    const existing = currentCart.find((c) => c.productId === product.id);
                    const totalQtyForProduct = (existing ? existing.quantity : 0) + qty;
                    const validateRes = await fetch(`${api}/api/shop/cart/validate`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        items: [{ productId: product.id, quantity: totalQtyForProduct }],
                      }),
                    });
                    if (!validateRes.ok) {
                      const errData = await validateRes.json().catch(() => ({}));
                      setQtyWarning(errData?.message || 'حداکثر تعداد مجاز خرید برای این محصول رعایت نشده است.');
                      return;
                    }
                  } catch {
                    // Fallback to localCheck if offline
                  }

                  setQtyWarning('');
                  addToCart(candidateItem);
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

            {qtyWarning && (
              <div
                role="alert"
                style={{
                  marginTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <AlertCircle size={17} style={{ flexShrink: 0 }} />
                <span>{qtyWarning}</span>
              </div>
            )}
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
        <div className="pd-tabs-section" id="product-tabs">
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
              نظرات کاربران ({reviews.length.toLocaleString('fa-IR')})
            </button>
          </div>

          <div className="pd-tab-content">
            {tab === 'description' && (
              <div className="pd-description">
                {product.shortDescription && (
                  <p className="pd-description__short">{product.shortDescription}</p>
                )}
                {product.description?.includes('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p>{product.description || 'توضیحاتی برای این محصول ثبت نشده است.'}</p>
                )}
              </div>
            )}
            {tab === 'specs' && (
              <div className="pd-specs">
                {(() => {
                  if (!product.technicalSpecifications) {
                    return <p className="pd-tab-empty">مشخصات فنی برای این محصول ثبت نشده است.</p>;
                  }
                  try {
                    const parsed = JSON.parse(product.technicalSpecifications);
                    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                      return (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                            <tbody>
                              {Object.entries(parsed).map(([key, val]) => (
                                <tr key={key} style={{ borderBottom: '1px solid #E5EAF0' }}>
                                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#092F5B', width: '35%', background: '#F8FAFC' }}>{key}</td>
                                  <td style={{ padding: '12px 16px', color: '#334155' }}>{String(val)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                  } catch {}
                  return <pre className="pd-specs__text">{product.technicalSpecifications}</pre>;
                })()}
              </div>
            )}
            {tab === 'reviews' && (
              <div className="pd-reviews" style={{ display: 'grid', gap: 28 }}>
                {/* Approved Reviews List */}
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#092F5B', marginBottom: 14 }}>
                    نظرات تأییدشده کاربران ({reviews.length.toLocaleString('fa-IR')})
                  </h3>

                  {reviewsLoading ? (
                    <p style={{ color: '#64748b' }}>در حال بارگذاری نظرات...</p>
                  ) : reviews.length === 0 ? (
                    <div
                      style={{
                        padding: 20,
                        borderRadius: 12,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        fontSize: 14,
                      }}
                    >
                      هنوز نظر تأییدشده‌ای برای این محصول ثبت نشده است. اولین نفری باشید که تجربه خود را ثبت می‌کنید!
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 14 }}>
                      {reviews.map((rev) => (
                        <article
                          key={rev.id}
                          style={{
                            padding: 18,
                            borderRadius: 14,
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: 10,
                              marginBottom: 10,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '50%',
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  display: 'grid',
                                  placeItems: 'center',
                                }}
                              >
                                <UserIcon size={18} />
                              </div>
                              <div>
                                <strong style={{ display: 'block', fontSize: 14, color: '#0f172a' }}>
                                  {rev.userName}
                                </strong>
                                <small style={{ fontSize: 12, color: '#64748b' }}>
                                  {new Date(rev.createdAt).toLocaleDateString('fa-IR')}
                                </small>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Stars rating={rev.rating} scale={5} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>
                                ({rev.rating.toLocaleString('fa-IR')} از ۵)
                              </span>
                            </div>
                          </div>
                          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-line' }}>
                            {rev.content}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit New Review Box */}
                <div
                  style={{
                    padding: 22,
                    borderRadius: 16,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <MessageSquarePlus size={20} color="#0284c7" />
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#092F5B' }}>
                      ثبت نظر درباره این محصول
                    </h4>
                  </div>

                  {!user ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                        padding: 14,
                        borderRadius: 10,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                      }}
                    >
                      <span style={{ fontSize: 14, color: '#334155' }}>
                        برای ثبت نظر و امتیازدهی به این محصول، لطفاً ابتدا وارد حساب کاربری خود شوید.
                      </span>
                      <a
                        href="/login"
                        style={{
                          padding: '8px 18px',
                          borderRadius: 8,
                          background: '#0284c7',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: 13,
                          textDecoration: 'none',
                        }}
                      >
                        ورود به حساب کاربری
                      </a>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} style={{ display: 'grid', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                          امتیاز شما به این محصول:
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {[1, 2, 3, 4, 5].map((starValue) => (
                            <button
                              key={starValue}
                              type="button"
                              onClick={() => setReviewRating(starValue)}
                              aria-label={`امتیاز ${starValue}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '6px 12px',
                                borderRadius: 8,
                                border: reviewRating >= starValue ? '1px solid #f59e0b' : '1px solid #cbd5e1',
                                background: reviewRating >= starValue ? '#fffbeb' : '#ffffff',
                                cursor: 'pointer',
                              }}
                            >
                              <Star
                                size={16}
                                fill={reviewRating >= starValue ? '#F59E0B' : 'none'}
                                stroke={reviewRating >= starValue ? '#F59E0B' : '#94a3b8'}
                              />
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                                {starValue.toLocaleString('fa-IR')}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="product-review-textarea"
                          style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}
                        >
                          متن دیدگاه شما:
                        </label>
                        <textarea
                          id="product-review-textarea"
                          rows={4}
                          value={reviewContent}
                          onChange={(e) => setReviewContent(e.target.value)}
                          placeholder="تجربه کاربری یا دیدگاه تخصصی خود را درباره این محصول بنویسید..."
                          required
                          style={{
                            width: '100%',
                            padding: 12,
                            borderRadius: 10,
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            fontSize: 14,
                            fontFamily: 'inherit',
                            resize: 'vertical',
                          }}
                        />
                        <small style={{ color: '#64748b', fontSize: 12 }}>
                          نظرات پس از بررسی و تأیید توسط مدیر در صفحه محصول منتشر می‌شوند.
                        </small>
                      </div>

                      {reviewError && (
                        <div
                          role="alert"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#b91c1c',
                            fontSize: 13,
                          }}
                        >
                          <AlertCircle size={17} />
                          <span>{reviewError}</span>
                        </div>
                      )}

                      {reviewSuccessMessage && (
                        <div
                          role="status"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 16px',
                            borderRadius: 10,
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#065f46',
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          <CheckCircle2 size={18} />
                          <span>{reviewSuccessMessage}</span>
                        </div>
                      )}

                      <div>
                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 22px',
                            borderRadius: 10,
                            border: 'none',
                            background: '#0284c7',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: reviewSubmitting ? 'wait' : 'pointer',
                          }}
                        >
                          <Send size={16} />
                          <span>{reviewSubmitting ? 'در حال ارسال نظر...' : 'ثبت نظر'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
