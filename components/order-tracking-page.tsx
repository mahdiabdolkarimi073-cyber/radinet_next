'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  CircleHelp,
  ClipboardList,
  Clock3,
  Copy,
  MapPin,
  Package,
  PackageCheck,
  Search,
  Truck,
} from 'lucide-react';

const api = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

type ProductRef = { imageUrl?: string; slug?: string };
type OrderItem = { id: string; productName: string; quantity: number; unitPrice: string | number; lineTotal: string | number; product?: ProductRef };
type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingMethodName?: string | null;
  shippingMethod?: string | null;
  trackingCode?: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  total: string | number;
  subtotal: string | number;
  shippingCost: string | number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

type Stage = { key: string; label: string; icon: typeof ClipboardList };
const stages: Stage[] = [
  { key: 'registered', label: 'ثبت شده', icon: ClipboardList },
  { key: 'processing', label: 'در حال پردازش', icon: Clock3 },
  { key: 'ready', label: 'آماده ارسال', icon: PackageCheck },
  { key: 'shipped', label: 'ارسال شده', icon: Truck },
  { key: 'delivered', label: 'تحویل شده', icon: Check },
];

const statusRank: Record<string, number> = {
  pending: 0,
  registered: 0,
  processing: 1,
  ready: 2,
  ready_to_ship: 2,
  shipped: 3,
  delivered: 4,
};

const money = (value: string | number) => `${Number(value || 0).toLocaleString('fa-IR')} تومان`;
const formatDate = (value: string) => new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
const normalizeStatus = (value: string) => statusRank[value.toLowerCase()] ?? 0;

function statusLabel(status: string): string {
  return stages[normalizeStatus(status)]?.label ?? 'ثبت شده';
}

