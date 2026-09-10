'use client';

import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UpStatusBadge } from '@/components/user-panel/user-shell';
import { userGet, type PanelOrder } from '@/lib/user-panel-api';

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<PanelOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    userGet<{ items: PanelOrder[] }>('/panel/orders')
      .then((data) => setOrders(data.items))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="up-page">
      <div className="up-page-title">
        <span>فروشگاه</span>
        <h2>سفارش‌های فروشگاه</h2>
        <p>تاریخچه کامل سفارش‌های شما در فروشگاه رادینت.</p>
      </div>

      {error && <div className="up-error">{error}</div>}

      {loading ? (
        <div className="up-empty"><Package size={28} className="up-spin" /> در حال بارگذاری...</div>
      ) : orders.length === 0 ? (
        <div className="up-card"><div className="up-empty"><Package size={32} /> سفارشی ثبت نشده است</div></div>
      ) : (
        <div className="up-card" style={{ padding: 0 }}>
          <div className="up-table-wrap">
            <table className="up-table">
              <thead>
                <tr><th>شماره سفارش</th><th>مبلغ کل</th><th>وضعیت سفارش</th><th>وضعیت پرداخت</th><th>تاریخ</th><th></th></tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <>
                    <tr key={order.id}>
                      <td>{order.orderNumber}</td>
                      <td>{Number(order.total).toLocaleString('fa-IR')} ریال</td>
                      <td><UpStatusBadge value={order.status} /></td>
                      <td><UpStatusBadge value={order.paymentStatus} /></td>
                      <td>{new Date(order.createdAt).toLocaleDateString('fa-IR')}</td>
                      <td>
                        <button className="up-expand-btn" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                          {expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    </tr>
                    {expanded === order.id && (
                      <tr className="up-row-detail">
                        <td colSpan={6}>
                          <div className="up-order-detail">
                            <h4>اقلام سفارش</h4>
                            <table className="up-table up-table-inner">
                              <thead><tr><th>محصول</th><th>تعداد</th><th>قیمت واحد</th><th>مجموع</th></tr></thead>
                              <tbody>
                                {order.items.map((item) => (
                                  <tr key={item.id}>
                                    <td>{item.productName}</td>
                                    <td>{item.quantity}</td>
                                    <td>{Number(item.unitPrice).toLocaleString('fa-IR')}</td>
                                    <td>{Number(item.lineTotal).toLocaleString('fa-IR')}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {order.trackingCode && <p className="up-tracking">کد رهگیری: <span dir="ltr">{order.trackingCode}</span></p>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
