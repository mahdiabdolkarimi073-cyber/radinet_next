import type {
  ProductListResponse,
  ShopCartConfig,
  ShopCategory,
  ShopDiscount,
  ShopOrder,
  ShopProduct,
  ShopShippingMethod,
} from './shop-data';

export type {
  ProductListResponse,
  ShopCartConfig,
  ShopCategory,
  ShopDiscount,
  ShopOrder,
  ShopProduct,
  ShopShippingMethod,
};

export const DEFAULT_CART_CONFIG: ShopCartConfig = {
  taxRate: 9,
  shippingCost: 250000,
  freeShippingThreshold: 5000000,
};

export function formatToman(value: number | string | null | undefined): string {
  const num = typeof value === 'number' ? value : Number(value);
  const safeNum = Number.isFinite(num) ? Math.max(0, Math.round(num)) : 0;
  return `${safeNum.toLocaleString('fa-IR')} تومان`;
}
