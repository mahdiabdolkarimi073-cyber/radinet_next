'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, Minus, Plus, Send, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem, cartCount, readCart, writeCart } from '@/lib/cart';

const api = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

type CartConfig = { taxRate: number; shippingCost: number; freeShippingThreshold: number };
type Discount = { type: string; value: number; description?: string };

const money = (value: number) => `${Math.max(0, Math.round(value)).toLocaleString('fa-IR')} تومان`;

export function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [config, setConfig] = useState<CartConfig>({ taxRate: 0, shippingCost: 0, freeShippingThreshold: 0 });
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);

  useEffect(() => {
    setItems(readCart());
    fetch(`${api}/api/shop/cart/config`)
      .then((response) => response.ok ? response.json() : null)
      .then((data: CartConfig | null) => { if (data) setConfig(data); })
      .catch(() => undefined);
  }, []);

  const updateItems = (next: CartItem[]) => { setItems(next); writeCart(next); };
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discountAmount = useMemo(() => {
    if (!discount) return 0;
    return discount.type === 'fixed' ? Math.min(subtotal, Number(discount.value)) : Math.round(subtotal * Number(discount.value) / 100);
  }, [discount, subtotal]);
  const tax = Math.round((subtotal - discountAmount) * (Number(config.taxRate) / 100));
  const shipping = config.freeShippingThreshold > 0 && subtotal >= config.freeShippingThreshold ? 0 : Number(config.shippingCost);
  const total = subtotal - discountAmount + tax + shipping;

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountLoading(true); setDiscountError('');
    try {
      const response = await fetch(`${api}/api/shop/discounts/${encodeURIComponent(discountCode.trim())}`);
      if (!response.ok) throw new Error('کد تخفیف نامعتبر است');
      const data = await response.json();
      setDiscount(data);
    } catch (error) {
      setDiscount(null);
      setDiscountError(error instanceof Error ? error.message : 'کد تخفیف نامعتبر است');
    } finally { setDiscountLoading(false); }
  };

  if (items.length === 0) {
    return <div className="cart-empty"><ShoppingBag size={52} /><h1>سبد خرید شما خالی است</h1><p>محصولات مورد علاقه‌تان را به سبد خرید اضافه کنید.</p><a href="/shop/search">مشاهده محصولات <ChevronLeft size={18} /></a></div>;
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-stepper" aria-label="مراحل ثبت سفارش">
          {['سبد خرید', 'تکمیل سفارش', 'پرداخت', 'تکمیل سفارش'].map((label, index) => (
            <div className={`cart-step ${index === 0 ? 'is-active' : ''}`} key={`${label}-${index}`}>
              <span>{index === 0 ? <Check size={16} /> : index + 1}</span><small>{label}</small>
            </div>
          ))}
        </div>
        <div className="cart-layout">
          <section className="cart-table">
            <div className="cart-table__head"><span>محصول</span><span>قیمت واحد</span><span>تعداد</span><span>جمع کل</span></div>
            <div className="cart-table__rows">
              {items.map((item) => (
                <div className="cart-row" key={item.productId}>
                  <div className="cart-product"><img src={item.imageUrl || '/assets/images/logo-radinat.svg.png'} alt={item.name} /><div><small>{item.brand || 'رادینت'}</small><a href={`/shop/product/${item.slug}`}>{item.name}</a></div></div>
                  <strong className="cart-unit">{money(item.price)}</strong>
                  <div className="cart-quantity"><button onClick={() => updateItems(items.map((entry) => entry.productId === item.productId ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry))} aria-label="کاهش تعداد"><Minus size={14} /></button><span>{item.quantity.toLocaleString('fa-IR')}</span><button onClick={() => updateItems(items.map((entry) => entry.productId === item.productId ? { ...entry, quantity: Math.min(entry.stock || 99, entry.quantity + 1) } : entry))} aria-label="افزایش تعداد"><Plus size={14} /></button></div>
                  <strong className="cart-line-total">{money(item.price * item.quantity)}</strong>
                  <button className="cart-remove" onClick={() => updateItems(items.filter((entry) => entry.productId !== item.productId))} aria-label="حذف محصول"><X size={17} /></button>
                </div>
              ))}
            </div>
            <div className="cart-table__footer"><button className="cart-discount-trigger" onClick={() => document.getElementById('discount-code')?.focus()}>اعمال تخفیف</button><button className="cart-clear" onClick={() => updateItems([])}><Trash2 size={16} /> خالی کردن سبد</button></div>
          </section>
          <aside className="cart-summary">
            <h2>خلاصه سفارش</h2>
            <div className="cart-summary__lines"><div><span>جمع جزء</span><strong>{money(subtotal)}</strong></div><div className="is-discount"><span>سود شما از خرید</span><strong>- {money(discountAmount)}</strong></div><div><span>مالیات ({Number(config.taxRate).toLocaleString('fa-IR')}٪)</span><strong>{money(tax)}</strong></div><div><span>هزینه ارسال</span><strong>{shipping === 0 ? 'رایگان' : money(shipping)}</strong></div></div>
            <div className="cart-coupon"><label htmlFor="discount-code">کد تخفیف</label><div><input id="discount-code" value={discountCode} onChange={(event) => setDiscountCode(event.target.value)} placeholder="RADINTO" /><button onClick={applyDiscount} disabled={discountLoading}>{discountLoading ? '...' : 'اعمال'}</button></div>{discountError && <small>{discountError}</small>}{discount && <small className="is-success">کد تخفیف اعمال شد.</small>}</div>
            <div className="cart-summary__total"><span>مبلغ قابل پرداخت</span><strong>{money(total)}</strong></div>
            <a className="cart-checkout" href="/shop/checkout">ادامه ثبت سفارش <Plus size={18} /></a>
          </aside>
        </div>
        <div className="cart-free-shipping"><Send size={18} /> ارسال رایگان برای سفارش‌های بالای {config.freeShippingThreshold > 0 ? money(config.freeShippingThreshold) : 'سقف تعیین‌شده توسط مدیریت'}</div>
      </div>
    </div>
  );
}
