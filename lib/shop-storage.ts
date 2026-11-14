import { BACKEND_URL as backendUrl } from './auth-client';
import type {
  AdminReviewListResponse,
  OrderListResponse,
  OrderStatsResponse,
  ProductListResponse,
  ProductReview,
  ShopCartConfig,
  ShopCategory,
  ShopDiscount,
  ShopOrder,
  ShopProduct,
  ShopShippingMethod,
} from './shop-data';

export type ProductFilterOptions = {
  search?: string;
  category?: string;
  categorySlug?: string;
  categoryId?: string;
  status?: string;
  brands?: string;
  inStock?: string | boolean;
  outOfStock?: string | boolean;
  minPrice?: number | string;
  maxPrice?: number | string;
  sort?: string;
  page?: number | string;
  limit?: number | string;
  featured?: boolean;
};

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  notes?: string;
  items: Array<{
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice?: number;
    lineTotal?: number;
  }>;
  subtotal?: number;
  shippingCost?: number;
  discountTotal?: number;
  discountCode?: string;
  total?: number;
  firstName?: string;
  lastName?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  shippingMethod?: string;
  shippingMethodName?: string;
  needInvoice?: boolean;
  companyNationalId?: string;
  companyEconomicCode?: string;
  companyRegistrationNumber?: string;
  companyName?: string;
  paymentMethod?: string;
  paymentStatus?: 'unpaid' | 'paid' | 'failed';
  paymentReference?: string;
};

function mapProduct(p: any): ShopProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    shortDescription: p.shortDescription || '',
    technicalSpecifications: p.technicalSpecifications || '',
    categoryId: p.categoryId || null,
    brand: p.brand || '',
    sku: p.sku || '',
    price: Number(p.price) || 0,
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    discountPercent: p.discountPercent || 0,
    stock: p.stock ?? 0,
    maxOrderQty: p.maxOrderQty ?? null,
    salesCount: p.salesCount || 0,
    imageUrl: p.imageUrl || '',
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    isActive: p.isActive !== false,
    isFeatured: Boolean(p.isFeatured),
    rating: Number(p.rating) || 5,
    reviewCount: p.reviewCount || 0,
    attributes: p.attributes && typeof p.attributes === 'object' ? p.attributes : undefined,
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
        }
      : null,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
  };
}

