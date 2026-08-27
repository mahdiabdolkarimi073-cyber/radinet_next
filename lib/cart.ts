export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  quantity: number;
  stock: number;
};

const CART_KEY = 'radinet-cart';

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

export function addToCart(item: CartItem): CartItem[] {
  const items = readCart();
  const existing = items.find((entry) => entry.productId === item.productId);
  const next = existing
    ? items.map((entry) => entry.productId === item.productId
      ? { ...entry, quantity: Math.min(entry.stock || 99, entry.quantity + item.quantity), price: item.price, stock: item.stock }
      : entry)
    : [...items, item];
  writeCart(next);
  return next;
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}
