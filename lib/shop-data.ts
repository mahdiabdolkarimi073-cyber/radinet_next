export type ShopCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  heroImageUrl?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImageUrl?: string;
  iconKey: string;
  colorTheme: string;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
  children?: ShopCategory[];
  _count?: { products: number };
};

export type ShopProduct = {
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
  oldPrice: number | null;
  discountPercent: number;
  stock: number;
  salesCount: number;
  imageUrl: string;
  gallery: string[];
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  attributes?: Record<string, string>;
  category?: { id: string; name: string; slug: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  imageUrl: string;
  stock: number;
};

export type ShopShippingMethod = {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string | null;
  iconKey: string;
  isActive: boolean;
};

export type ShopDiscount = {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  description?: string;
  minOrderAmount?: number;
  isActive: boolean;
};

export type ShopOrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: {
    id: string;
    name: string;
    imageUrl: string;
    slug?: string;
    brand?: string;
  };
};

export type ShopOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  province?: string;
  city?: string;
  postalCode?: string;
  shippingMethod: string;
  shippingMethodName?: string | null;
  shippingCost: number;
  needInvoice: boolean;
  companyName?: string;
  companyNationalId?: string;
  companyEconomicCode?: string;
  companyRegistrationNumber?: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'unpaid' | 'pending';
  status: 'pending' | 'processing' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled';
  trackingCode: string | null;
  subtotal: number;
  discountTotal: number;
  tax: number;
  total: number;
  items: ShopOrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type ShopCartConfig = {
  taxRate: number;
  shippingCost: number;
  freeShippingThreshold: number;
};

export type ProductListResponse = {
  items: ShopProduct[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type OrderListResponse = {
  items: ShopOrder[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type OrderStatsResponse = {
  total: number;
  byStatus: {
    pending: number;
    processing: number;
    readyToShip: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  revenue: number;
  paidRevenue: number;
};