export async function getShopCategoriesServer(): Promise<ShopCategory[]> {
  try {
    const res = await fetch(`${backendUrl}/shop/categories`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error('Error fetching categories from backend:', err);
  }
  return [];
}

export async function getShopCategoryBySlugServer(slug: string): Promise<ShopCategory | null> {
  try {
    const res = await fetch(`${backendUrl}/shop/categories/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (res.ok) {
      return res.json();
    }
  } catch (err) {
    console.error('Error fetching category by slug:', err);
  }
  return null;
}

export async function getShopBrandsServer(): Promise<string[]> {
  try {
    const res = await fetch(`${backendUrl}/shop/products/brands`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch {}
  return ['سیمنس', 'فیلیپس', 'ج‌ای', 'رادینت', 'بارکو', 'کرستریم'];
}

export async function getShopCartConfigServer(): Promise<ShopCartConfig> {
  try {
    const res = await fetch(`${backendUrl}/shop/cart/config`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        taxRate: Number(data.taxRate ?? 0),
        shippingCost: Number(data.shippingCost ?? 0),
        freeShippingThreshold: Number(data.freeShippingThreshold ?? 0),
      };
    }
  } catch {}
  return { taxRate: 0, shippingCost: 0, freeShippingThreshold: 0 };
}

export async function getShopProductsServer(options: ProductFilterOptions = {}): Promise<ProductListResponse> {
  const pageNum = Math.max(Number(options.page) || 1, 1);
  const limitNum = Math.max(Number(options.limit) || 12, 1);

  try {
    const q = new URLSearchParams();
    if (options.search) q.set('search', options.search);
    if (options.categorySlug) q.set('categorySlug', options.categorySlug);
    if (options.category) q.set('categorySlug', options.category);
    if (options.brands) q.set('brands', options.brands);
    if (options.sort) q.set('sort', options.sort);
    if (options.featured) q.set('featured', 'true');
    if (options.page) q.set('page', String(pageNum));
    if (options.limit) q.set('pageSize', String(limitNum));
    if (options.minPrice) q.set('minPrice', String(options.minPrice));
    if (options.maxPrice) q.set('maxPrice', String(options.maxPrice));
    if (options.inStock) q.set('inStock', 'true');
    if (options.outOfStock) q.set('outOfStock', 'true');
    const qs = q.toString();

    const res = await fetch(`${backendUrl}/shop/products${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const rawItems = Array.isArray(data) ? data : data.items || [];
      const items = rawItems.map(mapProduct);
      const total = data.total ?? items.length;
      return {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        pages: data.pages ?? Math.max(Math.ceil(total / limitNum), 1),
      };
    }
  } catch (err) {
    console.error('Error fetching products from backend:', err);
  }
  return { items: [], total: 0, page: pageNum, limit: limitNum, pages: 1 };
}

export async function getShopProductBySlugServer(slug: string): Promise<(ShopProduct & { related?: ShopProduct[] }) | null> {
  try {
    const res = await fetch(`${backendUrl}/shop/products/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (res.ok) {
      const p = await res.json();
      const mapped = mapProduct(p);
      return {
        ...mapped,
        related: Array.isArray(p.related) ? p.related.map(mapProduct) : [],
      };
    }
  } catch (err) {
    console.error('Error fetching product by slug:', err);
  }
  return null;
}

export async function getShopShippingMethodsServer(): Promise<ShopShippingMethod[]> {
  try {
    const res = await fetch(`${backendUrl}/shop/shipping-methods`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return (data || []).map((s: any) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        description: s.description || '',
        price: Number(s.price) || 0,
        estimatedDays: s.estimatedDays || null,
        iconKey: s.iconKey || 'truck',
        isActive: s.isActive !== false,
      }));
    }
  } catch (err) {
    console.error('Error fetching shipping methods:', err);
  }
  return [];
}

export async function validateShopDiscountServer(code: string, _subtotal?: number): Promise<ShopDiscount | null> {
  try {
    const res = await fetch(`${backendUrl}/shop/discounts/${encodeURIComponent(code)}`, { cache: 'no-store' });
    if (res.ok) {
      const d = await res.json();
      return {
        id: d.id,
        code: d.code,
        description: d.description || '',
        type: (d.type || 'percent') as 'percent' | 'fixed',
        value: Number(d.value) || 0,
        minOrderAmount: d.minOrderAmount !== null && d.minOrderAmount !== undefined ? Number(d.minOrderAmount) : undefined,
        isActive: d.isActive !== false,
      };
    }
  } catch (err) {
    console.error('Error validating discount:', err);
  }
  return null;
}

export async function validateCartItemsServer(
  items: Array<{ productId: string; quantity: number }>,
): Promise<{ valid: boolean; message?: string }> {
  try {
    const res = await fetch(`${backendUrl}/shop/cart/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (res.ok) {
      return { valid: true };
    }
    const err = await res.json().catch(() => ({}));
    return { valid: false, message: err.message || 'اعتبارسنجی سبد خرید با خطا مواجه شد' };
  } catch {
    return { valid: true };
  }
}

export async function createShopOrderServer(payload: CreateOrderInput, auth?: string): Promise<ShopOrder> {
  const res = await fetch(`${backendUrl}/shop/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    return res.json();
  }
  const err = await res.json().catch(() => ({}));
  throw new Error(err.message || 'ثبت سفارش با خطا مواجه شد');
}

export async function getShopOrderByNumberServer(orderNumber: string): Promise<ShopOrder | null> {
  try {
    const res = await fetch(`${backendUrl}/shop/orders/${encodeURIComponent(orderNumber)}`, { cache: 'no-store' });
    if (res.ok) {
      return res.json();
    }
  } catch (err) {
    console.error('Error fetching order by number:', err);
  }
  return null;
}

export async function getShopOrdersByPhoneServer(phone: string): Promise<ShopOrder[]> {
  try {
    const res = await fetch(`${backendUrl}/shop/orders/phone/${encodeURIComponent(phone)}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error('Error fetching orders by phone:', err);
  }
  return [];
}

export async function adminListShopProductsServer(
  options: ProductFilterOptions = {},
  auth?: string,
): Promise<ProductListResponse> {
  const pageNum = Math.max(Number(options.page) || 1, 1);
  const limitNum = Math.max(Number(options.limit) || 20, 1);

  if (auth) {
    try {
      const q = new URLSearchParams();
      if (options.search) q.set('search', options.search);
      if (options.categorySlug) q.set('categorySlug', options.categorySlug);
      if (options.category) q.set('categorySlug', options.category);
      if (options.status) q.set('status', options.status);
      if (options.sort) q.set('sort', options.sort);
      if (options.page) q.set('page', String(pageNum));
      if (options.limit) q.set('limit', String(limitNum));
      const qs = q.toString();

      const res = await fetch(`${backendUrl}/admin/shop/products${qs ? `?${qs}` : ''}`, {
        headers: { Authorization: auth },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const rawItems = Array.isArray(data) ? data : data.items || [];
        const items = rawItems.map(mapProduct);
        const total = data.total ?? items.length;
        return {
          items,
          total,
          page: data.page ?? pageNum,
          limit: data.limit ?? limitNum,
          pages: data.pages ?? Math.max(Math.ceil(total / limitNum), 1),
        };
      }
    } catch (err) {
      console.error('Error listing admin products:', err);
    }
  }
  return getShopProductsServer(options);
}

export async function adminCreateShopProductServer(payload: Partial<ShopProduct>, auth?: string): Promise<ShopProduct> {
  const res = await fetch(`${backendUrl}/admin/shop/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    const p = await res.json();
    return mapProduct(p);
  }
  const err = await res.json().catch(() => ({}));
  throw new Error(err.message || 'ایجاد محصول با خطا مواجه شد');
}

export async function adminUpdateShopProductServer(
  id: string,
  payload: Partial<ShopProduct>,
  auth?: string,
): Promise<ShopProduct> {
  const res = await fetch(`${backendUrl}/admin/shop/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    const p = await res.json();
    return mapProduct(p);
  }
  const err = await res.json().catch(() => ({}));
  throw new Error(err.message || 'بروزرسانی محصول با خطا مواجه شد');
}

export async function adminDeleteShopProductServer(id: string, auth?: string): Promise<boolean> {
  const res = await fetch(`${backendUrl}/admin/shop/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: auth ? { Authorization: auth } : {},
  });
  return res.ok;
}

export async function adminListShopOrdersServer(
  options: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    page?: number | string;
    limit?: number | string;
  },
  auth?: string,
): Promise<OrderListResponse> {
  try {
    const q = new URLSearchParams();
    if (options.status) q.set('status', options.status);
    if (options.paymentStatus) q.set('paymentStatus', options.paymentStatus);
    if (options.search) q.set('search', options.search);
    if (options.page) q.set('page', String(options.page));
    if (options.limit) q.set('limit', String(options.limit));
    const qs = q.toString();

    const res = await fetch(`${backendUrl}/admin/orders${qs ? `?${qs}` : ''}`, {
      headers: auth ? { Authorization: auth } : {},
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return {
        items: data.items || [],
        total: data.total ?? 0,
        page: data.page ?? (Number(options.page) || 1),
        limit: data.limit ?? (Number(options.limit) || 20),
        pages: data.pages ?? 1,
      };
    }
  } catch (err) {
    console.error('Error listing orders from backend:', err);
  }
  return { items: [], total: 0, page: 1, limit: 20, pages: 1 };
}

export async function adminGetOrderStatsServer(auth?: string): Promise<OrderStatsResponse> {
  try {
    const res = await fetch(`${backendUrl}/admin/orders/stats/summary`, {
      headers: auth ? { Authorization: auth } : {},
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return {
        total: Number(data.total ?? 0),
        byStatus: {
          pending: Number(data.byStatus?.pending ?? 0),
          processing: Number(data.byStatus?.processing ?? 0),
          readyToShip: Number(data.byStatus?.readyToShip ?? 0),
          shipped: Number(data.byStatus?.shipped ?? 0),
          delivered: Number(data.byStatus?.delivered ?? 0),
          cancelled: Number(data.byStatus?.cancelled ?? 0),
        },
        revenue: Number(data.revenue ?? data.paidRevenue ?? 0),
        paidRevenue: Number(data.paidRevenue ?? 0),
      };
    }
  } catch (err) {
    console.error('Error fetching order stats from backend:', err);
  }
  return {
    total: 0,
    byStatus: {
      pending: 0,
      processing: 0,
      readyToShip: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
    revenue: 0,
    paidRevenue: 0,
  };
}

export async function adminUpdateOrderStatusServer(
  orderNumber: string,
  status: string,
  trackingCode?: string,
  paymentStatus?: string,
  auth?: string,
): Promise<ShopOrder> {
  const res = await fetch(`${backendUrl}/admin/orders/${encodeURIComponent(orderNumber)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
    body: JSON.stringify({ status, trackingCode, paymentStatus }),
  });
  if (res.ok) {
    const data = await res.json();
    return data?.order || data;
  }
  const err = await res.json().catch(() => ({}));
  throw new Error(err.message || 'بروزرسانی وضعیت سفارش ناموفق بود');
}

export async function getApprovedProductReviewsServer(
  productSlug: string,
): Promise<{ items: ProductReview[]; total: number }> {
  try {
    const res = await fetch(`${backendUrl}/shop/products/${encodeURIComponent(productSlug)}/reviews`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.items || [];
      return { items, total: data.total ?? items.length };
    }
  } catch {}
  return { items: [], total: 0 };
}

export async function createProductReviewServer(
  input: {
    productSlug?: string;
    productIdOrSlug?: string;
    userName: string;
    userEmail: string;
    rating: number;
    content: string;
    userId?: string;
  },
  auth?: string,
): Promise<ProductReview> {
  const slug = input.productSlug || input.productIdOrSlug || '';
  const res = await fetch(`${backendUrl}/shop/products/${encodeURIComponent(slug)}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
    body: JSON.stringify(input),
  });
  if (res.ok) {
    return res.json();
  }
  const err = await res.json().catch(() => ({}));
  throw new Error(err.message || 'ثبت نظر با خطا مواجه شد');
}

export async function adminListReviewsServer(
  options: {
    status?: string;
    targetType?: string;
    page?: number;
    limit?: number;
  },
  auth?: string,
): Promise<AdminReviewListResponse> {
  try {
    const q = new URLSearchParams();
    if (options.status) q.set('status', options.status);
    if (options.targetType) q.set('targetType', options.targetType);
    if (options.page) q.set('page', String(options.page));
    if (options.limit) q.set('limit', String(options.limit));
    const qs = q.toString();

    const res = await fetch(`${backendUrl}/admin/reviews${qs ? `?${qs}` : ''}`, {
      headers: auth ? { Authorization: auth } : {},
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return {
        items: data.items || [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        limit: data.limit ?? 20,
        pages: data.pages ?? 1,
        counts: data.counts ?? { all: 0, pending: 0, approved: 0, rejected: 0 },
      };
    }
  } catch (err) {
    console.error('Error listing reviews:', err);
  }
  return {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
    counts: { all: 0, pending: 0, approved: 0, rejected: 0 },
  };
}

export async function getApprovedSupportReviewsServer(): Promise<{ items: ProductReview[]; total: number }> {
  try {
    const res = await fetch(`${backendUrl}/shop/support-reviews`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.items || [];
      return { items, total: data.total ?? items.length };
    }
  } catch {}
  return { items: [], total: 0 };
}

export async function createSupportReviewServer(
  input: {
    userName: string;
    userEmail: string;
    rating: number;
    content: string;
    userId?: string;
  },
  auth?: string,
): Promise<ProductReview> {
  const res = await fetch(`${backendUrl}/shop/support-reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
    body: JSON.stringify(input),
  });
  if (res.ok) {
    return res.json();
  }
  const err = await res.json().catch(() => ({}));
  throw new Error(err.message || 'ثبت نظر پشتیبانی با خطا مواجه شد');
}

export async function adminUpdateReviewStatusServer(
  id: string,
  statusOrInput:
    | 'approved'
    | 'rejected'
    | { status: 'approved' | 'rejected'; rejectReason?: string; reviewedBy?: string },
  rejectReasonOrAuth?: string,
  maybeAuth?: string,
): Promise<ProductReview | null> {
  const isObj = typeof statusOrInput === 'object';
  const status = isObj ? statusOrInput.status : statusOrInput;
  const rejectReason = isObj ? statusOrInput.rejectReason : rejectReasonOrAuth;
  const auth = isObj ? rejectReasonOrAuth : maybeAuth;

  try {
    const res = await fetch(`${backendUrl}/admin/reviews/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({ status, rejectReason }),
    });
    if (res.ok) {
      return res.json();
    }
  } catch (err) {
    console.error('Error updating review status:', err);
  }
  return null;
}

export async function adminDeleteReviewServer(id: string, auth?: string): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/admin/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: auth ? { Authorization: auth } : {},
    });
    return res.ok;
  } catch {
    return false;
  }
}
