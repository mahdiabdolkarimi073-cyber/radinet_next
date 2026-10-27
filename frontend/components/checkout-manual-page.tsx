'use client';

import { useEffect, useState } from 'react';
import { Banknote, ChevronLeft, Copy } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export function CheckoutManualPage() {
  const params = useSearchParams();
  const orderNumber = params.get('order') ?? '';
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cardNumber = '۶۰۳۷-۹۹۱۱-۱۲۳۴-۵۶۷۸';
  const [copied, setCopied] = useState(false);

  const copyCard = () => {
    navigator.clipboard?.writeText('6037991112345678').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!mounted) return null;

  return (
    <div className="co-empty">
      <Banknote size={56} style={{ color: '#2563EB' }} />
      <h1>پرداخت کارت به کارت</h1>
      <p>شماره سفارش: {orderNumber || 'نامشخص'}</p>
      <p>مبلغ را به کارت زیر واریز کنید و رسید را ارسال کنید.</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '14px 18px' }}>
        <strong style={{ fontSize: 18 }}>{cardNumber}</strong>
        <button onClick={copyCard} style={{ border: '1px solid #2563EB', background: '#fff', color: '#2563EB', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
          <Copy size={14} /> {copied ? 'کپی شد' : 'کپی'}
        </button>
      </div>
      <a href="/shop">بازگشت به فروشگاه <ChevronLeft size={18} /></a>
    </div>
  );
}