export function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const loadOrders = async (event?: FormEvent) => {
    event?.preventDefault();
    setError('');
    if (!orderNumber.trim() && !phone.trim()) {
      setError('شماره سفارش یا شماره تلفن را وارد کنید.');
      return;
    }
    setLoading(true);
    try {
      let selected: Order | null = null;
      let orders: Order[] = [];
      if (phone.trim()) {
        const historyResponse = await fetch(`${api}/api/shop/orders/phone/${encodeURIComponent(phone.trim())}`);
        if (historyResponse.ok) orders = await historyResponse.json();
      }
      if (orderNumber.trim()) {
        const orderResponse = await fetch(`${api}/api/shop/orders/${encodeURIComponent(orderNumber.trim())}`);
        if (!orderResponse.ok) throw new Error('سفارشی با این شماره پیدا نشد.');
        selected = await orderResponse.json();
        if (!orders.some((item) => item.orderNumber === selected?.orderNumber)) orders = [selected, ...orders];
      }
      if (!selected) selected = orders[0] ?? null;
      if (!selected) throw new Error('سفارشی با این اطلاعات پیدا نشد.');
      setHistory(orders);
      setOrder(selected);
    } catch (requestError) {
      setOrder(null);
      setHistory([]);
      setError(requestError instanceof Error ? requestError.message : 'دریافت اطلاعات سفارش ناموفق بود.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialOrder = params.get('order');
    const initialPhone = params.get('phone');
    if (initialOrder) setOrderNumber(initialOrder);
    if (initialPhone) setPhone(initialPhone);
    if (initialOrder || initialPhone) void loadOrders();
  }, []);

  const currentRank = useMemo(() => (order ? normalizeStatus(order.status) : 0), [order]);

  const selectOrder = (selected: Order) => {
    setOrder(selected);
    setOrderNumber(selected.orderNumber);
  };

  const copyTrackingCode = () => {
    if (!order?.trackingCode) return;
    navigator.clipboard?.writeText(order.trackingCode).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        <div className="tracking-heading">
          <div>
            <h1>پیگیری سفارش</h1>
            <p>برای مشاهده وضعیت سفارش، شماره سفارش یا تلفن خود را وارد کنید.</p>
          </div>
          <form className="tracking-search" onSubmit={loadOrders}>
            <input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="شماره سفارش" aria-label="شماره سفارش" />
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="شماره تلفن" aria-label="شماره تلفن" inputMode="tel" />
            <button type="submit"><Search size={17} /> پیگیری</button>
          </form>
        </div>

        {error && <div className="tracking-error">{error}</div>}
        {loading && <div className="tracking-loading">در حال دریافت اطلاعات سفارش...</div>}

        {!order && !loading && !error && (
          <div className="tracking-empty">
            <CircleHelp size={48} color="#2563EB" />
            <h2>هنوز سفارشی برای نمایش انتخاب نشده است</h2>
            <p>شماره سفارش درج‌شده در رسید خرید یا تلفن ثبت‌شده را وارد کنید.</p>
          </div>
        )}

        {order && (
          <>
            <div className="tracking-layout">
              <section>
                <div className="tracking-card tracking-status-card">
                  <h2>وضعیت سفارش</h2>
                  <div className="tracking-stepper">
                    <div className="tracking-progress" style={{ width: `${Math.max(0, Math.min(80, currentRank * 20))}%` }} />
                    {stages.map((stage, index) => {
                      const Icon = stage.icon;
                      const isDone = index < currentRank;
                      const isCurrent = index === currentRank;
                      return (
                        <div className={`tracking-step ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`} key={stage.key}>
                          <span className="tracking-step__circle">{isDone ? <Check size={16} /> : <Icon size={16} />}</span>
                          <span className="tracking-step__label">{stage.label}</span>
                          <span className="tracking-step__date">{isCurrent || isDone ? formatDate(order.updatedAt || order.createdAt) : '—'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="tracking-card tracking-info">
                  <h3>اطلاعات ارسال</h3>
                  <div className="tracking-info-grid">
                    <div className="tracking-info-row"><Truck size={16} /><span>روش ارسال:</span><strong>{order.shippingMethodName || order.shippingMethod || 'مرسوله پستی'}</strong></div>
                    <div className="tracking-info-row"><MapPin size={16} /><span>مقصد:</span><strong>{order.shippingAddress || 'ثبت نشده'}</strong></div>
                    <div className="tracking-info-row"><Package size={16} /><span>کد رهگیری:</span><strong className="tracking-code">{order.trackingCode || 'پس از ارسال ثبت می‌شود'}</strong>{order.trackingCode && <button onClick={copyTrackingCode} aria-label="کپی کد رهگیری" style={{ border: 0, background: 'transparent', color: '#2563EB', cursor: 'pointer' }}><Copy size={14} /></button>}{copied && <small style={{ color: '#10B981' }}>کپی شد</small>}</div>
                    <div className="tracking-info-row"><CalendarDays size={16} /><span>آخرین بروزرسانی:</span><strong>{formatDate(order.updatedAt || order.createdAt)}</strong></div>
                  </div>
                </div>

                <div className="tracking-card tracking-products">
                  <h3>محصولات سفارش</h3>
                  {order.items.map((item) => (
                    <div className="tracking-product" key={item.id}>
                      <img src={item.product?.imageUrl || '/assets/images/logo-radinat.svg.png'} alt={item.productName} />
                      <div className="tracking-product__body">
                        <p className="tracking-product__name">{item.productName}</p>
                        <div className="tracking-product__meta"><span>تعداد: {item.quantity.toLocaleString('fa-IR')}</span><span>{money(item.lineTotal)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="tracking-card tracking-details">
                <h2>جزئیات سفارش</h2>
                <div className="tracking-detail-row"><span>شماره سفارش</span><strong>{order.orderNumber}</strong></div>
                <div className="tracking-detail-row"><span>تاریخ ثبت</span><strong>{formatDate(order.createdAt)}</strong></div>
                <div className="tracking-detail-row"><span>وضعیت فعلی</span><strong style={{ color: '#2563EB' }}>{statusLabel(order.status)}</strong></div>
                <div className="tracking-detail-row"><span>وضعیت پرداخت</span><strong>{order.paymentStatus === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت'}</strong></div>
                <div className="tracking-total"><span>مبلغ کل</span><strong>{money(order.total)}</strong></div>
                <button className="tracking-invoice" type="button" onClick={() => window.print()}>مشاهده فاکتور</button>
              </aside>
            </div>

            {history.length > 1 && (
              <section className="tracking-card tracking-history">
                <h2>تاریخچه کامل سفارش‌ها</h2>
                <div className="tracking-history-list">
                  {history.map((item) => (
                    <button className={`tracking-history-item ${item.id === order.id ? 'is-active' : ''}`} key={item.id} onClick={() => selectOrder(item)} type="button">
                      <strong>{item.orderNumber}</strong>
                      <span>{formatDate(item.createdAt)}</span>
                      <span>{statusLabel(item.status)} · {money(item.total)}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
