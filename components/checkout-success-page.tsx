'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export function CheckoutSuccessPage() {
  const params = useSearchParams();
  const orderNumber = params.get('order') ?? '';
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="co-empty">
      <CheckCircle2 size={56} style={{ color: '#10B981' }} />
      <h1>سفارش با موفقیت ثبت شد</h1>
      <p>شماره سفارش: {orderNumber || 'نامشخص'}</p>
      <p>درگاه پرداخت به‌زودی فعال خواهد شد.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <a href={`/shop/tracking?order=${orderNumber}`}>پیگیری سفارش <ChevronLeft size={18} /></a>
        <a href="/shop">بازگشت به فروشگاه <ChevronLeft size={18} /></a>
      </div>
    </div>
  );
}
