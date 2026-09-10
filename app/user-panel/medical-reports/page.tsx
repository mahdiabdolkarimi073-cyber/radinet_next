'use client';

import { FileText, Search, Download, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { userGet, type PanelMedicalReport } from '@/lib/user-panel-api';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api';

export default function UserMedicalReportsPage() {
  const [items, setItems] = useState<PanelMedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  function load() {
    setLoading(true);
    const q = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    userGet<{ items: PanelMedicalReport[] }>(`/panel/medical-reports${q}`)
      .then((data) => setItems(data.items))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  return (
    <section className="up-page">
      <div className="up-page-title">
        <span>پزشکی</span>
        <h2>گزارش‌های پزشکی</h2>
        <p>آرشیو کامل گزارش‌های پزشکی دریافتی شما.</p>
      </div>

      {error && <div className="up-error">{error}</div>}

      <div className="up-search-bar">
        <div className="up-search-input">
          <Search size={17} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو بر اساس عنوان، نوع یا توضیحات..." onKeyDown={(e) => e.key === 'Enter' && load()} />
        </div>
        <button className="up-button" onClick={load}>جستجو</button>
      </div>

      {loading ? (
        <div className="up-empty"><FileText size={28} className="up-spin" /> در حال بارگذاری...</div>
      ) : items.length === 0 ? (
        <div className="up-card"><div className="up-empty"><FileText size={32} /> گزارشی یافت نشد</div></div>
      ) : (
        <div className="up-reports-grid">
          {items.map((report) => (
            <div className="up-report-card" key={report.id}>
              <div className="up-report-icon"><FileText size={22} /></div>
              <div className="up-report-body">
                <h4>{report.title}</h4>
                <span className="up-report-type">{report.type}</span>
                {report.description && <p>{report.description}</p>}
                <small>{new Date(report.createdAt).toLocaleDateString('fa-IR')}</small>
              </div>
              <div className="up-report-actions">
                {report.fileUrl ? (
                  <>
                    <a href={`${BACKEND_URL}/panel/medical-reports/${report.id}`} target="_blank" rel="noreferrer" className="up-icon-btn" title="مشاهده"><Eye size={17} /></a>
                    <a href={`${BACKEND_URL}/panel/medical-reports/${report.id}`} download className="up-icon-btn" title="دانلود"><Download size={17} /></a>
                  </>
                ) : (
                  <span className="up-muted">فایلی موجود نیست</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
