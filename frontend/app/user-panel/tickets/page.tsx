'use client';

import { MessageSquare, Plus, X, Send } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { UpStatusBadge } from '@/components/user-panel/user-shell';
import { userGet, userPost, type PanelTicket } from '@/lib/user-panel-api';
import { toast } from 'sonner';

const categoryLabels: Record<string, string> = {
  general: 'عمومی', technical: 'فنی', billing: 'مالی', telereport: 'تله‌ریپورت', shop: 'فروشگاه',
};

export default function UserTicketsPage() {
  const [items, setItems] = useState<PanelTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');

  function load() {
    setLoading(true);
    userGet<{ items: PanelTicket[] }>('/panel/tickets')
      .then((data) => setItems(data.items))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await userPost('/panel/tickets', { subject, message, category, priority });
      toast.success('تیکت با موفقیت ثبت شد');
      setSubject(''); setMessage(''); setCategory('general'); setPriority('medium');
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ثبت تیکت ناموفق بود');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="up-page">
      <div className="up-page-title">
        <span>پشتیبانی</span>
        <h2>تیکت‌های پشتیبانی</h2>
        <p>تیکت‌های پشتیبانی خود را مدیریت کنید.</p>
      </div>

      {error && <div className="up-error">{error}</div>}

      <button className="up-button" style={{ marginBottom: 18 }} onClick={() => setShowForm(!showForm)}>
        {showForm ? <><X size={16} /> انصراف</> : <><Plus size={16} /> تیکت جدید</>}
      </button>

      {showForm && (
        <div className="up-card">
          <h3>ثبت تیکت جدید</h3>
          <form className="up-form" onSubmit={handleSubmit}>
            <div className="up-field">
              <label>موضوع</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="موضوع تیکت" maxLength={200} />
            </div>
            <div className="up-form-row">
              <div className="up-field">
                <label>دسته‌بندی</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="up-select">
                  <option value="general">عمومی</option>
                  <option value="technical">فنی</option>
                  <option value="billing">مالی</option>
                  <option value="telereport">تله‌ریپورت</option>
                  <option value="shop">فروشگاه</option>
                </select>
              </div>
              <div className="up-field">
                <label>اولویت</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="up-select">
                  <option value="low">کم</option>
                  <option value="medium">متوسط</option>
                  <option value="high">زیاد</option>
                  <option value="urgent">فوری</option>
                </select>
              </div>
            </div>
            <div className="up-field">
              <label>پیام</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="شرح مشکل یا درخواست..." className="up-textarea" />
            </div>
            <button className="up-button" type="submit" disabled={submitting}>
              {submitting ? 'در حال ارسال...' : <><Send size={16} /> ارسال تیکت</>}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="up-empty"><MessageSquare size={28} className="up-spin" /> در حال بارگذاری...</div>
      ) : items.length === 0 ? (
        <div className="up-card"><div className="up-empty"><MessageSquare size={32} /> تیکتی ثبت نشده است</div></div>
      ) : (
        <div className="up-card" style={{ padding: 0 }}>
          <div className="up-table-wrap">
            <table className="up-table">
              <thead>
                <tr><th>موضوع</th><th>دسته‌بندی</th><th>اولویت</th><th>وضعیت</th><th>پاسخ‌ها</th><th>تاریخ</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.subject}</td>
                    <td>{categoryLabels[ticket.category] ?? ticket.category}</td>
                    <td><UpStatusBadge value={ticket.priority} /></td>
                    <td><UpStatusBadge value={ticket.status} /></td>
                    <td>{ticket._count.replies}</td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString('fa-IR')}</td>
                    <td><a href={`/user-panel/tickets/${ticket.id}`} className="up-link">مشاهده</a></td>
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
