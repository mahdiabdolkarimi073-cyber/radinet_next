'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  Grid2x2,
  LayoutGrid,
  Loader2,
  Menu,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { addToCart } from '@/lib/cart';

const api = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

type Category = { id: string; name: string; slug: string };

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  sku: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  imageUrl: string;
  category?: { name: string } | null;
};

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'sales' | 'rating';

const sortLabels: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price-asc', label: 'ارزان‌ترین' },
  { value: 'price-desc', label: 'گران‌ترین' },
  { value: 'sales', label: 'پرفروش‌ترین' },
  { value: 'rating', label: 'محبوب‌ترین' },
];

const formatPrice = (value: number) => value.toLocaleString('fa-IR') + ' تومان';

export function SearchPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllCats, setShowAllCats] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [cats, brs] = await Promise.all([
          fetch(`${api}/api/shop/categories`).then((r) => r.json()),
          fetch(`${api}/api/shop/products/brands`).then((r) => r.ok ? r.json() : []),
        ]);
        setCategories(cats ?? []);
        setBrands(brs ?? []);
      } catch {
        setCategories([]);
        setBrands([]);
      }
    })();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (sort) params.set('sort', sort);
      if (selectedCategories.length === 1) params.set('categorySlug', selectedCategories[0]);
      else if (selectedCategories.length > 1) {
        // multiple categories not directly supported; fetch all and filter client-side fallback
        params.set('pageSize', '100');
      }
      if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (inStockOnly) params.set('inStock', 'true');
      if (outOfStockOnly) params.set('outOfStock', 'true');
      params.set('pageSize', '48');

      const res = await fetch(`${api}/api/shop/products?${params.toString()}`);
      if (!res.ok) throw new Error('خطا در دریافت محصولات');
      const data = await res.json();
      let items = data.items ?? [];
      if (selectedCategories.length > 1) {
        items = items.filter((p: Product) => p.category && selectedCategories.includes(p.category.slug) || selectedCategories.includes((p as any).categorySlug));
      }
      setProducts(items);
      setTotal(data.total ?? items.length);
    } catch (e: any) {
      setError(e.message ?? 'خطا در ارتباط با سرور');
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => { fetchProducts(); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, selectedCategories, selectedBrands, minPrice, maxPrice, inStockOnly, outOfStockOnly]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  };
  const toggleBrand = (b: string) => {
    setSelectedBrands((prev) => prev.includes(b) ? prev.filter((s) => s !== b) : [...prev, b]);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setOutOfStockOnly(false);
    setSearch('');
  };

  const visibleBrands = showAllBrands ? brands : brands.slice(0, 5);
  const visibleCats = showAllCats ? categories : categories.slice(0, 5);

  return (
    <div className="search-page">
      <div className="search-toolbar">
        <div className="search-toolbar__inner">
          <div className="search-toolbar__view">
            <button className="view-btn is-active" aria-label="نمای شبکه"><LayoutGrid size={18} /></button>
            <button className="view-btn" aria-label="نمای لیست"><Grid2x2 size={18} /></button>
          </div>
          <div className="search-toolbar__search">
            <Search size={18} />
            <input
              type="text"
              placeholder="جستجو در عنوان، توضیحات و مشخصات فنی..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="جستجوی محصول"
            />
          </div>
          <button className="search-toolbar__filter" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <SlidersHorizontal size={18} />
            <span>نمایش {total} محصول</span>
          </button>
        </div>
      </div>

      <div className="search-body">
        <button className="search-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          {sidebarOpen ? 'بستن فیلترها' : 'نمایش فیلترها'}
        </button>

        <aside className={`search-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="search-sidebar__head">
            <h3>فیلترها</h3>
            <button className="search-sidebar__clear" onClick={clearFilters}>پاک کردن همه</button>
          </div>

          <div className="filter-group">
            <h4>دسته‌بندی</h4>
            <div className="filter-list">
              {visibleCats.map((c) => (
                <label className="filter-item" key={c.slug}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c.slug)}
                    onChange={() => toggleCategory(c.slug)}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
            {categories.length > 5 && (
              <button className="filter-more" onClick={() => setShowAllCats(!showAllCats)}>
                {showAllCats ? 'نمایش کمتر' : 'مشاهده بیشتر'}
              </button>
            )}
          </div>

          <div className="filter-group">
            <h4>برند</h4>
            <div className="filter-list">
              {visibleBrands.map((b) => (
                <label className="filter-item" key={b}>
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => toggleBrand(b)}
                  />
                  <span>{b}</span>
                </label>
              ))}
              {brands.length === 0 && <p className="filter-empty">برندی ثبت نشده است</p>}
            </div>
            {brands.length > 5 && (
              <button className="filter-more" onClick={() => setShowAllBrands(!showAllBrands)}>
                {showAllBrands ? 'نمایش کمتر' : 'مشاهده بیشتر'}
              </button>
            )}
          </div>

          <div className="filter-group">
            <h4>محدوده قیمت</h4>
            <div className="filter-price-inputs">
              <input
                type="number"
                placeholder="از"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                aria-label="حداقل قیمت"
              />
              <input
                type="number"
                placeholder="تا"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                aria-label="حداکثر قیمت"
              />
            </div>
          </div>

          <div className="filter-group">
            <h4>وضعیت موجودی</h4>
            <div className="filter-list">
              <label className="filter-item">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => { setInStockOnly(!inStockOnly); if (!inStockOnly) setOutOfStockOnly(false); }}
                />
                <span className="filter-instock">موجود</span>
              </label>
              <label className="filter-item">
                <input
                  type="checkbox"
                  checked={outOfStockOnly}
                  onChange={() => { setOutOfStockOnly(!outOfStockOnly); if (!outOfStockOnly) setInStockOnly(false); }}
                />
                <span className="filter-outstock">ناموجود</span>
              </label>
            </div>
          </div>
        </aside>

        <main className="search-main">
          <div className="search-sortbar">
            <div className="search-sortbar__count">{total} محصول یافت شد</div>
            <div className="search-sortbar__sort">
              <label>مرتب‌سازی:</label>
              <div className="sort-select">
                <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
                  {sortLabels.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="search-loading">
              <Loader2 size={28} className="animate-spin" />
              <p>در حال بارگذاری محصولات...</p>
            </div>
          ) : error ? (
            <div className="search-error">
              <h3>خطا در دریافت محصولات</h3>
              <p>{error}</p>
              <p className="search-error__hint">مطمئن شوید سرور بک‌اند در حال اجراست و محصولات در پنل مدیریت ثبت شده‌اند.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="search-empty">
              <h3>محصولی یافت نشد</h3>
              <p>هیچ محصولی با این فیلترها وجود ندارد. فیلترها را تغییر دهید یا محصولات جدیدی را از پنل مدیریت اضافه کنید.</p>
            </div>
          ) : (
            <div className="search-grid">
              {products.map((p) => {
                const inStock = p.stock > 0;
                return (
                  <article className="search-card" key={p.id}>
                    <a href={`/shop/product/${p.slug}`} className="search-card__link">
                    <div className="search-card__image">
                      <img src={p.imageUrl || '/assets/images/logo-radinat.svg.png'} alt={p.name} loading="lazy" />
                    </div>
                    <div className="search-card__body">
                      {p.brand && <span className="search-card__brand">{p.brand}</span>}
                      <h3 className="search-card__name">{p.name}</h3>
                      {p.sku && <span className="search-card__sku">کد: {p.sku}</span>}
                      <div className="search-card__price">
                        <strong>{formatPrice(Number(p.price))}</strong>
                        {p.oldPrice && Number(p.oldPrice) > 0 && <s>{formatPrice(Number(p.oldPrice))}</s>}
                      </div>
                      <span className={`search-card__stock ${inStock ? 'is-in' : 'is-out'}`}>
                        {inStock ? 'موجود' : 'ناموجود'}
                      </span>
                    </div>
                    </a>
                    <button className="search-card__cart" aria-label="افزودن به سبد" disabled={!inStock}
                      onClick={(e) => { e.preventDefault(); addToCart({ productId: p.id, slug: p.slug, name: p.name, brand: p.brand, imageUrl: p.imageUrl, price: Number(p.price), quantity: 1, stock: p.stock }); }}
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
