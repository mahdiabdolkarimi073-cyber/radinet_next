'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  CreditCard,
  Truck,
  Lock,
  Layers,
  Banknote,
  CalendarClock,
  Building2,
  PackageCheck,
  Send,
  ShoppingBag,
} from 'lucide-react';
import { CartItem, readCart } from '@/lib/cart';

const api = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

type CartConfig = { taxRate: number; shippingCost: number; freeShippingThreshold: number };
type ShippingMethod = {
  id: string;
  code: string;
  name: string;
  description: string;
  price: string | number;
  estimatedDays: string | null;
  iconKey: string;
};

const money = (value: number) => `${Math.max(0, Math.round(value)).toLocaleString('fa-IR')} تومان`;

const SHIPPING_ICON_MAP: Record<string, typeof Truck> = {
  truck: Truck,
  post: Send,
  tipax: PackageCheck,
  bar: Layers,
  express: CalendarClock,
};

const PAYMENT_METHODS = [
  { code: 'gateway', label: 'درگاه بانکی', icon: CreditCard },
  { code: 'card', label: 'کارت به کارت', icon: Banknote },
  { code: 'installments', label: 'اقساطی', icon: CalendarClock },
];

export function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [config, setConfig] = useState<CartConfig>({ taxRate: 0, shippingCost: 0, freeShippingThreshold: 0 });
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  const [express, setExpress] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState('');

  const [needInvoice, setNeedInvoice] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyNationalId, setCompanyNationalId] = useState('');
  const [companyEconomicCode, setCompanyEconomicCode] = useState('');
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('gateway');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    setItems(readCart());
    fetch(`${api}/api/shop/cart/config`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: CartConfig | null) => { if (d) setConfig(d); })
      .catch(() => undefined);
    fetch(`${api}/api/shop/shipping-methods`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d: ShippingMethod[]) => {
        setShippingMethods(d);
        if (d.length > 0) setSelectedShipping(d[0].code);
      })
      .catch(() => undefined);
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const tax = Math.round(subtotal * (Number(config.taxRate) / 100));

  const selectedShippingMethod = shippingMethods.find((s) => s.code === selectedShipping);
  const shippingCost = selectedShippingMethod ? Number(selectedShippingMethod.price) : Number(config.shippingCost);
  const displayShipping =
    config.freeShippingThreshold > 0 && subtotal >= config.freeShippingThreshold ? 0 : shippingCost;

  const total = subtotal + tax + displayShipping;

  const handleSubmit = async () => {
    setError('');
    if (!firstName.trim() || !lastName.trim() || !province.trim() || !city.trim() || !address.trim() || !postalCode.trim() || !phone.trim()) {
      setError('لطفاً تمام فیلدهای اطلاعات ارسال را تکمیل کنید.');
      return;
    }
    if (!selectedShipping) {
      setError('یک روش ارسال انتخاب کنید.');
      return;
    }
    if (!paymentMethod) {
      setError('یک روش پرداخت انتخاب کنید.');
      return;
    }
    if (!agreeTerms) {
      setError('برای ادامه باید قوانین و مقررات را بپذیرید.');
      return;
    }
    if (items.length === 0) {
      setError('سبد خرید شما خالی است.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${api}/api/shop/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: `${firstName} ${lastName}`,
          customerPhone: phone,
          shippingAddress: `${province} - ${city} - ${address} - کد پستی: ${postalCode}`,
          firstName,
          lastName,
          province,
          city,
          postalCode,
          shippingMethod: selectedShipping,
          needInvoice,
          companyNationalId: needInvoice ? companyNationalId : undefined,
          companyEconomicCode: needInvoice ? companyEconomicCode : undefined,
          companyRegistrationNumber: needInvoice ? companyRegistrationNumber : undefined,
          companyName: needInvoice ? companyName : undefined,
          paymentMethod,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? 'ثبت سفارش ناموفق بود.');
      }
      const order = await response.json();
      // simulate redirect to payment gateway
      if (paymentMethod === 'gateway') {
        setRedirectUrl(`/shop/checkout/success?order=${order.orderNumber}`);
      } else if (paymentMethod === 'card') {
        setRedirectUrl(`/shop/checkout/manual?order=${order.orderNumber}`);
      } else {
        setRedirectUrl(`/shop/checkout/installments?order=${order.orderNumber}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }, [redirectUrl]);

  if (items.length === 0 && !submitting) {
    return (
      <div className="co-empty">
        <ShoppingBag size={52} />
        <h1>سبد خرید شما خالی است</h1>
        <p>برای تسویه حساب ابتدا محصولاتی را به سبد خرید اضافه کنید.</p>
        <a href="/shop/search">مشاهده محصولات <ChevronLeft size={18} /></a>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Stepper */}
        <div className="checkout-stepper" aria-label="مراحل ثبت سفارش">
          {['سبد خرید', 'تسویه حساب', 'پرداخت', 'تکمیل سفارش'].map((label, index) => (
            <div className={`checkout-step ${index === 1 ? 'is-active' : ''} ${index === 0 ? 'is-done' : ''}`} key={`${label}-${index}`}>
              <span>{index < 1 ? <Check size={16} /> : index + 1}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>

        {error && <div className="co-error">{error}</div>}

        <div className="checkout-layout">
          {/* Column 1: Shipping Info */}
          <section className="co-card">
            <h2 className="co-card__title"><Truck size={18} /> اطلاعات ارسال</h2>
            <div className="co-row">
              <div className="co-field">
                <label htmlFor="firstName">نام</label>
                <input id="firstName" className="co-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="نام" />
              </div>
              <div className="co-field">
                <label htmlFor="lastName">نام خانوادگی</label>
                <input id="lastName" className="co-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="نام خانوادگی" />
              </div>
            </div>
            <div className="co-row">
              <div className="co-field">
                <label htmlFor="province">استان</label>
                <input id="province" className="co-input" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="استان" />
              </div>
              <div className="co-field">
                <label htmlFor="city">شهر</label>
                <input id="city" className="co-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="شهر" />
              </div>
            </div>
            <div className="co-field">
              <label htmlFor="address">آدرس</label>
              <textarea id="address" className="co-input co-textarea" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="آدرس کامل" />
            </div>
            <div className="co-row">
              <div className="co-field">
                <label htmlFor="postalCode">کد پستی</label>
                <input id="postalCode" className="co-input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="کد پستی" inputMode="numeric" />
              </div>
              <div className="co-field">
                <label htmlFor="phone">تلفن</label>
                <input id="phone" className="co-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="تلفن" inputMode="tel" />
              </div>
            </div>
            <button className="co-edit-btn" type="button">ویرایش</button>
          </section>

          {/* Column 2: Shipping Methods */}
          <section className="co-card">
            <h2 className="co-card__title"><PackageCheck size={18} /> روش ارسال</h2>
            <div className="co-express">
              <span>مرسولات اکسپرس رسید</span>
              <label className="co-switch">
                <input type="checkbox" checked={express} onChange={(e) => setExpress(e.target.checked)} />
                <span className="co-switch__track"><span className="co-switch__thumb" /></span>
              </label>
            </div>
            <div className="co-shipping-list">
              {shippingMethods.length === 0 && (
                <div className="co-shipping-item">
                  <div className="co-shipping-item__body">
                    <p className="co-shipping-item__name">پست پیشتاز</p>
                    <p className="co-shipping-item__price is-free">رایگان</p>
                  </div>
                </div>
              )}
              {shippingMethods.map((method) => {
                const Icon = SHIPPING_ICON_MAP[method.iconKey] ?? Truck;
                const price = Number(method.price);
                const isFree = price === 0;
                return (
                  <div
                    key={method.id}
                    className={`co-shipping-item ${selectedShipping === method.code ? 'is-selected' : ''}`}
                    onClick={() => setSelectedShipping(method.code)}
                  >
                    <Icon className="co-shipping-item__icon" />
                    <div className="co-shipping-item__body">
                      <p className="co-shipping-item__name">{method.name}</p>
                      <p className={`co-shipping-item__price ${isFree ? 'is-free' : ''}`}>
                        {isFree ? 'ارسال رایگان' : money(price)}
                        {method.estimatedDays ? ` - ${method.estimatedDays}` : ''}
                      </p>
                      <a className="co-shipping-item__link" href="#" onClick={(e) => e.preventDefault()}>مشاهده</a>
                    </div>
                    <span className="co-radio"><span className="co-radio__dot" /></span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Column 3: Payment + Summary */}
          <section className="co-summary-col">
            <div className="co-card">
              <h2 className="co-card__title"><CreditCard size={18} /> روش پرداخت</h2>
              <div className="co-payment-list">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.code}
                      className={`co-payment-item ${paymentMethod === method.code ? 'is-selected' : ''}`}
                      onClick={() => setPaymentMethod(method.code)}
                    >
                      <Icon className="co-payment-item__icon" />
                      <span>{method.label}</span>
                      <span className="co-radio" style={{ marginRight: 'auto' }}><span className="co-radio__dot" /></span>
                    </div>
                  );
                })}
              </div>

              {/* Invoice toggle */}
              <div className="co-invoice-toggle">
                <div className="co-express">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Building2 size={16} /> درخواست فاکتور رسمی</span>
                  <label className="co-switch">
                    <input type="checkbox" checked={needInvoice} onChange={(e) => setNeedInvoice(e.target.checked)} />
                    <span className="co-switch__track"><span className="co-switch__thumb" /></span>
                  </label>
                </div>
                {needInvoice && (
                  <div className="co-invoice-fields">
                    <div className="co-field">
                      <label htmlFor="companyName">نام شرکت</label>
                      <input id="companyName" className="co-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="نام شرکت" />
                    </div>
                    <div className="co-row">
                      <div className="co-field">
                        <label htmlFor="companyNationalId">شناسه ملی</label>
                        <input id="companyNationalId" className="co-input" value={companyNationalId} onChange={(e) => setCompanyNationalId(e.target.value)} placeholder="شناسه ملی" inputMode="numeric" />
                      </div>
                      <div className="co-field">
                        <label htmlFor="companyEconomicCode">کد اقتصادی</label>
                        <input id="companyEconomicCode" className="co-input" value={companyEconomicCode} onChange={(e) => setCompanyEconomicCode(e.target.value)} placeholder="کد اقتصادی" inputMode="numeric" />
                      </div>
                    </div>
                    <div className="co-field">
                      <label htmlFor="companyRegistrationNumber">شماره ثبت</label>
                      <input id="companyRegistrationNumber" className="co-input" value={companyRegistrationNumber} onChange={(e) => setCompanyRegistrationNumber(e.target.value)} placeholder="شماره ثبت" inputMode="numeric" />
                    </div>
                  </div>
                )}
              </div>

              <button className="co-edit-btn" type="button">ویرایش</button>
            </div>

            {/* Summary + Pay button */}
            <div className="co-card co-summary">
              <div className="co-summary__lines">
                <div><span>جمع جزء</span><strong>{money(subtotal)}</strong></div>
                {tax > 0 && <div><span>مالیات ({Number(config.taxRate).toLocaleString('fa-IR')}٪)</span><strong>{money(tax)}</strong></div>}
                <div>
                  <span>هزینه ارسال</span>
                  <strong className={displayShipping === 0 ? 'is-free' : ''}>
                    {displayShipping === 0 ? 'رایگان' : money(displayShipping)}
                  </strong>
                </div>
              </div>
              <p className="co-summary__label">مبلغ قابل پرداخت</p>
              <p className="co-summary__price">{money(total)}</p>
              <button className="co-pay-btn" type="button" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'در حال انتقال...' : <>انتقال به درگاه پرداخت <Lock size={18} /></>}
              </button>
              <label className="co-terms">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                <span>
                  <a href="/legal/terms" target="_blank" rel="noopener noreferrer">قوانین و مقررات</a> سایت را مطالعه کرده و می‌پذیرم.
                </span>
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
