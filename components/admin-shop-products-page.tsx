'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Filter,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { adminNavItems, formatDate, formatToman } from '@/lib/admin-nav';

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string | null;
  brand: string;
  sku: string;
  price: number;
  oldPrice: number | null;
  discountPercent: number;
  stock: number;
  salesCount: number;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  category: { id: string; name: string; slug: string } | null;
};

type ProductResponse = {
  items: ProductItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
};

type FilterValues = {
  categoryId: string;
  status: string;
  sort: string;
  search: string;
};

const initialFilters: FilterValues = { categoryId: 'all', status: 'all', sort: 'newest', search: '' };

export function AdminShopProductsPage() {
  const { user, signOut } = useAuth();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [data, setData] = useState<ProductResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<ProductItem | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters, page]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch(`/api/admin/shop/products?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت محصولات ناموفق بود.');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const loadCategories = useCallback(async () => {
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const response = await fetch('/api/admin/shop/categories', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('دریافت دسته‌بندی‌ها ناموفق بود.');
      const result = await response.json();
      setCategories(Array.isArray(result) ? result : result.items ?? []);
    } catch {
      // دسته‌بندی‌ها بارگذاری نشد؛ فیلتر خالی می‌ماند
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function updateFilter(key: keyof FilterValues, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="admin-page-root">
      <div className="admin-page-shell">
        <aside className={`admin-page-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-page-brand">
            <div className="admin-page-brand__mark"><ShieldCheck size={28} strokeWidth={1.7} /></div>
            <div>
              <strong>رادینت</strong>
              <span>پنل مدیریت</span>
            </div>
            <button className="admin-page-sidebar__close" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'grid' : 'none' }}>
              <X size={22} />
            </button>
          </div>
          <nav className="admin-page-nav">
            {adminNavItems.map((item) => (
              <a key={item.href} href={item.href} className={`admin-page-nav__item ${item.href === '/admin/shop-products' ? 'is-active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <item.icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="admin-page-nav__logout" onClick={() => void signOut()}>
            <LogOut size={22} strokeWidth={1.8} />
            <span>خروج</span>
          </button>
        </aside>

        {sidebarOpen && (
          <div className="admin-page-overlay" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,29,65,.42)' }} />
        )}

        <div className="admin-page-content">
          <header className="admin-page-header">
            <div className="admin-page-header__title">
              <Package size={26} strokeWidth={1.7} />
              <span>مدیریت محصولات فروشگاه</span>
            </div>
            <div className="admin-page-profile">
              <div className="admin-page-avatar">{user?.fullName?.charAt(0) ?? 'A'}</div>
              <div className="admin-page-user">
                <strong>{user?.fullName ?? 'مدیر سیستم'}</strong>
                <span>مدیر کل</span>
              </div>
              <ChevronDown className="admin-page-profile__chevron" size={17} />
            </div>
            <button className="admin-page-burger" onClick={() => setSidebarOpen(true)} aria-label="منو">
              <Menu size={26} strokeWidth={1.7} />
            </button>
          </header>

          <main className="admin-page-main">
            <div className="admin-page-title">
              <div>
                <h2>مدیریت محصولات فروشگاه</h2>
                <p>مشاهده، فیلتر، افزودن، ویرایش و حذف محصولات فروشگاه رادینت</p>
              </div>
              <button className="admin-page-add-btn" onClick={() => setShowAddModal(true)}>
                <Plus size={18} /> افزودن محصول
              </button>
            </div>

            <section className="admin-page-filter-card">
              <div className="admin-page-filter-row">
                <label>
                  <span>دسته‌بندی</span>
                  <select value={filters.categoryId} onChange={(e) => updateFilter('categoryId', e.target.value)}>
                    <option value="all">همه دسته‌ها</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>وضعیت</span>
                  <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                  </select>
                </label>
                <label>
                  <span>مرتب‌سازی</span>
                  <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                    <option value="newest">جدیدترین</option>
                    <option value="price-asc">قیمت صعودی</option>
                    <option value="price-desc">قیمت نزولی</option>
                    <option value="stock-asc">موجودی صعودی</option>
                    <option value="stock-desc">موجودی نزولی</option>
                    <option value="sales">پرفروش‌ترین</option>
                  </select>
                </label>
              </div>
              <div className="admin-page-search">
                <Search size={18} />
                <input
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="جستجو بر اساس نام محصول، برند یا SKU..."
                />
                <Filter size={18} />
              </div>
            </section>

            {error && <div className="admin-page-error">{error}</div>}

            <section className="admin-page-table-card">
              <div className="admin-page-table-meta">
                <strong>فهرست محصولات</strong>
                <span>{data?.total?.toLocaleString('fa-IR') ?? '۰'} محصول</span>
              </div>
              <div className="admin-page-table-wrap">
                <table className="admin-page-table">
                  <thead>
                    <tr>
                      <th>نام محصول</th>
                      <th>دسته‌بندی</th>
                      <th>قیمت</th>
                      <th>موجودی</th>
                      <th>فروش</th>
                      <th>SKU</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td colSpan={8} className="admin-page-empty">در حال دریافت محصولات…</td></tr>
                    )}
                    {!isLoading && data?.items.map((item) => (
                      <tr key={item.id}>
                        <td data-label="نام محصول" className="admin-page-user-cell">
                          <strong>{item.name}</strong>
                          {item.brand && <small>{item.brand}</small>}
                        </td>
                        <td data-label="دسته‌بندی">{item.category?.name ?? '—'}</td>
                        <td data-label="قیمت">{item.price ? `${formatToman(item.price)} تومان` : '—'}</td>
                        <td data-label="موجودی">{item.stock.toLocaleString('fa-IR')}</td>
                        <td data-label="فروش">{item.salesCount.toLocaleString('fa-IR')}</td>
                        <td data-label="SKU">{item.sku || '—'}</td>
                        <td data-label="وضعیت">
                          <span className={`admin-status-badge ${item.isActive ? 'is-active' : 'is-inactive'}`}>
                            {item.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td data-label="عملیات">
                          <div className="admin-page-actions">
                            <button className="admin-page-action admin-page-action--edit" onClick={() => setShowEditModal(item)} title="ویرایش">
                              <Edit3 size={16} />
                            </button>
                            <button
                              className="admin-page-action admin-page-action--delete"
                              onClick={async () => {
                                if (!confirm('آیا از حذف این محصول مطمئن هستید؟')) return;
                                const token = window.localStorage.getItem('radinet_auth_token');
                                await fetch(`/api/admin/shop/products/${item.id}`, {
                                  method: 'DELETE',
                                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                                });
                                void loadProducts();
                              }}
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && data?.items.length === 0 && (
                      <tr><td colSpan={8} className="admin-page-empty">محصولی با این فیلترها پیدا نشد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && data && (
                <div className="admin-page-pagination">
                  <button disabled={data.page <= 1} onClick={() => setPage(data.page - 1)}>
                    <ChevronRight size={16} /> قبلی
                  </button>
                  <div>
                    {Array.from({ length: Math.min(data.pages, 5) }, (_, i) => i + 1).map((n) => (
                      <button key={n} className={data.page === n ? 'is-current' : ''} onClick={() => setPage(n)}>
                        {n.toLocaleString('fa-IR')}
                      </button>
                    ))}
                  </div>
                  <button disabled={data.page >= data.pages} onClick={() => setPage(data.page + 1)}>
                    بعدی <ChevronLeft size={16} />
                  </button>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {showAddModal && (
        <AddProductModal categories={categories} onClose={() => setShowAddModal(false)} onSaved={() => { setShowAddModal(false); void loadProducts(); }} />
      )}
      {showEditModal && (
        <EditProductModal product={showEditModal} categories={categories} onClose={() => setShowEditModal(null)} onSaved={() => { setShowEditModal(null); void loadProducts(); }} />
      )}
    </div>
  );
}

function AddProductModal({ categories, onClose, onSaved }: { categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState(0);
  const [oldPrice, setOldPrice] = useState<number | ''>('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch('/api/admin/shop/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          slug,
          description,
          shortDescription,
          categoryId: categoryId || null,
          brand,
          sku,
          price: Number(price),
          oldPrice: oldPrice === '' ? null : Number(oldPrice),
          discountPercent: Number(discountPercent),
          stock: Number(stock),
          imageUrl,
          isActive,
          isFeatured,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'افزودن محصول ناموفق بود.');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>افزودن محصول جدید</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <div className="admin-modal__row">
            <label>
              <span>نام محصول</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="نام محصول" />
            </label>
            <label>
              <span>نامک (slug)</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="product-slug" />
            </label>
          </div>
          <label>
            <span>توضیحات کوتاه</span>
            <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="خلاصه کوتاه محصول" />
          </label>
          <label>
            <span>توضیحات کامل</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="توضیحات کامل محصول" />
          </label>
          <div className="admin-modal__row">
            <label>
              <span>دسته‌بندی</span>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">بدون دسته</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>برند</span>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="نام برند" />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>SKU</span>
              <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="کد محصول" />
            </label>
            <label>
              <span>آدرس تصویر</span>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>قیمت (تومان)</span>
              <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            </label>
            <label>
              <span>قیمت قبلی (تومان)</span>
              <input type="number" min={0} value={oldPrice} onChange={(e) => setOldPrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder="اختیاری" />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>درصد تخفیف</span>
              <input type="number" min={0} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} />
            </label>
            <label>
              <span>موجودی</span>
              <input type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} required />
            </label>
          </div>
          <div className="admin-modal__row">
            <label className="admin-modal__checkbox">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <span>محصول فعال است</span>
            </label>
            <label className="admin-modal__checkbox">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <span>محصول ویژه</span>
            </label>
          </div>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ذخیره…' : 'افزودن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditProductModal({ product, categories, onClose, onSaved }: { product: ProductItem; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(product.description);
  const [shortDescription, setShortDescription] = useState(product.shortDescription);
  const [categoryId, setCategoryId] = useState(product.categoryId ?? '');
  const [brand, setBrand] = useState(product.brand);
  const [sku, setSku] = useState(product.sku);
  const [price, setPrice] = useState(product.price);
  const [oldPrice, setOldPrice] = useState<number | ''>(product.oldPrice ?? '');
  const [discountPercent, setDiscountPercent] = useState(product.discountPercent);
  const [stock, setStock] = useState(product.stock);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [isActive, setIsActive] = useState(product.isActive);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = window.localStorage.getItem('radinet_auth_token');
      const res = await fetch(`/api/admin/shop/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          slug,
          description,
          shortDescription,
          categoryId: categoryId || null,
          brand,
          sku,
          price: Number(price),
          oldPrice: oldPrice === '' ? null : Number(oldPrice),
          discountPercent: Number(discountPercent),
          stock: Number(stock),
          imageUrl,
          isActive,
          isFeatured,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'ویرایش محصول ناموفق بود.');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h3>ویرایش محصول: {product.name}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal__form">
          <div className="admin-modal__row">
            <label>
              <span>نام محصول</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              <span>نامک (slug)</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </label>
          </div>
          <label>
            <span>توضیحات کوتاه</span>
            <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          </label>
          <label>
            <span>توضیحات کامل</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </label>
          <div className="admin-modal__row">
            <label>
              <span>دسته‌بندی</span>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">بدون دسته</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>برند</span>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>SKU</span>
              <input value={sku} onChange={(e) => setSku(e.target.value)} />
            </label>
            <label>
              <span>آدرس تصویر</span>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>قیمت (تومان)</span>
              <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            </label>
            <label>
              <span>قیمت قبلی (تومان)</span>
              <input type="number" min={0} value={oldPrice} onChange={(e) => setOldPrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder="اختیاری" />
            </label>
          </div>
          <div className="admin-modal__row">
            <label>
              <span>درصد تخفیف</span>
              <input type="number" min={0} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} />
            </label>
            <label>
              <span>موجودی</span>
              <input type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} required />
            </label>
          </div>
          <div className="admin-modal__row">
            <label className="admin-modal__checkbox">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <span>محصول فعال است</span>
            </label>
            <label className="admin-modal__checkbox">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <span>محصول ویژه</span>
            </label>
          </div>
          {error && <div className="admin-modal__error">{error}</div>}
          <div className="admin-modal__actions">
            <button type="button" onClick={onClose} className="admin-modal__cancel">انصراف</button>
            <button type="submit" disabled={saving} className="admin-modal__save">
              {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
