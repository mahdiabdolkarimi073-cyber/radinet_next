export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  quantity: number;
  stock: number;
  maxOrderQty?: number | null;
};

const CART_KEY = 'radinet-cart';

export function getEffectiveMaxQty(item: { stock?: number; maxOrderQty?: number | null }): number {
  const stockCap = typeof item.stock === 'number' && item.stock > 0 ? item.stock : 99;
  const maxOrderCap =
    typeof item.maxOrderQty === 'number' && Number.isFinite(item.maxOrderQty) && item.maxOrderQty >= 1
      ? Math.floor(item.maxOrderQty)
      : null;
  if (maxOrderCap !== null) {
    return Math.min(stockCap, maxOrderCap);
  }
  return stockCap;
}

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(CART_KEY) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]): void {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export function checkCartItemAddition(
  item: CartItem,
  currentItems?: CartItem[],
): {
  allowed: boolean;
  maxAllowed: number;
  currentInCart: number;
  message?: string;
} {
  const items = currentItems ?? readCart();
  const existing = items.find((entry) => entry.productId === item.productId);
  const currentInCart = existing ? existing.quantity : 0;
  const mergedItem = {
    stock: item.stock ?? existing?.stock ?? 99,
    maxOrderQty: item.maxOrderQty !== undefined ? item.maxOrderQty : existing?.maxOrderQty,
  };
  const maxAllowed = getEffectiveMaxQty(mergedItem);
  const requestedTotal = currentInCart + item.quantity;

  if (requestedTotal > maxAllowed) {
    const hasUserLimit =
      typeof mergedItem.maxOrderQty === 'number' &&
      mergedItem.maxOrderQty >= 1 &&
      mergedItem.maxOrderQty <= (mergedItem.stock || 99);
    const message = hasUserLimit
      ? `حداکثر تعداد مجاز خرید برای کالای «${item.name}» ${mergedItem.maxOrderQty} عدد برای هر کاربر است.`
      : `حداکثر موجودی قابل سفارش برای کالای «${item.name}» ${maxAllowed} عدد است.`;
    return {
      allowed: false,
      maxAllowed,
      currentInCart,
      message,
    };
  }

  return {
    allowed: true,
    maxAllowed,
    currentInCart,
  };
}

export function addToCart(item: CartItem): CartItem[] {
  const items = readCart();
  const existing = items.find((entry) => entry.productId === item.productId);
  const maxAllowed = getEffectiveMaxQty({
    stock: item.stock ?? existing?.stock,
    maxOrderQty: item.maxOrderQty !== undefined ? item.maxOrderQty : existing?.maxOrderQty,
  });
  const next = existing
    ? items.map((entry) =>
        entry.productId === item.productId
          ? {
              ...entry,
              quantity: Math.min(maxAllowed, entry.quantity + item.quantity),
              price: item.price,
              stock: item.stock,
              maxOrderQty: item.maxOrderQty !== undefined ? item.maxOrderQty : entry.maxOrderQty,
            }
          : entry,
      )
    : [
        ...items,
        {
          ...item,
          quantity: Math.min(maxAllowed, Math.max(1, item.quantity)),
        },
      ];
  writeCart(next);
  return next;
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}
