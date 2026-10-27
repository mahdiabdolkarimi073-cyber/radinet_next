'use client';

import { Stethoscope, FileText, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UpStatusBadge } from '@/components/user-panel/user-shell';
import { userGet, type PanelTelereport } from '@/lib/user-panel-api';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

export default function UserTelereportsPage() {
  const [items, setItems] = useState<PanelTelereport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userGet<{ items: PanelTelereport[] }>('/panel/telereports')
      .then((data) => setItems(data.items))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="up-page">
      <div className="up-page-title">
        <span>تله‌ریپورت</span>
        <h2>درخواست‌های تله‌ریپورت</h2>
        <p>لیست درخواست‌های تله‌ریپورت شما و وضعیت هر یک.</p>
      </div>

      {error && <div className="up-error">{error}</div>}

      {loading ? (
        <div className="up-empty"><Stethoscope size={28} className="up-spin" /> در حال بارگذاری...</div>
      ) : items.length === 0 ? (
        <div className="up-card"><div className="up-empty"><Stethoscope size={32} /> درخواستی ثبت نشده است</div></div>
      ) : (
        <div className="up-card" style={{ padding: 0 }}>
          <div className="up-table-wrap">
            <table className="up-table">
              <thead>
                <tr><th>شماره درخواست</th><th>نوع تصویربرداری</th><th>ناحیه</th><th>بیمار</th><th>وضعیت</th><th>گزارش</th><th>تاریخ</th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.requestNumber}</td>
                    <td>{item.imagingType}</td>
                    <td>{item.imagingArea}</td>
                    <td>{item.patientFirstName} {item.patientLastName}</td>
                    <td><UpStatusBadge value={item.status} /></td>
                    <td>
                      {item.reports.length > 0 && item.reports.some((r) => r.signed) ? (
                        <a href={`${BACKEND_URL}/panel/telereports/${item.id}`} className="up-link" target="_blank" rel="noreferrer">
                          <Download size={15} /> دانلود
                        </a>
                      ) : (
                        <span className="up-muted">—</span>
                      )}
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString('fa-IR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
