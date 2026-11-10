'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, ChevronLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export function CheckoutInstallmentsPage() {
  const params = useSearchParams();
  const orderNumber = params.get('order') ?? '';
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="co-empty">
      <CalendarClock size={56} style={{ color: '#F97316' }} />
      <h1>درخواست خرید اقساطی ثبت شد</h1>
      <p>شماره سفارش: {orderNumber || 'نامشخص'}</p>
      <p>کارشناسان ما در اسرع وقت با شما تماس می‌گیرند.</p>
      <a href="/shop">بازگشت به فروشگاه <ChevronLeft size={18} /></a>
    </div>
  );
}
