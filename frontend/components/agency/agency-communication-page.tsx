'use client';

import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Plus, X } from 'lucide-react';
import { formatDate } from '@/lib/agency-nav';

type Message = {
  id: string; agency_id: string; subject: string; body: string;
  type: string; status: string; response: string | null;
  created_at: string; updated_at: string;
};

const statusLabels: Record<string, string> = { pending: 'در انتظار', reviewed: 'بررسی‌شده', responded: 'پاسخ داده‌شده' };
const statusClasses: Record<string, string> = { pending: 'is-pending', reviewed: 'is-reviewed', responded: 'is-responded' };
const typeLabels: Record<string, string> = { request: 'درخواست', report: 'گزارش', complaint: 'شکایت', other: 'سایر' };

export function AgencyCommunicationPage() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: '', body: '', type: 'request' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? window.localStorage.getItem('radinet_auth_token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/agency/messages', { headers, cache: 'no-store' });
      if (!res.ok) throw new Error('دریافت پیام‌ها ناموفق بود.');
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleSend() {
    if (!form.subject.trim()) { setFormError('موضوع الزامی است.'); return; }
    setSaving(true);
    try {
      await fetch('/api/agency/messages', { method: 'POST', headers, body: JSON.stringify(form) });
      setShowModal(false);
      setForm({ subject: '', body: '', type: 'request' });
      setFormError('');
      void load();
    } catch {
      setFormError('خطا در ارسال پیام.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="agency-page-title">
        <div>
          <h2>ارتباط با مدیریت مرکزی</h2>
          <p>ارسال درخواست‌ها و گزارش‌ها به مدیریت مرکزی و پیگیری وضعیت آن‌ها</p>
        </div>
        <button className="agency-page-add-btn" onClick={() => setShowModal(true)}><Plus size={20} /> ارسال پیام جدید</button>
      </div>

      {error && <div className="agency-page-error">{error}</div>}

      <div className="agency-card">
        <div className="agency-card__head">
          <h2><MessageSquare size={22} strokeWidth={1.7} /> تاریخچه پیام‌ها</h2>
        </div>
        {loading && <p className="agency-page-empty">در حال دریافت...</p>}
        {!loading && items.length === 0 && <p className="agency-page-empty">پیامی ثبت نشده است.</p>}
        {!loading && items.length > 0 && (
          <div className="agency-message-list">
            {items.map((m) => (
              <div className="agency-message-item" key={m.id}>
                <div className="agency-message-item__head">
                  <strong>{m.subject}</strong>
                  <span className={`agency-status-badge ${statusClasses[m.status] ?? 'is-pending'}`}>{statusLabels[m.status] ?? m.status}</span>
                </div>
                <div className="agency-message-item__body">{m.body || '—'}</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#9aa7b7' }}>{typeLabels[m.type] ?? m.type}</span>
                  <span className="agency-message-item__time">{formatDate(m.created_at)}</span>
                </div>
                {m.response && (
                  <div className="agency-message-item__response">
                    <strong>پاسخ مدیریت مرکزی:</strong>
                    {m.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="agency-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="agency-modal agency-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="agency-modal__head">
              <h3>ارسال پیام به مدیریت مرکزی</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="agency-modal__form">
              {formError && <div className="agency-modal__error">{formError}</div>}
              <label><span>موضوع *</span><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label>
              <label><span>نوع پیام</span>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="request">درخواست</option>
                  <option value="report">گزارش</option>
                  <option value="complaint">شکایت</option>
                  <option value="other">سایر</option>
                </select>
              </label>
              <label><span>متن پیام</span><textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} style={{ minHeight: '120px' }} /></label>
              <div className="agency-modal__actions">
                <button className="agency-modal__cancel" onClick={() => setShowModal(false)}>انصراف</button>
                <button className="agency-modal__save" onClick={handleSend} disabled={saving}>{saving ? 'در حال ارسال...' : 'ارسال'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
